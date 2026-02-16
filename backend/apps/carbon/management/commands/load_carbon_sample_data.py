from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.carbon.models import EmissionScope, EmissionFactor, CarbonPeriod, CarbonDataEntry
from apps.api.models import Organization
from datetime import date
from decimal import Decimal


class Command(BaseCommand):
    help = 'Carga datos de ejemplo para el módulo de Huella de Carbono'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando datos de ejemplo de Huella de Carbono...\n')

        # Obtener scopes
        try:
            scope_1 = EmissionScope.objects.get(code='scope_1')
            scope_2 = EmissionScope.objects.get(code='scope_2')
            scope_3 = EmissionScope.objects.get(code='scope_3')
        except EmissionScope.DoesNotExist:
            self.stdout.write(self.style.ERROR(
                'Error: Scopes no existen. Ejecuta load_carbon_initial_data primero.'
            ))
            return

        organization = Organization.objects.first()
        user = User.objects.filter(is_superuser=True).first() or User.objects.first()

        self.stdout.write('\nCreando Factores de Emisión...')

        # Factores Scope 1
        factors_scope1 = [
            {
                'name': 'Combustión de Gas Natural',
                'code': 'NATURAL_GAS',
                'description': 'Emisiones por combustión de gas natural en calderas e instalaciones',
                'unit': 'm3',
                'emission_factor': Decimal('1.93'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Combustión de Diésel',
                'code': 'DIESEL_COMBUSTION',
                'description': 'Emisiones por uso de diésel en generadores y vehículos propios',
                'unit': 'l',
                'emission_factor': Decimal('2.68'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Combustión de Gasolina',
                'code': 'GASOLINE_COMBUSTION',
                'description': 'Emisiones por uso de gasolina en vehículos de la flota',
                'unit': 'l',
                'emission_factor': Decimal('2.31'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Gases Refrigerantes (R-134a)',
                'code': 'REFRIGERANT_R134A',
                'description': 'Fugas de gases refrigerantes en sistemas de aire acondicionado',
                'unit': 'kg',
                'emission_factor': Decimal('1430.00'),
                'emission_unit': 'kgCO₂e'
            }
        ]

        for factor_data in factors_scope1:
            factor, created = EmissionFactor.objects.get_or_create(
                code=factor_data['code'],
                defaults={
                    **factor_data,
                    'scope': scope_1,
                    'data_type': 'numeric',
                    'organization': organization,
                    'gri_standard': 'GRI 305-1',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {factor.name}'))

        # Factores Scope 2
        factors_scope2 = [
            {
                'name': 'Electricidad de Red',
                'code': 'GRID_ELECTRICITY',
                'description': 'Emisiones indirectas por consumo de electricidad de la red nacional',
                'unit': 'kwh',
                'emission_factor': Decimal('0.45'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Vapor Comprado',
                'code': 'PURCHASED_STEAM',
                'description': 'Emisiones por vapor comprado para procesos industriales',
                'unit': 'ton',
                'emission_factor': Decimal('78.50'),
                'emission_unit': 'kgCO₂e'
            }
        ]

        for factor_data in factors_scope2:
            factor, created = EmissionFactor.objects.get_or_create(
                code=factor_data['code'],
                defaults={
                    **factor_data,
                    'scope': scope_2,
                    'data_type': 'numeric',
                    'organization': organization,
                    'gri_standard': 'GRI 305-2',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {factor.name}'))

        # Factores Scope 3
        factors_scope3 = [
            {
                'name': 'Transporte en Autobús',
                'code': 'BUS_TRANSPORT',
                'description': 'Emisiones por transporte de empleados en autobús',
                'unit': 'km',
                'emission_factor': Decimal('0.10'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Viajes de Negocios (Avión)',
                'code': 'BUSINESS_FLIGHT',
                'description': 'Emisiones por viajes de negocios en avión',
                'unit': 'km',
                'emission_factor': Decimal('0.25'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Taxi/Uber',
                'code': 'TAXI_TRANSPORT',
                'description': 'Emisiones por uso de taxi o servicios de transporte privado',
                'unit': 'km',
                'emission_factor': Decimal('0.18'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Transporte de Mercancías',
                'code': 'FREIGHT_TRANSPORT',
                'description': 'Emisiones por transporte de mercancías (upstream)',
                'unit': 'ton',
                'emission_factor': Decimal('62.00'),
                'emission_unit': 'kgCO₂e'
            },
            {
                'name': 'Residuos Enviados a Vertedero',
                'code': 'WASTE_LANDFILL',
                'description': 'Emisiones por tratamiento de residuos en vertedero',
                'unit': 'kg',
                'emission_factor': Decimal('0.52'),
                'emission_unit': 'kgCO₂e'
            }
        ]

        for factor_data in factors_scope3:
            factor, created = EmissionFactor.objects.get_or_create(
                code=factor_data['code'],
                defaults={
                    **factor_data,
                    'scope': scope_3,
                    'data_type': 'numeric',
                    'organization': organization,
                    'gri_standard': 'GRI 305-3',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {factor.name}'))

        # Crear Período
        self.stdout.write('\nCreando Período de Carbono...')
        period, created = CarbonPeriod.objects.get_or_create(
            name='Año Fiscal 2024',
            organization=organization,
            defaults={
                'start_date': date(2024, 1, 1),
                'end_date': date(2024, 12, 31),
                'is_active': True,
                'is_closed': False,
                'description': 'Período de medición de huella de carbono - año fiscal 2024',
                'created_by': user
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'  ✓ {period.name}'))

        # Crear datos de ejemplo
        self.stdout.write('\nCreando Registros de Emisiones...')

        bus = EmissionFactor.objects.filter(code='BUS_TRANSPORT').first()
        elec = EmissionFactor.objects.filter(code='GRID_ELECTRICITY').first()
        gas = EmissionFactor.objects.filter(code='NATURAL_GAS').first()
        diesel = EmissionFactor.objects.filter(code='DIESEL_COMBUSTION').first()
        flight = EmissionFactor.objects.filter(code='BUSINESS_FLIGHT').first()

        sample_data = []
        if bus:
            sample_data.append({
                'period': period, 'factor': bus,
                'collection_date': date(2024, 1, 15),
                'quantity': Decimal('1250.50'),
                'uncertainty_percentage': Decimal('5.0'),
                'notes': 'Transporte de empleados - Enero 2024',
                'status': 'completed', 'responsible': user, 'organization': organization
            })
        if elec:
            sample_data.append({
                'period': period, 'factor': elec,
                'collection_date': date(2024, 1, 31),
                'quantity': Decimal('45000.00'),
                'uncertainty_percentage': Decimal('2.0'),
                'notes': 'Consumo eléctrico oficinas - Enero 2024',
                'status': 'completed', 'responsible': user, 'organization': organization
            })
        if gas:
            sample_data.append({
                'period': period, 'factor': gas,
                'collection_date': date(2024, 1, 31),
                'quantity': Decimal('8500.00'),
                'uncertainty_percentage': Decimal('3.0'),
                'notes': 'Consumo gas natural calefacción - Enero 2024',
                'status': 'completed', 'responsible': user, 'organization': organization
            })
        if diesel:
            sample_data.append({
                'period': period, 'factor': diesel,
                'collection_date': date(2024, 2, 15),
                'quantity': Decimal('350.75'),
                'uncertainty_percentage': Decimal('1.5'),
                'notes': 'Consumo diésel generadores - Febrero 2024',
                'status': 'completed', 'responsible': user, 'organization': organization
            })
        if flight:
            sample_data.append({
                'period': period, 'factor': flight,
                'collection_date': date(2024, 2, 20),
                'quantity': Decimal('5420.00'),
                'uncertainty_percentage': Decimal('0.0'),
                'notes': 'Viaje de negocios a conferencia internacional',
                'status': 'completed', 'responsible': user, 'organization': organization
            })

        for data in sample_data:
            obj, created = CarbonDataEntry.objects.get_or_create(
                period=data['period'],
                factor=data['factor'],
                collection_date=data['collection_date'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f"  ✓ {obj.factor.name}: {obj.quantity} {obj.factor.unit} "
                    f"→ {obj.calculated_emission} {obj.factor.emission_unit}"
                ))

        self.stdout.write(self.style.SUCCESS('\n✓ Datos de ejemplo de Huella de Carbono cargados'))
        self.stdout.write(f'\nResumen:')
        self.stdout.write(f'  - Factores Scope 1: {EmissionFactor.objects.filter(scope=scope_1).count()}')
        self.stdout.write(f'  - Factores Scope 2: {EmissionFactor.objects.filter(scope=scope_2).count()}')
        self.stdout.write(f'  - Factores Scope 3: {EmissionFactor.objects.filter(scope=scope_3).count()}')
        self.stdout.write(f'  - Registros de datos: {CarbonDataEntry.objects.count()}')
