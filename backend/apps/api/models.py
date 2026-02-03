from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class Notification(models.Model):
    """
    Notificación para el usuario, con refuerzo opcional por correo
    """
    NOTIF_TYPE_CHOICES = [
        ('alert', 'Alerta'),
        ('reminder', 'Recordatorio'),
        ('info', 'Informativa'),
        ('action', 'Acción requerida'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=20, choices=NOTIF_TYPE_CHOICES, default='info')
    title = models.CharField(max_length=200)
    message = models.TextField()
    url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    reinforced_by_email = models.BooleanField(default=False)
    sent_email = models.BooleanField(default=False)

    def send_email(self):
        """Envía la notificación por correo si corresponde y no se ha enviado aún"""
        if self.reinforced_by_email and not self.sent_email:
            # Aquí se integraría con el servicio de correo
            from .email_service import send_notification_email
            send_notification_email(self.user.email, self.title, self.message, self.url)
            self.sent_email = True
            self.save()

    def __str__(self):
        return f"Notificación para {self.user.username}: {self.title}"

class BaseModel(models.Model):
    """
    Modelo base con campos comunes para todos los modelos
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class UserProfile(BaseModel):
    """
    Perfil extendido del usuario con información adicional
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/%Y/%m/', blank=True, null=True, verbose_name='Foto de perfil')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name='Cargo')
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name='Departamento')
    
    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'
    
    def __str__(self):
        return f"Perfil de {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Crear perfil automáticamente cuando se crea un usuario"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Guardar perfil cuando se guarda el usuario"""
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        UserProfile.objects.create(user=instance)


class Organization(BaseModel):
    """
    Modelo de Organización
    """
    SECTOR_CHOICES = [
        ('manufactura', 'Manufactura'),
        ('tecnologia', 'Tecnología/Software'),
        ('retail', 'Retail/Comercio'),
        ('servicios', 'Servicios profesionales'),
        ('alimentos', 'Alimentos y bebidas'),
        ('construccion', 'Construcción'),
        ('logistica', 'Logística/Transporte'),
        ('energia', 'Energía'),
        ('turismo', 'Turismo/Hospitalidad'),
    ]
    
    MODO_CHOICES = [
        ('cumplimiento', 'Cumplimiento'),
        ('accion', 'Acción'),
        ('liderazgo', 'Liderazgo'),
    ]
    
    nombre = models.CharField(max_length=200, verbose_name='Nombre de la Organización')
    rol = models.CharField(max_length=100, verbose_name='Rol del usuario')
    empleados = models.CharField(max_length=50, verbose_name='Cantidad de empleados')
    rut = models.CharField(max_length=20, verbose_name='RUT')
    sector = models.CharField(max_length=50, choices=SECTOR_CHOICES, verbose_name='Sector/Industria')
    modo = models.CharField(max_length=50, choices=MODO_CHOICES, verbose_name='Modo')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organizations', verbose_name='Usuario')
    
    class Meta:
        verbose_name = 'Organización'
        verbose_name_plural = 'Organizaciones'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.nombre


class UserSettings(BaseModel):
    """
    Configuraciones del usuario - Preferencias personalizadas
    """
    THEME_CHOICES = [
        ('light', 'Claro'),
        ('dark', 'Oscuro'),
        ('system', 'Sistema'),
    ]
    
    LANGUAGE_CHOICES = [
        ('es', 'Español'),
        ('en', 'English'),
        ('pt', 'Português'),
        ('fr', 'Français'),
    ]
    
    DATE_FORMAT_CHOICES = [
        ('DD/MM/YYYY', 'DD/MM/YYYY'),
        ('MM/DD/YYYY', 'MM/DD/YYYY'),
        ('YYYY-MM-DD', 'YYYY-MM-DD'),
    ]
    
    TIMEZONE_CHOICES = [
        ('Europe/Madrid', 'Europe/Madrid (CET)'),
        ('Europe/London', 'Europe/London (GMT)'),
        ('America/New_York', 'America/New_York (EST)'),
        ('America/Los_Angeles', 'America/Los_Angeles (PST)'),
        ('America/Mexico_City', 'America/Mexico_City (CST)'),
        ('America/Bogota', 'America/Bogota (COT)'),
        ('America/Santiago', 'America/Santiago (CLT)'),
        ('America/Buenos_Aires', 'America/Buenos_Aires (ART)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Notificaciones
    email_notifications = models.BooleanField(default=True, verbose_name='Notificaciones por email')
    push_notifications = models.BooleanField(default=False, verbose_name='Notificaciones push')
    weekly_digest = models.BooleanField(default=True, verbose_name='Resumen semanal')
    alerts_emissions = models.BooleanField(default=True, verbose_name='Alertas de emisiones')
    alerts_compliance = models.BooleanField(default=True, verbose_name='Alertas de cumplimiento')
    alerts_deadlines = models.BooleanField(default=True, verbose_name='Recordatorios de fechas')
    
    # Apariencia
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light', verbose_name='Tema')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='es', verbose_name='Idioma')
    date_format = models.CharField(max_length=15, choices=DATE_FORMAT_CHOICES, default='DD/MM/YYYY', verbose_name='Formato de fecha')
    timezone = models.CharField(max_length=50, choices=TIMEZONE_CHOICES, default='Europe/Madrid', verbose_name='Zona horaria')
    
    # Seguridad
    two_factor_enabled = models.BooleanField(default=False, verbose_name='2FA habilitado')
    session_timeout = models.IntegerField(default=30, verbose_name='Tiempo de sesión (minutos)')
    ip_whitelist_enabled = models.BooleanField(default=False, verbose_name='Lista blanca de IPs')
    ip_whitelist = models.TextField(blank=True, null=True, verbose_name='IPs permitidas')
    
    # API
    api_enabled = models.BooleanField(default=False, verbose_name='API habilitada')
    api_key = models.CharField(max_length=100, blank=True, null=True, verbose_name='API Key')
    webhooks_enabled = models.BooleanField(default=False, verbose_name='Webhooks habilitados')
    webhook_url = models.URLField(blank=True, null=True, verbose_name='URL del webhook')
    
    class Meta:
        verbose_name = 'Configuración de Usuario'
        verbose_name_plural = 'Configuraciones de Usuario'
    
    def __str__(self):
        return f"Configuración de {self.user.username}"


@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    """Crear configuración automáticamente cuando se crea un usuario"""
    if created:
        UserSettings.objects.get_or_create(user=instance)


class Integration(BaseModel):
    """
    Integraciones de usuario con servicios externos
    """
    PROVIDER_CHOICES = [
        ('google', 'Google Workspace'),
        ('microsoft', 'Microsoft 365'),
        ('slack', 'Slack'),
        ('zapier', 'Zapier'),
        ('salesforce', 'Salesforce'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='integrations')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, verbose_name='Proveedor')
    is_connected = models.BooleanField(default=False, verbose_name='Conectado')
    access_token = models.TextField(blank=True, null=True, verbose_name='Token de acceso')
    refresh_token = models.TextField(blank=True, null=True, verbose_name='Token de refresco')
    token_expires_at = models.DateTimeField(blank=True, null=True, verbose_name='Expiración del token')
    metadata = models.JSONField(blank=True, null=True, verbose_name='Metadatos')
    
    class Meta:
        verbose_name = 'Integración'
        verbose_name_plural = 'Integraciones'
        unique_together = ['user', 'provider']
    
    def __str__(self):
        return f"{self.user.username} - {self.provider}"