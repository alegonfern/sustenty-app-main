from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import datetime

from .models import (
    ESGPeriod, ESGCategory, ESGScope, ESGMetric, ESGDataCollection,
    ESGGoal, ESGAction, ESGComplianceStandard
)
from .serializers import (
    ESGPeriodSerializer, ESGCategorySerializer, ESGScopeSerializer, ESGMetricSerializer,
    ESGDataCollectionSerializer, ESGGoalSerializer, ESGActionSerializer,
    ESGComplianceStandardSerializer, ESGAnalyticsSerializer, ESGDashboardSerializer
)


class ESGPeriodViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Períodos ESG
    """
    queryset = ESGPeriod.objects.all()
    serializer_class = ESGPeriodSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_closed', 'organization']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def close_period(self, request, pk=None):
        """Cerrar un período ESG"""
        period = self.get_object()
        period.is_closed = True
        period.is_active = False
        period.save()
        return Response({'status': 'period closed'})

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Obtener resumen de datos del período"""
        period = self.get_object()
        data = {
            'period': ESGPeriodSerializer(period).data,
            'total_data_points': period.data_collections.count(),
            'completed_data_points': period.data_collections.filter(status='completed').count(),
            'pending_data_points': period.data_collections.filter(status='pending').count(),
            'data_by_category': period.data_collections.values(
                'metric__category__name'
            ).annotate(count=Count('id'))
        }
        return Response(data)


class ESGCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Categorías ESG
    """
    queryset = ESGCategory.objects.all()
    serializer_class = ESGCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']


class ESGScopeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Scopes/Orígenes ESG (Scope 1, 2, 3)
    """
    queryset = ESGScope.objects.all()
    serializer_class = ESGScopeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'code']
    search_fields = ['name', 'description']
    ordering_fields = ['code', 'name']
    ordering = ['code']


class ESGMetricViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Factores de Emisión/Métricas ESG
    """
    queryset = ESGMetric.objects.all()
    serializer_class = ESGMetricSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'scope', 'data_type', 'is_mandatory', 'is_active', 'organization']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['category', 'name']

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Obtener métricas agrupadas por categoría"""
        metrics = self.get_queryset()
        data = {}
        for category in ESGCategory.objects.filter(is_active=True):
            category_metrics = metrics.filter(category=category)
            data[category.code] = ESGMetricSerializer(category_metrics, many=True).data
        return Response(data)

    @action(detail=False, methods=['get'])
    def by_scope(self, request):
        """Obtener métricas agrupadas por scope"""
        scope_id = request.query_params.get('scope')
        if scope_id:
            metrics = self.get_queryset().filter(scope_id=scope_id)
        else:
            metrics = self.get_queryset()
        return Response(ESGMetricSerializer(metrics, many=True).data)


class ESGDataCollectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Colección de Datos ESG
    """
    queryset = ESGDataCollection.objects.select_related('metric', 'period', 'responsible')
    serializer_class = ESGDataCollectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['period', 'metric', 'metric__category', 'status', 'responsible', 'organization']
    search_fields = ['metric__name', 'notes']
    ordering_fields = ['collection_date', 'created_at']
    ordering = ['-collection_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_period(self, request):
        """Obtener datos agrupados por período"""
        period_id = request.query_params.get('period_id')
        if not period_id:
            return Response({'error': 'period_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        data_collections = self.get_queryset().filter(period_id=period_id)
        
        # Agrupar por categoría
        result = {}
        for category in ESGCategory.objects.filter(is_active=True):
            category_data = data_collections.filter(metric__category=category)
            result[category.code] = ESGDataCollectionSerializer(category_data, many=True).data
        
        return Response(result)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Crear múltiples registros de datos"""
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar un dato recolectado"""
        data_collection = self.get_object()
        data_collection.status = 'approved'
        data_collection.save()
        return Response({'status': 'approved'})


class ESGGoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Objetivos ESG
    """
    queryset = ESGGoal.objects.select_related('category', 'metric', 'responsible')
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
        """Actualizar progreso del objetivo"""
        goal = self.get_object()
        current_value = request.data.get('current_value')
        
        if current_value is not None:
            goal.current_value = current_value
            goal.progress = goal.calculate_progress()
            goal.save()
            return Response(ESGGoalSerializer(goal).data)
        
        return Response({'error': 'current_value is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard de objetivos"""
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
    """
    ViewSet para gestionar Acciones ESG
    """
    queryset = ESGAction.objects.select_related('category', 'goal', 'responsible').prefetch_related('team_members')
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
        """Actualizar progreso de la acción"""
        action = self.get_object()
        progress = request.data.get('progress')
        
        if progress is not None:
            action.progress = min(100, max(0, int(progress)))
            if action.progress == 100 and action.status != 'completed':
                action.status = 'completed'
            action.save()
            return Response(ESGActionSerializer(action).data)
        
        return Response({'error': 'progress is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Estadísticas de acciones"""
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
    """
    ViewSet para consultar Estándares de Cumplimiento
    """
    queryset = ESGComplianceStandard.objects.all()
    serializer_class = ESGComplianceStandardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']
