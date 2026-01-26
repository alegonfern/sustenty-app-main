from django.contrib import admin
from .models import Team, TeamMember


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'is_active', 'created_at']
    list_filter = ['is_active', 'organization']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'email', 'team', 'organization', 'notification_level', 'is_active']
    list_filter = ['is_active', 'notification_level', 'organization', 'team']
    search_fields = ['name', 'email', 'position']
    readonly_fields = ['created_at', 'updated_at']
