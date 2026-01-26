#!/usr/bin/env python
"""
Script para limpiar y reconfigurar Google OAuth
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sustenty.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.conf import settings

print("Limpiando configuración anterior...")

# Eliminar todas las SocialApps
SocialApp.objects.all().delete()
print("✓ SocialApps eliminadas")

# Eliminar todos los Sites
Site.objects.all().delete()
print("✓ Sites eliminados")

# Crear Site con ID 1
site = Site.objects.create(
    id=1,
    domain='localhost:8000',
    name='Sustenty Local'
)
print(f"✓ Site creado: {site.domain}")

# Obtener credenciales
client_id = settings.GOOGLE_OAUTH_CLIENT_ID
client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET

if not client_id or not client_secret:
    print("✗ Error: Credenciales no encontradas en settings")
    exit(1)

# Crear SocialApp
social_app = SocialApp.objects.create(
    provider='google',
    name='Google OAuth',
    client_id=client_id,
    secret=client_secret,
)

# Asociar con el site
social_app.sites.add(site)
social_app.save()

print(f"✓ Google OAuth configurado exitosamente")
print(f"\nClient ID: {client_id[:20]}...")
print(f"Site ID: {site.id}")
print(f"Site Domain: {site.domain}")
print(f"App Sites Count: {social_app.sites.count()}")
print("\n¡Configuración completada! Intenta hacer login nuevamente.")
