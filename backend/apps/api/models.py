from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class BaseModel(models.Model):
    """
    Modelo base con campos comunes para todos los modelos
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


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