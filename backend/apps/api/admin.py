from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'rut', 'sector', 'modo', 'user', 'created_at']
    list_filter = ['sector', 'modo', 'created_at']
    search_fields = ['nombre', 'rut', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'rol', 'user')
        }),
        ('Detalles de la Empresa', {
            'fields': ('empleados', 'rut', 'sector')
        }),
        ('Configuración', {
            'fields': ('modo',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )