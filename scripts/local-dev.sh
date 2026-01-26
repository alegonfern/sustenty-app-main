#!/bin/bash
# Script para desarrollo local sin Docker

echo "🔧 Iniciando desarrollo local sin Docker..."

# Verificar Python y Node.js
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no está instalado."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado."
    exit 1
fi

# Configurar backend
echo "📦 Configurando backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "Ejecutando migraciones..."
python manage.py migrate

echo "Creando superusuario (si no existe)..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sustenty.com', 'admin123')
    print('Superuser creado: admin/admin123')
"

# Iniciar backend en background
python manage.py runserver 8000 &
BACKEND_PID=$!

cd ..

# Configurar frontend
echo "📦 Configurando frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de npm..."
    npm install
fi

# Iniciar frontend
npm start &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Servicios iniciados:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend: http://localhost:8000"
echo "   🗄️  Admin: http://localhost:8000/admin/ (admin/admin123)"
echo ""
echo "Para detener los servicios, ejecuta Ctrl+C"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# Mantener el script corriendo
wait