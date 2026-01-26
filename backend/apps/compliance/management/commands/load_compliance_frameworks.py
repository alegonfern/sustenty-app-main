"""
Management command to load initial compliance frameworks and requirements.
"""
from django.core.management.base import BaseCommand
from apps.compliance.models import ComplianceFramework, ComplianceRequirement


class Command(BaseCommand):
    help = 'Load initial compliance frameworks and their requirements'

    def handle(self, *args, **options):
        self.stdout.write('Loading compliance frameworks...')
        
        frameworks_data = [
            {
                'code': 'ISO-27001',
                'name': 'ISO 27001:2022',
                'description': 'Sistema de Gestión de Seguridad de la Información (SGSI). '
                              'Norma internacional que especifica los requisitos para establecer, '
                              'implementar, mantener y mejorar continuamente un sistema de gestión '
                              'de seguridad de la información.',
                'version': '2022',
                'category': 'security',
                'requirements': [
                    {'code': 'A.5.1', 'name': 'Políticas de seguridad de la información', 'description': 'Deben definirse políticas de seguridad de la información, aprobadas por la dirección, publicadas y comunicadas.', 'category': 'governance'},
                    {'code': 'A.5.2', 'name': 'Roles y responsabilidades', 'description': 'Deben definirse y asignarse las responsabilidades de seguridad de la información.', 'category': 'governance'},
                    {'code': 'A.5.3', 'name': 'Segregación de funciones', 'description': 'Las funciones y áreas de responsabilidad conflictivas deben estar segregadas.', 'category': 'governance'},
                    {'code': 'A.6.1', 'name': 'Selección de personal', 'description': 'Verificación de antecedentes de todos los candidatos según leyes y regulaciones.', 'category': 'procedure'},
                    {'code': 'A.6.2', 'name': 'Términos y condiciones de empleo', 'description': 'Acuerdos contractuales con empleados sobre responsabilidades de seguridad.', 'category': 'procedure'},
                    {'code': 'A.6.3', 'name': 'Concienciación sobre seguridad', 'description': 'Programas de concienciación, educación y formación en seguridad.', 'category': 'training'},
                    {'code': 'A.7.1', 'name': 'Perímetros de seguridad física', 'description': 'Deben definirse perímetros de seguridad para proteger áreas con información sensible.', 'category': 'control'},
                    {'code': 'A.7.2', 'name': 'Controles de entrada física', 'description': 'Las áreas seguras deben estar protegidas mediante controles de entrada apropiados.', 'category': 'control'},
                    {'code': 'A.8.1', 'name': 'Inventario de activos', 'description': 'Deben identificarse los activos asociados con información e instalaciones de procesamiento.', 'category': 'documentation'},
                    {'code': 'A.8.2', 'name': 'Clasificación de información', 'description': 'La información debe clasificarse según requisitos legales, valor, criticidad y sensibilidad.', 'category': 'documentation'},
                    {'code': 'A.8.3', 'name': 'Manejo de activos', 'description': 'Procedimientos para el manejo de activos según la clasificación de información.', 'category': 'procedure'},
                    {'code': 'A.8.4', 'name': 'Gestión de medios removibles', 'description': 'Procedimientos para la gestión de medios removibles según esquema de clasificación.', 'category': 'procedure'},
                ]
            },
            {
                'code': 'ISO-14001',
                'name': 'ISO 14001:2015',
                'description': 'Sistema de Gestión Ambiental. Marco para que las organizaciones '
                              'gestionen sus responsabilidades ambientales de manera sistemática.',
                'version': '2015',
                'category': 'environmental',
                'requirements': [
                    {'code': '4.1', 'name': 'Contexto de la organización', 'description': 'Determinar cuestiones externas e internas pertinentes al propósito y dirección estratégica.', 'category': 'organizational'},
                    {'code': '4.2', 'name': 'Partes interesadas', 'description': 'Determinar las partes interesadas pertinentes y sus requisitos.', 'category': 'organizational'},
                    {'code': '4.3', 'name': 'Alcance del SGA', 'description': 'Determinar los límites y aplicabilidad del sistema de gestión ambiental.', 'category': 'documentation'},
                    {'code': '5.1', 'name': 'Liderazgo y compromiso', 'description': 'La alta dirección debe demostrar liderazgo y compromiso con el SGA.', 'category': 'governance'},
                    {'code': '5.2', 'name': 'Política ambiental', 'description': 'Establecer, implementar y mantener una política ambiental.', 'category': 'policy'},
                    {'code': '6.1.1', 'name': 'Aspectos ambientales', 'description': 'Identificar aspectos ambientales y determinar impactos ambientales significativos.', 'category': 'documentation'},
                    {'code': '6.1.2', 'name': 'Requisitos legales', 'description': 'Determinar y tener acceso a requisitos legales aplicables.', 'category': 'documentation'},
                    {'code': '6.2', 'name': 'Objetivos ambientales', 'description': 'Establecer objetivos ambientales en funciones y niveles pertinentes.', 'category': 'documentation'},
                    {'code': '7.2', 'name': 'Competencia', 'description': 'Determinar competencia necesaria de personas que afectan desempeño ambiental.', 'category': 'training'},
                    {'code': '7.4', 'name': 'Comunicación', 'description': 'Establecer procesos de comunicación interna y externa.', 'category': 'procedure'},
                    {'code': '8.1', 'name': 'Control operacional', 'description': 'Establecer criterios de operación y controles para procesos.', 'category': 'control'},
                    {'code': '8.2', 'name': 'Preparación para emergencias', 'description': 'Establecer procesos para responder a situaciones de emergencia.', 'category': 'procedure'},
                ]
            },
            {
                'code': 'GRI',
                'name': 'GRI Standards 2021',
                'description': 'Global Reporting Initiative. Estándares para la elaboración de '
                              'informes de sostenibilidad, ayudando a las organizaciones a ser '
                              'transparentes sobre sus impactos.',
                'version': '2021',
                'category': 'sustainability',
                'requirements': [
                    {'code': 'GRI 2-1', 'name': 'Detalles organizacionales', 'description': 'Informar nombre legal, naturaleza de propiedad, ubicación de sede.', 'category': 'reporting'},
                    {'code': 'GRI 2-2', 'name': 'Entidades en informe', 'description': 'Listar todas las entidades incluidas en el informe de sostenibilidad.', 'category': 'reporting'},
                    {'code': 'GRI 2-3', 'name': 'Período y frecuencia', 'description': 'Especificar período de reporte y frecuencia de informes.', 'category': 'reporting'},
                    {'code': 'GRI 2-6', 'name': 'Actividades y cadena de valor', 'description': 'Describir actividades, productos, servicios y cadena de suministro.', 'category': 'reporting'},
                    {'code': 'GRI 2-22', 'name': 'Declaración de estrategia', 'description': 'Declaración del máximo responsable sobre relevancia de sostenibilidad.', 'category': 'governance'},
                    {'code': 'GRI 2-27', 'name': 'Cumplimiento normativo', 'description': 'Informar casos de incumplimiento de leyes y regulaciones.', 'category': 'governance'},
                    {'code': 'GRI 2-29', 'name': 'Enfoque de partes interesadas', 'description': 'Describir enfoque para involucrar a partes interesadas.', 'category': 'organizational'},
                    {'code': 'GRI 3-1', 'name': 'Proceso de materialidad', 'description': 'Describir proceso para determinar temas materiales.', 'category': 'documentation'},
                    {'code': 'GRI 3-2', 'name': 'Lista de temas materiales', 'description': 'Listar los temas materiales de la organización.', 'category': 'documentation'},
                    {'code': 'GRI 302-1', 'name': 'Consumo energético', 'description': 'Consumo total de energía dentro de la organización.', 'category': 'reporting'},
                    {'code': 'GRI 305-1', 'name': 'Emisiones GEI Alcance 1', 'description': 'Emisiones directas de GEI (Alcance 1).', 'category': 'reporting'},
                    {'code': 'GRI 305-2', 'name': 'Emisiones GEI Alcance 2', 'description': 'Emisiones indirectas de GEI de energía (Alcance 2).', 'category': 'reporting'},
                ]
            },
            {
                'code': 'CSRD',
                'name': 'CSRD / ESRS',
                'description': 'Corporate Sustainability Reporting Directive. Directiva de la UE '
                              'que exige a las empresas divulgar información sobre sostenibilidad '
                              'según los European Sustainability Reporting Standards (ESRS).',
                'version': '2024',
                'category': 'sustainability',
                'requirements': [
                    {'code': 'ESRS 2 GOV-1', 'name': 'Rol de órganos de gobierno', 'description': 'Describir el rol de los órganos de administración y supervisión.', 'category': 'governance', 'weight': 9},
                    {'code': 'ESRS 2 GOV-2', 'name': 'Información a órganos', 'description': 'Describir cómo se informa a órganos de gobierno sobre sostenibilidad.', 'category': 'governance', 'weight': 8},
                    {'code': 'ESRS 2 GOV-3', 'name': 'Incentivos de sostenibilidad', 'description': 'Esquemas de incentivos vinculados a sostenibilidad.', 'category': 'governance', 'weight': 7},
                    {'code': 'ESRS 2 SBM-1', 'name': 'Estrategia y modelo de negocio', 'description': 'Describir estrategia y modelo de negocio de la empresa.', 'category': 'strategy', 'weight': 9},
                    {'code': 'ESRS 2 SBM-2', 'name': 'Partes interesadas', 'description': 'Intereses y puntos de vista de partes interesadas.', 'category': 'strategy', 'weight': 8},
                    {'code': 'ESRS 2 SBM-3', 'name': 'Impactos materiales', 'description': 'Impactos, riesgos y oportunidades materiales.', 'category': 'strategy', 'weight': 10},
                    {'code': 'ESRS E1-1', 'name': 'Plan de transición climática', 'description': 'Plan de transición para mitigación del cambio climático.', 'category': 'climate', 'weight': 10},
                    {'code': 'ESRS E1-4', 'name': 'Objetivos de mitigación', 'description': 'Objetivos relacionados con mitigación del cambio climático.', 'category': 'climate', 'weight': 9},
                    {'code': 'ESRS E1-6', 'name': 'Emisiones brutas GEI', 'description': 'Emisiones brutas de GEI Alcance 1, 2 y 3.', 'category': 'climate', 'weight': 10},
                    {'code': 'ESRS S1-1', 'name': 'Políticas de trabajadores', 'description': 'Políticas relacionadas con la fuerza laboral propia.', 'category': 'social', 'weight': 8},
                    {'code': 'ESRS S1-6', 'name': 'Características de empleados', 'description': 'Características de los empleados de la empresa.', 'category': 'social', 'weight': 7},
                    {'code': 'ESRS G1-1', 'name': 'Cultura empresarial', 'description': 'Cultura empresarial y políticas de conducta.', 'category': 'governance', 'weight': 8},
                ]
            },
        ]

        created_frameworks = 0
        created_requirements = 0

        for fw_data in frameworks_data:
            requirements = fw_data.pop('requirements')
            
            framework, created = ComplianceFramework.objects.get_or_create(
                code=fw_data['code'],
                defaults=fw_data
            )
            
            if created:
                created_frameworks += 1
                self.stdout.write(f'  Created framework: {framework.name}')
            else:
                self.stdout.write(f'  Framework already exists: {framework.name}')
            
            for req_data in requirements:
                req, req_created = ComplianceRequirement.objects.get_or_create(
                    framework=framework,
                    code=req_data['code'],
                    defaults={
                        'name': req_data['name'],
                        'description': req_data['description'],
                        'category': req_data.get('category', 'control'),
                    }
                )
                if req_created:
                    created_requirements += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully loaded {created_frameworks} frameworks and {created_requirements} requirements'
        ))
