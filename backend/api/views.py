import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import InvestmentPrinciple
from .serializers import (
    InvestmentPrincipleSerializer,
    PrincipleUpdateSerializer,
    AnalyzeRequestSerializer,
    AskRequestSerializer,
    CompareRequestSerializer
)
from .services.company_data import fetch_company_data, FinancialDataError
from .services.financial_metrics import calculate_metrics
from .services.investment_principles import evaluate_principles
from .services.ai_research import (
    generate_research_report,
    answer_financial_question,
    generate_comparison_report
)

logger = logging.getLogger(__name__)

class CompanyDetailView(APIView):
    """Fetches normalized company financial profile, statements, and price history."""
    def get(self, request, ticker):
        ticker_clean = ticker.strip().upper()
        try:
            company_data = fetch_company_data(ticker_clean)
            return Response(company_data.model_dump())
        except FinancialDataError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching company {ticker}: {e}", exc_info=True)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PrincipleListView(APIView):
    """Retrieves all configured investment principles."""
    def get(self, request):
        principles = InvestmentPrinciple.objects.all()
        serializer = InvestmentPrincipleSerializer(principles, many=True)
        return Response(serializer.data)

class PrincipleDetailView(APIView):
    """Updates the evaluation threshold for a specific investment principle."""
    def put(self, request, identifier):
        try:
            principle = InvestmentPrinciple.objects.get(identifier=identifier)
        except InvestmentPrinciple.DoesNotExist:
            return Response({"detail": "Principle not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PrincipleUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        principle.threshold = serializer.validated_data['threshold']
        principle.save()
        return Response({"status": "success", "threshold": principle.threshold})

class AnalyzeView(APIView):
    """Runs complete single-company investment analysis pipeline."""
    def post(self, request):
        serializer = AnalyzeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Ticker cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        ticker = serializer.validated_data['ticker'].strip().upper()
        if not ticker:
            return Response({"detail": "Ticker cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            company_data = fetch_company_data(ticker)
            metrics_result = calculate_metrics(company_data)
            metrics_dict = metrics_result.metrics.model_dump()
            principles = list(InvestmentPrinciple.objects.all())
            evaluation_report = evaluate_principles(metrics_dict, principles)

            ai_report_dict = generate_research_report(
                company_data, metrics_dict, evaluation_report.model_dump()
            )

            return Response({
                "company_data": company_data.model_dump(),
                "metrics": metrics_result.model_dump(),
                "evaluation": evaluation_report.model_dump(),
                "ai_report": ai_report_dict
            })
        except FinancialDataError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error analyzing {ticker}: {e}", exc_info=True)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AskView(APIView):
    """Processes interactive Q&A utilizing bounded application context."""
    def post(self, request):
        serializer = AskRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Question and context are required."}, status=status.HTTP_400_BAD_REQUEST)

        question = serializer.validated_data['question'].strip()
        context = serializer.validated_data['context']
        if not question:
            return Response({"detail": "Question cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ans = answer_financial_question(context, question)
            return Response({"answer": ans})
        except Exception as e:
            logger.error(f"Error answering question: {e}", exc_info=True)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CompareView(APIView):
    """Executes a full pipeline analysis on two tickers for a head-to-head comparison."""
    def post(self, request):
        serializer = CompareRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Exactly 2 tickers are required for comparison."}, status=status.HTTP_400_BAD_REQUEST)

        tickers = serializer.validated_data['tickers']
        if len(tickers) != 2:
            return Response({"detail": "Exactly 2 tickers are required for comparison."}, status=status.HTTP_400_BAD_REQUEST)

        principles = list(InvestmentPrinciple.objects.all())
        companies = []
        contexts = []

        try:
            for t in tickers:
                t_clean = t.strip().upper()
                c_data = fetch_company_data(t_clean)
                c_metrics = calculate_metrics(c_data)
                c_evals = evaluate_principles(c_metrics.metrics.model_dump(), principles)

                companies.append({
                    "ticker": t_clean,
                    "metrics": c_metrics.metrics.model_dump(),
                    "evaluations": c_evals.model_dump()
                })
                contexts.append({
                    "profile": c_data.profile.model_dump(),
                    "metrics": c_metrics.metrics.model_dump(),
                    "evaluations": c_evals.model_dump()
                })

            ai_comp = generate_comparison_report(contexts[0], contexts[1])
            return Response({
                "companies": companies,
                "ai_comparison": ai_comp
            })
        except FinancialDataError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error comparing {tickers}: {e}", exc_info=True)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

