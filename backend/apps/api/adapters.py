"""
Adaptador personalizado de Allauth para manejar OAuth con redirección al frontend
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.shortcuts import redirect
from django.conf import settings


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Adaptador que redirige al frontend en caso de errores de OAuth
    """
    
    def authentication_error(self, request, provider_id, error=None, exception=None, extra_context=None):
        """
        Redirige al frontend cuando hay un error de autenticación
        """
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        error_message = str(exception) if exception else 'Error en la autenticación con Google'
        
        # Redirigir al frontend con el error
        return redirect(f"{frontend_url}/login?error=google_auth_failed&message={error_message}")
    
    def is_auto_signup_allowed(self, request, sociallogin):
        """
        Permitir registro automático con Google
        """
        return True
