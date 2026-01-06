
from django.contrib import admin
from .models import Notification, Organization

# --- ADMIN DE NOTIFICACIONES ---
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notif_type', 'title', 'created_at', 'read', 'reinforced_by_email', 'sent_email')
    list_filter = ('notif_type', 'read', 'reinforced_by_email', 'sent_email')
    search_fields = ('title', 'message', 'user__username')


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