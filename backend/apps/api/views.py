from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .models import Organization
from .serializers import OrganizationSerializer, OrganizationCreateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint para verificar el estado de la API
    """
    return Response({
        'status': 'ok',
        'message': 'Sustenty API is running',
        'version': '1.0.0'
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def organization_list_create(request):
    """
    GET: Lista todas las organizaciones del usuario autenticado
    POST: Crea una nueva organización para el usuario autenticado
    """
    if request.method == 'GET':
        organizations = Organization.objects.filter(user=request.user)
        serializer = OrganizationSerializer(organizations, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = OrganizationCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar el usuario autenticado a la organización
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def organization_detail(request, pk):
    """
    GET: Obtiene los detalles de una organización
    PUT: Actualiza una organización
    DELETE: Elimina una organización
    """
    try:
        organization = Organization.objects.get(pk=pk, user=request.user)
    except Organization.DoesNotExist:
        return Response(
            {'error': 'Organización no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = OrganizationSerializer(organization)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = OrganizationCreateSerializer(organization, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        organization.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)