from django.contrib import admin
from .models import (
    ComplianceFramework,
    ComplianceRequirement,
    ComplianceDocument,
    ComplianceAnalysis,
    ComplianceGap,
    ComplianceReport
)


@admin.register(ComplianceFramework)
class ComplianceFrameworkAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'version', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'code']


@admin.register(ComplianceRequirement)
class ComplianceRequirementAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'framework', 'category', 'is_mandatory']
    list_filter = ['framework', 'category', 'is_mandatory']
    search_fields = ['code', 'name']


@admin.register(ComplianceDocument)
class ComplianceDocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'document_type', 'organization', 'uploaded_at', 'analysis_status']
    list_filter = ['document_type', 'analysis_status']
    search_fields = ['name']


@admin.register(ComplianceAnalysis)
class ComplianceAnalysisAdmin(admin.ModelAdmin):
    list_display = ['framework', 'organization', 'compliance_score', 'status', 'created_at']
    list_filter = ['framework', 'status']


@admin.register(ComplianceGap)
class ComplianceGapAdmin(admin.ModelAdmin):
    list_display = ['requirement', 'analysis', 'status', 'severity', 'due_date']
    list_filter = ['status', 'severity']


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    list_display = ['name', 'report_type', 'organization', 'created_at']
    list_filter = ['report_type']
