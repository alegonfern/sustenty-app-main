from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class ESGPeriod(models.Model):
    """
    Períodos ESG - Similar a períodos contables
    Permite organizar todos los datos ESG capturados dentro de un rango de fechas
    """
    name = models.CharField(max_length=100, verbose_name=_('Nombre del Período'))
    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    end_date = models.DateField(verbose_name=_('Fecha de Fin'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    is_closed = models.BooleanField(default=False, verbose_name=_('Cerrado'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, related_name='esg_periods', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_esg_periods')

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Período ESG')
        verbose_name_plural = _('Períodos ESG')
        unique_together = ['name', 'organization']

    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"


class ESGCategory(models.Model):
    """
    Categorías ESG: Ambiental (E), Social (S), Gobernanza (G)
    """
    CATEGORY_CHOICES = [
        ('environmental', 'Ambiental'),
        ('social', 'Social'),
        ('governance', 'Gobernanza'),
    ]

    name = models.CharField(max_length=100, verbose_name=_('Nombre'))
    code = models.CharField(max_length=20, choices=CATEGORY_CHOICES, unique=True, verbose_name=_('Código'))
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


class ESGScope(models.Model):
    """
    Orígenes/Alcances de emisiones (Scope 1, 2, 3)
    Principalmente para categoría Ambiental
    """
    SCOPE_CHOICES = [
        ('scope_1', 'Scope 1 - Emisiones Directas'),
        ('scope_2', 'Scope 2 - Emisiones Indirectas de Energía'),
        ('scope_3', 'Scope 3 - Otras Emisiones Indirectas'),
    ]

    name = models.CharField(max_length=100, verbose_name=_('Nombre'))
    code = models.CharField(max_length=20, choices=SCOPE_CHOICES, unique=True, verbose_name=_('Código'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    category = models.ForeignKey(ESGCategory, on_delete=models.CASCADE, related_name='scopes', verbose_name=_('Categoría'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        verbose_name = _('Origen/Scope ESG')
        verbose_name_plural = _('Orígenes/Scopes ESG')

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class ESGMetric(models.Model):
    """
    Factores de Emisión / Métricas ESG configurables
    Similar a los "Factores de Emisión" en Odoo
    """
    DATA_TYPE_CHOICES = [
        ('numeric', 'Numérico'),
        ('percentage', 'Porcentaje'),
        ('text', 'Texto'),
        ('boolean', 'Sí/No'),
        ('date', 'Fecha'),
    ]

    UNIT_CHOICES = [
        ('ton', 'Toneladas'),
        ('kg', 'Kilogramos'),
        ('kwh', 'Kilovatios-hora'),
        ('m3', 'Metros cúbicos'),
        ('l', 'Litros'),
        ('percentage', 'Porcentaje'),
        ('count', 'Cantidad'),
        ('hours', 'Horas'),
        ('days', 'Días'),
        ('currency', 'Moneda'),
        ('other', 'Otro'),
    ]

    category = models.ForeignKey(ESGCategory, on_delete=models.CASCADE, related_name='metrics', verbose_name=_('Categoría'))
    scope = models.ForeignKey(ESGScope, on_delete=models.SET_NULL, null=True, blank=True, related_name='metrics', verbose_name=_('Origen/Scope'))
    name = models.CharField(max_length=200, verbose_name=_('Nombre de la Métrica'))
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Código'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    data_type = models.CharField(max_length=20, choices=DATA_TYPE_CHOICES, default='numeric', verbose_name=_('Tipo de Dato'))
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, blank=True, null=True, verbose_name=_('Unidad'))
    
    # Factor de conversión/emisión (ej: kg CO2e por unidad)
    emission_factor = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True, verbose_name=_('Factor de Emisión'))
    emission_unit = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Unidad de Emisión'), help_text=_('Ej: kgCO2e'))
    
    # Estándares de reporte
    gri_standard = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Estándar GRI'))
    sasb_standard = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Estándar SASB'))
    tcfd_standard = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Estándar TCFD'))
    
    is_mandatory = models.BooleanField(default=False, verbose_name=_('Obligatorio'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, related_name='esg_metrics', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = _('Métrica ESG')
        verbose_name_plural = _('Métricas ESG')

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class ESGDataCollection(models.Model):
    """
    Colección de datos ESG - Registros de valores por métrica y período
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En Proceso'),
        ('completed', 'Completado'),
        ('reviewed', 'Revisado'),
        ('approved', 'Aprobado'),
    ]

    period = models.ForeignKey(ESGPeriod, on_delete=models.CASCADE, related_name='data_collections', verbose_name=_('Período'))
    metric = models.ForeignKey(ESGMetric, on_delete=models.CASCADE, related_name='data_collections', verbose_name=_('Factor de Emisión/Métrica'))
    
    # Fecha y cantidad del registro (como en Odoo)
    collection_date = models.DateField(verbose_name=_('Fecha'))
    quantity = models.DecimalField(max_digits=15, decimal_places=4, default=0, verbose_name=_('Cantidad'))
    uncertainty_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_('Incertidumbre (%)'), validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Resultado calculado (cantidad * factor de emisión)
    calculated_emission = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True, verbose_name=_('Emisión Calculada'))
    
    # Valores adicionales según tipo de dato
    value_numeric = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True, verbose_name=_('Valor Numérico'))
    value_text = models.TextField(null=True, blank=True, verbose_name=_('Valor Texto'))
    value_boolean = models.BooleanField(null=True, blank=True, verbose_name=_('Valor Booleano'))
    value_date = models.DateField(null=True, blank=True, verbose_name=_('Valor Fecha'))
    
    # Meta y progreso
    target_value = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True, verbose_name=_('Valor Meta'))
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name=_('Estado'))
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='responsible_esg_data', verbose_name=_('Responsable'))
    
    # Evidencia y documentación
    notes = models.TextField(blank=True, null=True, verbose_name=_('Notas'))
    evidence_file = models.FileField(upload_to='esg/evidence/', null=True, blank=True, verbose_name=_('Archivo de Evidencia'))
    
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, related_name='esg_data_collections', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_esg_data')

    class Meta:
        ordering = ['-collection_date', 'metric']
        verbose_name = _('Colección de Datos ESG')
        verbose_name_plural = _('Colecciones de Datos ESG')
        unique_together = ['period', 'metric', 'collection_date']

    def save(self, *args, **kwargs):
        """Calcular emisión antes de guardar"""
        if self.metric and self.metric.emission_factor and self.quantity:
            self.calculated_emission = self.quantity * self.metric.emission_factor
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.metric.name} - {self.period.name} - {self.collection_date}"

    def get_value(self):
        """Retorna el valor según el tipo de dato de la métrica"""
        if self.metric.data_type == 'numeric' or self.metric.data_type == 'percentage':
            return self.value_numeric
        elif self.metric.data_type == 'text':
            return self.value_text
        elif self.metric.data_type == 'boolean':
            return self.value_boolean
        elif self.metric.data_type == 'date':
            return self.value_date
        return None


class ESGGoal(models.Model):
    """
    Objetivos/Metas ESG
    """
    STATUS_CHOICES = [
        ('on_track', 'En Camino'),
        ('at_risk', 'En Riesgo'),
        ('delayed', 'Retrasado'),
        ('achieved', 'Alcanzado'),
        ('cancelled', 'Cancelado'),
    ]

    category = models.ForeignKey(ESGCategory, on_delete=models.CASCADE, related_name='goals', verbose_name=_('Categoría'))
    name = models.CharField(max_length=200, verbose_name=_('Nombre del Objetivo'))
    description = models.TextField(verbose_name=_('Descripción'))
    
    metric = models.ForeignKey(ESGMetric, on_delete=models.SET_NULL, null=True, blank=True, related_name='goals', verbose_name=_('Métrica Asociada'))
    target_value = models.DecimalField(max_digits=15, decimal_places=4, verbose_name=_('Valor Meta'))
    current_value = models.DecimalField(max_digits=15, decimal_places=4, default=0, verbose_name=_('Valor Actual'))
    
    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    target_date = models.DateField(verbose_name=_('Fecha Meta'))
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='on_track', verbose_name=_('Estado'))
    progress = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0, verbose_name=_('Progreso %'))
    
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='responsible_esg_goals', verbose_name=_('Responsable'))
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, related_name='esg_goals', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_esg_goals')

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Objetivo ESG')
        verbose_name_plural = _('Objetivos ESG')

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def calculate_progress(self):
        """Calcula el progreso basado en valor actual vs valor meta"""
        if self.target_value and self.target_value > 0:
            progress = (self.current_value / self.target_value) * 100
            return min(100, max(0, int(progress)))
        return 0


class ESGAction(models.Model):
    """
    Planes de Acción ESG
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

    category = models.ForeignKey(ESGCategory, on_delete=models.CASCADE, related_name='actions', verbose_name=_('Categoría'))
    title = models.CharField(max_length=200, verbose_name=_('Título'))
    description = models.TextField(verbose_name=_('Descripción'))
    
    goal = models.ForeignKey(ESGGoal, on_delete=models.SET_NULL, null=True, blank=True, related_name='actions', verbose_name=_('Objetivo Asociado'))
    
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name=_('Prioridad'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned', verbose_name=_('Estado'))
    progress = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0, verbose_name=_('Progreso %'))
    
    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    end_date = models.DateField(verbose_name=_('Fecha de Fin'))
    
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='responsible_esg_actions', verbose_name=_('Responsable'))
    team_members = models.ManyToManyField(User, blank=True, related_name='esg_action_team', verbose_name=_('Equipo'))
    
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name=_('Presupuesto'))
    actual_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name=_('Costo Real'))
    
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, related_name='esg_actions', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_esg_actions')

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
