# Documentación del Proyecto Sustenty

## Índice

- [Guía de Instalación](./installation.md)
- [Arquitectura del Sistema](./architecture.md)
- [API Reference](./api.md)
- [Guía de Desarrollo](./development.md)
- [Deployment](./deployment.md)

## Descripción General

Sustenty es una aplicación full stack diseñada para ayudar a organizaciones y particulares a gestionar y monitorear sus iniciativas de sostenibilidad.

### Stack Tecnológico

**Frontend:**

- React 18
- Material-UI (MUI)
- React Router DOM
- React Query
- Axios
- React Hook Form

**Backend:**

- Django 4.2
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- JWT Authentication

**DevOps:**

- Docker & Docker Compose
- Nginx (producción)
- Gunicorn

## Flujo de Datos

```
Cliente (React) ↔ API REST (Django) ↔ PostgreSQL
                      ↓
                  Celery Worker ↔ Redis
```

## Estructura de Carpetas

```
sustenty-app-main/
├── backend/
│   ├── apps/api/          # Aplicación principal
│   ├── sustenty/          # Configuración Django
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── Dockerfile
├── scripts/               # Scripts de automatización
├── docs/                  # Documentación
└── docker-compose.yml
```
