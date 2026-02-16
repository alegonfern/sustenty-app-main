from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class ESGCategory(models.Model):
    """
    Categorías ESG: Ambiental (E), Social (S), Gobernanza (G).
    Marco estratégico de alto nivel.
    """
    CATEGORY_CHOICES = [
        ('environmental', 'Ambiental'),
        ('social', 'Social'),
        ('governance', 'Gobernanza'),
    ]

    name = models.CharField(max_length=100, verbose_name=_('Nombre'))
    code = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, unique=True,
        verbose_name=_('Código')
    )
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Icono'))
    color = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Color'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))

    class Meta:
        ordering = ['code']
        verbose_name = _('Categoría ESG')
        verbose_name_plural = _('Categorías ESG')

    def __str__(self):
        return self.name


class ESGGoal(models.Model):
    """
    Objetivos/Metas ESG estratégicos.
    Pueden vincularse a datos de carbono u otros módulos.
    """
    STATUS_CHOICES = [
        ('on_track', 'En Camino'),
        ('at_risk', 'En Riesgo'),
        ('delayed', 'Retrasado'),
        ('achieved', 'Alcanzado'),
        ('cancelled', 'Cancelado'),
    ]

    category = models.ForeignKey(
        ESGCategory, on_delete=models.CASCADE,
        related_name='goals', verbose_name=_('Categoría')
    )
    name = models.CharField(max_length=200, verbose_name=_('Nombre del Objetivo'))
    description = models.TextField(verbose_name=_('Descripción'))

    target_value = models.DecimalField(
        max_digits=15, decimal_places=4, verbose_name=_('Valor Meta')
    )
    current_value = models.DecimalField(
        max_digits=15, decimal_places=4, default=0,
        verbose_name=_('Valor Actual')
    )
    unit = models.CharField(
        max_length=50, blank=True, null=True,
        verbose_name=_('Unidad'), help_text=_('Ej: tonCO₂e, %, kWh')
    )

    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    target_date = models.DateField(verbose_name=_('Fecha Meta'))

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='on_track',
        verbose_name=_('Estado')
    )
    progress = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0, verbose_name=_('Progreso %')
    )

    responsible = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='responsible_esg_goals', verbose_name=_('Responsable')
    )
    organization = models.ForeignKey(
        'api.Organization', on_delete=models.CASCADE,
        related_name='esg_goals', null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='created_esg_goals'
    )

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Objetivo ESG')
        verbose_name_plural = _('Objetivos ESG')

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def calculate_progress(self):
        """Calcula el progreso basado en valor actual vs valor meta."""
        if self.target_value and self.target_value > 0:
            progress = (self.current_value / self.target_value) * 100
            return min(100, max(0, int(progress)))
        return 0


class ESGAction(models.Model):
    """
    Planes de Acción ESG.
    Iniciativas concretas vinculadas a objetivos estratégicos.
    """
    STATUS_CHOICES = [
        ('planned', 'Planificado'),
        ('in_progress', 'En Progreso'),
        ('paused', 'Pausado'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]

    category = models.ForeignKey(
        ESGCategory, on_delete=models.CASCADE,
        related_name='actions', verbose_name=_('Categoría')
    )
    title = models.CharField(max_length=200, verbose_name=_('Título'))
    description = models.TextField(verbose_name=_('Descripción'))

    goal = models.ForeignKey(
        ESGGoal, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='actions', verbose_name=_('Objetivo Asociado')
    )
    expected_impact = models.TextField(
        blank=True, null=True, verbose_name=_('Enfoque/Impacto Esperado')
    )
    actual_result = models.TextField(
        blank=True, null=True, verbose_name=_('Resultado Real/Logro')
    )

    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default='medium',
        verbose_name=_('Prioridad')
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='planned',
        verbose_name=_('Estado')
    )
    progress = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0, verbose_name=_('Progreso %')
    )

    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    end_date = models.DateField(verbose_name=_('Fecha de Fin'))

    responsible = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='responsible_esg_actions', verbose_name=_('Responsable')
    )
    team_members = models.ManyToManyField(
        User, blank=True, related_name='esg_action_team',
        verbose_name=_('Equipo')
    )

    budget = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True,
        verbose_name=_('Presupuesto')
    )
    actual_cost = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True,
        verbose_name=_('Costo Real')
    )

    organization = models.ForeignKey(
        'api.Organization', on_delete=models.CASCADE,
        related_name='esg_actions', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='created_esg_actions'
    )

    class Meta:
        ordering = ['-priority', '-start_date']
        verbose_name = _('Acción ESG')
        verbose_name_plural = _('Acciones ESG')

    def __str__(self):
        return f"{self.title} ({self.category.name})"


class ESGComplianceStandard(models.Model):
    """
    Estándares de cumplimiento ESG (GRI, SASB, TCFD, CDP, etc.)
    """
    name = models.CharField(max_length=100, verbose_name=_('Nombre del Estándar'))
    code = models.CharField(max_length=20, unique=True, verbose_name=_('Código'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    version = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Versión'))
    url = models.URLField(blank=True, null=True, verbose_name=_('URL'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))

    class Meta:
        ordering = ['name']
        verbose_name = _('Estándar de Cumplimiento')
        verbose_name_plural = _('Estándares de Cumplimiento')

    def __str__(self):
        return f"{self.name} ({self.code})"
