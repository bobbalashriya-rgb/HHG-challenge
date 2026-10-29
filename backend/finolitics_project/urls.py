from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        "message": "Finolitics AI API (Django) is running. Access /api/ for endpoints.",
        "version": "0.1.0",
        "framework": "Django REST Framework"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', root_view, name='root'),
]

