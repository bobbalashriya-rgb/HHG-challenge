from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

def root_view(request):
    db_status = "connected"
    pg_version = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            row = cursor.fetchone()
            if row:
                pg_version = row[0]
    except Exception as e:
        db_status = f"error: {str(e)}"

    return JsonResponse({
        "message": "Finolitics AI API (Django) is running with Quantitative & Qualitative RAG.",
        "version": "0.2.0",
        "framework": "Django REST Framework",
        "database": {
            "engine": connection.vendor,
            "status": db_status,
            "version": pg_version
        },
        "modules": {
            "quantitative_valuation": "/api/",
            "qualitative_companies": "/api/companies/",
            "qualitative_documents": "/api/documents/",
            "qualitative_research": "/api/research/",
            "api_documentation": "/api/docs/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Qualitative Fundamental Analysis & RAG Endpoints (StockQualitativeAnalysis)
    path('api/companies/', include('companies.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/research/', include('research.urls')),
    path('api/core/', include('core.urls')),

    # OpenAPI 3 / Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    path('', root_view, name='root'),
]

