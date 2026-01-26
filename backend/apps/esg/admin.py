from django.contrib import admin
from .models import (
    ESGPeriod, ESGCategory, ESGScope, ESGMetric, ESGDataCollection,
    ESGGoal, ESGAction, ESGComplianceStandard
)


@admin.register(ESGPeriod)
class ESGPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_active', 'is_closed', 'organization', 'created_at']
    list_filter = ['is_active', 'is_closed', 'organization']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'description', 'organization')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date')
        }),
        ('Estado', {
            'fields': ('is_active', 'is_closed')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ESGCategory)
class ESGCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'color']
    list_filter = ['is_active', 'code']
    search_fields = ['name', 'description']


@admin.register(ESGScope)
class ESGScopeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'code']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'code', 'category', 'description')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ESGMetric)
class ESGMetricAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'scope', 'data_type', 'unit', 'emission_factor', 'is_mandatory', 'is_active', 'organization']
    list_filter = ['category', 'scope', 'data_type', 'is_mandatory', 'is_active', 'organization']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información General', {
            'fields': ('category', 'scope', 'name', 'code', 'description', 'organization')
        }),
        ('Configuración de Datos', {
            'fields': ('data_type', 'unit', 'is_mandatory')
        }),
        ('Factor de Emisión', {
            'fields': ('emission_factor', 'emission_unit')
        }),
        ('Estándares', {
            'fields': ('gri_standard', 'sasb_standard', 'tcfd_standard'),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ESGDataCollection)
class ESGDataCollectionAdmin(admin.ModelAdmin):
    list_display = ['metric', 'period', 'get_value', 'status', 'responsible', 'collection_date', 'organization']
    list_filter = ['status', 'period', 'metric__category', 'organization', 'collection_date']
    search_fields = ['metric__name', 'notes']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    date_hierarchy = 'collection_date'
    
    fieldsets = (
        ('Referencia', {
            'fields': ('period', 'metric', 'organization')
        }),
        ('Valores', {
            'fields': ('value_numeric', 'value_text', 'value_boolean', 'value_date', 'target_value')
        }),
        ('Seguimiento', {
            'fields': ('status', 'responsible', 'collection_date')
        }),
        ('Documentación', {
            'fields': ('notes', 'evidence_file'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def get_value(self, obj):
        return obj.get_value()
    get_value.short_description = 'Valor'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ESGGoal)
class ESGGoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'status', 'progress', 'start_date', 'target_date', 'responsible', 'organization']
    list_filter = ['category', 'status', 'organization']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'progress']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Información General', {
            'fields': ('category', 'name', 'description', 'organization')
        }),
        ('Métrica y Valores', {
            'fields': ('metric', 'target_value', 'current_value')
        }),
        ('Fechas', {
            'fields': ('start_date', 'target_date')
        }),
        ('Seguimiento', {
            'fields': ('status', 'progress', 'responsible')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.progress = obj.calculate_progress()
        super().save_model(request, obj, form, change)


@admin.register(ESGAction)
class ESGActionAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'status', 'progress', 'start_date', 'end_date', 'responsible', 'organization']
    list_filter = ['category', 'priority', 'status', 'organization']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    date_hierarchy = 'start_date'
    filter_horizontal = ['team_members']
    
    fieldsets = (
        ('Información General', {
            'fields': ('category', 'title', 'description', 'organization')
        }),
        ('Objetivo Asociado', {
            'fields': ('goal',)
        }),
        ('Configuración', {
            'fields': ('priority', 'status', 'progress')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date')
        }),
        ('Equipo', {
            'fields': ('responsible', 'team_members')
        }),
        ('Presupuesto', {
            'fields': ('budget', 'actual_cost'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ESGComplianceStandard)
class ESGComplianceStandardAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'version', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'description']
