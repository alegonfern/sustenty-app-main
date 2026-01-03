# Sustenty - Aplicación Full Stack de Sostenibilidad

🌱 **Sustenty** es una aplicación full stack desarrollada con **React** (frontend) y **Django REST Framework** (backend) para gestionar y monitorear iniciativas de sostenibilidad.

## 🚀 Características

- **Frontend React** con Material-UI y React Query
- **Backend Django** con REST API completa
- **Autenticación JWT** segura
- **Base de datos PostgreSQL**
- **Redis** para tareas asíncronas con Celery
- **Docker** para desarrollo y despliegue
- **Documentación API** automática con Swagger/OpenAPI

## 📋 Prerrequisitos

### Opción 1: Desarrollo con Docker (Recomendado)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Opción 2: Desarrollo Local
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

## 🛠️ Instalación y Configuración

### Configuración Inicial

```bash
# Clonar el repositorio
git clone <repository-url>
cd sustenty-app-main

# Ejecutar script de configuración
./scripts/setup.sh
```

### Desarrollo con Docker

```bash
# Iniciar todos los servicios
./scripts/dev-start.sh

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
./scripts/dev-stop.sh
```

### Desarrollo Local (sin Docker)

```bash
# Configurar e iniciar backend y frontend
./scripts/local-dev.sh
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación React |
| Backend API | http://localhost:8000/api/v1 | API REST |
| API Docs | http://localhost:8000/api/docs/ | Documentación Swagger |
| Admin Panel | http://localhost:8000/admin/ | Panel de administración Django |

## 👤 Credenciales por Defecto

- **Admin**: `admin` / `admin123`

## 📁 Estructura del Proyecto

```
sustenty-app-main/
├── backend/                 # Django REST API
│   ├── apps/
│   │   └── api/            # Aplicación principal de API
│   ├── sustenty/           # Configuración de Django
│   ├── requirements.txt    # Dependencias Python
│   ├── Dockerfile         # Container del backend
│   └── docker-entrypoint.sh
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   └── styles/        # Estilos CSS
│   ├── package.json       # Dependencias Node.js
│   └── Dockerfile         # Container del frontend
├── scripts/                # Scripts de desarrollo
├── docs/                   # Documentación
├── docker-compose.yml      # Orquestación de servicios
└── README.md
```

## 🔧 Desarrollo

### Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm start

# Ejecutar tests
npm test

# Construir para producción
npm run build
```

## 📊 API Endpoints

### Autenticación
- `POST /api/v1/auth/login/` - Iniciar sesión
- `POST /api/v1/auth/refresh/` - Renovar token

### Sistema
- `GET /api/v1/health/` - Health check de la API

> 📚 **Documentación completa**: http://localhost:8000/api/docs/

## 🐳 Comandos Docker Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Reconstruir servicios
docker-compose up --build

# Ejecutar comandos en el backend
docker-compose exec backend python manage.py shell

# Ver logs de un servicio específico
docker-compose logs -f backend

# Limpiar volúmenes
docker-compose down -v
```

## 🔒 Variables de Entorno

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=tu-clave-secreta
DB_NAME=sustenty_db
DB_USER=sustenty_user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

## 📈 Próximos Pasos

- [ ] Implementar módulo de proyectos de sostenibilidad
- [ ] Añadir sistema de métricas y KPIs
- [ ] Crear dashboard de análisis
- [ ] Implementar notificaciones
- [ ] Añadir tests automatizados
- [ ] Configurar CI/CD

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor:

1. Revisa la [documentación](./docs/)
2. Busca en los [issues existentes](../../issues)
3. Crea un nuevo [issue](../../issues/new) si es necesario
