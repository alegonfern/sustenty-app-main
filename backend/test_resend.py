#!/usr/bin/env python
"""
Script de prueba para verificar la configuración de Resend
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sustenty.settings')
django.setup()

from apps.api.email_service import EmailService
from django.conf import settings

print('=' * 50)
print('CONFIGURACIÓN DE RESEND')
print('=' * 50)
print(f'API Key configurada: {"Sí" if settings.RESEND_API_KEY else "No"}')
if settings.RESEND_API_KEY:
    print(f'API Key: {settings.RESEND_API_KEY[:20]}...')
print(f'From Email: {settings.DEFAULT_FROM_EMAIL}')
print()

# Test de envío real
email_service = EmailService()
print('=' * 50)
print('PRUEBA DE ENVÍO')
print('=' * 50)
print('Enviando email de prueba a alexis@sustenty.com...')
print()

result = email_service.send_email(
    to_email='alexis@sustenty.com',
    subject='✅ Prueba Exitosa - Resend configurado en Sustenty',
    html_content='''
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981;">¡Resend está funcionando!</h1>
        <p>Este email confirma que la integración con Resend está correctamente configurada en Sustenty.</p>
        <ul style="line-height: 1.8;">
            <li>✅ API Key válida</li>
            <li>✅ Backend configurado</li>
            <li>✅ Email enviado a alexis@sustenty.com</li>
        </ul>
        <p style="margin-top: 24px; color: #666;">Si ves este mensaje, puedes usar Resend para enviar emails desde Sustenty.</p>
    </div>
    ''',
    text_content='Resend funcionando en Sustenty. Email enviado a alexis@sustenty.com.'
)

print('Resultado:', result)
if result.get('success'):
    print('✅ Email enviado correctamente.')
else:
    print('❌ Error al enviar el email:', result.get('error'))

print('=' * 50)
print('CONFIGURACIÓN DE RESEND')
print('=' * 50)
print(f'API Key configurada: {"Sí" if settings.RESEND_API_KEY else "No"}')
if settings.RESEND_API_KEY:
    print(f'API Key: {settings.RESEND_API_KEY[:20]}...')
print(f'From Email: {settings.DEFAULT_FROM_EMAIL}')
print()

# Test de envío real
email_service = EmailService()
print('=' * 50)
print('PRUEBA DE ENVÍO')
print('=' * 50)
print('Enviando email de prueba a alexis@sustenty.com...')
print()

result = email_service.send_email(
    to_email='alexis@sustenty.com',
    subject='✅ Prueba Exitosa - Resend configurado en Sustenty',
    html_content='''
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981;">¡Resend está funcionando!</h1>
        <p>Este email confirma que la integración con Resend está correctamente configurada en Sustenty.</p>
        <ul style="line-height: 1.8;">
            <li>✅ API Key válida</li>
            <li>✅ Servicio de email operativo</li>
            <li>✅ Listo para funcionalidades de email</li>
        </ul>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Enviado desde el entorno de desarrollo</p>
    </div>
    ''',
    text_content='¡Resend está funcionando! La integración con Resend está correctamente configurada en Sustenty.'
)

print('=' * 50)
print('RESULTADO')
print('=' * 50)
print(f'Success: {result.get("success")}')
print(f'Message: {result.get("message")}')
if result.get('message_id'):
    print(f'✅ Email ID: {result.get("message_id")}')
    print('\n✅ Email enviado correctamente! Revisa tu bandeja de entrada en alexis@sustenty.com')
elif result.get('success'):
    print('\n✅ Email enviado correctamente! Revisa tu bandeja de entrada en alexis@sustenty.com')
else:
    print('\n❌ Error al enviar el email.')
    if result.get('error'):
        print(f'Error: {result.get("error")}')
