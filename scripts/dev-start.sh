#!/bin/bash
# Script para iniciar el entorno de desarrollo

echo "🚀 Iniciando Sustenty en modo desarrollo..."

# Construir e iniciar los servicios
docker-compose up --build -d

echo ""
echo "✅ Servicios iniciados:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/api/docs/"
echo "   🗄️  Admin Panel: http://localhost:8000/admin/"
echo ""
echo "📊 Para ver los logs en tiempo real:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para detener los servicios:"
echo "   ./scripts/dev-stop.sh"