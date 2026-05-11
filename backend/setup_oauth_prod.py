#!/usr/bin/env python
"""
Script para configurar Google OAuth en PRODUCCIÓN (sustenty.com)
Ejecutar dentro del contenedor backend:
  docker-compose -f docker-compose.prod.yml --env-file .env.prod exec backend python setup_oauth_prod.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sustenty.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.conf import settings

print("Limpiando configuración anterior...")

# Eliminar SocialApps y Sites existentes
SocialApp.objects.all().delete()
print("✓ SocialApps eliminadas")

Site.objects.all().delete()
print("✓ Sites eliminados")

# Crear Site con dominio de producción
site = Site.objects.create(
    id=1,
    domain='sustenty.com',
    name='Sustenty'
)
print(f"✓ Site creado: {site.domain}")

# Obtener credenciales desde settings (tomadas del .env.prod)
client_id = settings.GOOGLE_OAUTH_CLIENT_ID
client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET

if not client_id or not client_secret:
    print("\n✗ Error: GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET están vacíos en .env.prod")
    print("  Agrega las credenciales de Google Cloud Console y vuelve a ejecutar.")
    exit(1)

# Crear SocialApp para Google
social_app = SocialApp.objects.create(
    provider='google',
    name='Google OAuth',
    client_id=client_id,
    secret=client_secret,
)

social_app.sites.add(site)
social_app.save()

print(f"✓ Google OAuth configurado exitosamente")
print(f"\n  Client ID: {client_id[:20]}...")
print(f"  Site ID:     {site.id}")
print(f"  Site Domain: {site.domain}")
print(f"  Sites count: {social_app.sites.count()}")
print("\n¡Listo! El login con Google debería funcionar en https://sustenty.com")
