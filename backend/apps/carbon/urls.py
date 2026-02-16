from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'periods', views.CarbonPeriodViewSet, basename='carbon-period')
router.register(r'scopes', views.EmissionScopeViewSet, basename='carbon-scope')
router.register(r'factors', views.EmissionFactorViewSet, basename='carbon-factor')
router.register(r'data', views.CarbonDataEntryViewSet, basename='carbon-data')

urlpatterns = [
    path('', include(router.urls)),
]
