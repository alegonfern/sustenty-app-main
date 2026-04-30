from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Avg, Count, Q
from django.utils import timezone
import logging

from .models import (
    ComplianceFramework,
    ComplianceRequirement,
    ComplianceDocument,
    InvoiceEmissionMapping,
    ComplianceAnalysis,
    ComplianceGap,
    ComplianceReport
)
from .serializers import (
    ComplianceFrameworkSerializer,
    ComplianceRequirementSerializer,
    ComplianceRequirementNestedSerializer,
    ComplianceDocumentSerializer,
    ComplianceDocumentUploadSerializer,
    InvoiceEmissionMappingSerializer,
    ComplianceAnalysisSerializer,
    ComplianceAnalysisDetailSerializer,
    ComplianceAnalysisCreateSerializer,
    ComplianceGapSerializer,
    ComplianceReportSerializer,
    ComplianceReportCreateSerializer,
)
from .services import ComplianceAnalyzerService, DocumentExtractorService, InvoiceCarbonProcessorService

logger = logging.getLogger(__name__)


class InvoiceEmissionMappingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para configurar mapeos de categorías de factura a factores de emisión.
    """
    serializer_class = InvoiceEmissionMappingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InvoiceEmissionMapping.objects.filter(
            organization__user=self.request.user
        ).select_related('organization', 'emission_factor')

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        is_active = self.request.query_params.get('is_active')
        if is_active in ['true', 'false']:
            queryset = queryset.filter(is_active=(is_active == 'true'))

        return queryset

    def perform_create(self, serializer):
        from apps.api.models import Organization
        org = Organization.objects.filter(user=self.request.user).first()
        if not org:
            raise serializers.ValidationError({"detail": "Debe tener una organización"})
        serializer.save(organization=org)


class ComplianceFrameworkViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar frameworks de cumplimiento
    """
    queryset = ComplianceFramework.objects.filter(is_active=True)
    serializer_class = ComplianceFrameworkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset

    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Obtener requisitos de un framework"""
        framework = self.get_object()
        requirements = framework.requirements.filter(is_active=True, parent=None)
        serializer = ComplianceRequirementNestedSerializer(requirements, many=True)
        return Response(serializer.data)


class ComplianceRequirementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar requisitos de cumplimiento
    """
    queryset = ComplianceRequirement.objects.filter(is_active=True)
    serializer_class = ComplianceRequirementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        framework = self.request.query_params.get('framework')
        if framework:
            queryset = queryset.filter(framework_id=framework)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset


class ComplianceDocumentViewSet(viewsets.ModelViewSet):
        @action(detail=True, methods=['post'])
        def analyze_ia(self, request, pk=None):
            """Analiza el documento con IA: clasificación y resumen ejecutivo usando OpenAI"""
            document = self.get_object()
            if not document.extracted_text:
                return Response({'error': 'El documento no tiene texto extraído'}, status=status.HTTP_400_BAD_REQUEST)

            # Clasificación IA
            extractor = DocumentExtractorService()
            tipo = extractor.classify_document_type_ia(document.extracted_text)

            # Resumen ejecutivo IA
            resumen = None
            openai_api_key = getattr(settings, 'OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY'))
            if openai_api_key:
                try:
                    import openai
                    openai.api_key = openai_api_key
                    prompt = (
                        f"""Eres un asistente experto en ESG, compliance y sostenibilidad. Resume el siguiente documento en máximo 120 palabras, resaltando los puntos clave, riesgos y oportunidades para la organización. Responde solo el resumen, sin introducción ni despedida.\n\nDOCUMENTO:\n{text}"""
                    )
                    response = openai.Completion.create(
                        engine='gpt-3.5-turbo-instruct',
                        prompt=prompt.replace('{text}', document.extracted_text[:2000]),
                        max_tokens=180,
                        temperature=0.2
                    )
                    resumen = response.choices[0].text.strip()
                except Exception as e:
                    logger.error(f"Error generando resumen IA: {e}")
                    resumen = None

            return Response({
                'document_id': document.id,
                'document_type_ia': tipo,
                'executive_summary_ia': resumen,
                'text_length': len(document.extracted_text),
            })


class ComplianceDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar documentos de cumplimiento
    """
    serializer_class = ComplianceDocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return ComplianceDocument.objects.filter(
            organization__user=self.request.user
        ).select_related('organization', 'uploaded_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplianceDocumentUploadSerializer
        return ComplianceDocumentSerializer


    def create(self, request, *args, **kwargs):
        # Verificar organización antes de procesar
        org = Organization.objects.filter(user=request.user).first()
        if not org:
            return Response(
                {"detail": "Debe configurar una organización antes de subir documentos. Vaya a Organizaciones para crear una."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Document upload - Data: {request.data}")
        logger.info(f"Document upload - Files: {request.FILES}")
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Obtener organización del usuario
        org = Organization.objects.filter(user=self.request.user).first()
        # Ya se verificó en create(), pero por seguridad
        if not org:
            raise serializers.ValidationError({"detail": "Debe tener una organización para subir documentos"})
        doc = serializer.save(
            organization=org,
            uploaded_by=self.request.user
        )
        # Iniciar extracción de texto en background
        try:
            extractor = DocumentExtractorService()
            extractor.extract_text_async(doc.id)

        except Exception as e:
            logger.error(f"Error iniciando extracción: {e}")

    @action(detail=True, methods=['post'])
    def extract_text(self, request, pk=None):
        """Extraer texto de un documento manualmente"""
        document = self.get_object()
        try:
            extractor = DocumentExtractorService()
            text = extractor.extract_text(document)
            document.extracted_text = text
            document.extraction_date = timezone.now()
            document.analysis_status = 'completed' if text else 'failed'
            document.save()
            return Response({
                'status': 'success',
                'text_length': len(text) if text else 0,
                'preview': text[:500] if text else None
            })
        except Exception as e:
            document.analysis_status = 'failed'
            document.analysis_error = str(e)
            document.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def process_invoice(self, request, pk=None):
        document = self.get_object()

        if document.document_type != 'invoice':
            return Response(
                {'error': 'El documento no es una factura'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not document.extracted_text:
            extractor = DocumentExtractorService()
            try:
                text = extractor.extract_text(document)
                document.extracted_text = text
                document.extraction_date = timezone.now()
                document.analysis_status = 'completed' if text else 'failed'
                document.save()
            except Exception as extract_error:
                document.analysis_status = 'failed'
                document.analysis_error = str(extract_error)
                document.save()
                return Response({'error': str(extract_error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            processor = InvoiceCarbonProcessorService()
            result = processor.process_document(document)
            serializer = self.get_serializer(document)
            return Response({
                'status': 'processed',
                'result': result,
                'document': serializer.data,
            })
        except Exception as process_error:
            document.analysis_error = str(process_error)
            document.save(update_fields=['analysis_error', 'updated_at'])
            return Response({'error': str(process_error)}, status=status.HTTP_400_BAD_REQUEST)


class ComplianceAnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar análisis de cumplimiento
    """
    serializer_class = ComplianceAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ComplianceAnalysis.objects.filter(
            organization__user=self.request.user
        ).select_related('framework', 'organization', 'created_by')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ComplianceAnalysisDetailSerializer
        if self.action == 'create':
            return ComplianceAnalysisCreateSerializer
        return ComplianceAnalysisSerializer

    def perform_create(self, serializer):
        from apps.api.models import Organization
        org = Organization.objects.filter(user=self.request.user).first()
        
        if not org:
            raise serializers.ValidationError("Debe tener una organización")
        
        analysis = serializer.save(
            organization=org,
            created_by=self.request.user,
            status='pending'
        )
        
        return analysis

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Ejecutar análisis de cumplimiento con IA"""
        analysis = self.get_object()
        
        if analysis.status == 'running':
            return Response(
                {'error': 'El análisis ya está en ejecución'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            analysis.status = 'running'
            analysis.started_at = timezone.now()
            analysis.save()
            
            # Ejecutar análisis
            analyzer = ComplianceAnalyzerService()
            result = analyzer.analyze(analysis)
            
            analysis.status = 'completed'
            analysis.completed_at = timezone.now()
            analysis.compliance_score = result.get('compliance_score')
            analysis.executive_summary = result.get('executive_summary')
            analysis.key_findings = result.get('key_findings', [])
            analysis.recommendations = result.get('recommendations', [])
            analysis.ai_analysis_result = result
            analysis.save()
            
            # Actualizar contadores
            gaps = analysis.gaps.all()
            analysis.requirements_total = gaps.count()
            analysis.requirements_compliant = gaps.filter(status='compliant').count()
            analysis.requirements_partial = gaps.filter(status='partial').count()
            analysis.requirements_non_compliant = gaps.filter(status='non_compliant').count()
            analysis.save()
            
            serializer = ComplianceAnalysisDetailSerializer(analysis, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error en análisis {analysis.id}: {e}")
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Obtener estadísticas para el dashboard de cumplimiento"""
        from apps.api.models import Organization
        org = Organization.objects.filter(user=request.user).first()
        
        if not org:
            return Response({
                'total_frameworks': 0,
                'total_documents': 0,
                'total_analyses': 0,
                'average_compliance_score': None,
                'gaps_by_severity': {},
                'gaps_by_status': {},
                'compliance_by_framework': [],
                'recent_analyses': [],
                'pending_gaps': []
            })
        
        # Estadísticas básicas
        analyses = ComplianceAnalysis.objects.filter(organization=org)
        documents = ComplianceDocument.objects.filter(organization=org)
        gaps = ComplianceGap.objects.filter(analysis__organization=org)
        
        # Gaps por severidad
        gaps_by_severity = dict(
            gaps.values('severity').annotate(count=Count('id')).values_list('severity', 'count')
        )
        
        # Gaps por estado
        gaps_by_status = dict(
            gaps.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )
        
        # Cumplimiento por framework
        compliance_by_framework = list(
            analyses.filter(compliance_score__isnull=False)
            .values('framework__name', 'framework__code')
            .annotate(avg_score=Avg('compliance_score'))
            .order_by('-avg_score')[:10]
        )
        
        # Análisis recientes
        recent_analyses = analyses.order_by('-created_at')[:5]
        
        # Gaps pendientes (críticos y altos)
        pending_gaps = gaps.filter(
            status__in=['non_compliant', 'partial'],
            severity__in=['critical', 'high']
        ).order_by('-severity')[:10]
        
        return Response({
            'total_frameworks': ComplianceFramework.objects.filter(is_active=True).count(),
            'total_documents': documents.count(),
            'total_analyses': analyses.count(),
            'average_compliance_score': analyses.filter(
                compliance_score__isnull=False
            ).aggregate(avg=Avg('compliance_score'))['avg'],
            'gaps_by_severity': gaps_by_severity,
            'gaps_by_status': gaps_by_status,
            'compliance_by_framework': compliance_by_framework,
            'recent_analyses': ComplianceAnalysisSerializer(
                recent_analyses, many=True, context={'request': request}
            ).data,
            'pending_gaps': ComplianceGapSerializer(
                pending_gaps, many=True, context={'request': request}
            ).data
        })


class ComplianceGapViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar brechas de cumplimiento
    """
    serializer_class = ComplianceGapSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ComplianceGap.objects.filter(
            analysis__organization__user=self.request.user
        ).select_related('analysis', 'requirement', 'responsible')
        
        # Filtros
        analysis = self.request.query_params.get('analysis')
        if analysis and analysis not in ['undefined', 'null', '']:
            try:
                import uuid
                uuid.UUID(analysis)  # Validar que es un UUID válido
                queryset = queryset.filter(analysis_id=analysis)
            except (ValueError, AttributeError):
                pass  # Ignorar si no es un UUID válido
        
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter not in ['undefined', 'null', '']:
            queryset = queryset.filter(status=status_filter)
        
        severity = self.request.query_params.get('severity')
        if severity and severity not in ['undefined', 'null', '']:
            queryset = queryset.filter(severity=severity)
        
        return queryset

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Asignar responsable a una brecha"""
        gap = self.get_object()
        responsible_id = request.data.get('responsible')
        due_date = request.data.get('due_date')
        
        from django.contrib.auth.models import User
        try:
            responsible = User.objects.get(id=responsible_id)
            gap.responsible = responsible
            if due_date:
                gap.due_date = due_date
            gap.save()
            
            serializer = self.get_serializer(gap)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Marcar brecha como resuelta"""
        gap = self.get_object()
        gap.status = 'compliant'
        gap.resolved_date = timezone.now().date()
        gap.notes = request.data.get('notes', gap.notes)
        gap.save()
        
        # Recalcular score del análisis
        analysis = gap.analysis
        analysis.compliance_score = analysis.calculate_score()
        analysis.requirements_compliant = analysis.gaps.filter(status='compliant').count()
        analysis.requirements_partial = analysis.gaps.filter(status='partial').count()
        analysis.requirements_non_compliant = analysis.gaps.filter(status='non_compliant').count()
        analysis.save()
        
        serializer = self.get_serializer(gap)
        return Response(serializer.data)


class ComplianceReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reportes de cumplimiento
    """
    serializer_class = ComplianceReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ComplianceReport.objects.filter(
            organization__user=self.request.user
        ).select_related('organization', 'created_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplianceReportCreateSerializer
        return ComplianceReportSerializer

    def perform_create(self, serializer):
        from apps.api.models import Organization
        org = Organization.objects.filter(user=self.request.user).first()
        
        if not org:
            raise serializers.ValidationError("Debe tener una organización")
        
        serializer.save(
            organization=org,
            created_by=self.request.user
        )

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generar archivo de reporte"""
        report = self.get_object()
        
        # TODO: Implementar generación de PDF/Excel
        # Por ahora solo retornamos el contenido JSON
        
        analyses = report.analyses.all()
        content = {
            'report_name': report.name,
            'report_type': report.report_type,
            'generated_at': timezone.now().isoformat(),
            'organization': report.organization.name,
            'analyses': []
        }
        
        for analysis in analyses:
            content['analyses'].append({
                'framework': analysis.framework.name,
                'compliance_score': float(analysis.compliance_score) if analysis.compliance_score else None,
                'executive_summary': analysis.executive_summary,
                'key_findings': analysis.key_findings,
                'recommendations': analysis.recommendations,
                'gaps_summary': {
                    'total': analysis.requirements_total,
                    'compliant': analysis.requirements_compliant,
                    'partial': analysis.requirements_partial,
                    'non_compliant': analysis.requirements_non_compliant,
                }
            })
        
        report.content = content
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)
