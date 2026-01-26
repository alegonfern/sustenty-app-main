from rest_framework import serializers
from .models import Notification
# --- SERIALIZER DE NOTIFICACIONES ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notif_type', 'title', 'message', 'url',
            'created_at', 'read', 'reinforced_by_email', 'sent_email'
        ]
        read_only_fields = ['id', 'created_at', 'sent_email']
from .models import Organization, UserSettings, Integration
import re


def validar_rut(rut):
    """
    Valida formato y dígito verificador de RUT chileno
    Acepta formatos: 12.345.678-9, 12345678-9, 123456789
    """
    # Limpiar el RUT (quitar puntos y guiones)
    rut_limpio = rut.replace('.', '').replace('-', '').strip()
    
    # Verificar que tenga entre 8 y 9 caracteres
    if len(rut_limpio) < 8 or len(rut_limpio) > 9:
        return False
    
    # Separar número y dígito verificador
    rut_numero = rut_limpio[:-1]
    dv = rut_limpio[-1].upper()
    
    # Verificar que el número sea numérico
    if not rut_numero.isdigit():
        return False
    
    # Calcular dígito verificador
    suma = 0
    multiplicador = 2
    
    for digito in reversed(rut_numero):
        suma += int(digito) * multiplicador
        multiplicador += 1
        if multiplicador > 7:
            multiplicador = 2
    
    resto = suma % 11
    dv_calculado = 11 - resto
    
    if dv_calculado == 11:
        dv_esperado = '0'
    elif dv_calculado == 10:
        dv_esperado = 'K'
    else:
        dv_esperado = str(dv_calculado)
    
    return dv == dv_esperado


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Organization
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Organization
        fields = [
            'id',
            'nombre',
            'rol',
            'empleados',
            'rut',
            'sector',
            'modo',
            'user',
            'user_email',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear organizaciones
    """
    class Meta:
        model = Organization
        fields = [
            'nombre',
            'rol',
            'empleados',
            'rut',
            'sector',
            'modo'
        ]
    
    def validate(self, data):
        # Validar que todos los campos estén presentes
        required_fields = ['nombre', 'rol', 'empleados', 'rut', 'sector', 'modo']
        for field in required_fields:
            if field not in data or not data[field]:
                raise serializers.ValidationError({field: f'El campo {field} es requerido'})
        
        # Validar formato de RUT
        if not validar_rut(data['rut']):
            raise serializers.ValidationError({
                'rut': 'RUT inválido. Formato esperado: 12.345.678-9 o 12345678-9'
            })
        
        return data
    
    def create(self, validated_data):
        # El usuario se asigna desde la vista
        return Organization.objects.create(**validated_data)


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer para las configuraciones del usuario
    """
    class Meta:
        model = UserSettings
        fields = [
            'id',
            # Notificaciones
            'email_notifications',
            'push_notifications',
            'weekly_digest',
            'alerts_emissions',
            'alerts_compliance',
            'alerts_deadlines',
            # Apariencia
            'theme',
            'language',
            'date_format',
            'timezone',
            # Seguridad
            'two_factor_enabled',
            'session_timeout',
            'ip_whitelist_enabled',
            'ip_whitelist',
            # API
            'api_enabled',
            'api_key',
            'webhooks_enabled',
            'webhook_url',
            # Timestamps
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'api_key', 'created_at', 'updated_at']


class IntegrationSerializer(serializers.ModelSerializer):
    """
    Serializer para integraciones
    """
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    
    class Meta:
        model = Integration
        fields = [
            'id',
            'provider',
            'provider_display',
            'is_connected',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
