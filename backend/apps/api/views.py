from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import Organization
from .serializers import OrganizationSerializer, OrganizationCreateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint para verificar el estado de la API
    """
    return Response({
        'status': 'ok',
        'message': 'Sustenty API is running',
        'version': '1.0.0'
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def organization_list_create(request):
    """
    GET: Lista todas las organizaciones del usuario autenticado
    POST: Crea una nueva organización para el usuario autenticado
    """
    if request.method == 'GET':
        organizations = Organization.objects.filter(user=request.user)
        serializer = OrganizationSerializer(organizations, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print(f"Datos recibidos: {request.data}")
        serializer = OrganizationCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar el usuario autenticado a la organización
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Log de errores para debugging
        print(f"Error de validación: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def organization_detail(request, pk):
    """
    GET: Obtiene los detalles de una organización
    PUT: Actualiza una organización
    DELETE: Elimina una organización
    """
    try:
        organization = Organization.objects.get(pk=pk, user=request.user)
    except Organization.DoesNotExist:
        return Response(
            {'error': 'Organización no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = OrganizationSerializer(organization)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = OrganizationCreateSerializer(organization, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        organization.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Solicita un restablecimiento de contraseña enviando un email con token
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'email': ['Este campo es requerido']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        # Generar token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Crear enlace de reset (en producción usar el dominio real)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_link = f"{frontend_url}/reset-password?token={uid}-{token}"
        
        # Enviar email
        subject = 'Recuperación de contraseña - Sustenty'
        message = f"""
Hola {user.username},

Has solicitado restablecer tu contraseña en Sustenty.

Haz clic en el siguiente enlace para crear una nueva contraseña:
{reset_link}

Este enlace expirará en 24 horas.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
El equipo de Sustenty
        """
        
        # En desarrollo, solo imprimimos el enlace
        print(f"\n{'='*80}")
        print(f"PASSWORD RESET LINK FOR {user.email}:")
        print(f"{reset_link}")
        print(f"{'='*80}\n")
        
        # Intentar enviar email (en producción configurar SMTP)
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}")
            # En desarrollo, continuamos aunque falle el envío
            pass
        
        return Response({
            'detail': 'Si existe una cuenta con este email, recibirás instrucciones para recuperar tu contraseña.'
        })
    
    except User.DoesNotExist:
        # Por seguridad, no revelamos si el email existe o no
        return Response({
            'detail': 'Si existe una cuenta con este email, recibirás instrucciones para recuperar tu contraseña.'
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Confirma el restablecimiento de contraseña con el token
    """
    token_string = request.data.get('token')
    password = request.data.get('password')
    
    if not token_string or not password:
        return Response(
            {'detail': 'Token y contraseña son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decodificar uid y token
        uid, token = token_string.split('-', 1)
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        # Verificar token
        if default_token_generator.check_token(user, token):
            # Validar contraseña
            if len(password) < 8:
                return Response(
                    {'password': ['La contraseña debe tener al menos 8 caracteres']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Actualizar contraseña
            user.set_password(password)
            user.save()
            
            return Response({
                'detail': 'Contraseña actualizada exitosamente'
            })
        else:
            return Response(
                {'detail': 'El enlace de recuperación es inválido o ha expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except (ValueError, User.DoesNotExist):
        return Response(
            {'detail': 'El enlace de recuperación es inválido o ha expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )
