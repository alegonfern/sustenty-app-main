from django.db import models
from django.contrib.auth import get_user_model
from apps.api.models import Organization, BaseModel

User = get_user_model()


class Team(BaseModel):
    """
    Modelo para Equipos de trabajo
    """
    name = models.CharField(max_length=200, verbose_name='Nombre del Equipo')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='teams',
        verbose_name='Organización'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_teams',
        verbose_name='Creado por'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')

    class Meta:
        verbose_name = 'Equipo'
        verbose_name_plural = 'Equipos'
        ordering = ['-created_at']
        unique_together = ['name', 'organization']

    def __str__(self):
        return f"{self.name} - {self.organization.nombre}"


class TeamMember(BaseModel):
    """
    Modelo para Miembros del Equipo
    """
    NOTIFICATION_CHOICES = [
        ('all', 'Todo'),
        ('relevant', 'Relevante'),
        ('emergency', 'Emergencia'),
    ]

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name='Equipo'
    )
    name = models.CharField(max_length=200, verbose_name='Nombre Completo')
    position = models.CharField(max_length=200, verbose_name='Cargo')
    email = models.EmailField(verbose_name='Correo Electrónico')
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='team_members',
        verbose_name='Organización'
    )
    notification_level = models.CharField(
        max_length=20,
        choices=NOTIFICATION_CHOICES,
        default='relevant',
        verbose_name='Nivel de Notificación'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_members',
        verbose_name='Creado por'
    )

    class Meta:
        verbose_name = 'Miembro del Equipo'
        verbose_name_plural = 'Miembros del Equipo'
        ordering = ['name']
        unique_together = ['email', 'organization']

    def __str__(self):
        return f"{self.name} - {self.position}"
