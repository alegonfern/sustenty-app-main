from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CarbonPeriod, EmissionScope, EmissionFactor, CarbonDataEntry


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico de usuario para referencias."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = fields


class EmissionScopeSerializer(serializers.ModelSerializer):
    factors_count = serializers.SerializerMethodField()

    class Meta:
        model = EmissionScope
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_factors_count(self, obj):
        return obj.factors.filter(is_active=True).count()


class CarbonPeriodSerializer(serializers.ModelSerializer):
    created_by_detail = UserBasicSerializer(source='created_by', read_only=True)
    data_count = serializers.SerializerMethodField()

    class Meta:
        model = CarbonPeriod
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_data_count(self, obj):
        return obj.data_entries.count()


class EmissionFactorSerializer(serializers.ModelSerializer):
    scope_detail = EmissionScopeSerializer(source='scope', read_only=True)

    class Meta:
        model = EmissionFactor
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class CarbonDataEntrySerializer(serializers.ModelSerializer):
    factor_detail = EmissionFactorSerializer(source='factor', read_only=True)
    period_detail = CarbonPeriodSerializer(source='period', read_only=True)
    responsible_detail = UserBasicSerializer(source='responsible', read_only=True)
    created_by_detail = UserBasicSerializer(source='created_by', read_only=True)
    value = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = CarbonDataEntry
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_value(self, obj):
        return obj.get_value()

    def get_progress_percentage(self, obj):
        if obj.target_value and obj.value_numeric and obj.target_value > 0:
            return min(100, (float(obj.value_numeric) / float(obj.target_value)) * 100)
        return None


# Serializers para reportes
class CarbonSummarySerializer(serializers.Serializer):
    """Serializer para resumen de huella de carbono."""
    total_scope1 = serializers.DecimalField(max_digits=15, decimal_places=4)
    total_scope2 = serializers.DecimalField(max_digits=15, decimal_places=4)
    total_scope3 = serializers.DecimalField(max_digits=15, decimal_places=4)
    total_emissions = serializers.DecimalField(max_digits=15, decimal_places=4)
    entries_count = serializers.IntegerField()
    completed_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
