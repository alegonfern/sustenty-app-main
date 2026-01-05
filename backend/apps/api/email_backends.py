"""
Custom Email Backend for Resend
================================
Este backend permite enviar emails usando la API de Resend.

Para usar:
1. Instala resend: pip install resend
2. Configura RESEND_API_KEY en tu .env
3. El backend se activa automáticamente cuando hay API key

Documentación: https://resend.com/docs
"""

from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ResendEmailBackend(BaseEmailBackend):
    """
    Backend de email personalizado para Resend.
    Compatible con la API de Django send_mail().
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, 'RESEND_API_KEY', '')
        
    def send_messages(self, email_messages):
        """
        Envía uno o más mensajes de email usando Resend.
        Retorna el número de mensajes enviados exitosamente.
        """
        if not self.api_key:
            logger.warning("RESEND_API_KEY no está configurada. Los emails no se enviarán.")
            if not self.fail_silently:
                raise Exception("RESEND_API_KEY no configurada")
            return 0
        
        try:
            import resend
            resend.api_key = self.api_key
        except ImportError:
            logger.error("El paquete 'resend' no está instalado. Ejecuta: pip install resend")
            if not self.fail_silently:
                raise
            return 0
        
        sent_count = 0
        
        for message in email_messages:
            try:
                # Preparar el email para Resend
                email_data = {
                    "from": message.from_email or settings.DEFAULT_FROM_EMAIL,
                    "to": list(message.to),
                    "subject": message.subject,
                }
                
                # Si tiene contenido HTML
                if hasattr(message, 'alternatives') and message.alternatives:
                    for content, mimetype in message.alternatives:
                        if mimetype == 'text/html':
                            email_data["html"] = content
                            break
                    # También incluir texto plano
                    email_data["text"] = message.body
                else:
                    # Solo texto plano
                    email_data["text"] = message.body
                
                # Agregar CC y BCC si existen
                if message.cc:
                    email_data["cc"] = list(message.cc)
                if message.bcc:
                    email_data["bcc"] = list(message.bcc)
                
                # Agregar reply-to si existe
                if message.reply_to:
                    email_data["reply_to"] = message.reply_to[0]
                
                # Enviar con Resend
                response = resend.Emails.send(email_data)
                
                logger.info(f"Email enviado exitosamente a {message.to}. ID: {response.get('id', 'N/A')}")
                sent_count += 1
                
            except Exception as e:
                logger.error(f"Error enviando email a {message.to}: {str(e)}")
                if not self.fail_silently:
                    raise
        
        return sent_count
