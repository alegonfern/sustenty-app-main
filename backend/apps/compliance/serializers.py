from rest_framework import serializers
from .models import (
    ComplianceFramework,
    ComplianceRequirement,
    ComplianceDocument,
    ComplianceAnalysis,
    ComplianceGap,
    ComplianceReport,
    InvoiceEmissionMapping
)


class ComplianceFrameworkSerializer(serializers.ModelSerializer):
    requirement_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceFramework
        fields = [
            'id', 'name', 'code', 'category', 'description', 'version',
            'issuing_body', 'official_url', 'last_updated',
            'icon', 'color', 'is_active', 'requirement_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_requirement_count(self, obj):
        return obj.requirements.count()


class ComplianceRequirementSerializer(serializers.ModelSerializer):
    framework_name = serializers.CharField(source='framework.name', read_only=True)
    framework_code = serializers.CharField(source='framework.code', read_only=True)
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceRequirement
        fields = [
            'id', 'framework', 'framework_name', 'framework_code',
            'code', 'name', 'description', 'category',
            'parent', 'order', 'evaluation_criteria', 'evidence_required',
            'keywords', 'is_mandatory', 'is_active', 'children_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_children_count(self, obj):
        return obj.children.count()


class ComplianceRequirementNestedSerializer(serializers.ModelSerializer):
    """Serializer con requisitos hijos anidados"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceRequirement
        fields = [
            'id', 'code', 'name', 'description', 'category',
            'order', 'is_mandatory', 'children'
        ]
    
    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('order')
        return ComplianceRequirementNestedSerializer(children, many=True).data


class ComplianceDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceDocument
        fields = [
            'id', 'name', 'description', 'document_type',
            'file', 'file_url', 'file_size', 'file_type',
            'analysis_status', 'frameworks',
            'organization', 'organization_name',
            'uploaded_by', 'uploaded_by_name', 'uploaded_at',
            'version', 'is_current', 'updated_at'
        ]
        read_only_fields = ['id', 'file_size', 'file_type', 'uploaded_at', 'updated_at', 
                          'uploaded_by', 'analysis_status', 'extracted_text']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ComplianceDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer para subida de documentos"""
    
    class Meta:
        model = ComplianceDocument
        fields = ['name', 'description', 'document_type', 'file', 'frameworks']
    
    def create(self, validated_data):
        # Calcular tamaño y tipo de archivo
        file = validated_data.get('file')
        if file:
            validated_data['file_size'] = file.size
            validated_data['file_type'] = file.content_type
        
        return super().create(validated_data)


class ComplianceGapSerializer(serializers.ModelSerializer):
    requirement_code = serializers.CharField(source='requirement.code', read_only=True)
    requirement_name = serializers.CharField(source='requirement.name', read_only=True)
    responsible_name = serializers.CharField(source='responsible.get_full_name', read_only=True)
    
    class Meta:
        model = ComplianceGap
        fields = [
            'id', 'analysis', 'requirement', 'requirement_code', 'requirement_name',
            'status', 'severity', 'confidence_score',
            'finding', 'evidence_found', 'recommendation',
            'relevant_documents', 'remediation_plan',
            'responsible', 'responsible_name', 'due_date', 'resolved_date',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplianceAnalysisSerializer(serializers.ModelSerializer):
    framework_name = serializers.CharField(source='framework.name', read_only=True)
    framework_code = serializers.CharField(source='framework.code', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    gaps_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceAnalysis
        fields = [
            'id', 'name', 'framework', 'framework_name', 'framework_code',
            'documents', 'compliance_score',
            'requirements_total', 'requirements_compliant',
            'requirements_partial', 'requirements_non_compliant',
            'executive_summary', 'key_findings', 'recommendations',
            'status', 'error_message',
            'organization', 'organization_name',
            'created_by', 'created_by_name',
            'started_at', 'completed_at', 'created_at', 'updated_at',
            'gaps_summary'
        ]
        read_only_fields = ['id', 'compliance_score', 'requirements_total',
                          'requirements_compliant', 'requirements_partial',
                          'requirements_non_compliant', 'executive_summary',
                          'key_findings', 'recommendations', 'status',
                          'error_message', 'started_at', 'completed_at',
                          'created_at', 'updated_at', 'created_by']
    
    def get_gaps_summary(self, obj):
        gaps = obj.gaps.all()
        return {
            'total': gaps.count(),
            'compliant': gaps.filter(status='compliant').count(),
            'partial': gaps.filter(status='partial').count(),
            'non_compliant': gaps.filter(status='non_compliant').count(),
            'critical': gaps.filter(severity='critical').count(),
            'high': gaps.filter(severity='high').count(),
        }


class ComplianceAnalysisDetailSerializer(ComplianceAnalysisSerializer):
    """Serializer con gaps incluidos para vista detallada"""
    gaps = ComplianceGapSerializer(many=True, read_only=True)
    documents_detail = ComplianceDocumentSerializer(source='documents', many=True, read_only=True)
    
    class Meta(ComplianceAnalysisSerializer.Meta):
        fields = ComplianceAnalysisSerializer.Meta.fields + ['gaps', 'documents_detail', 'ai_analysis_result']


class ComplianceAnalysisCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear un nuevo análisis"""
    
    class Meta:
        model = ComplianceAnalysis
        fields = ['name', 'framework', 'documents']


class ComplianceReportSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceReport
        fields = [
            'id', 'name', 'report_type', 'format',
            'analyses', 'frameworks', 'file', 'file_url',
            'period_start', 'period_end',
            'organization', 'organization_name',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'file', 'created_at', 'created_by']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ComplianceReportCreateSerializer(serializers.ModelSerializer):
    """Serializer para generar un nuevo reporte"""
    
    class Meta:
        model = ComplianceReport
        fields = ['name', 'report_type', 'format', 'analyses', 'frameworks', 
                 'period_start', 'period_end']


class InvoiceEmissionMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceEmissionMapping
        fields = ['id', 'organization', 'category', 'emission_factor',
                  'is_active', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# Dashboard/Stats Serializers
class ComplianceDashboardSerializer(serializers.Serializer):
    """Serializer para estadísticas del dashboard"""
    total_frameworks = serializers.IntegerField()
    total_documents = serializers.IntegerField()
    total_analyses = serializers.IntegerField()
    average_compliance_score = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    
    gaps_by_severity = serializers.DictField()
    gaps_by_status = serializers.DictField()
    compliance_by_framework = serializers.ListField()
    recent_analyses = ComplianceAnalysisSerializer(many=True)
    pending_gaps = ComplianceGapSerializer(many=True)
