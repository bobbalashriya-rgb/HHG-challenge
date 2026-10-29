import enum
from django.db import models

class Operator(str, enum.Enum):
    GREATER_THAN = ">"
    LESS_THAN = "<"
    GREATER_THAN_OR_EQUAL = ">="
    LESS_THAN_OR_EQUAL = "<="

class InvestmentPrinciple(models.Model):
    OPERATOR_CHOICES = [
        (Operator.GREATER_THAN.value, ">"),
        (Operator.LESS_THAN.value, "<"),
        (Operator.GREATER_THAN_OR_EQUAL.value, ">="),
        (Operator.LESS_THAN_OR_EQUAL.value, "<="),
    ]

    identifier = models.CharField(max_length=64, primary_key=True, help_text="Unique principle identifier")
    name = models.CharField(max_length=255, help_text="Human-readable rule name")
    metric = models.CharField(max_length=100, help_text="Target metric identifier")
    operator = models.CharField(max_length=10, choices=OPERATOR_CHOICES, help_text="Evaluation operator")
    threshold = models.FloatField(help_text="Numeric threshold hurdle")
    description = models.TextField(help_text="Detailed principle rationale")

    class Meta:
        db_table = "investment_principles"
        ordering = ["identifier"]
        verbose_name = "Investment Principle"
        verbose_name_plural = "Investment Principles"

    def __str__(self):
        return f"{self.name} ({self.metric} {self.operator} {self.threshold})"

