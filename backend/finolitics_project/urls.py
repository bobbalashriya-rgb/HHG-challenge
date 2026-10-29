from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection

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
        "message": "Finolitics AI API (Django) is running. Access /api/ for endpoints.",
        "version": "0.1.0",
        "framework": "Django REST Framework",
        "database": {
            "engine": connection.vendor,
            "status": db_status,
            "version": pg_version
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', root_view, name='root'),
]

