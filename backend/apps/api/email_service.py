"""
Servicio de Email usando Resend
"""
import resend
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Servicio centralizado para envío de emails usando Resend
    """
    
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.from_email = settings.DEFAULT_FROM_EMAIL
        self.has_api_key = bool(self.api_key)
        
        if self.has_api_key:
            resend.api_key = self.api_key
    
    def send_email(self, to_email, subject, html_content, text_content=None):
        """
        Envía un email usando Resend
        
        Args:
            to_email: Email del destinatario
            subject: Asunto del email
            html_content: Contenido HTML del email
            text_content: Contenido en texto plano (opcional)
        """
        if not self.has_api_key:
            logger.warning(f"📧 [DEV MODE] Email que se enviaría a {to_email}:")
            logger.warning(f"   Asunto: {subject}")
            logger.warning(f"   Contenido: {html_content[:200]}...")
            return {'success': False, 'message': 'Resend API key no configurada'}
        
        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            
            if text_content:
                params["text"] = text_content
            
            response = resend.Emails.send(params)
            logger.info(f"✅ Email enviado a {to_email}: {subject}")
            return {'success': True, 'message_id': response.get('id')}
            
        except Exception as e:
            logger.error(f"❌ Error enviando email a {to_email}: {e}")
            return {'success': False, 'error': str(e)}
    
    def send_weekly_digest(self, user, digest_data):
        """
        Envía el resumen semanal al usuario
        """
        if not user.settings.email_notifications or not user.settings.weekly_digest:
            return {'success': False, 'message': 'Usuario no tiene habilitado el resumen semanal'}
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #80cfc5 0%, #5fa99f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
                .stat-card {{ background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .stat-number {{ font-size: 32px; font-weight: bold; color: #80cfc5; }}
                .stat-label {{ color: #666; font-size: 14px; }}
                .footer {{ background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }}
                .btn {{ display: inline-block; padding: 12px 24px; background: #80cfc5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌱 Tu Resumen Semanal ESG</h1>
                    <p>Semana del {digest_data.get('week_start', '')} al {digest_data.get('week_end', '')}</p>
                </div>
                
                <div class="content">
                    <p>Hola {user.first_name or user.username},</p>
                    <p>Aquí está tu resumen semanal de actividad en Sustenty:</p>
                    
                    <div class="stat-card">
                        <div class="stat-number">{digest_data.get('emissions_count', 0)}</div>
                        <div class="stat-label">Emisiones registradas esta semana</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-number">{digest_data.get('documents_uploaded', 0)}</div>
                        <div class="stat-label">Documentos procesados</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-number">{digest_data.get('compliance_score', 'N/A')}%</div>
                        <div class="stat-label">Puntuación de cumplimiento</div>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="{settings.FRONTEND_URL}/dashboard" class="btn">Ver Dashboard Completo</a>
                    </p>
                </div>
                
                <div class="footer">
                    <p>Este es un email automático de Sustenty</p>
                    <p>Puedes desactivar los resúmenes semanales en <a href="{settings.FRONTEND_URL}/settings" style="color: #80cfc5;">Configuración</a></p>
                    <p>&copy; 2026 Sustenty. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=user.email,
            subject="🌱 Tu Resumen Semanal ESG - Sustenty",
            html_content=html_content
        )
    
    def send_emission_alert(self, user, emission_data):
        """
        Envía alerta cuando las emisiones superan un umbral
        """
        if not user.settings.email_notifications or not user.settings.alerts_emissions:
            return {'success': False, 'message': 'Usuario no tiene habilitadas alertas de emisiones'}
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .alert {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }}
                .btn {{ display: inline-block; padding: 12px 24px; background: #80cfc5; color: white; text-decoration: none; border-radius: 6px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>⚠️ Alerta de Emisiones</h2>
                <div class="alert">
                    <p><strong>Se ha detectado un incremento en las emisiones</strong></p>
                    <p>Emisión registrada: {emission_data.get('amount', 'N/A')} tCO2e</p>
                    <p>Fuente: {emission_data.get('source', 'N/A')}</p>
                    <p>Fecha: {emission_data.get('date', 'N/A')}</p>
                </div>
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/esg/emissions" class="btn">Ver Detalles</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=user.email,
            subject="⚠️ Alerta de Emisiones - Sustenty",
            html_content=html_content
        )
    
    def send_compliance_alert(self, user, compliance_data):
        """
        Envía alerta de cumplimiento normativo
        """
        if not user.settings.email_notifications or not user.settings.alerts_compliance:
            return {'success': False, 'message': 'Usuario no tiene habilitadas alertas de cumplimiento'}
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .alert {{ background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; }}
                .btn {{ display: inline-block; padding: 12px 24px; background: #80cfc5; color: white; text-decoration: none; border-radius: 6px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🔔 Alerta de Cumplimiento</h2>
                <div class="alert">
                    <p><strong>{compliance_data.get('title', 'Cambio en normativa')}</strong></p>
                    <p>{compliance_data.get('description', '')}</p>
                    <p>Regulación: {compliance_data.get('regulation', 'N/A')}</p>
                </div>
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/esg/compliance" class="btn">Ver Cumplimiento</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=user.email,
            subject="🔔 Alerta de Cumplimiento - Sustenty",
            html_content=html_content
        )
    
    def send_deadline_reminder(self, user, deadline_data):
        """
        Envía recordatorio de fecha límite
        """
        if not user.settings.email_notifications or not user.settings.alerts_deadlines:
            return {'success': False, 'message': 'Usuario no tiene habilitados recordatorios'}
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .reminder {{ background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; }}
                .btn {{ display: inline-block; padding: 12px 24px; background: #80cfc5; color: white; text-decoration: none; border-radius: 6px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>📅 Recordatorio de Fecha Límite</h2>
                <div class="reminder">
                    <p><strong>{deadline_data.get('title', 'Tarea pendiente')}</strong></p>
                    <p>Fecha límite: {deadline_data.get('due_date', 'N/A')}</p>
                    <p>{deadline_data.get('description', '')}</p>
                </div>
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/dashboard" class="btn">Ver Tareas</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=user.email,
            subject="📅 Recordatorio - Sustenty",
            html_content=html_content
        )
    
    def send_password_reset(self, user, reset_link):
        """
        Envía email de restablecimiento de contraseña
        """
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #80cfc5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
                .btn {{ display: inline-block; padding: 14px 28px; background: #80cfc5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }}
                .warning {{ background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Restablecer Contraseña</h1>
                </div>
                
                <div class="content">
                    <p>Hola {user.first_name or user.username},</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Sustenty.</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" class="btn">Restablecer Contraseña</a>
                    </p>
                    
                    <div class="warning">
                        <strong>⏰ Este enlace expira en 1 hora</strong>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">
                        Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá sin cambios.
                    </p>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        <a href="{reset_link}" style="color: #80cfc5; word-break: break-all;">{reset_link}</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=user.email,
            subject="🔐 Restablecer tu contraseña - Sustenty",
            html_content=html_content
        )


# Instancia global del servicio
email_service = EmailService()
