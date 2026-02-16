"""
Comando para enviar resúmenes semanales por email
Ejecutar: python manage.py send_weekly_digest
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from apps.api.email_service import email_service
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Envía resúmenes semanales ESG a todos los usuarios con la configuración habilitada'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Enviar solo a un usuario específico (para testing)',
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        
        # Calcular fechas de la semana
        today = datetime.now().date()
        week_start = today - timedelta(days=7)
        week_end = today
        
        # Obtener usuarios
        if user_id:
            users = User.objects.filter(id=user_id)
            self.stdout.write(f"Enviando resumen semanal a usuario #{user_id}...")
        else:
            # Solo usuarios con configuración habilitada
            users = User.objects.filter(
                settings__email_notifications=True,
                settings__weekly_digest=True
            ).select_related('settings')
            self.stdout.write(f"Enviando resúmenes semanales a {users.count()} usuarios...")
        
        success_count = 0
        error_count = 0
        
        for user in users:
            try:
                # Recopilar datos de la semana del usuario
                user_orgs = user.organizations.all()
                
                # Datos de ejemplo (reemplazar cuando existan los modelos)
                emissions_count = 0
                documents_uploaded = 0
                compliance_score = 85
                
                # Intentar obtener datos reales si los modelos existen
                try:
                    from apps.carbon.models import CarbonDataEntry
                    from apps.compliance.models import Document
                    
                    emissions_count = CarbonDataEntry.objects.filter(
                        organization__in=user_orgs,
                        collection_date__gte=week_start,
                        collection_date__lte=week_end
                    ).count()
                    
                    documents_uploaded = Document.objects.filter(
                        organization__in=user_orgs,
                        created_at__date__gte=week_start,
                        created_at__date__lte=week_end
                    ).count()
                except ImportError:
                    # Modelos aún no existen, usar datos de ejemplo
                    pass
                
                digest_data = {
                    'week_start': week_start.strftime('%d/%m/%Y'),
                    'week_end': week_end.strftime('%d/%m/%Y'),
                    'emissions_count': emissions_count,
                    'documents_uploaded': documents_uploaded,
                    'compliance_score': compliance_score,
                }
                
                # Enviar email
                result = email_service.send_weekly_digest(user, digest_data)
                
                if result.get('success'):
                    success_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"✅ Enviado a {user.email}")
                    )
                else:
                    error_count += 1
                    self.stdout.write(
                        self.style.WARNING(f"⚠️ No enviado a {user.email}: {result.get('message', 'Unknown error')}")
                    )
                    
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f"❌ Error con {user.email}: {str(e)}")
                )
                logger.error(f"Error enviando resumen semanal a {user.email}: {e}")
        
        # Resumen final
        self.stdout.write(self.style.SUCCESS(f"\n✅ Proceso completado: {success_count} enviados, {error_count} errores"))
