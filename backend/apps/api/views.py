from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import Organization, Notification
from .serializers import OrganizationSerializer, OrganizationCreateSerializer, NotificationSerializer


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


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    GET: Retorna la información del usuario autenticado
    PATCH: Actualiza la información del usuario
    """
    from allauth.socialaccount.models import SocialAccount
    from .models import UserProfile
    
    user = request.user
    
    # Asegurar que existe el perfil
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    if request.method == 'PATCH':
        # Campos del usuario permitidos para actualizar
        user_fields = ['first_name', 'last_name', 'email']
        for field in user_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        
        # Campos del perfil
        profile_fields = ['phone', 'position', 'department']
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()
    
    # Obtener foto de perfil (prioridad: avatar subido > Google > None)
    profile_picture = None
    
    # Primero verificar si tiene avatar subido
    if profile.avatar:
        profile_picture = request.build_absolute_uri(profile.avatar.url)
    else:
        # Intentar obtener de Google
        try:
            social_account = SocialAccount.objects.filter(user=user, provider='google').first()
            if social_account and social_account.extra_data:
                profile_picture = social_account.extra_data.get('picture')
        except:
            pass
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': user.get_full_name() or user.username,
        'profile_picture': profile_picture,
        'phone': profile.phone,
        'position': profile.position,
        'department': profile.department,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
    """
    Sube una imagen de perfil para el usuario autenticado
    """
    from .models import UserProfile
    
    if 'avatar' not in request.FILES:
        return Response(
            {'detail': 'No se proporcionó ninguna imagen'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    avatar = request.FILES['avatar']
    
    # Validar tipo de archivo
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if avatar.content_type not in allowed_types:
        return Response(
            {'detail': 'Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar tamaño (max 5MB)
    if avatar.size > 5 * 1024 * 1024:
        return Response(
            {'detail': 'La imagen es demasiado grande. Máximo 5MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Eliminar avatar anterior si existe
    if profile.avatar:
        profile.avatar.delete(save=False)
    
    profile.avatar = avatar
    profile.save()
    
    return Response({
        'detail': 'Imagen de perfil actualizada correctamente',
        'avatar_url': request.build_absolute_uri(profile.avatar.url)
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_avatar(request):
    """
    Elimina la imagen de perfil del usuario
    """
    from .models import UserProfile
    
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if profile.avatar:
        profile.avatar.delete(save=False)
        profile.avatar = None
        profile.save()
        return Response({'detail': 'Imagen de perfil eliminada'})
    
    return Response({'detail': 'No hay imagen de perfil para eliminar'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Cambia la contraseña del usuario autenticado
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'detail': 'Se requiere la contraseña actual y la nueva contraseña'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {'old_password': ['La contraseña actual es incorrecta']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'detail': 'La nueva contraseña debe tener al menos 8 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'detail': 'Contraseña cambiada correctamente'})


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
        
        # Usar el servicio de email con Resend
        from .email_service import email_service
        
        result = email_service.send_password_reset(user, reset_link)
        
        # En desarrollo, también imprimir en consola
        if not result.get('success'):
            print(f"\n{'='*80}")
            print(f"PASSWORD RESET LINK FOR {user.email}:")
            print(f"{reset_link}")
            print(f"{'='*80}\n")
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sustentia_insight(request):
    """
    Genera un insight personalizado de SustentIA basado en los datos del usuario
    Se cachea por 1 hora, a menos que se pase ?force=true
    """
    import os
    from groq import Groq
    from django.core.cache import cache
    from apps.esg.models import ESGDataCollection, ESGGoal, ESGAction
    from datetime import datetime, timedelta
    
    # Verificar si se debe forzar regeneración
    force_refresh = request.GET.get('force', 'false').lower() == 'true'
    
    # Verificar si hay un insight en caché (solo si no es forzado)
    cache_key = f'sustentia_insight_{request.user.id}'
    if not force_refresh:
        cached_insight = cache.get(cache_key)
        if cached_insight:
            return Response(cached_insight)
    
    try:
        # Recopilar datos del usuario
        organizations = Organization.objects.filter(user=request.user)
        
        # Estadísticas ESG - solo contar registros totales
        total_emissions = ESGDataCollection.objects.filter(
            organization__in=organizations
        ).count()
        
        # Contar metas no alcanzadas (en camino, en riesgo, retrasadas)
        pending_goals = ESGGoal.objects.filter(
            organization__in=organizations
        ).exclude(status__in=['achieved', 'cancelled']).count()
        
        # Contar acciones pendientes o en progreso
        pending_actions = ESGAction.objects.filter(
            organization__in=organizations
        ).exclude(status='completed').count()
        
        # Construir contexto
        context_data = {
            'organizations_count': organizations.count(),
            'total_emissions_records': total_emissions,
            'pending_goals': pending_goals,
            'pending_actions': pending_actions,
            'has_data': total_emissions > 0,
        }
        
        # Generar insight con IA
        api_key = os.getenv('GROQ_API_KEY', '')
        
        if api_key and organizations.count() > 0:
            client = Groq(api_key=api_key)
            
            # Determinar tipo de mensaje basado en el estado
            if not context_data['has_data']:
                message_type = "bienvenida"
            elif pending_actions > 5:
                message_type = "urgencia_acciones"
            elif pending_goals > 3:
                message_type = "enfoque_metas"
            else:
                message_type = "motivacion"
            
            prompts = {
                "bienvenida": f"""Eres SustentIA. El usuario acaba de registrarse y tiene {organizations.count()} organización(es) pero aún no ha cargado datos ESG.

Genera un mensaje motivacional corto (máx 100 palabras) que:
1. Le dé la bienvenida
2. Le explique brevemente que puede hacer en la plataforma (registrar emisiones, crear metas, ver analytics)
3. Le sugiera empezar por la sección "Colección" para registrar sus primeros datos
4. Sea amigable y motivador

No uses emojis. Sé directo y profesional.""",

                "urgencia_acciones": f"""Eres SustentIA. El usuario tiene {pending_actions} acciones pendientes de completar.

Genera un mensaje corto (máx 100 palabras) que:
1. Le recuerde amablemente las acciones pendientes
2. Le motive a completarlas mencionando el impacto positivo
3. Le sugiera priorizar las más importantes
4. Sea alentador, no regañón

No uses emojis.""",

                "enfoque_metas": f"""Eres SustentIA. El usuario tiene {pending_goals} metas ESG pendientes y {total_emissions} registros de emisiones.

Genera un mensaje corto (máx 100 palabras) que:
1. Reconozca su esfuerzo en registrar datos
2. Le recuerde sus metas pendientes
3. Le sugiera revisar el progreso en la sección Analytics
4. Sea motivador

No uses emojis.""",

                "motivacion": f"""Eres SustentIA. El usuario tiene {total_emissions} registros, {pending_goals} metas y {pending_actions} acciones pendientes.

Genera un mensaje inspirador corto (máx 100 palabras) que:
1. Celebre su progreso
2. Le sugiera una acción específica (crear un reporte, revisar tendencias, o completar acciones)
3. Le recuerde el impacto positivo de su trabajo
4. Incluya un dato interesante sobre sostenibilidad

No uses emojis. Sé inspirador."""
            }
            
            chat_completion = client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": prompts[message_type]
                }],
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=200
            )
            
            insight_text = chat_completion.choices[0].message.content
        else:
            # Mensajes predeterminados sin IA
            if not context_data['has_data']:
                insight_text = "¡Bienvenido a Sustenty! Comienza registrando tus primeros datos de emisiones en la sección 'Colección'. Esto te permitirá visualizar tu impacto ambiental y establecer metas de reducción. Cada dato que registres es un paso hacia la sostenibilidad."
            elif pending_actions > 5:
                insight_text = f"Tienes {pending_actions} acciones pendientes. Completar estas acciones puede tener un impacto significativo en tu huella de carbono. Te sugerimos priorizar las de mayor impacto primero. ¡Cada acción cuenta!"
            elif pending_goals > 3:
                insight_text = f"Has establecido {pending_goals} metas ESG. Revisa tu progreso en la sección Analytics para identificar áreas de mejora. Mantén el enfoque y verás resultados positivos pronto."
            else:
                insight_text = f"Excelente progreso con {total_emissions} registros. ¿Sabías que las empresas que miden su impacto ESG tienen 23% más probabilidad de reducir emisiones? Sigue así y considera generar tu primer reporte de sostenibilidad."
        
        # Preparar respuesta
        response_data = {
            'insight': insight_text,
            'generated_at': datetime.now().isoformat(),
            'context': context_data
        }
        
        # Cachear por 1 hora (3600 segundos)
        cache.set(cache_key, response_data, 3600)
        
        return Response(response_data)
        
    except Exception as e:
        return Response({
            'error': 'Error al generar insight',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sustentia_insights(request):
    """
    Genera 5 insights personalizados de SustentIA basados en los datos del usuario
    Se cachean por 1 hora, a menos que se pase ?force=true
    """
    import os
    from groq import Groq
    from django.core.cache import cache
    from apps.esg.models import ESGDataCollection, ESGGoal, ESGAction
    from datetime import datetime, timedelta
    
    # Verificar si se debe forzar regeneración
    force_refresh = request.GET.get('force', 'false').lower() == 'true'
    
    # Verificar si hay insights en caché (solo si no es forzado)
    cache_key = f'sustentia_insights_{request.user.id}'
    if not force_refresh:
        cached_insights = cache.get(cache_key)
        if cached_insights:
            return Response(cached_insights)
    
    try:
        # Recopilar datos del usuario
        organizations = Organization.objects.filter(user=request.user)
        
        # Estadísticas ESG
        total_emissions = ESGDataCollection.objects.filter(
            organization__in=organizations
        ).count()
        
        pending_goals = ESGGoal.objects.filter(
            organization__in=organizations
        ).exclude(status__in=['achieved', 'cancelled']).count()
        
        pending_actions = ESGAction.objects.filter(
            organization__in=organizations
        ).exclude(status='completed').count()
        
        # Generar 5 insights con IA
        api_key = os.getenv('GROQ_API_KEY', '')
        insights_list = []
        
        if api_key and organizations.count() > 0:
            client = Groq(api_key=api_key)
            
            # 5 tipos diferentes de insights
            insight_prompts = [
                {
                    "type": "bienvenida",
                    "prompt": f"""Eres SustentIA. El usuario tiene {organizations.count()} organización(es) y {total_emissions} registros ESG.

Genera un mensaje de bienvenida motivacional corto (máx 80 palabras) que:
1. Le dé una bienvenida amigable
2. Mencione brevemente una capacidad clave de la plataforma
3. Sea inspirador y profesional

No uses emojis. Responde SOLO el mensaje, sin introducción."""
                },
                {
                    "type": "datos",
                    "prompt": f"""Eres SustentIA. El usuario tiene {total_emissions} registros de datos ESG.

Genera un mensaje corto (máx 80 palabras) que:
1. Reconozca su esfuerzo en registrar datos
2. Le sugiera una acción específica para mejorar la calidad de datos
3. Mencione un beneficio de tener datos precisos

No uses emojis. Responde SOLO el mensaje."""
                },
                {
                    "type": "acciones",
                    "prompt": f"""Eres SustentIA. El usuario tiene {pending_actions} acciones ESG pendientes.

Genera un mensaje motivador corto (máx 80 palabras) que:
1. Mencione las acciones de forma positiva
2. Explique brevemente el impacto de completarlas
3. Le anime a priorizarlas

No uses emojis. Responde SOLO el mensaje."""
                },
                {
                    "type": "metas",
                    "prompt": f"""Eres SustentIA. El usuario tiene {pending_goals} metas ESG activas.

Genera un mensaje inspirador corto (máx 80 palabras) que:
1. Reconozca el valor de establecer metas
2. Le sugiera revisar el progreso
3. Sea alentador

No uses emojis. Responde SOLO el mensaje."""
                },
                {
                    "type": "impacto",
                    "prompt": f"""Eres SustentIA. Genera un mensaje educativo corto (máx 80 palabras) que:
1. Comparta un dato interesante sobre sostenibilidad o ESG
2. Lo conecte con la importancia de medir el impacto
3. Sea inspirador

No uses emojis. Responde SOLO el mensaje."""
                }
            ]
            
            # Generar cada insight
            for prompt_data in insight_prompts:
                try:
                    chat_completion = client.chat.completions.create(
                        messages=[{
                            "role": "user",
                            "content": prompt_data["prompt"]
                        }],
                        model="llama-3.1-8b-instant",
                        temperature=0.8,
                        max_tokens=150
                    )
                    
                    insight_text = chat_completion.choices[0].message.content.strip()
                    insights_list.append({
                        'insight': insight_text,
                        'type': prompt_data['type'],
                        'generated_at': datetime.now().isoformat()
                    })
                except Exception as e:
                    print(f"Error generando insight {prompt_data['type']}: {e}")
                    # Continuar con el siguiente
                    continue
        
        # Si no se generaron insights con IA o no hay API key, usar mensajes predeterminados
        if len(insights_list) < 5:
            default_insights = [
                {
                    'insight': '¡Bienvenido a Sustenty! Esta plataforma te ayuda a medir, gestionar y reducir tu impacto ambiental. Comienza explorando las diferentes secciones para registrar tus datos ESG y establecer metas de sostenibilidad.',
                    'type': 'bienvenida',
                    'generated_at': datetime.now().isoformat()
                },
                {
                    'insight': 'Registrar tus datos de emisiones regularmente es fundamental para un seguimiento preciso. Te recomendamos establecer un calendario de recopilación de datos y asignar responsables para cada métrica clave.',
                    'type': 'datos',
                    'generated_at': datetime.now().isoformat()
                },
                {
                    'insight': f'Tienes {pending_actions if pending_actions > 0 else "la oportunidad de crear"} acciones de sostenibilidad {"pendientes" if pending_actions > 0 else ""}. Completar estas acciones puede generar un impacto significativo en la reducción de tu huella de carbono. Cada pequeño paso cuenta hacia un futuro más sostenible.',
                    'type': 'acciones',
                    'generated_at': datetime.now().isoformat()
                },
                {
                    'insight': 'Establecer metas ESG claras y medibles es el primer paso hacia la sostenibilidad empresarial. Revisa regularmente tu progreso en la sección de Analytics para identificar oportunidades de mejora y celebrar tus logros.',
                    'type': 'metas',
                    'generated_at': datetime.now().isoformat()
                },
                {
                    'insight': 'Las empresas que miden y gestionan activamente su impacto ESG tienen un 23% más de probabilidad de reducir sus emisiones de CO₂. La transparencia y el seguimiento constante son clave para alcanzar objetivos de sostenibilidad.',
                    'type': 'impacto',
                    'generated_at': datetime.now().isoformat()
                }
            ]
            
            insights_list = default_insights[:5]
        
        # Cachear por 1 hora (3600 segundos)
        cache.set(cache_key, insights_list, 3600)
        
        return Response(insights_list)
        
    except Exception as e:
        return Response({
            'error': 'Error al generar insights',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# CONFIGURACIÓN DE USUARIO (SETTINGS)
# =============================================================================

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    """
    GET: Retorna las configuraciones del usuario
    PATCH: Actualiza las configuraciones del usuario
    """
    from .models import UserSettings
    from .serializers import UserSettingsSerializer
    
    user = request.user
    
    # Obtener o crear configuraciones
    settings_obj, created = UserSettings.objects.get_or_create(user=user)
    
    if request.method == 'GET':
        serializer = UserSettingsSerializer(settings_obj)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Configuración actualizada correctamente',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_api_key(request):
    """
    Genera una nueva API key para el usuario
    """
    from .models import UserSettings
    import secrets
    
    user = request.user
    settings_obj, created = UserSettings.objects.get_or_create(user=user)
    
    if not settings_obj.api_enabled:
        return Response({
            'error': 'Debes habilitar el acceso a la API primero'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generar nueva API key
    new_key = f"sk_live_{secrets.token_urlsafe(32)}"
    settings_obj.api_key = new_key
    settings_obj.save()
    
    return Response({
        'api_key': new_key,
        'message': 'Nueva API key generada. Guárdala en un lugar seguro, no podrás verla de nuevo.'
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_integrations(request):
    """
    GET: Lista las integraciones del usuario
    POST: Crea o actualiza una integración
    """
    from .models import Integration
    from .serializers import IntegrationSerializer
    
    user = request.user
    
    # Integraciones disponibles por defecto
    DEFAULT_INTEGRATIONS = [
        {'provider': 'google', 'name': 'Google Workspace', 'description': 'Sincroniza documentos de Google Drive', 'icon': '🔗'},
        {'provider': 'microsoft', 'name': 'Microsoft 365', 'description': 'Integra con SharePoint y Teams', 'icon': '📎'},
        {'provider': 'slack', 'name': 'Slack', 'description': 'Notificaciones en canales de Slack', 'icon': '💬'},
        {'provider': 'zapier', 'name': 'Zapier', 'description': 'Automatiza flujos de trabajo', 'icon': '⚡'},
        {'provider': 'salesforce', 'name': 'Salesforce', 'description': 'Sincroniza datos de sostenibilidad', 'icon': '☁️'},
    ]
    
    if request.method == 'GET':
        # Obtener integraciones existentes
        existing_integrations = {i.provider: i for i in Integration.objects.filter(user=user)}
        
        # Combinar con defaults
        result = []
        for default in DEFAULT_INTEGRATIONS:
            if default['provider'] in existing_integrations:
                integration = existing_integrations[default['provider']]
                result.append({
                    'id': integration.id,
                    'provider': default['provider'],
                    'name': default['name'],
                    'description': default['description'],
                    'icon': default['icon'],
                    'is_connected': integration.is_connected,
                })
            else:
                result.append({
                    'id': None,
                    'provider': default['provider'],
                    'name': default['name'],
                    'description': default['description'],
                    'icon': default['icon'],
                    'is_connected': False,
                })
        
        return Response(result)
    
    elif request.method == 'POST':
        provider = request.data.get('provider')
        action = request.data.get('action', 'toggle')  # 'connect' or 'disconnect' or 'toggle'
        
        if not provider:
            return Response({'error': 'Provider es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_providers = [p['provider'] for p in DEFAULT_INTEGRATIONS]
        if provider not in valid_providers:
            return Response({'error': 'Provider inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        integration, created = Integration.objects.get_or_create(
            user=user,
            provider=provider
        )
        
        if action == 'toggle':
            integration.is_connected = not integration.is_connected
        elif action == 'connect':
            integration.is_connected = True
        elif action == 'disconnect':
            integration.is_connected = False
        
        integration.save()
        
        # Obtener el nombre para el mensaje
        provider_name = next((p['name'] for p in DEFAULT_INTEGRATIONS if p['provider'] == provider), provider)
        
        return Response({
            'message': f"{'Conectado a' if integration.is_connected else 'Desconectado de'} {provider_name}",
            'integration': {
                'provider': integration.provider,
                'is_connected': integration.is_connected
            }
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_user_data(request):
    """
    Inicia la exportación de todos los datos del usuario
    """
    from django.core.mail import send_mail
    import json
    from datetime import datetime
    
    user = request.user
    export_format = request.data.get('format', 'json')  # 'json' or 'csv'
    
    # En producción, esto debería ser una tarea asíncrona (Celery)
    # Por ahora, simulamos el proceso
    
    # Recopilar todos los datos del usuario
    export_data = {
        'user': {
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': str(user.date_joined),
        },
        'organizations': list(user.organizations.values()),
        'exported_at': datetime.now().isoformat(),
        'format': export_format
    }
    
    # TODO: Agregar más datos (emisiones, documentos, etc.)
    # TODO: Implementar exportación real con tarea asíncrona
    
    return Response({
        'message': 'Exportación iniciada. Recibirás un email con el enlace de descarga en unos minutos.',
        'format': export_format,
        'estimated_time': '5-10 minutos'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usage_stats(request):
    """
    Retorna estadísticas de uso del plan actual
    """
    from apps.esg.models import Emission
    from apps.compliance.models import Document
    
    user = request.user
    
    # Obtener organización actual
    org_id = request.query_params.get('organization')
    
    # Calcular estadísticas de uso
    try:
        documents_count = Document.objects.filter(user=user).count()
    except:
        documents_count = 0
    
    try:
        emissions_count = Emission.objects.filter(organization_id=org_id).count() if org_id else 0
    except:
        emissions_count = 0
    
    # Límites del plan (estos vendrían de una tabla de planes en producción)
    plan_limits = {
        'starter': {'documents': 50, 'storage': 1, 'api_calls': 1000, 'users': 5},
        'professional': {'documents': 100, 'storage': 5, 'api_calls': 5000, 'users': 10},
        'enterprise': {'documents': float('inf'), 'storage': float('inf'), 'api_calls': float('inf'), 'users': float('inf')}
    }
    
    current_plan = 'professional'  # TODO: Obtener del modelo de suscripción
    limits = plan_limits.get(current_plan, plan_limits['professional'])
    
    return Response({
        'plan': current_plan,
        'usage': {
            'documents': documents_count,
            'documents_limit': limits['documents'],
            'storage': 2.3,  # GB - TODO: calcular real
            'storage_limit': limits['storage'],
            'api_calls': 1250,  # TODO: tracking real
            'api_calls_limit': limits['api_calls'],
            'users': user.organizations.first().members.count() if user.organizations.exists() and hasattr(user.organizations.first(), 'members') else 1,
            'users_limit': limits['users']
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_history(request):
    """
    Retorna el historial de facturación del usuario
    """
    # TODO: Implementar con integración de Stripe
    # Por ahora retornamos datos de ejemplo
    
    invoices = [
        {'id': 'INV-001', 'date': '01/12/2025', 'amount': '€99.00', 'status': 'Pagado', 'plan': 'Professional'},
        {'id': 'INV-002', 'date': '01/11/2025', 'amount': '€99.00', 'status': 'Pagado', 'plan': 'Professional'},
        {'id': 'INV-003', 'date': '01/10/2025', 'amount': '€99.00', 'status': 'Pagado', 'plan': 'Professional'},
        {'id': 'INV-004', 'date': '01/09/2025', 'amount': '€99.00', 'status': 'Pagado', 'plan': 'Professional'},
        {'id': 'INV-005', 'date': '01/08/2025', 'amount': '€49.00', 'status': 'Pagado', 'plan': 'Starter'},
    ]
    
    return Response({
        'invoices': invoices,
        'total_count': len(invoices),
        'next_billing_date': '01/01/2026',
        'payment_method': {
            'type': 'card',
            'last4': '4242',
            'brand': 'Visa'
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_support(request):
    """
    Endpoint para el formulario de contacto/ayuda
    Envía un email al equipo de soporte con el mensaje del usuario
    """
    from .email_service import email_service
    from django.conf import settings
    
    name = request.data.get('name')
    email = request.data.get('email')
    subject = request.data.get('subject')
    message = request.data.get('message')
    
    # Validar campos requeridos
    if not all([name, email, subject, message]):
        return Response(
            {'error': 'Todos los campos son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Preparar email para el equipo de soporte
    support_email = settings.config('SUPPORT_EMAIL', default='soporte@sustenty.io')
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #80cfc5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
            .info-box {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #80cfc5; }}
            .message-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 6px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📧 Nuevo Mensaje de Contacto</h2>
            </div>
            
            <div class="content">
                <div class="info-box">
                    <p><strong>Nombre:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Asunto:</strong> {subject}</p>
                </div>
                
                <div class="message-box">
                    <h3>Mensaje:</h3>
                    <p>{message}</p>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    💡 Responder a: <a href="mailto:{email}">{email}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Enviar email al equipo de soporte
    try:
        result = email_service.send_email(
            to_email=support_email,
            subject=f"[Contacto] {subject}",
            html_content=html_content,
            text_content=f"Nuevo mensaje de {name} ({email})\n\nAsunto: {subject}\n\nMensaje:\n{message}"
        )
        
        # También enviar confirmación al usuario
        confirmation_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #80cfc5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Mensaje Recibido</h1>
                </div>
                
                <div class="content">
                    <p>Hola {name},</p>
                    <p>Hemos recibido tu mensaje y te responderemos lo antes posible (generalmente en menos de 24 horas).</p>
                    <p><strong>Tu mensaje:</strong></p>
                    <p style="background: white; padding: 15px; border-left: 4px solid #80cfc5;">
                        {message[:200]}{'...' if len(message) > 200 else ''}
                    </p>
                    <p>Mientras tanto, puedes:</p>
                    <ul>
                        <li>Revisar nuestro <a href="{settings.FRONTEND_URL}/ayuda">Centro de Ayuda</a></li>
                        <li>Contactarnos por WhatsApp al +56 9 1234 5678</li>
                        <li>Explorar nuestra <a href="{settings.FRONTEND_URL}/api/docs">documentación</a></li>
                    </ul>
                    <p>¡Gracias por ser parte de Sustenty! 🌱</p>
                    <p>El equipo de Sustenty</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        email_service.send_email(
            to_email=email,
            subject="Hemos recibido tu mensaje - Sustenty",
            html_content=confirmation_html
        )
        
        return Response({
            'message': 'Mensaje enviado correctamente. Te responderemos pronto.',
            'success': True
        })
        
    except Exception as e:
        logger.error(f"Error enviando mensaje de contacto: {e}")
        return Response({
            'message': 'Mensaje recibido. Te contactaremos pronto.',
            'success': True  # Siempre retornar success para el usuario
        })


# =============================================================================
# NOTIFICACIONES
# =============================================================================

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        notif = serializer.save(user=self.request.user)
        notif.send_email()

    def perform_update(self, serializer):
        notif = serializer.save()
        if notif.reinforced_by_email and not notif.sent_email:
            notif.send_email()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sample_notifications(request):
    """
    Crea varias notificaciones de ejemplo para el usuario autenticado
    """
    user = request.user
    Notification.objects.create(
        user=user,
        notif_type='alert',
        title='¡Acción próxima a vencer!',
        message='Tienes una acción ESG que vence mañana. No olvides completarla.',
        url='/acciones',
        reinforced_by_email=True
    )
    Notification.objects.create(
        user=user,
        notif_type='reminder',
        title='Carga tus métricas ESG',
        message='Recuerda cargar los datos de emisiones del mes actual.',
        url='/metricas',
        reinforced_by_email=False
    )
    Notification.objects.create(
        user=user,
        notif_type='info',
        title='Nuevo logro desbloqueado',
        message='¡Felicidades! Has completado tu primera acción de sostenibilidad.',
        url='/dashboard',
        reinforced_by_email=False
    )
    return Response({'detail': 'Notificaciones de ejemplo creadas.'})

from datetime import date, timedelta
from apps.esg.models import ESGAction, ESGDataCollection

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_auto_notifications(request):
    """
    Genera notificaciones automáticas para el usuario autenticado:
    - Acciones ESG próximas a vencer (dentro de 3 días)
    - Métricas ESG pendientes de carga para el mes actual
    """
    user = request.user
    today = date.today()
    # Acciones próximas a vencer
    actions = ESGAction.objects.filter(
        responsible=user,
        status__in=['planned', 'in_progress'],
        end_date__gte=today,
        end_date__lte=today + timedelta(days=3)
    )
    for action in actions:
        Notification.objects.get_or_create(
            user=user,
            notif_type='alert',
            title=f'Acción próxima a vencer: {action.title}',
            message=f'La acción "{action.title}" vence el {action.end_date}.',
            url=f'/acciones/{action.id}',
            reinforced_by_email=True,
            read=False
        )
    # Métricas pendientes de carga
    current_month = today.month
    current_year = today.year
    metrics_pending = ESGDataCollection.objects.filter(
        responsible=user,
        status='pending',
        collection_date__year=current_year,
        collection_date__month=current_month
    )
    for metric in metrics_pending:
        Notification.objects.get_or_create(
            user=user,
            notif_type='reminder',
            title=f'Métrica pendiente: {metric.metric.name}',
            message=f'Falta cargar la métrica "{metric.metric.name}" para el período {metric.period.name}.',
            url=f'/metricas/{metric.id}',
            reinforced_by_email=False,
            read=False
        )
    return Response({'detail': 'Notificaciones automáticas generadas.'})
