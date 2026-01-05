"""
Email Service for Sustenty
===========================
Servicio centralizado para enviar emails con plantillas HTML.

Uso:
    from apps.api.email_service import EmailService
    
    # Enviar email de bienvenida
    EmailService.send_welcome_email(user)
    
    # Enviar alerta
    EmailService.send_alert_email(user, 'emissions', data)
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Servicio centralizado para envío de emails"""
    
    # Colores de la marca
    BRAND_COLOR = "#1976d2"
    BRAND_COLOR_LIGHT = "#e3f2fd"
    
    @classmethod
    def is_enabled(cls):
        """Verifica si el envío de emails está habilitado"""
        return bool(getattr(settings, 'RESEND_API_KEY', ''))
    
    @classmethod
    def _get_base_template(cls, content, title=""):
        """Genera el template HTML base con estilos"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: {cls.BRAND_COLOR}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🌿 Sustenty</h1>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Sostenibilidad Empresarial</p>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    {content}
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #fafafa; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                                    <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
                                        © 2026 Sustenty. Todos los derechos reservados.<br>
                                        <a href="{settings.FRONTEND_URL}/settings" style="color: {cls.BRAND_COLOR};">Gestionar preferencias de notificación</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    @classmethod
    def _send_email(cls, to_email, subject, text_content, html_content):
        """Envía un email con contenido HTML y texto plano"""
        if not cls.is_enabled():
            logger.info(f"[EMAIL DISABLED] To: {to_email}, Subject: {subject}")
            print(f"\n{'='*60}")
            print(f"📧 EMAIL (modo desarrollo)")
            print(f"To: {to_email}")
            print(f"Subject: {subject}")
            print(f"{'='*60}")
            print(text_content)
            print(f"{'='*60}\n")
            return False
        
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email] if isinstance(to_email, str) else to_email
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)
            logger.info(f"Email enviado exitosamente a {to_email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando email a {to_email}: {str(e)}")
            return False
    
    # =========================================================================
    # EMAILS DE USUARIO
    # =========================================================================
    
    @classmethod
    def send_welcome_email(cls, user):
        """Email de bienvenida para nuevos usuarios"""
        subject = "¡Bienvenido a Sustenty! 🌿"
        
        text_content = f"""
Hola {user.first_name or user.username},

¡Bienvenido a Sustenty! Estamos emocionados de tenerte con nosotros.

Con Sustenty podrás:
- Calcular y gestionar tu huella de carbono
- Cumplir con normativas ESG
- Generar reportes de sostenibilidad

Para comenzar, visita: {settings.FRONTEND_URL}/dashboard

¿Necesitas ayuda? Responde a este email y te asistiremos.

Saludos,
El equipo de Sustenty
        """
        
        html_content = cls._get_base_template(f"""
            <h2 style="margin: 0 0 20px 0; color: #333;">¡Hola {user.first_name or user.username}!</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Bienvenido a <strong>Sustenty</strong>. Estamos emocionados de tenerte con nosotros en tu viaje hacia la sostenibilidad empresarial.
            </p>
            
            <div style="background-color: {cls.BRAND_COLOR_LIGHT}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: {cls.BRAND_COLOR};">Con Sustenty podrás:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                    <li style="margin-bottom: 8px;">📊 Calcular y gestionar tu huella de carbono</li>
                    <li style="margin-bottom: 8px;">✅ Cumplir con normativas ESG (CSRD, GRI, SASB)</li>
                    <li style="margin-bottom: 8px;">📋 Generar reportes de sostenibilidad automáticos</li>
                    <li style="margin-bottom: 8px;">🤖 Usar IA para obtener insights y recomendaciones</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; background-color: {cls.BRAND_COLOR}; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Comenzar ahora →
                </a>
            </div>
            
            <p style="color: #888; font-size: 14px;">
                ¿Necesitas ayuda? Simplemente responde a este email y te asistiremos.
            </p>
        """, subject)
        
        return cls._send_email(user.email, subject, text_content, html_content)
    
    @classmethod
    def send_password_reset_email(cls, user, reset_link):
        """Email para restablecer contraseña"""
        subject = "Restablecer tu contraseña - Sustenty"
        
        text_content = f"""
Hola {user.first_name or user.username},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita el siguiente enlace:
{reset_link}

Este enlace expira en 1 hora.

Si no solicitaste este cambio, puedes ignorar este email.

Saludos,
El equipo de Sustenty
        """
        
        html_content = cls._get_base_template(f"""
            <h2 style="margin: 0 0 20px 0; color: #333;">Restablecer contraseña</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Hola {user.first_name or user.username}, recibimos una solicitud para restablecer la contraseña de tu cuenta.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="display: inline-block; background-color: {cls.BRAND_COLOR}; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Restablecer contraseña
                </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
                Este enlace expira en <strong>1 hora</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="color: #999; font-size: 13px;">
                Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.
            </p>
        """, subject)
        
        return cls._send_email(user.email, subject, text_content, html_content)
    
    # =========================================================================
    # ALERTAS ESG
    # =========================================================================
    
    @classmethod
    def send_emissions_alert(cls, user, data):
        """Alerta cuando las emisiones superan un umbral"""
        subject = f"⚠️ Alerta de Emisiones - {data.get('organization', 'Tu organización')}"
        
        current = data.get('current_emissions', 0)
        threshold = data.get('threshold', 0)
        percentage = data.get('percentage_over', 0)
        
        text_content = f"""
Alerta de Emisiones

Hola {user.first_name or user.username},

Las emisiones de {data.get('organization', 'tu organización')} han superado el umbral configurado.

- Emisiones actuales: {current} tCO2e
- Umbral configurado: {threshold} tCO2e
- Exceso: {percentage}%

Te recomendamos revisar las fuentes de emisión y tomar medidas correctivas.

Ver detalles: {settings.FRONTEND_URL}/esg/emissions

Saludos,
El equipo de Sustenty
        """
        
        html_content = cls._get_base_template(f"""
            <h2 style="margin: 0 0 20px 0; color: #d32f2f;">⚠️ Alerta de Emisiones</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Las emisiones de <strong>{data.get('organization', 'tu organización')}</strong> han superado el umbral configurado.
            </p>
            
            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d32f2f;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #555;">Emisiones actuales:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #d32f2f;">{current} tCO2e</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555;">Umbral configurado:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600;">{threshold} tCO2e</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555;">Exceso:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #d32f2f;">+{percentage}%</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/esg/emissions" 
                   style="display: inline-block; background-color: #d32f2f; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Ver detalles
                </a>
            </div>
        """, subject)
        
        return cls._send_email(user.email, subject, text_content, html_content)
    
    @classmethod
    def send_compliance_alert(cls, user, data):
        """Alerta de cambios en cumplimiento normativo"""
        subject = f"📋 Actualización de Cumplimiento - {data.get('regulation', 'Normativa')}"
        
        text_content = f"""
Actualización de Cumplimiento

Hola {user.first_name or user.username},

Se ha detectado un cambio en tu estado de cumplimiento:

Normativa: {data.get('regulation', 'N/A')}
Estado anterior: {data.get('previous_status', 'N/A')}
Estado actual: {data.get('current_status', 'N/A')}
Brechas detectadas: {data.get('gaps_count', 0)}

Ver análisis completo: {settings.FRONTEND_URL}/esg/compliance

Saludos,
El equipo de Sustenty
        """
        
        status_color = "#4caf50" if data.get('current_status') == "Cumple" else "#ff9800"
        
        html_content = cls._get_base_template(f"""
            <h2 style="margin: 0 0 20px 0; color: #333;">📋 Actualización de Cumplimiento</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Se ha detectado un cambio en tu estado de cumplimiento normativo.
            </p>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800;">
                <h3 style="margin: 0 0 15px 0; color: #e65100;">{data.get('regulation', 'Normativa')}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #555;">Estado anterior:</td>
                        <td style="padding: 8px 0; text-align: right;">{data.get('previous_status', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555;">Estado actual:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: {status_color};">{data.get('current_status', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555;">Brechas detectadas:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600;">{data.get('gaps_count', 0)}</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/esg/compliance" 
                   style="display: inline-block; background-color: {cls.BRAND_COLOR}; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Ver análisis completo
                </a>
            </div>
        """, subject)
        
        return cls._send_email(user.email, subject, text_content, html_content)
    
    @classmethod
    def send_deadline_reminder(cls, user, data):
        """Recordatorio de fecha límite próxima"""
        subject = f"📅 Recordatorio: {data.get('title', 'Fecha límite próxima')}"
        
        text_content = f"""
Recordatorio de Fecha Límite

Hola {user.first_name or user.username},

Tienes una fecha límite próxima:

{data.get('title', 'Actividad pendiente')}
Fecha límite: {data.get('deadline', 'No especificada')}
Días restantes: {data.get('days_remaining', 'N/A')}

{data.get('description', '')}

Ver detalles: {settings.FRONTEND_URL}/dashboard

Saludos,
El equipo de Sustenty
        """
        
        days = data.get('days_remaining', 999)
        urgency_color = "#d32f2f" if days <= 3 else "#ff9800" if days <= 7 else "#4caf50"
        
        html_content = cls._get_base_template(f"""
            <h2 style="margin: 0 0 20px 0; color: #333;">📅 Recordatorio</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Tienes una fecha límite próxima que requiere tu atención.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid {urgency_color};">
                <h3 style="margin: 0 0 10px 0; color: #333;">{data.get('title', 'Actividad pendiente')}</h3>
                <p style="margin: 0 0 15px 0; color: #666;">{data.get('description', '')}</p>
                <div style="display: flex; gap: 20px;">
                    <span style="color: #555;">📆 <strong>{data.get('deadline', 'No especificada')}</strong></span>
                    <span style="color: {urgency_color}; font-weight: 600;">⏱️ {data.get('days_remaining', 'N/A')} días restantes</span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; background-color: {cls.BRAND_COLOR}; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Ver detalles
                </a>
            </div>
        """, subject)
        
        return cls._send_email(user.email, subject, text_content, html_content)
    
    # =========================================================================
    # RESUMEN SEMANAL
    # =========================================================================
    
    @classmethod
    def send_weekly_digest(cls, user, data):
        """Resumen semanal de actividad ESG"""
        subject = "📊 Tu resumen semanal de sostenibilidad - Sustenty"
        
        text_content = f"""
Resumen Semanal de Sostenibilidad

Hola {user.first_name or user.username},

Aquí está tu resumen de la semana:

EMISIONES
- Total: {data.get('total_emissions', 0)} tCO2e
- Variación: {data.get('emissions_change', 0)}% vs semana anterior

CUMPLIMIENTO
- Normativas activas: {data.get('active_regulations', 0)}
- Brechas pendientes: {data.get('pending_gaps', 0)}

PRÓXIMAS FECHAS
{data.get('upcoming_deadlines_text', 'No hay fechas próximas')}

Ver dashboard completo: {settings.FRONTEND_URL}/dashboard

Saludos,
El equipo de Sustenty
        """
        
        emissions_change = data.get('emissions_change', 0)
        change_color = "#4caf50" if emissions_change < 0 else "#d32f2f" if emissions_change > 0 else "#666"
        change_icon = "📉" if emissions_change < 0 else "📈" if emissions_change > 0 else "➡️"
        
        deadlines_html = ""
        for deadline in data.get('upcoming_deadlines', [])[:3]:
            deadlines_html += f'<li style="margin-bottom: 8px;">{deadline.get("title", "Tarea")} - {deadline.get("date", "Fecha")}</li>'
        
        if not deadlines_html:
            deadlines_html = '<li style="color: #888;">No hay fechas próximas esta semana</li>'
        
        html_content = cls._get_base_template(f"""
            <h2 style="margin: 0 0 20px 0; color: #333;">📊 Tu resumen semanal</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Hola {user.first_name or user.username}, aquí está tu resumen de sostenibilidad de la semana.
            </p>
            
            <!-- Métricas principales -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin: 25px 0;">
                <tr>
                    <td style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; width: 50%;">
                        <div style="font-size: 28px; font-weight: 700; color: #2e7d32;">{data.get('total_emissions', 0)}</div>
                        <div style="color: #666; font-size: 14px;">tCO2e totales</div>
                        <div style="color: {change_color}; font-size: 13px; margin-top: 5px;">{change_icon} {emissions_change}% vs semana anterior</div>
                    </td>
                    <td style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; width: 50%;">
                        <div style="font-size: 28px; font-weight: 700; color: #1565c0;">{data.get('compliance_score', 0)}%</div>
                        <div style="color: #666; font-size: 14px;">Cumplimiento ESG</div>
                        <div style="color: #666; font-size: 13px; margin-top: 5px;">{data.get('pending_gaps', 0)} brechas pendientes</div>
                    </td>
                </tr>
            </table>
            
            <!-- Próximas fechas -->
            <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #f57c00;">📅 Próximas fechas</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                    {deadlines_html}
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; background-color: {cls.BRAND_COLOR}; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Ver dashboard completo
                </a>
            </div>
        """, subject)
        
        return cls._send_email(user.email, subject, text_content, html_content)


# Función helper para verificar si se pueden enviar emails
def can_send_emails():
    """Retorna True si el envío de emails está configurado"""
    return EmailService.is_enabled()
