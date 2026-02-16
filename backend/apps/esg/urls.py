from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.ESGCategoryViewSet, basename='esg-category')
router.register(r'goals', views.ESGGoalViewSet, basename='esg-goal')
router.register(r'actions', views.ESGActionViewSet, basename='esg-action')
router.register(r'compliance-standards', views.ESGComplianceStandardViewSet, basename='esg-compliance-standard')

urlpatterns = [
    path('', include(router.urls)),
]
