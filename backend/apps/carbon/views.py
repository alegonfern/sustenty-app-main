from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q

from .models import CarbonPeriod, EmissionScope, EmissionFactor, CarbonDataEntry
from .serializers import (
    CarbonPeriodSerializer, EmissionScopeSerializer,
    EmissionFactorSerializer, CarbonDataEntrySerializer
)


class CarbonPeriodViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Períodos de Carbono."""
    queryset = CarbonPeriod.objects.all()
    serializer_class = CarbonPeriodSerializer
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
        """Cerrar un período de carbono."""
        period = self.get_object()
        period.is_closed = True
        period.is_active = False
        period.save()
        return Response({'status': 'period closed'})

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Resumen de emisiones del período."""
        period = self.get_object()
        entries = period.data_entries.all()

        # Calcular totales por scope
        scope_totals = entries.values(
            'factor__scope__code'
        ).annotate(
            total=Sum('calculated_emission'),
            count=Count('id')
        )

        scope_map = {item['factor__scope__code']: item['total'] or 0 for item in scope_totals}

        data = {
            'period': CarbonPeriodSerializer(period).data,
            'total_entries': entries.count(),
            'completed_entries': entries.filter(status='completed').count(),
            'pending_entries': entries.filter(status='pending').count(),
            'total_scope1': scope_map.get('scope_1', 0),
            'total_scope2': scope_map.get('scope_2', 0),
            'total_scope3': scope_map.get('scope_3', 0),
            'total_emissions': sum(scope_map.values()),
            'by_scope': scope_totals
        }
        return Response(data)


class EmissionScopeViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Alcances de Emisiones (Scope 1, 2, 3)."""
    queryset = EmissionScope.objects.all()
    serializer_class = EmissionScopeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'code']
    search_fields = ['name', 'description']
    ordering_fields = ['code', 'name']
    ordering = ['code']


class EmissionFactorViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Factores de Emisión."""
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['scope', 'data_type', 'is_mandatory', 'is_active', 'organization']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['scope', 'name']

    @action(detail=False, methods=['get'])
    def by_scope(self, request):
        """Obtener factores agrupados por scope."""
        scope_id = request.query_params.get('scope')
        if scope_id:
            factors = self.get_queryset().filter(scope_id=scope_id)
        else:
            factors = self.get_queryset()
        return Response(EmissionFactorSerializer(factors, many=True).data)


class CarbonDataEntryViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Registros de Emisiones."""
    queryset = CarbonDataEntry.objects.select_related('factor', 'period', 'responsible')
    serializer_class = CarbonDataEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['period', 'factor', 'factor__scope', 'status', 'responsible', 'organization']
    search_fields = ['factor__name', 'notes']
    ordering_fields = ['collection_date', 'created_at']
    ordering = ['-collection_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_period(self, request):
        """Datos agrupados por período y scope."""
        period_id = request.query_params.get('period_id')
        if not period_id:
            return Response(
                {'error': 'period_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        entries = self.get_queryset().filter(period_id=period_id)

        result = {}
        for scope in EmissionScope.objects.filter(is_active=True):
            scope_entries = entries.filter(factor__scope=scope)
            result[scope.code] = CarbonDataEntrySerializer(scope_entries, many=True).data

        return Response(result)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Crear múltiples registros de emisiones."""
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar un registro de emisiones."""
        entry = self.get_object()
        entry.status = 'approved'
        entry.save()
        return Response({'status': 'approved'})
