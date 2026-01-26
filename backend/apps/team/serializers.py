from rest_framework import serializers
from .models import Team, TeamMember
from apps.api.models import Organization


class TeamSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.nombre', read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'organization', 'organization_name',
            'is_active', 'members_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        return obj.members.filter(is_active=True).count()


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['name', 'description', 'organization', 'is_active']
    
    def validate_organization(self, value):
        # Verificar que el usuario tenga acceso a esta organización
        request = self.context.get('request')
        if request and not value.user == request.user:
            raise serializers.ValidationError('No tienes acceso a esta organización')
        return value


class TeamMemberSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    organization_name = serializers.CharField(source='organization.nombre', read_only=True)
    notification_level_display = serializers.CharField(source='get_notification_level_display', read_only=True)
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'team', 'team_name', 'name', 'position', 'email',
            'organization', 'organization_name', 'notification_level',
            'notification_level_display', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeamMemberCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['team', 'name', 'position', 'email', 'organization', 'notification_level', 'is_active']
    
    def validate_organization(self, value):
        # Verificar que el usuario tenga acceso a esta organización
        request = self.context.get('request')
        if request and not value.user == request.user:
            raise serializers.ValidationError('No tienes acceso a esta organización')
        return value
    
    def validate_email(self, value):
        # Validar formato de email
        if not value:
            raise serializers.ValidationError('El correo electrónico es requerido')
        return value.lower()
    
    def validate(self, data):
        # Validar que el equipo pertenezca a la organización seleccionada
        if data.get('team') and data.get('organization'):
            if data['team'].organization != data['organization']:
                raise serializers.ValidationError({
                    'team': 'El equipo debe pertenecer a la organización seleccionada'
                })
        return data
