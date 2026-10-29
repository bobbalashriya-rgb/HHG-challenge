from django.test import TestCase, Client
from django.urls import reverse
from api.models import InvestmentPrinciple

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

    def test_ask_endpoint(self):
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

