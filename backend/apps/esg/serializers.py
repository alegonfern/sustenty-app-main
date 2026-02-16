from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ESGCategory, ESGGoal, ESGAction, ESGComplianceStandard


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico de usuario para referencias."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = fields


class ESGCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGCategory
        fields = '__all__'


class ESGGoalSerializer(serializers.ModelSerializer):
    category_detail = ESGCategorySerializer(source='category', read_only=True)
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


# Serializers para dashboard ESG agregado
class ESGDashboardSerializer(serializers.Serializer):
    """Serializer para dashboard ESG de alto nivel."""
    active_goals = serializers.IntegerField()
    active_actions = serializers.IntegerField()
    goals_on_track = serializers.IntegerField()
    goals_at_risk = serializers.IntegerField()
    actions_completed = serializers.IntegerField()
    average_goal_progress = serializers.FloatField()
