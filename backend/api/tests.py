import unittest.mock
from django.test import TestCase, Client
from api.models import InvestmentPrinciple
from api.services.company_data import (
    NormalizedCompanyData, CompanyProfile, FinancialStatements
)
from api.services.financial_metrics import calculate_metrics

class ApiEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_root_endpoint(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("Django", data["message"])
        self.assertEqual(data["database"]["engine"], "postgresql")
        self.assertEqual(data["database"]["status"], "connected")

    def test_principles_list(self):
        response = self.client.get('/api/principles')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) >= 6)
        identifiers = [p['identifier'] for p in data]
        self.assertIn('ROE_GT_15', identifiers)
        self.assertIn('PE_LT_30', identifiers)

    def test_update_principle(self):
        response = self.client.put(
            '/api/principles/ROE_GT_15',
            data={"threshold": 0.20},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["threshold"], 0.20)

        # Verify in DB
        p = InvestmentPrinciple.objects.get(identifier='ROE_GT_15')
        self.assertEqual(p.threshold, 0.20)

    @unittest.mock.patch('api.views.answer_financial_question', return_value="The ROE of Test Corp is 18%.")
    def test_ask_endpoint(self, mock_ask):
        mock_context = {
            "profile": {"name": "Test Corp", "ticker": "TEST"},
            "metrics": {"roe": 0.18, "revenue_growth": 0.12},
            "evaluations": {"passed_count": 5, "total_count": 6}
        }
        response = self.client.post(
            '/api/ask',
            data={"question": "What is the ROE of this company?", "context": mock_context},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertTrue(len(data["answer"]) > 0)

    def test_analyze_empty_ticker(self):
        response = self.client.post(
            '/api/analyze',
            data={"ticker": ""},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    def test_compare_invalid_tickers(self):
        response = self.client.post(
            '/api/compare',
            data={"tickers": ["AAPL"]},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())


class ValuationMetricsTestCase(TestCase):
    """Unit tests for the 6 Quantitative Valuation Modules and Edge Cases."""

    def _create_mock_data(self, ticker="TCS.NS", net_profit=1000.0, revenue=5000.0, fcf=800.0, total_debt=200.0, interest_expense=20.0):
        profile = CompanyProfile(
            ticker=ticker,
            name="Tata Consultancy Services",
            sector="Technology",
            industry="Information Technology Services",
            current_price=3500.0,
            market_cap=25000,
            currency="INR",
            shares_outstanding=10,
            enterprise_value=27000.0,
            forward_pe=22.5,
            trailing_pe=25.0,
            peg_ratio=1.8,
            price_to_sales=5.0,
            price_to_book=8.0,
            ev_to_ebitda=18.0,
            ev_to_revenue=5.4,
            beta=0.85
        )
        financials = FinancialStatements(
            income_statement={
                "2024-03-31": {
                    "Total Revenue": revenue,
                    "Net Income": net_profit,
                    "Operating Income": 1200.0,
                    "EBIT": 1200.0,
                    "EBITDA": 1500.0,
                    "Interest Expense": interest_expense
                },
                "2023-03-31": {
                    "Total Revenue": 4500.0,
                    "Net Income": 900.0,
                    "Operating Income": 1050.0,
                    "EBIT": 1050.0
                }
            },
            balance_sheet={
                "2024-03-31": {
                    "Stockholders Equity": 3125.0,
                    "Total Assets": 4000.0,
                    "Current Liabilities": 800.0,
                    "Total Debt": total_debt,
                    "Cash And Cash Equivalents": 500.0
                }
            },
            cash_flow={
                "2024-03-31": {
                    "Operating Cash Flow": fcf + 200.0 if fcf is not None else None,
                    "Capital Expenditure": 200.0
                },
                "2023-03-31": {
                    "Operating Cash Flow": 900.0,
                    "Capital Expenditure": 200.0
                }
            }
        )
        return NormalizedCompanyData(
            profile=profile,
            financials=financials,
            historical_prices=[]
        )

    def test_earnings_valuation_eight_metrics(self):
        """Verifies that all 8 Earnings-Based Valuation metrics are calculated with tooltips & formulas."""
        data = self._create_mock_data()
        res = calculate_metrics(data)

        self.assertIsNotNone(res.valuation)
        ev = res.valuation.earnings_valuation

        # 1. P/E
        self.assertEqual(ev.pe.abbreviation, "P/E")
        self.assertIsNotNone(ev.pe.value)
        self.assertIn("Share Price", ev.pe.formula or "")
        self.assertIn("₹", ev.pe.explanation)

        # 2. Forward P/E
        self.assertEqual(ev.forward_pe.abbreviation, "Forward P/E")
        self.assertEqual(ev.forward_pe.value, 22.5)

        # 3. PEG
        self.assertEqual(ev.peg.abbreviation, "PEG")
        self.assertEqual(ev.peg.value, 1.8)

        # 4. P/S
        self.assertEqual(ev.ps.abbreviation, "P/S")
        self.assertEqual(ev.ps.value, 5.0)

        # 5. P/B
        self.assertEqual(ev.pb.abbreviation, "P/B")
        self.assertEqual(ev.pb.value, 8.0)

        # 6. EV/EBITDA
        self.assertEqual(ev.ev_ebitda.abbreviation, "EV/EBITDA")
        self.assertEqual(ev.ev_ebitda.value, 18.0)

        # 7. EV/EBIT (Calculated: 27000 / 1200 = 22.5)
        self.assertEqual(ev.ev_ebit.abbreviation, "EV/EBIT")
        self.assertAlmostEqual(ev.ev_ebit.value, 22.5, places=1)

        # 8. EV/Sales
        self.assertEqual(ev.ev_sales.abbreviation, "EV/Sales")
        self.assertEqual(ev.ev_sales.value, 5.4)

    def test_negative_earnings_safe_handling(self):
        """Verifies that loss-making periods do not calculate invalid negative P/E or crash."""
        data = self._create_mock_data(net_profit=-500.0)
        # Clear profile trailing_pe to force fallback calculation
        data.profile.trailing_pe = None
        res = calculate_metrics(data)

        self.assertIsNone(res.metrics.pe_ratio)
        self.assertEqual(res.valuation.earnings_valuation.pe.formatted_value, "Not available")

    def test_missing_cash_flow_dcf_marked_unavailable(self):
        """Verifies that negative or missing FCF sets DCF is_available=False with honest disclosure."""
        data = self._create_mock_data(fcf=-100.0)
        res = calculate_metrics(data)

        self.assertFalse(res.valuation.dcf_valuation.is_available)
        self.assertIsNotNone(res.valuation.dcf_valuation.reason)
        self.assertIn("negative or zero", res.valuation.dcf_valuation.reason.lower())
        self.assertIsNone(res.valuation.dcf_valuation.intrinsic_value_per_share)

    def test_positive_fcf_dcf_model(self):
        """Verifies DCF intrinsic valuation outputs and transparent disclosed assumptions."""
        data = self._create_mock_data(fcf=800.0)
        res = calculate_metrics(data)

        dcf = res.valuation.dcf_valuation
        self.assertTrue(dcf.is_available)
        self.assertEqual(len(dcf.projected_fcf), 5)
        self.assertGreater(dcf.intrinsic_value_per_share, 0)
        self.assertEqual(dcf.assumptions.discount_rate_pct, 10.5)
        self.assertEqual(dcf.assumptions.terminal_growth_rate_pct, 3.0)

    def test_quality_and_risk_metrics(self):
        """Verifies Interest Coverage, Debt/Equity, and Cash Conversion calculations."""
        data = self._create_mock_data(net_profit=1000.0, fcf=800.0, total_debt=200.0, interest_expense=20.0)
        res = calculate_metrics(data)

        qr = res.valuation.quality_risk
        # Interest coverage = 1200 / 20 = 60.0
        self.assertEqual(qr.interest_coverage.value, 60.0)
        # Cash conversion = 800 / 1000 = 0.80
        self.assertEqual(qr.cash_conversion.value, 0.8)
        self.assertEqual(qr.beta.value, 0.85)

    def test_relative_valuation_peer_benchmarking(self):
        """Verifies sector peer benchmarking and discount/premium status badge."""
        data = self._create_mock_data()
        res = calculate_metrics(data)

        rel = res.valuation.relative_valuation
        self.assertEqual(rel.sector, "Technology")
        self.assertIsNotNone(rel.benchmark_pe)
        self.assertIsNotNone(rel.pe_discount_premium_pct)
        self.assertIn("Sector", rel.status_badge)


class AuthEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        from django.contrib.auth.models import User, Group
        self.group_user, _ = Group.objects.get_or_create(name='user group_1')
        self.group_admin, _ = Group.objects.get_or_create(name='Administrators')

        self.user = User.objects.create_user(
            username='testanalyst',
            email='analyst@test.com',
            password='Password123!',
            first_name='Test',
            last_name='Analyst'
        )
        self.user.groups.add(self.group_user, self.group_admin)

    def test_django_credentials_login(self):
        """Tests successful Django credentials login and group serialization."""
        response = self.client.post(
            '/api/auth/login',
            data={'username': 'testanalyst', 'password': 'Password123!'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'testanalyst')
        self.assertIn('user group_1', data['user']['groups'])
        self.assertIn('Administrators', data['user']['groups'])

    def test_invalid_credentials_rejected(self):
        """Tests that invalid passwords return 401 Unauthorized."""
        response = self.client.post(
            '/api/auth/login',
            data={'username': 'testanalyst', 'password': 'WrongPassword!'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_oauth_login_provisioning_and_groups(self):
        """Tests OAuth user registration, automatic group assignment, and login."""
        response = self.client.post(
            '/api/auth/oauth',
            data={
                'provider': 'google',
                'email': 'newoauthuser@example.com',
                'name': 'New OAuth User',
                'oauth_id': 'google_test_123'
            },
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['is_new_user'])
        self.assertEqual(data['user']['email'], 'newoauthuser@example.com')
        self.assertIn('user group_1', data['user']['groups'])
        self.assertIn('Investment Analysts', data['user']['groups'])

    def test_groups_endpoint(self):
        """Tests retrieval of Django groups and member counts."""
        response = self.client.get('/api/auth/groups')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        group_names = [g['name'] for g in data]
        self.assertIn('user group_1', group_names)
        self.assertIn('Administrators', group_names)

