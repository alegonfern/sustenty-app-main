from django.contrib import admin
from .models import CarbonPeriod, EmissionScope, EmissionFactor, CarbonDataEntry


@admin.register(CarbonPeriod)
class CarbonPeriodAdmin(admin.ModelAdmin):
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


@admin.register(EmissionScope)
class EmissionScopeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'created_at']
    list_filter = ['is_active', 'code']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'code', 'description')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EmissionFactor)
class EmissionFactorAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'scope', 'data_type', 'unit',
        'emission_factor', 'is_mandatory', 'is_active', 'organization'
    ]
    list_filter = ['scope', 'data_type', 'is_mandatory', 'is_active', 'organization']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información General', {
            'fields': ('scope', 'name', 'code', 'description', 'organization')
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


@admin.register(CarbonDataEntry)
class CarbonDataEntryAdmin(admin.ModelAdmin):
    list_display = [
        'factor', 'period', 'quantity', 'calculated_emission',
        'status', 'responsible', 'collection_date', 'organization'
    ]
    list_filter = ['status', 'period', 'factor__scope', 'organization', 'collection_date']
    search_fields = ['factor__name', 'notes']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'calculated_emission']
    date_hierarchy = 'collection_date'

    fieldsets = (
        ('Referencia', {
            'fields': ('period', 'factor', 'organization')
        }),
        ('Datos', {
            'fields': ('collection_date', 'quantity', 'uncertainty_percentage', 'calculated_emission')
        }),
        ('Valores Adicionales', {
            'fields': ('value_numeric', 'value_text', 'value_boolean', 'value_date', 'target_value'),
            'classes': ('collapse',)
        }),
        ('Seguimiento', {
            'fields': ('status', 'responsible')
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

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
