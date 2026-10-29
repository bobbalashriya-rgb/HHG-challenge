from django.urls import path
from .views import (
    CompanyDetailView,
    PrincipleListView,
    PrincipleDetailView,
    AnalyzeView,
    AskView,
    CompareView
)

urlpatterns = [
    path('company/<str:ticker>', CompanyDetailView.as_view(), name='company-detail'),
    path('principles', PrincipleListView.as_view(), name='principles-list'),
    path('principles/<str:identifier>', PrincipleDetailView.as_view(), name='principle-detail'),
    path('analyze', AnalyzeView.as_view(), name='analyze'),
    path('ask', AskView.as_view(), name='ask'),
    path('compare', CompareView.as_view(), name='compare'),
]

