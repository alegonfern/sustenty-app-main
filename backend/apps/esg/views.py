from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg

from .models import ESGCategory, ESGGoal, ESGAction, ESGComplianceStandard
from .serializers import (
    ESGCategorySerializer, ESGGoalSerializer,
    ESGActionSerializer, ESGComplianceStandardSerializer
)


class ESGCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Categorías ESG (E, S, G)."""
    queryset = ESGCategory.objects.all()
    serializer_class = ESGCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']


class ESGGoalViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Objetivos ESG estratégicos."""
    queryset = ESGGoal.objects.select_related('category', 'responsible')
    serializer_class = ESGGoalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'responsible', 'organization']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'target_date', 'progress']
    ordering = ['-start_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Actualizar progreso del objetivo."""
        goal = self.get_object()
        current_value = request.data.get('current_value')

        if current_value is not None:
            goal.current_value = current_value
            goal.progress = goal.calculate_progress()
            goal.save()
            return Response(ESGGoalSerializer(goal).data)

        return Response(
            {'error': 'current_value is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard de objetivos ESG."""
        goals = self.get_queryset()
        organization_id = request.query_params.get('organization')
        if organization_id:
            goals = goals.filter(organization_id=organization_id)

        data = {
            'total_goals': goals.count(),
            'on_track': goals.filter(status='on_track').count(),
            'at_risk': goals.filter(status='at_risk').count(),
            'delayed': goals.filter(status='delayed').count(),
            'achieved': goals.filter(status='achieved').count(),
            'average_progress': goals.aggregate(Avg('progress'))['progress__avg'] or 0,
            'by_category': goals.values('category__name').annotate(count=Count('id'))
        }
        return Response(data)


class ESGActionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Acciones/Planes ESG."""
    queryset = ESGAction.objects.select_related(
        'category', 'goal', 'responsible'
    ).prefetch_related('team_members')
    serializer_class = ESGActionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'priority', 'responsible', 'organization']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'end_date', 'priority', 'progress']
    ordering = ['-priority', '-start_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Actualizar progreso de la acción."""
        action_obj = self.get_object()
        progress = request.data.get('progress')

        if progress is not None:
            action_obj.progress = min(100, max(0, int(progress)))
            if action_obj.progress == 100 and action_obj.status != 'completed':
                action_obj.status = 'completed'
            action_obj.save()
            return Response(ESGActionSerializer(action_obj).data)

        return Response(
            {'error': 'progress is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Estadísticas de acciones ESG."""
        actions = self.get_queryset()
        organization_id = request.query_params.get('organization')
        if organization_id:
            actions = actions.filter(organization_id=organization_id)

        data = {
            'total_actions': actions.count(),
            'planned': actions.filter(status='planned').count(),
            'in_progress': actions.filter(status='in_progress').count(),
            'completed': actions.filter(status='completed').count(),
            'paused': actions.filter(status='paused').count(),
            'high_priority': actions.filter(priority='high').count(),
            'average_progress': actions.aggregate(Avg('progress'))['progress__avg'] or 0,
            'by_category': actions.values('category__name').annotate(count=Count('id')),
            'total_budget': actions.aggregate(total=Count('budget'))['total'] or 0
        }
        return Response(data)


class ESGComplianceStandardViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar Estándares de Cumplimiento."""
    queryset = ESGComplianceStandard.objects.all()
    serializer_class = ESGComplianceStandardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']
