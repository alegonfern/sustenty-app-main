from django.core.management.base import BaseCommand
from apps.carbon.models import EmissionScope


class Command(BaseCommand):
    help = 'Carga datos iniciales para el módulo de Huella de Carbono'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando Alcances de Emisiones (Scopes)...')

        scopes = [
            {
                'name': 'Scope 1 - Emisiones Directas',
                'code': 'scope_1',
                'description': 'Emisiones directas de fuentes controladas o poseídas por la organización',
            },
            {
                'name': 'Scope 2 - Emisiones Indirectas de Energía',
                'code': 'scope_2',
                'description': 'Emisiones indirectas de la generación de energía comprada',
            },
            {
                'name': 'Scope 3 - Otras Emisiones Indirectas',
                'code': 'scope_3',
                'description': 'Otras emisiones indirectas que ocurren en la cadena de valor',
            }
        ]

        for scope_data in scopes:
            scope, created = EmissionScope.objects.get_or_create(
                code=scope_data['code'],
                defaults=scope_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Creado scope: {scope.name}'))
            else:
                self.stdout.write(f'  - Scope ya existe: {scope.name}')

        self.stdout.write(self.style.SUCCESS('\n✓ Datos iniciales de Huella de Carbono cargados'))
