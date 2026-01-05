from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'frameworks', views.ComplianceFrameworkViewSet, basename='compliance-framework')
router.register(r'requirements', views.ComplianceRequirementViewSet, basename='compliance-requirement')
router.register(r'documents', views.ComplianceDocumentViewSet, basename='compliance-document')
router.register(r'analyses', views.ComplianceAnalysisViewSet, basename='compliance-analysis')
router.register(r'gaps', views.ComplianceGapViewSet, basename='compliance-gap')
router.register(r'reports', views.ComplianceReportViewSet, basename='compliance-report')

urlpatterns = [
    path('', include(router.urls)),
]
