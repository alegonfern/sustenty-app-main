from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class CarbonPeriod(models.Model):
    """
    Períodos de medición de huella de carbono.
    Permite organizar los datos de emisiones dentro de un rango de fechas.
    """
    name = models.CharField(max_length=100, verbose_name=_('Nombre del Período'))
    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    end_date = models.DateField(verbose_name=_('Fecha de Fin'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    is_closed = models.BooleanField(default=False, verbose_name=_('Cerrado'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    organization = models.ForeignKey(
        'api.Organization', on_delete=models.CASCADE,
        related_name='carbon_periods', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='created_carbon_periods'
    )

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Período de Carbono')
        verbose_name_plural = _('Períodos de Carbono')
        unique_together = ['name', 'organization']

    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"


class EmissionScope(models.Model):
    """
    Alcances de emisiones GHG (Scope 1, 2, 3) según GHG Protocol.
    """
    SCOPE_CHOICES = [
        ('scope_1', 'Scope 1 - Emisiones Directas'),
        ('scope_2', 'Scope 2 - Emisiones Indirectas de Energía'),
        ('scope_3', 'Scope 3 - Otras Emisiones Indirectas'),
    ]

    name = models.CharField(max_length=100, verbose_name=_('Nombre'))
    code = models.CharField(
        max_length=20, choices=SCOPE_CHOICES, unique=True,
        verbose_name=_('Código')
    )
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        verbose_name = _('Alcance de Emisiones')
        verbose_name_plural = _('Alcances de Emisiones')

    def __str__(self):
        return self.name


class EmissionFactor(models.Model):
    """
    Factores de emisión configurables.
    Convierte unidades de actividad (kWh, litros, km) en kgCO₂e.
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

    scope = models.ForeignKey(
        EmissionScope, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='factors', verbose_name=_('Alcance/Scope')
    )
    name = models.CharField(max_length=200, verbose_name=_('Nombre del Factor'))
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Código'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    data_type = models.CharField(
        max_length=20, choices=DATA_TYPE_CHOICES, default='numeric',
        verbose_name=_('Tipo de Dato')
    )
    unit = models.CharField(
        max_length=20, choices=UNIT_CHOICES, blank=True, null=True,
        verbose_name=_('Unidad de Actividad')
    )

    # Factor de conversión (ej: kg CO2e por unidad de actividad)
    emission_factor = models.DecimalField(
        max_digits=15, decimal_places=6, null=True, blank=True,
        verbose_name=_('Factor de Emisión')
    )
    emission_unit = models.CharField(
        max_length=50, blank=True, null=True,
        verbose_name=_('Unidad de Emisión'),
        help_text=_('Ej: kgCO2e')
    )

    # Estándares de reporte asociados
    gri_standard = models.CharField(
        max_length=50, blank=True, null=True, verbose_name=_('Estándar GRI')
    )
    sasb_standard = models.CharField(
        max_length=50, blank=True, null=True, verbose_name=_('Estándar SASB')
    )
    tcfd_standard = models.CharField(
        max_length=50, blank=True, null=True, verbose_name=_('Estándar TCFD')
    )

    is_mandatory = models.BooleanField(default=False, verbose_name=_('Obligatorio'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    organization = models.ForeignKey(
        'api.Organization', on_delete=models.CASCADE,
        related_name='emission_factors', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scope', 'name']
        verbose_name = _('Factor de Emisión')
        verbose_name_plural = _('Factores de Emisión')

    def __str__(self):
        scope_name = self.scope.name if self.scope else 'Sin scope'
        return f"{self.name} ({scope_name})"


class CarbonDataEntry(models.Model):
    """
    Registro de datos de emisiones.
    Cada entrada vincula un factor de emisión con una cantidad y período.
    La emisión se calcula automáticamente: cantidad × factor de emisión.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En Proceso'),
        ('completed', 'Completado'),
        ('reviewed', 'Revisado'),
        ('approved', 'Aprobado'),
    ]

    period = models.ForeignKey(
        CarbonPeriod, on_delete=models.CASCADE,
        related_name='data_entries', verbose_name=_('Período')
    )
    factor = models.ForeignKey(
        EmissionFactor, on_delete=models.CASCADE,
        related_name='data_entries', verbose_name=_('Factor de Emisión')
    )

    # Fecha y cantidad del registro
    collection_date = models.DateField(verbose_name=_('Fecha'))
    quantity = models.DecimalField(
        max_digits=15, decimal_places=4, default=0,
        verbose_name=_('Cantidad')
    )
    uncertainty_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        verbose_name=_('Incertidumbre (%)'),
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Resultado calculado (cantidad × factor de emisión)
    calculated_emission = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True,
        verbose_name=_('Emisión Calculada (kgCO₂e)')
    )

    # Valores adicionales según tipo de dato
    value_numeric = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True,
        verbose_name=_('Valor Numérico')
    )
    value_text = models.TextField(null=True, blank=True, verbose_name=_('Valor Texto'))
    value_boolean = models.BooleanField(null=True, blank=True, verbose_name=_('Valor Booleano'))
    value_date = models.DateField(null=True, blank=True, verbose_name=_('Valor Fecha'))

    # Meta y progreso
    target_value = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True,
        verbose_name=_('Valor Meta')
    )

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending',
        verbose_name=_('Estado')
    )
    responsible = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='responsible_carbon_data', verbose_name=_('Responsable')
    )

    # Evidencia y documentación
    notes = models.TextField(blank=True, null=True, verbose_name=_('Notas'))
    evidence_file = models.FileField(
        upload_to='carbon/evidence/', null=True, blank=True,
        verbose_name=_('Archivo de Evidencia')
    )

    organization = models.ForeignKey(
        'api.Organization', on_delete=models.CASCADE,
        related_name='carbon_data_entries', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='created_carbon_data'
    )

    class Meta:
        ordering = ['-collection_date', 'factor']
        verbose_name = _('Registro de Emisiones')
        verbose_name_plural = _('Registros de Emisiones')
        unique_together = ['period', 'factor', 'collection_date']

    def save(self, *args, **kwargs):
        """Calcular emisión antes de guardar."""
        if self.factor and self.factor.emission_factor and self.quantity:
            self.calculated_emission = self.quantity * self.factor.emission_factor
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.factor.name} - {self.period.name} - {self.collection_date}"

    def get_value(self):
        """Retorna el valor según el tipo de dato del factor."""
        if self.factor.data_type in ('numeric', 'percentage'):
            return self.value_numeric
        elif self.factor.data_type == 'text':
            return self.value_text
        elif self.factor.data_type == 'boolean':
            return self.value_boolean
        elif self.factor.data_type == 'date':
            return self.value_date
        return None
