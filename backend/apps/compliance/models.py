from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid


class ComplianceFramework(models.Model):
    """
    Frameworks normativos: ISO 27001, ISO 14001, GRI, CSRD, DORA, SOC2, etc.
    """
    CATEGORY_CHOICES = [
        ('sustainability', 'Sostenibilidad'),
        ('environmental', 'Ambiental'),
        ('security', 'Seguridad de la Información'),
        ('governance', 'Gobernanza'),
        ('quality', 'Calidad'),
        ('social', 'Social/Laboral'),
        ('financial', 'Financiero'),
        ('data_privacy', 'Privacidad de Datos'),
    ]

    name = models.CharField(max_length=200, verbose_name=_('Nombre'))
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Código'))
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name=_('Categoría'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    version = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Versión'))
    
    # Información del estándar
    issuing_body = models.CharField(max_length=200, blank=True, null=True, verbose_name=_('Organismo Emisor'))
    official_url = models.URLField(blank=True, null=True, verbose_name=_('URL Oficial'))
    last_updated = models.DateField(blank=True, null=True, verbose_name=_('Última Actualización'))
    
    # Configuración de análisis
    analysis_prompt = models.TextField(blank=True, null=True, verbose_name=_('Prompt de Análisis IA'), 
        help_text=_('Instrucciones específicas para la IA al analizar documentos para este framework'))
    
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Icono'))
    color = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Color'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = _('Framework de Cumplimiento')
        verbose_name_plural = _('Frameworks de Cumplimiento')

    def __str__(self):
        return f"{self.name} ({self.code})"

    def get_requirement_count(self):
        return self.requirements.count()


class ComplianceRequirement(models.Model):
    """
    Requisitos específicos de cada framework normativo
    """
    CATEGORY_CHOICES = [
        ('policy', 'Políticas'),
        ('procedure', 'Procedimientos'),
        ('control', 'Controles'),
        ('documentation', 'Documentación'),
        ('training', 'Capacitación'),
        ('audit', 'Auditoría'),
        ('reporting', 'Reporte'),
        ('governance', 'Gobernanza'),
        ('technical', 'Técnico'),
        ('organizational', 'Organizacional'),
    ]

    framework = models.ForeignKey(ComplianceFramework, on_delete=models.CASCADE, 
        related_name='requirements', verbose_name=_('Framework'))
    
    code = models.CharField(max_length=50, verbose_name=_('Código del Requisito'))
    name = models.CharField(max_length=300, verbose_name=_('Nombre'))
    description = models.TextField(verbose_name=_('Descripción'))
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='control', 
        verbose_name=_('Categoría'))
    
    # Jerarquía (para requisitos anidados)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, 
        related_name='children', verbose_name=_('Requisito Padre'))
    order = models.IntegerField(default=0, verbose_name=_('Orden'))
    
    # Criterios de evaluación
    evaluation_criteria = models.TextField(blank=True, null=True, 
        verbose_name=_('Criterios de Evaluación'))
    evidence_required = models.TextField(blank=True, null=True, 
        verbose_name=_('Evidencia Requerida'))
    
    # Keywords para análisis automático
    keywords = models.JSONField(default=list, blank=True, 
        verbose_name=_('Palabras Clave'), help_text=_('Lista de palabras clave para detección automática'))
    
    is_mandatory = models.BooleanField(default=True, verbose_name=_('Obligatorio'))
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['framework', 'order', 'code']
        verbose_name = _('Requisito de Cumplimiento')
        verbose_name_plural = _('Requisitos de Cumplimiento')
        unique_together = ['framework', 'code']

    def __str__(self):
        return f"{self.code}: {self.name[:50]}"


class ComplianceDocument(models.Model):
    """
    Documentos subidos para análisis de cumplimiento
    """
    DOCUMENT_TYPE_CHOICES = [
        ('policy', 'Política'),
        ('procedure', 'Procedimiento'),
        ('manual', 'Manual'),
        ('record', 'Registro'),
        ('certificate', 'Certificado'),
        ('audit_report', 'Informe de Auditoría'),
        ('evidence', 'Evidencia'),
        ('contract', 'Contrato'),
        ('training', 'Material de Capacitación'),
        ('other', 'Otro'),
    ]

    ANALYSIS_STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=300, verbose_name=_('Nombre'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES, 
        default='other', verbose_name=_('Tipo de Documento'))
    
    # Archivo
    file = models.FileField(upload_to='compliance/documents/%Y/%m/', verbose_name=_('Archivo'))
    file_size = models.BigIntegerField(default=0, verbose_name=_('Tamaño (bytes)'))
    file_type = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('Tipo de Archivo'))
    
    # Contenido extraído para análisis
    extracted_text = models.TextField(blank=True, null=True, verbose_name=_('Texto Extraído'))
    extraction_date = models.DateTimeField(blank=True, null=True, verbose_name=_('Fecha de Extracción'))
    
    # Estado del análisis
    analysis_status = models.CharField(max_length=20, choices=ANALYSIS_STATUS_CHOICES, 
        default='pending', verbose_name=_('Estado de Análisis'))
    analysis_error = models.TextField(blank=True, null=True, verbose_name=_('Error de Análisis'))
    
    # Frameworks relacionados
    frameworks = models.ManyToManyField(ComplianceFramework, blank=True, 
        related_name='documents', verbose_name=_('Frameworks Relacionados'))
    
    # Metadatos
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, 
        related_name='compliance_documents', verbose_name=_('Organización'))
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, 
        related_name='uploaded_compliance_docs', verbose_name=_('Subido por'))
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Fecha de Subida'))
    updated_at = models.DateTimeField(auto_now=True)
    
    # Control de versiones
    version = models.CharField(max_length=20, default='1.0', verbose_name=_('Versión'))
    is_current = models.BooleanField(default=True, verbose_name=_('Versión Actual'))
    previous_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='next_versions', verbose_name=_('Versión Anterior'))

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = _('Documento de Cumplimiento')
        verbose_name_plural = _('Documentos de Cumplimiento')

    def __str__(self):
        return f"{self.name} (v{self.version})"


class ComplianceAnalysis(models.Model):
    """
    Análisis de cumplimiento - evaluación de documentos contra un framework
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=200, verbose_name=_('Nombre del Análisis'))
    framework = models.ForeignKey(ComplianceFramework, on_delete=models.CASCADE, 
        related_name='analyses', verbose_name=_('Framework'))
    
    # Documentos analizados
    documents = models.ManyToManyField(ComplianceDocument, related_name='analyses', 
        verbose_name=_('Documentos'))
    
    # Resultados
    compliance_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)], 
        verbose_name=_('Puntuación de Cumplimiento (%)'))
    
    requirements_total = models.IntegerField(default=0, verbose_name=_('Total Requisitos'))
    requirements_compliant = models.IntegerField(default=0, verbose_name=_('Requisitos Cumplidos'))
    requirements_partial = models.IntegerField(default=0, verbose_name=_('Requisitos Parciales'))
    requirements_non_compliant = models.IntegerField(default=0, verbose_name=_('Requisitos No Cumplidos'))
    
    # Resumen generado por IA
    executive_summary = models.TextField(blank=True, null=True, verbose_name=_('Resumen Ejecutivo'))
    key_findings = models.JSONField(default=list, blank=True, verbose_name=_('Hallazgos Clave'))
    recommendations = models.JSONField(default=list, blank=True, verbose_name=_('Recomendaciones'))
    
    # Resultado completo del análisis IA
    ai_analysis_result = models.JSONField(default=dict, blank=True, verbose_name=_('Resultado Análisis IA'))
    
    # Estado y metadatos
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', 
        verbose_name=_('Estado'))
    error_message = models.TextField(blank=True, null=True, verbose_name=_('Mensaje de Error'))
    
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, 
        related_name='compliance_analyses', verbose_name=_('Organización'))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, 
        related_name='created_compliance_analyses', verbose_name=_('Creado por'))
    
    started_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Inicio'))
    completed_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Completado'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Análisis de Cumplimiento')
        verbose_name_plural = _('Análisis de Cumplimiento')

    def __str__(self):
        return f"{self.name} - {self.framework.code}"

    def calculate_score(self):
        """Calcula el score de cumplimiento basado en los gaps"""
        gaps = self.gaps.all()
        if not gaps.exists():
            return None
        
        total = gaps.count()
        compliant = gaps.filter(status='compliant').count()
        partial = gaps.filter(status='partial').count()
        
        # Compliant = 100%, Partial = 50%, Non-compliant = 0%
        score = ((compliant * 100) + (partial * 50)) / total
        return round(score, 2)


class ComplianceGap(models.Model):
    """
    Brechas de cumplimiento detectadas por el análisis
    """
    STATUS_CHOICES = [
        ('compliant', 'Cumple'),
        ('partial', 'Cumplimiento Parcial'),
        ('non_compliant', 'No Cumple'),
        ('not_applicable', 'No Aplica'),
        ('pending_review', 'Pendiente Revisión'),
    ]

    SEVERITY_CHOICES = [
        ('critical', 'Crítico'),
        ('high', 'Alto'),
        ('medium', 'Medio'),
        ('low', 'Bajo'),
        ('info', 'Informativo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    analysis = models.ForeignKey(ComplianceAnalysis, on_delete=models.CASCADE, 
        related_name='gaps', verbose_name=_('Análisis'))
    requirement = models.ForeignKey(ComplianceRequirement, on_delete=models.CASCADE, 
        related_name='gaps', verbose_name=_('Requisito'))
    
    # Evaluación
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_review', 
        verbose_name=_('Estado'))
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium', 
        verbose_name=_('Severidad'))
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)], 
        verbose_name=_('Confianza IA (%)'))
    
    # Análisis IA
    finding = models.TextField(blank=True, null=True, verbose_name=_('Hallazgo'))
    evidence_found = models.TextField(blank=True, null=True, verbose_name=_('Evidencia Encontrada'))
    recommendation = models.TextField(blank=True, null=True, verbose_name=_('Recomendación'))
    
    # Documentos donde se encontró/falta evidencia
    relevant_documents = models.ManyToManyField(ComplianceDocument, blank=True,
        related_name='related_gaps', verbose_name=_('Documentos Relevantes'))
    
    # Plan de remediación
    remediation_plan = models.TextField(blank=True, null=True, verbose_name=_('Plan de Remediación'))
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_gaps', verbose_name=_('Responsable'))
    due_date = models.DateField(blank=True, null=True, verbose_name=_('Fecha Límite'))
    resolved_date = models.DateField(blank=True, null=True, verbose_name=_('Fecha Resolución'))
    
    # Notas y seguimiento
    notes = models.TextField(blank=True, null=True, verbose_name=_('Notas'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['analysis', 'severity', 'requirement__order']
        verbose_name = _('Brecha de Cumplimiento')
        verbose_name_plural = _('Brechas de Cumplimiento')

    def __str__(self):
        return f"{self.requirement.code}: {self.get_status_display()}"


class ComplianceReport(models.Model):
    """
    Reportes de cumplimiento generados
    """
    REPORT_TYPE_CHOICES = [
        ('gap_analysis', 'Análisis de Brechas'),
        ('compliance_status', 'Estado de Cumplimiento'),
        ('roadmap', 'Roadmap de Cumplimiento'),
        ('executive_summary', 'Resumen Ejecutivo'),
        ('audit_preparation', 'Preparación Auditoría'),
        ('progress_report', 'Reporte de Progreso'),
    ]

    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('xlsx', 'Excel'),
        ('docx', 'Word'),
        ('html', 'HTML'),
        ('json', 'JSON'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=200, verbose_name=_('Nombre del Reporte'))
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES, 
        verbose_name=_('Tipo de Reporte'))
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf',
        verbose_name=_('Formato'))
    
    # Análisis incluidos
    analyses = models.ManyToManyField(ComplianceAnalysis, related_name='reports',
        verbose_name=_('Análisis Incluidos'))
    frameworks = models.ManyToManyField(ComplianceFramework, related_name='reports',
        verbose_name=_('Frameworks'))
    
    # Archivo generado
    file = models.FileField(upload_to='compliance/reports/%Y/%m/', blank=True, null=True,
        verbose_name=_('Archivo'))
    
    # Contenido del reporte (para HTML/JSON)
    content = models.JSONField(default=dict, blank=True, verbose_name=_('Contenido'))
    
    # Período del reporte
    period_start = models.DateField(blank=True, null=True, verbose_name=_('Inicio Período'))
    period_end = models.DateField(blank=True, null=True, verbose_name=_('Fin Período'))
    
    # Metadatos
    organization = models.ForeignKey('api.Organization', on_delete=models.CASCADE, 
        related_name='compliance_reports', verbose_name=_('Organización'))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
        related_name='created_compliance_reports', verbose_name=_('Creado por'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Reporte de Cumplimiento')
        verbose_name_plural = _('Reportes de Cumplimiento')

    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class InvoiceEmissionMapping(models.Model):
    """
    Mapeo de categorías de facturas a factores de emisión para cálculo de huella de carbono.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    organization = models.ForeignKey(
        'api.Organization',
        on_delete=models.CASCADE,
        related_name='invoice_emission_mappings',
        verbose_name=_('Organización')
    )
    category = models.CharField(
        max_length=200,
        verbose_name=_('Categoría de Factura')
    )
    emission_factor = models.ForeignKey(
        'carbon.EmissionFactor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoice_mappings',
        verbose_name=_('Factor de Emisión')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
    notes = models.TextField(blank=True, verbose_name=_('Notas'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category']
        unique_together = [['organization', 'category']]
        verbose_name = _('Mapeo Factura-Emisión')
        verbose_name_plural = _('Mapeos Factura-Emisión')

    def __str__(self):
        return f"{self.organization} - {self.category}"
