from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Team, TeamMember
from .serializers import (
    TeamSerializer, TeamCreateSerializer,
    TeamMemberSerializer, TeamMemberCreateSerializer
)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Equipos
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['organization', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        # Solo mostrar equipos de las organizaciones del usuario
        return Team.objects.filter(organization__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Obtener todos los miembros de un equipo"""
        team = self.get_object()
        members = team.members.filter(is_active=True)
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activar/Desactivar un equipo"""
        team = self.get_object()
        team.is_active = not team.is_active
        team.save()
        return Response({'status': 'success', 'is_active': team.is_active})


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Miembros de Equipos
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['team', 'organization', 'notification_level', 'is_active']
    search_fields = ['name', 'position', 'email']
    ordering_fields = ['name', 'position', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        # Solo mostrar miembros de las organizaciones del usuario
        return TeamMember.objects.filter(organization__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TeamMemberCreateSerializer
        return TeamMemberSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activar/Desactivar un miembro"""
        member = self.get_object()
        member.is_active = not member.is_active
        member.save()
        return Response({'status': 'success', 'is_active': member.is_active})

    @action(detail=False, methods=['get'])
    def by_organization(self, request):
        """Obtener miembros filtrados por organización"""
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        members = self.get_queryset().filter(organization_id=org_id, is_active=True)
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)
