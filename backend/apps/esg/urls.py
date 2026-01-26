from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'periods', views.ESGPeriodViewSet, basename='esg-period')
router.register(r'categories', views.ESGCategoryViewSet, basename='esg-category')
router.register(r'scopes', views.ESGScopeViewSet, basename='esg-scope')
router.register(r'metrics', views.ESGMetricViewSet, basename='esg-metric')
router.register(r'data-collection', views.ESGDataCollectionViewSet, basename='esg-data-collection')
router.register(r'goals', views.ESGGoalViewSet, basename='esg-goal')
router.register(r'actions', views.ESGActionViewSet, basename='esg-action')
router.register(r'compliance-standards', views.ESGComplianceStandardViewSet, basename='esg-compliance-standard')

urlpatterns = [
    path('', include(router.urls)),
]
