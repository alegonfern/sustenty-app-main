#!/usr/bin/env python
"""
Script para configurar Google OAuth con IP local
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sustenty.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.conf import settings

# Configurar el Site con la IP local
site, created = Site.objects.get_or_create(
    id=1,
    defaults={
        'domain': '192.168.5.45:8000',
        'name': 'Sustenty Local IP'
    }
)

if not created:
    site.domain = '192.168.5.45:8000'
    site.name = 'Sustenty Local IP'
    site.save()
    print(f"✓ Site actualizado: {site.domain}")
else:
    print(f"✓ Site creado: {site.domain}")

# Configurar Google OAuth
client_id = settings.GOOGLE_OAUTH_CLIENT_ID
client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET

if not client_id or not client_secret:
    print("✗ Error: GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET deben estar en .env")
    exit(1)

# Crear o actualizar SocialApp
social_app, created = SocialApp.objects.update_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth',
        'client_id': client_id,
        'secret': client_secret,
    }
)

# Asociar con el site
social_app.sites.add(site)
social_app.save()

if created:
    print(f"✓ Google OAuth creado exitosamente")
else:
    print(f"✓ Google OAuth actualizado exitosamente")

print(f"\nClient ID: {client_id[:20]}...")
print(f"Site: {site.domain}")
print("\n¡Configuración completada!")
print("\n" + "="*70)
print("IMPORTANTE: Debes actualizar Google Cloud Console")
print("="*70)
print("\n1. Ve a: https://console.cloud.google.com/apis/credentials")
print("2. Edita tu OAuth 2.0 Client ID")
print("3. Agrega estas URIs DE REDIRECCIONAMIENTO AUTORIZADAS:")
print("   http://192.168.5.45:8000/accounts/google/login/callback/")
print("   http://localhost:8000/accounts/google/login/callback/")
print("\n4. Agrega estos ORÍGENES DE JAVASCRIPT AUTORIZADOS:")
print("   http://192.168.5.45:3000")
print("   http://192.168.5.45:8000")
print("   http://localhost:3000")
print("   http://localhost:8000")
print("\n5. Guarda los cambios")
print("="*70)
