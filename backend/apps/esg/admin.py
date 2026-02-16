from django.contrib import admin
from .models import ESGCategory, ESGGoal, ESGAction, ESGComplianceStandard


@admin.register(ESGCategory)
class ESGCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'color']
    list_filter = ['is_active', 'code']
    search_fields = ['name', 'description']


@admin.register(ESGGoal)
class ESGGoalAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'status', 'progress',
        'start_date', 'target_date', 'responsible', 'organization'
    ]
    list_filter = ['category', 'status', 'organization']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'progress']
    date_hierarchy = 'start_date'

    fieldsets = (
        ('Información General', {
            'fields': ('category', 'name', 'description', 'organization')
        }),
        ('Valores', {
            'fields': ('target_value', 'current_value', 'unit')
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
    list_display = [
        'title', 'category', 'priority', 'status', 'progress',
        'start_date', 'end_date', 'responsible', 'organization'
    ]
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
        ('Impacto', {
            'fields': ('expected_impact', 'actual_result')
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
