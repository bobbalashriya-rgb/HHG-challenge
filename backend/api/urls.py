from django.urls import path
from .views import (
    CompanyDetailView,
    PrincipleListView,
    PrincipleDetailView,
    AnalyzeView,
    AskView,
    CompareView
)
from .auth_views import (
    LoginView,
    OAuthLoginView,
    LogoutView,
    CurrentUserView,
    GroupsListView,
    UsersListView
)

urlpatterns = [
    # Company & Analysis Endpoints
    path('company/<str:ticker>', CompanyDetailView.as_view(), name='company-detail'),
    path('principles', PrincipleListView.as_view(), name='principles-list'),
    path('principles/<str:identifier>', PrincipleDetailView.as_view(), name='principle-detail'),
    path('analyze', AnalyzeView.as_view(), name='analyze'),
    path('ask', AskView.as_view(), name='ask'),
    path('compare', CompareView.as_view(), name='compare'),

    # Authentication & Django Users / Groups Endpoints
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/oauth', OAuthLoginView.as_view(), name='auth-oauth'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('auth/me', CurrentUserView.as_view(), name='auth-me'),
    path('auth/groups', GroupsListView.as_view(), name='auth-groups'),
    path('auth/users', UsersListView.as_view(), name='auth-users'),
]

