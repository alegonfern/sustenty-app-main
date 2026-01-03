from rest_framework import serializers
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Organization
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Organization
        fields = [
            'id',
            'nombre',
            'rol',
            'empleados',
            'rut',
            'sector',
            'modo',
            'user',
            'user_email',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear organizaciones
    """
    class Meta:
        model = Organization
        fields = [
            'nombre',
            'rol',
            'empleados',
            'rut',
            'sector',
            'modo'
        ]
    
    def create(self, validated_data):
        # El usuario se asigna desde la vista
        return Organization.objects.create(**validated_data)
