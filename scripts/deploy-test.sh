#!/bin/bash
# Script para desplegar en TESTING/STAGING

set -e

echo "🧪 Desplegando Sustenty en entorno de TESTING..."

# Verificar que existe el archivo .env.test
if [ ! -f .env.test ]; then
    echo "❌ Error: Archivo .env.test no encontrado"
    echo "Copia .env.test.example y configura las variables"
    exit 1
fi

# Detener servicios existentes
docker-compose -f docker-compose.test.yml down

# Construir e iniciar servicios
docker-compose -f docker-compose.test.yml --env-file .env.test up --build -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 10

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose -f docker-compose.test.yml exec backend python manage.py migrate

# Cargar datos de prueba (opcional)
echo "📊 Cargando datos de prueba..."
docker-compose -f docker-compose.test.yml exec backend python manage.py loaddata fixtures/test_data.json || true

# Crear superusuario de testing
echo "👤 Creando usuario de testing..."
docker-compose -f docker-compose.test.yml exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='testadmin').exists():
    User.objects.create_superuser('testadmin', 'test@sustenty.com', 'test123')
    print('Usuario de testing creado: testadmin/test123')
"

# Verificar estado de servicios
echo "✅ Verificando estado de servicios..."
docker-compose -f docker-compose.test.yml ps

echo ""
echo "🎉 Despliegue de testing completado!"
echo "📱 Frontend: http://localhost:80"
echo "🔧 Backend: http://localhost:8000"
echo "👤 Admin: testadmin/test123"