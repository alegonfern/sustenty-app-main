from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views
from .oauth_views import google_callback

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('auth/password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('auth/google/callback/', google_callback, name='google_callback'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # User
    path('user/me/', views.get_current_user, name='current_user'),
    path('user/change-password/', views.change_password, name='change_password'),
    path('user/avatar/', views.upload_avatar, name='upload_avatar'),
    path('user/avatar/delete/', views.delete_avatar, name='delete_avatar'),
    
    # User Settings
    path('user/settings/', views.user_settings, name='user_settings'),
    path('user/settings/api-key/', views.generate_api_key, name='generate_api_key'),
    path('user/integrations/', views.user_integrations, name='user_integrations'),
    path('user/export/', views.export_user_data, name='export_user_data'),
    path('user/usage/', views.usage_stats, name='usage_stats'),
    path('user/billing/', views.billing_history, name='billing_history'),
    
    # Organizations
    path('organizations/', views.organization_list_create, name='organization_list_create'),
    path('organizations/<int:pk>/', views.organization_detail, name='organization_detail'),
    
    # AI Chat
    path('chat/', views.chat_ai, name='chat_ai'),
    
    # SustentIA Insights
    path('sustentia/insight/', views.get_sustentia_insight, name='sustentia_insight'),
]