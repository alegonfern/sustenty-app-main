from django.shortcuts import redirect
from django.conf import settings
from allauth.socialaccount.models import SocialAccount
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.views.generic import TemplateView
import urllib.parse


class SocialAuthenticationErrorView(TemplateView):
    """
    Vista para manejar errores de autenticación social
    """
    template_name = 'socialaccount/authentication_error.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        error_message = self.request.GET.get('error', 'Error en la autenticación con Google')
        
        context['frontend_url'] = frontend_url
        context['error_message'] = error_message
        context['redirect_url'] = f"{frontend_url}/login?error=google_auth_failed"
        return context


def google_callback(request):
    """
    Vista personalizada para manejar el callback de Google OAuth
    Genera tokens JWT y redirige al frontend
    """
    user = request.user
    
    if user.is_authenticated:
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # URL del frontend
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
        
        # Redirigir al frontend con los tokens
        redirect_url = f"{frontend_url}/auth/callback?access={access_token}&refresh={refresh_token}"
        return redirect(redirect_url)
    else:
        # Si no está autenticado, redirigir al login con error
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
        return redirect(f"{frontend_url}/login?error=authentication_failed")
