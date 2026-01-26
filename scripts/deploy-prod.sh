#!/bin/bash
# Script para desplegar en PRODUCCIÓN

set -e

echo "🚀 Desplegando Sustenty en PRODUCCIÓN..."

# Verificar que existe el archivo .env.prod
if [ ! -f .env.prod ]; then
    echo "❌ Error: Archivo .env.prod no encontrado"
    echo "Copia .env.prod.example y configura las variables"
    exit 1
fi

# Verificar variables críticas
source .env.prod
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "change-this-secret-key" ]; then
    echo "❌ Error: SECRET_KEY no configurada correctamente"
    exit 1
fi

# Backup de la base de datos
echo "💾 Creando backup de la base de datos..."
mkdir -p backups
BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose -f docker-compose.prod.yml exec db pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE || true

# Pull de la última versión
echo "📥 Obteniendo última versión del código..."
git pull origin main

# Construir imágenes
echo "🔨 Construyendo imágenes de producción..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Detener servicios (excepto base de datos)
echo "🛑 Deteniendo servicios (manteniendo datos)..."
docker-compose -f docker-compose.prod.yml stop backend frontend nginx celery celery-beat

# Iniciar servicios
echo "🚀 Iniciando servicios de producción..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando que los servicios estén listos..."
sleep 20

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Recolectar archivos estáticos
echo "📦 Recolectando archivos estáticos..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Verificar estado
echo "✅ Verificando estado de servicios..."
docker-compose -f docker-compose.prod.yml ps

# Health check
echo "🏥 Realizando health check..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health/ || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Health check OK"
else
    echo "❌ Health check falló (HTTP $HTTP_STATUS)"
fi

echo ""
echo "🎉 Despliegue de producción completado!"
echo "🌐 Sitio web: https://tu-dominio.com"
echo "💾 Backup guardado en: $BACKUP_FILE"