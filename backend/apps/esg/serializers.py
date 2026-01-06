from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    ESGPeriod, ESGCategory, ESGScope, ESGMetric, ESGDataCollection,
    ESGGoal, ESGAction, ESGComplianceStandard
)


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico de usuario para referencias"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = fields


class ESGCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGCategory
        fields = '__all__'


class ESGScopeSerializer(serializers.ModelSerializer):
    category_detail = ESGCategorySerializer(source='category', read_only=True)
    metrics_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ESGScope
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_metrics_count(self, obj):
        return obj.metrics.filter(is_active=True).count()


class ESGPeriodSerializer(serializers.ModelSerializer):
    created_by_detail = UserBasicSerializer(source='created_by', read_only=True)
    data_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ESGPeriod
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_data_count(self, obj):
        return obj.data_collections.count()


class ESGMetricSerializer(serializers.ModelSerializer):
    category_detail = ESGCategorySerializer(source='category', read_only=True)
    scope_detail = ESGScopeSerializer(source='scope', read_only=True)
    
    class Meta:
        model = ESGMetric
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ESGDataCollectionSerializer(serializers.ModelSerializer):
    metric_detail = ESGMetricSerializer(source='metric', read_only=True)
    period_detail = ESGPeriodSerializer(source='period', read_only=True)
    responsible_detail = UserBasicSerializer(source='responsible', read_only=True)
    created_by_detail = UserBasicSerializer(source='created_by', read_only=True)
    value = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ESGDataCollection
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_value(self, obj):
        return obj.get_value()

    def get_progress_percentage(self, obj):
        if obj.target_value and obj.value_numeric and obj.target_value > 0:
            return min(100, (float(obj.value_numeric) / float(obj.target_value)) * 100)
        return None


class ESGGoalSerializer(serializers.ModelSerializer):
    category_detail = ESGCategorySerializer(source='category', read_only=True)
    metric_detail = ESGMetricSerializer(source='metric', read_only=True)
    responsible_detail = UserBasicSerializer(source='responsible', read_only=True)
    created_by_detail = UserBasicSerializer(source='created_by', read_only=True)
    actions_count = serializers.SerializerMethodField()
    calculated_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = ESGGoal
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_actions_count(self, obj):
        return obj.actions.count()

    def get_calculated_progress(self, obj):
        return obj.calculate_progress()


class ESGActionSerializer(serializers.ModelSerializer):
    category_detail = ESGCategorySerializer(source='category', read_only=True)
    goal_detail = ESGGoalSerializer(source='goal', read_only=True)
    metric_detail = ESGMetricSerializer(source='metric', read_only=True)
    responsible_detail = UserBasicSerializer(source='responsible', read_only=True)
    team_members_detail = UserBasicSerializer(source='team_members', many=True, read_only=True)
    created_by_detail = UserBasicSerializer(source='created_by', read_only=True)
    team_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ESGAction
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_team_count(self, obj):
        return obj.team_members.count()


class ESGComplianceStandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGComplianceStandard
        fields = '__all__'


# Serializers para reportes y analytics
class ESGAnalyticsSerializer(serializers.Serializer):
    """Serializer para datos de analítica ESG"""
    period_id = serializers.IntegerField()
    category = serializers.CharField()
    metrics_count = serializers.IntegerField()
    completed_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    

class ESGDashboardSerializer(serializers.Serializer):
    """Serializer para dashboard ESG"""
    total_metrics = serializers.IntegerField()
    environmental_metrics = serializers.IntegerField()
    social_metrics = serializers.IntegerField()
    governance_metrics = serializers.IntegerField()
    active_goals = serializers.IntegerField()
    active_actions = serializers.IntegerField()
    completion_rate = serializers.FloatField()
