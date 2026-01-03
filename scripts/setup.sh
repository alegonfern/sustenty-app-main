#!/bin/bash
# Desarrollo local - Script de configuración inicial

echo "🚀 Configurando proyecto Sustenty..."

# Crear archivos de variables de entorno si no existen
if [ ! -f backend/.env ]; then
    echo "📄 Creando archivo .env para backend..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📄 Creando archivo .env para frontend..."
    cp frontend/.env.example frontend/.env
fi

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "✅ Configuración completada!"
echo ""
echo "Para iniciar el proyecto ejecuta:"
echo "  ./scripts/dev-start.sh"