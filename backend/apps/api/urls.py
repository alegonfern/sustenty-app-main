from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Organizations
    path('organizations/', views.organization_list_create, name='organization_list_create'),
    path('organizations/<int:pk>/', views.organization_detail, name='organization_detail'),
]