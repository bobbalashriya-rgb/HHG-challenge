from rest_framework import serializers
from .models import InvestmentPrinciple

class InvestmentPrincipleSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPrinciple
        fields = ['identifier', 'name', 'metric', 'operator', 'threshold', 'description']

class PrincipleUpdateSerializer(serializers.Serializer):
    threshold = serializers.FloatField(required=True)

class AnalyzeRequestSerializer(serializers.Serializer):
    ticker = serializers.CharField(max_length=32, required=True)

class AskRequestSerializer(serializers.Serializer):
    question = serializers.CharField(required=True)
    context = serializers.DictField(required=True)

class CompareRequestSerializer(serializers.Serializer):
    tickers = serializers.ListField(
        child=serializers.CharField(max_length=32),
        min_length=2,
        max_length=2,
        required=True
    )

