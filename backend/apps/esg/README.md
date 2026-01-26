# Módulo ESG - Backend Documentation

## Descripción General

El módulo ESG (Environmental, Social, Governance) permite a Sustenty gestionar datos de sostenibilidad organizados por períodos, similar a períodos contables en Odoo.

## Modelos Creados

### 1. **ESGPeriod** (Períodos ESG)

Organiza todos los datos ESG capturados dentro de un rango de fechas.

- `name`: Nombre del período (ej: "Q1 2024", "Fiscal Year 2024")
- `start_date`, `end_date`: Rango de fechas
- `is_active`, `is_closed`: Estado del período
- `organization`: Organización asociada

### 2. **ESGCategory** (Categorías ESG)

Tres categorías predefinidas:

- **Environmental (Ambiental)**: Emisiones, energía, agua, residuos
- **Social**: Diversidad, seguridad, capacitación, comunidad
- **Governance (Gobernanza)**: Ética, compliance, transparencia

### 3. **ESGMetric** (Métricas/Indicadores)

Métricas configurables por categoría:

- Tipos de datos: numérico, porcentaje, texto, booleano, fecha
- Unidades: toneladas, kWh, m³, litros, etc.
- Estándares: GRI, SASB, TCFD
- Obligatorias o opcionales

### 4. **ESGDataCollection** (Colección de Datos)

Registros de valores capturados:

- Asociados a un período y métrica específica
- Múltiples tipos de valores según la métrica
- Estado: pendiente, en proceso, completado, revisado, aprobado
- Responsable y fecha de recolección
- Evidencia documental

### 5. **ESGGoal** (Objetivos/Metas)

Objetivos ESG con seguimiento:

- Valor meta vs valor actual
- Cálculo automático de progreso
- Estados: en camino, en riesgo, retrasado, alcanzado
- Fechas de inicio y objetivo

### 6. **ESGAction** (Planes de Acción)

Acciones para cumplir objetivos:

- Prioridad: baja, media, alta, crítica
- Estado: planificado, en progreso, pausado, completado
- Equipo de trabajo asignado
- Presupuesto y costo real

### 7. **ESGComplianceStandard** (Estándares de Cumplimiento)

Estándares precar gados: GRI, SASB, TCFD, CDP

## Endpoints API

Base URL: `/api/v1/esg/`

### Períodos

- `GET /periods/` - Listar períodos
- `POST /periods/` - Crear período
- `GET /periods/{id}/` - Detalle de período
- `PUT /periods/{id}/` - Actualizar período
- `DELETE /periods/{id}/` - Eliminar período
- `POST /periods/{id}/close_period/` - Cerrar período
- `GET /periods/{id}/summary/` - Resumen del período

### Categorías

- `GET /categories/` - Listar categorías
- `GET /categories/{id}/` - Detalle de categoría

### Métricas

- `GET /metrics/` - Listar métricas
- `POST /metrics/` - Crear métrica
- `GET /metrics/by_category/` - Métricas agrupadas por categoría
- Filtros: `?category=1&is_mandatory=true&organization=1`

### Colección de Datos

- `GET /data-collection/` - Listar datos
- `POST /data-collection/` - Crear dato
- `POST /data-collection/bulk_create/` - Crear múltiples datos
- `GET /data-collection/by_period/?period_id=1` - Datos por período
- `POST /data-collection/{id}/approve/` - Aprobar dato
- Filtros: `?period=1&metric=1&status=completed`

### Objetivos

- `GET /goals/` - Listar objetivos
- `POST /goals/` - Crear objetivo
- `POST /goals/{id}/update_progress/` - Actualizar progreso
- `GET /goals/dashboard/` - Dashboard de objetivos
- Filtros: `?category=1&status=on_track&organization=1`

### Acciones

- `GET /actions/` - Listar acciones
- `POST /actions/` - Crear acción
- `POST /actions/{id}/update_progress/` - Actualizar progreso
- `GET /actions/statistics/` - Estadísticas de acciones
- Filtros: `?category=1&priority=high&status=in_progress`

### Estándares

- `GET /compliance-standards/` - Listar estándares

## Flujo de Trabajo Recomendado

### 1. Configuración Inicial

```bash
# Crear categorías y estándares (ya cargados automáticamente)
python manage.py load_esg_initial_data

# Crear métricas personalizadas por organización
POST /api/v1/esg/metrics/
{
  "category": 1,  // Environmental
  "name": "Emisiones CO2",
  "code": "CO2_EMISSIONS",
  "data_type": "numeric",
  "unit": "ton",
  "gri_standard": "GRI 305-1"
}
```

### 2. Crear Período ESG

```bash
POST /api/v1/esg/periods/
{
  "name": "Q1 2024",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "organization": 1
}
```

### 3. Capturar Datos

```bash
POST /api/v1/esg/data-collection/
{
  "period": 1,
  "metric": 1,
  "value_numeric": 1250.5,
  "target_value": 1500,
  "status": "completed",
  "collection_date": "2024-03-15",
  "responsible": 1
}
```

### 4. Definir Objetivos

```bash
POST /api/v1/esg/goals/
{
  "category": 1,
  "name": "Reducir emisiones 30% para 2025",
  "target_value": 1050,
  "current_value": 1250,
  "start_date": "2024-01-01",
  "target_date": "2025-12-31"
}
```

### 5. Crear Planes de Acción

```bash
POST /api/v1/esg/actions/
{
  "category": 1,
  "title": "Instalación de Paneles Solares",
  "priority": "high",
  "status": "in_progress",
  "progress": 45,
  "start_date": "2024-01-15",
  "end_date": "2024-12-31",
  "budget": 150000,
  "goal": 1
}
```

## Características Especiales

### Datos Iniciales

- 3 categorías ESG precargadas
- 4 estándares de cumplimiento (GRI, SASB, TCFD, CDP)

### Validaciones

- Períodos únicos por organización
- Datos únicos por período + métrica + fecha
- Progreso automático de objetivos

### Permisos

- Todas las vistas requieren autenticación (`IsAuthenticated`)
- Filtrado automático por organización
- Auditoría completa (created_by, created_at, updated_at)

### Admin de Django

- Interfaces administrativas completas para todos los modelos
- Filtros, búsqueda y ordenamiento optimizados
- Campos de auditoría en modo colapsable

## Próximos Pasos

### Integración con Frontend

1. Actualizar servicios de API en frontend para incluir endpoints ESG
2. Conectar páginas Collection, Analytics y Actions con la API
3. Implementar formularios de creación/edición

### Funcionalidades Avanzadas

1. **Dashboards analíticos**: Gráficos de tendencias, comparativas
2. **Importación masiva**: Excel/CSV para datos históricos
3. **Reportes automáticos**: PDF con datos del período
4. **Notificaciones**: Alertas de vencimiento de objetivos
5. **Workflow de aprobación**: Múltiples niveles de revisión

## Comandos Útiles

```bash
# Crear migraciones
python manage.py makemigrations esg

# Aplicar migraciones
python manage.py migrate esg

# Cargar datos iniciales
python manage.py load_esg_initial_data

# Acceder al admin de Django
# http://localhost:8000/admin/
```

## Estructura de Archivos

```
backend/apps/esg/
├── __init__.py
├── admin.py              # Configuración del admin
├── apps.py               # Configuración de la app
├── models.py             # Modelos de datos
├── serializers.py        # Serializers para API
├── views.py              # ViewSets y endpoints
├── urls.py               # Rutas de la API
├── tests.py              # Tests (pendiente)
├── management/
│   └── commands/
│       └── load_esg_initial_data.py
└── migrations/
    └── 0001_initial.py
```

## Notas Técnicas

- **Django 4.x** compatible
- **Django REST Framework** para APIs
- **django-filter** para filtrado avanzado
- Relaciones con modelo `Organization` de `apps.api`
- Soporte para múltiples organizaciones (multi-tenant)
