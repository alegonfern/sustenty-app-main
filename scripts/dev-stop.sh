#!/bin/bash
# Script para detener el entorno de desarrollo

echo "🛑 Deteniendo servicios de Sustenty..."

docker-compose down

echo "✅ Servicios detenidos."
echo ""
echo "Para eliminar también los volúmenes de datos:"
echo "   docker-compose down -v"