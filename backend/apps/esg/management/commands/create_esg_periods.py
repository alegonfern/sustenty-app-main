from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.esg.models import ESGPeriod
from datetime import datetime

User = get_user_model()


class Command(BaseCommand):
    help = 'Crear períodos ESG de ejemplo'

    def handle(self, *args, **kwargs):
        # Obtener el primer usuario admin
        admin_user = User.objects.filter(is_superuser=True).first()
        
        if not admin_user:
            self.stdout.write(self.style.ERROR('No se encontró ningún usuario admin. Crea uno primero.'))
            return

        periods_data = [
            {
                'name': 'Q1 2025',
                'description': 'Primer trimestre de 2025',
                'start_date': datetime(2025, 1, 1).date(),
                'end_date': datetime(2025, 3, 31).date(),
                'is_active': False,
                'is_closed': True,
            },
            {
                'name': 'Q2 2025',
                'description': 'Segundo trimestre de 2025',
                'start_date': datetime(2025, 4, 1).date(),
                'end_date': datetime(2025, 6, 30).date(),
                'is_active': False,
                'is_closed': True,
            },
            {
                'name': 'Q3 2025',
                'description': 'Tercer trimestre de 2025',
                'start_date': datetime(2025, 7, 1).date(),
                'end_date': datetime(2025, 9, 30).date(),
                'is_active': False,
                'is_closed': True,
            },
            {
                'name': 'Q4 2025',
                'description': 'Cuarto trimestre de 2025',
                'start_date': datetime(2025, 10, 1).date(),
                'end_date': datetime(2025, 12, 31).date(),
                'is_active': False,
                'is_closed': True,
            },
            {
                'name': 'Q1 2026',
                'description': 'Primer trimestre de 2026',
                'start_date': datetime(2026, 1, 1).date(),
                'end_date': datetime(2026, 3, 31).date(),
                'is_active': True,
                'is_closed': False,
            },
            {
                'name': 'Año 2025',
                'description': 'Período anual completo 2025',
                'start_date': datetime(2025, 1, 1).date(),
                'end_date': datetime(2025, 12, 31).date(),
                'is_active': False,
                'is_closed': True,
            },
            {
                'name': 'Año 2026',
                'description': 'Período anual completo 2026',
                'start_date': datetime(2026, 1, 1).date(),
                'end_date': datetime(2026, 12, 31).date(),
                'is_active': True,
                'is_closed': False,
            },
        ]

        created_count = 0
        for period_data in periods_data:
            period, created = ESGPeriod.objects.get_or_create(
                name=period_data['name'],
                defaults={
                    **period_data,
                    'created_by': admin_user,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Período creado: {period.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'• Período ya existe: {period.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Proceso completado: {created_count} períodos creados'))
