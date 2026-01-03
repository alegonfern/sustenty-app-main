# 🚀 GUÍA RÁPIDA DE DESPLIEGUE - SUSTENTY

## 📋 RESUMEN EJECUTIVO

### ¿Qué necesito instalar?

**Opción A - Docker (Recomendado):**

- ✅ Docker + Docker Compose
- ⏱️ 5 minutos de configuración

**Opción B - Local:**

- Python 3.11+, Node.js 18+, PostgreSQL, Redis
- ⏱️ 20 minutos de configuración

---

## ⚡ COMANDOS RÁPIDOS

### 🏠 DESARROLLO LOCAL

```bash
# 1. Configuración inicial (solo la primera vez)
./scripts/setup.sh

# 2. Iniciar aplicación con Docker
./scripts/dev-start.sh

# 3. Iniciar sin Docker (alternativa)
./scripts/local-dev.sh

# ✅ URLs:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin (admin/admin123)
```

### 🧪 ENTORNO DE TESTING

```bash
# 1. Configurar variables de entorno
cp .env.test.example .env.test
nano .env.test

# 2. Desplegar testing
./scripts/deploy-test.sh

# ✅ Testing URL: http://localhost:80
```

### 🚀 PRODUCCIÓN

```bash
# 1. Configurar variables de entorno
cp .env.prod.example .env.prod
nano .env.prod

# 2. Desplegar producción
./scripts/deploy-prod.sh

# ✅ Producción URL: https://tu-dominio.com
```

---

## 🌐 DESPLIEGUE EN VPS

### Configuración Rápida (10 comandos)

```bash
# 1. En tu VPS
ssh root@tu-vps-ip

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# 3. Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Clonar proyecto
git clone https://github.com/tu-usuario/sustenty-app-main.git
cd sustenty-app-main

# 5. Configurar variables
cp .env.prod.example .env.prod
nano .env.prod  # Editar con tus datos

# 6. Configurar firewall
ufw allow ssh && ufw allow http && ufw allow https && ufw enable

# 7. Desplegar
./scripts/deploy-prod.sh

# 8. Configurar Nginx (ver documentación completa)
# 9. Obtener SSL con certbot
# 10. ¡Listo!
```

**📚 Guía completa**: [docs/vps-deployment.md](docs/vps-deployment.md)

---

## 🏗️ ARQUITECTURA DE DOCKER

```yaml
# Servicios que se levantan:
📦 db         # PostgreSQL (Puerto 5432)
📦 redis      # Cache/Queue (Puerto 6379)
📦 backend    # Django API (Puerto 8000)
📦 frontend   # React App (Puerto 3000/80)
📦 celery     # Worker asyncrono
📦 nginx      # Proxy reverso (solo producción)
```

---

## 🔧 COMANDOS ÚTILES

### Docker Management

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ejecutar comando en contenedor
docker-compose exec backend python manage.py shell

# Reiniciar servicio
docker-compose restart backend

# Limpiar todo
docker-compose down -v
```

### Base de datos

```bash
# Crear backup
docker-compose exec db pg_dump -U usuario base_datos > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U usuario base_datos < backup.sql

# Acceder a la DB
docker-compose exec db psql -U usuario base_datos
```

---

## 🚨 RESOLUCIÓN RÁPIDA DE PROBLEMAS

| Problema                     | Solución                                            |
| ---------------------------- | --------------------------------------------------- |
| **Puerto ocupado**           | `docker-compose down` y reiniciar                   |
| **Permisos negados**         | `sudo chown -R $USER:$USER .`                       |
| **Base de datos no conecta** | Verificar que el servicio `db` esté corriendo       |
| **Frontend no carga**        | Verificar `REACT_APP_API_URL` en `.env`             |
| **SSL no funciona**          | `sudo certbot renew && sudo systemctl reload nginx` |

---

## 📊 ENTORNOS Y URLs

| Entorno        | Comando                    | Frontend               | Backend                    | Admin                        |
| -------------- | -------------------------- | ---------------------- | -------------------------- | ---------------------------- |
| **Desarrollo** | `./scripts/dev-start.sh`   | :3000                  | :8000                      | :8000/admin                  |
| **Testing**    | `./scripts/deploy-test.sh` | :80                    | :8000                      | :8000/admin                  |
| **Producción** | `./scripts/deploy-prod.sh` | https://tu-dominio.com | https://tu-dominio.com/api | https://tu-dominio.com/admin |

---

## ✅ CHECKLIST DE DESPLIEGUE

### Desarrollo Local

- [ ] Docker instalado
- [ ] Ejecutar `./scripts/setup.sh`
- [ ] Ejecutar `./scripts/dev-start.sh`
- [ ] Verificar URLs funcionando

### Testing

- [ ] Configurar `.env.test`
- [ ] Ejecutar `./scripts/deploy-test.sh`
- [ ] Verificar funcionalidad

### Producción

- [ ] VPS configurado
- [ ] Dominio apuntando al VPS
- [ ] Variables `.env.prod` configuradas
- [ ] SSL certificado obtenido
- [ ] Backup configurado
- [ ] Monitoreo activo

---

**🎯 ¿Necesitas ayuda?**

- 📖 Documentación completa: [docs/](docs/)
- 🐛 Troubleshooting: [docs/vps-deployment.md](docs/vps-deployment.md)
- 💬 Issues: GitHub Issues
