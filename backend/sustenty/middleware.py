"""
Middleware para forzar localhost en desarrollo para OAuth
"""

class LocalhostMiddleware:
    """
    Middleware que fuerza el uso de localhost en lugar de la IP real
    para las peticiones de OAuth en desarrollo
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Si es una petición de OAuth o relacionada con Google
        if '/accounts/google/' in request.path or '/api/v1/auth/' in request.path:
            # Guardar el host original
            original_host = request.META.get('HTTP_HOST', '')
            
            # Forzar el host a localhost:8000
            request.META['HTTP_HOST'] = 'localhost:8000'
            request.META['SERVER_NAME'] = 'localhost'
            request.META['SERVER_PORT'] = '8000'
            
            # Asegurar que la sesión use el dominio correcto
            if hasattr(request, 'session'):
                request.session.save()
            
        response = self.get_response(request)
        return response
