from django.core.management.base import BaseCommand
from apps.esg.models import ESGCategory, ESGComplianceStandard


class Command(BaseCommand):
    help = 'Carga datos iniciales para el módulo ESG (categorías y estándares)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando categorías ESG...')

        # Crear categorías ESG
        categories = [
            {
                'name': 'Ambiental',
                'code': 'environmental',
                'description': 'Aspectos ambientales: emisiones, energía, agua, residuos, biodiversidad',
                'icon': 'Nature',
                'color': 'success'
            },
            {
                'name': 'Social',
                'code': 'social',
                'description': 'Aspectos sociales: empleados, diversidad, seguridad, comunidad',
                'icon': 'People',
                'color': 'info'
            },
            {
                'name': 'Gobernanza',
                'code': 'governance',
                'description': 'Aspectos de gobernanza: ética, compliance, transparencia, auditorías',
                'icon': 'Gavel',
                'color': 'warning'
            }
        ]

        for cat_data in categories:
            category, created = ESGCategory.objects.get_or_create(
                code=cat_data['code'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Creada categoría: {category.name}'))
            else:
                self.stdout.write(f'  - Categoría ya existe: {category.name}')

        # Crear estándares de cumplimiento
        self.stdout.write('\nCreando estándares de cumplimiento...')
        
        standards = [
            {
                'name': 'Global Reporting Initiative',
                'code': 'GRI',
                'description': 'Estándares GRI para reporting de sostenibilidad',
                'version': '2021',
                'url': 'https://www.globalreporting.org/'
            },
            {
                'name': 'Sustainability Accounting Standards Board',
                'code': 'SASB',
                'description': 'Estándares SASB para métricas ESG específicas de industria',
                'version': '2018',
                'url': 'https://www.sasb.org/'
            },
            {
                'name': 'Task Force on Climate-related Financial Disclosures',
                'code': 'TCFD',
                'description': 'Recomendaciones TCFD para divulgación de riesgos climáticos',
                'version': '2017',
                'url': 'https://www.fsb-tcfd.org/'
            },
            {
                'name': 'Carbon Disclosure Project',
                'code': 'CDP',
                'description': 'Sistema global de divulgación ambiental',
                'version': '2024',
                'url': 'https://www.cdp.net/'
            }
        ]
        
        for std_data in standards:
            standard, created = ESGComplianceStandard.objects.get_or_create(
                code=std_data['code'],
                defaults=std_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Creado estándar: {standard.name}'))
            else:
                self.stdout.write(f'  - Estándar ya existe: {standard.name}')

        self.stdout.write(self.style.SUCCESS('\n✓ Datos iniciales cargados exitosamente'))
