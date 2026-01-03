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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_ai(request):
    """
    Endpoint para chat con IA SustentIA
    """
    import os
    from groq import Groq
    
    message = request.data.get('message')
    context = request.data.get('context', {})
    
    if not message:
        return Response(
            {'error': 'El mensaje es requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Inicializar cliente Groq (usa API key de variables de entorno)
        # Si no hay API key, usa un sistema de respuestas predefinidas
        api_key = os.getenv('GROQ_API_KEY', '')
        
        if api_key:
            client = Groq(api_key=api_key)
            
            # Construir contexto del sistema
            system_prompt = f"""Eres SustentIA, un asistente experto en sostenibilidad y medio ambiente.
Tu objetivo es ayudar a usuarios y organizaciones a mejorar su impacto ambiental.

Contexto del usuario:
- Usuario: {context.get('username', 'Usuario')}
- Organizaciones: {len(context.get('organizations', []))}

Información de organizaciones:
{chr(10).join([f"- {org['name']} ({org['sector']}, {org['employees']} empleados, modo: {org['mode']})" for org in context.get('organizations', [])])}

Proporciona recomendaciones específicas, prácticas y accionables relacionadas con:
- Reducción de emisiones de carbono
- Eficiencia energética
- Gestión de residuos
- Economía circular
- Responsabilidad social corporativa
- Medición y reporting de sostenibilidad

Sé conciso, profesional y enfocado en soluciones prácticas."""

            # Llamar a la API de Groq
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                model="llama-3.1-8b-instant",  # Modelo gratuito de Groq
                temperature=0.7,
                max_tokens=500
            )
            
            response_text = chat_completion.choices[0].message.content
        else:
            # Sistema de respuestas predefinidas si no hay API key
            response_text = generate_fallback_response(message, context)
        
        return Response({
            'response': response_text,
            'model': 'groq-llama-3.1-8b' if api_key else 'fallback'
        })
        
    except Exception as e:
        print(f"Error in chat AI: {e}")
        # Fallback a respuestas predefinidas en caso de error
        return Response({
            'response': generate_fallback_response(message, context),
            'model': 'fallback'
        })


def generate_fallback_response(message, context):
    """
    Genera respuestas predefinidas cuando no hay API key de Groq
    """
    message_lower = message.lower()
    organizations = context.get('organizations', [])
    
    # Respuestas basadas en palabras clave
    if any(word in message_lower for word in ['emisiones', 'carbono', 'co2']):
        return f"""Para reducir las emisiones de carbono, te recomiendo:

1. **Auditoría energética**: Realiza un análisis del consumo energético de tu organización
2. **Energías renovables**: Considera instalar paneles solares o contratar energía verde
3. **Movilidad sostenible**: Implementa programas de teletrabajo y transporte compartido
4. **Compensación**: Participa en programas de reforestación o compra de bonos de carbono

{f"Con {len(organizations)} organización(es) registrada(s), puedes empezar implementando estas medidas de forma progresiva." if organizations else "Registra tu organización para obtener recomendaciones más específicas."}"""
    
    elif any(word in message_lower for word in ['residuos', 'basura', 'reciclaje']):
        return """Recomendaciones para gestión de residuos:

1. **Clasificación**: Implementa un sistema de separación de residuos (orgánicos, reciclables, peligrosos)
2. **Reducción**: Aplica la regla de las 3R: Reducir, Reutilizar, Reciclar
3. **Compostaje**: Para residuos orgánicos, considera un programa de compostaje
4. **Auditoría**: Mide y registra la generación de residuos para identificar oportunidades
5. **Economía circular**: Busca proveedores que acepten devolución de materiales"""
    
    elif any(word in message_lower for word in ['energía', 'electricidad', 'consumo']):
        return """Estrategias de eficiencia energética:

1. **Iluminación LED**: Reemplaza bombillas tradicionales por LED (ahorro del 75%)
2. **Equipos eficientes**: Usa equipos con certificación Energy Star
3. **Automatización**: Instala sensores de movimiento y termostatos inteligentes
4. **Mantenimiento**: Programa revisiones regulares de equipos HVAC
5. **Monitoreo**: Implementa sistemas de medición en tiempo real del consumo"""
    
    elif any(word in message_lower for word in ['agua', 'hídrico']):
        return """Gestión eficiente del agua:

1. **Captación de lluvia**: Instala sistemas para aprovechar agua pluvial
2. **Grifos eficientes**: Usa aireadores y sistemas de bajo flujo
3. **Reutilización**: Implementa sistemas de tratamiento para aguas grises
4. **Detección de fugas**: Realiza auditorías periódicas de tuberías
5. **Concientización**: Capacita al personal sobre uso responsable del agua"""
    
    elif any(word in message_lower for word in ['analiza', 'análisis', 'organización']):
        if organizations:
            sectors_summary = {}
            for org in organizations:
                sector = org['sector']
                sectors_summary[sector] = sectors_summary.get(sector, 0) + 1
            
            return f"""Análisis de tus {len(organizations)} organización(es):

**Sectores representados:**
{chr(10).join([f"- {sector}: {count} organización(es)" for sector, count in sectors_summary.items()])}

**Recomendaciones generales:**
1. Establece KPIs de sostenibilidad específicos para cada sector
2. Implementa un sistema de reporte mensual de métricas ambientales
3. Compara tu desempeño con benchmarks de tu industria
4. Crea un comité de sostenibilidad con representantes de cada área

¿Hay algún aspecto específico en el que quieras profundizar?"""
        else:
            return "Aún no tienes organizaciones registradas. Te recomiendo registrar tu primera organización para poder analizar y proporcionar recomendaciones específicas de sostenibilidad."
    
    elif any(word in message_lower for word in ['huella', 'impacto', 'medición']):
        return """Cálculo de huella de carbono:

**Alcances de medición:**
1. **Alcance 1**: Emisiones directas (combustibles, vehículos propios)
2. **Alcance 2**: Emisiones indirectas (electricidad, calefacción)
3. **Alcance 3**: Otras indirectas (cadena de suministro, viajes)

**Pasos para calcular:**
1. Recopila datos de consumo (energía, combustibles, transporte)
2. Aplica factores de emisión según tu región
3. Suma todas las fuentes de emisión
4. Compara con años anteriores para medir progreso

**Herramientas recomendadas:**
- GHG Protocol Calculator
- Carbon Footprint Ltd
- EPA Portfolio Manager"""
    
    else:
        # Respuesta genérica
        return f"""Hola! Soy SustentIA, tu asistente de sostenibilidad.

Puedo ayudarte con:
- 🌱 Reducción de emisiones de carbono
- ⚡ Eficiencia energética
- ♻️ Gestión de residuos
- 💧 Uso eficiente del agua
- 📊 Medición de impacto ambiental
- 🎯 Estrategias de sostenibilidad

{f"Actualmente tienes {len(organizations)} organización(es) registrada(s)." if organizations else ""}

¿Sobre qué tema específico te gustaría que te aconseje?"""
