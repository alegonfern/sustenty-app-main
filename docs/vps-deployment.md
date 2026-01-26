# 🌐 Guía de Despliegue en VPS

## Requisitos del VPS

**Especificaciones mínimas:**

- 2 CPU cores
- 4GB RAM
- 20GB SSD
- Ubuntu 20.04 LTS o superior

**Recomendado para producción:**

- 4 CPU cores
- 8GB RAM
- 40GB SSD

## 🚀 Instalación Paso a Paso

### 1. Preparar el Servidor

```bash
# Conectarse al VPS
ssh root@tu-ip-del-vps

# Actualizar el sistema
apt update && apt upgrade -y

# Instalar dependencias básicas
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Crear usuario para la aplicación
useradd -m -s /bin/bash sustenty
usermod -aG sudo sustenty
su - sustenty
```

### 2. Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario al grupo docker
sudo usermod -aG docker sustenty

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version

# Reiniciar sesión para aplicar grupos
exit
su - sustenty
```

### 3. Configurar el Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 4. Clonar y Configurar el Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sustenty-app-main.git
cd sustenty-app-main

# Configurar variables de entorno
cp .env.prod.example .env.prod

# Editar variables de producción
nano .env.prod
```

**Configurar .env.prod:**

```bash
DEBUG=False
SECRET_KEY=tu-clave-super-secreta-de-produccion
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com

DB_NAME=sustenty_prod
DB_USER=sustenty_prod_user
DB_PASSWORD=password-super-seguro-123

REACT_APP_API_URL=https://tu-dominio.com/api/v1

REDIS_PASSWORD=redis-password-seguro-123
```

### 5. Configurar Nginx como Proxy Reverso

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/sustenty
```

**Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # SSL certificados (se configurarán con certbot)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Proxy para la aplicación React (Frontend)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy para la API (Backend)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy para el admin de Django
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Servir archivos estáticos directamente
    location /static/ {
        alias /home/sustenty/sustenty-app-main/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/sustenty/sustenty-app-main/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/sustenty /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t
```

### 6. Obtener Certificado SSL

```bash
# Obtener certificado SSL con Let's Encrypt
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 7. Desplegar la Aplicación

```bash
# Hacer scripts ejecutables
chmod +x scripts/*.sh

# Desplegar en producción
./scripts/deploy-prod.sh
```

### 8. Configurar Servicios del Sistema

**Crear servicio systemd para Docker Compose:**

```bash
sudo nano /etc/systemd/system/sustenty.service
```

```ini
[Unit]
Description=Sustenty Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/sustenty/sustenty-app-main
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=sustenty

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar y iniciar el servicio
sudo systemctl daemon-reload
sudo systemctl enable sustenty
sudo systemctl start sustenty
```

## 🔧 Comandos de Mantenimiento

### Monitoreo

```bash
# Ver estado de servicios
sudo systemctl status sustenty
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver uso de recursos
docker stats
```

### Backups

```bash
# Crear backup manual
mkdir -p backups
docker-compose -f docker-compose.prod.yml exec db pg_dump -U sustenty_prod_user sustenty_prod > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U sustenty_prod_user sustenty_prod < backups/backup_file.sql
```

### Actualizaciones

```bash
# Actualizar la aplicación
git pull origin main
./scripts/deploy-prod.sh
```

## 🚨 Troubleshooting

### Problemas Comunes

**Error de permisos:**

```bash
sudo chown -R sustenty:sustenty /home/sustenty/sustenty-app-main
```

**Containers no inician:**

```bash
docker-compose -f docker-compose.prod.yml logs
```

**Base de datos no conecta:**

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py dbshell
```

**SSL no funciona:**

```bash
sudo certbot renew
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoreo y Alertas

### Instalar Monitoring (Opcional)

```bash
# Instalar htop para monitoreo básico
sudo apt install htop

# Para monitoreo avanzado, instalar Prometheus + Grafana
# (Documentación separada disponible)
```

### Logs Centralizados

Los logs se guardan en:

- Nginx: `/var/log/nginx/`
- Aplicación: `./logs/`
- Docker: `docker-compose logs`

## 🔐 Seguridad Adicional

### Fail2Ban (Opcional)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Actualizaciones Automáticas

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

---

**🎉 ¡Felicitaciones! Tu aplicación Sustenty está corriendo en producción.**

**URLs de acceso:**

- **Sitio web**: https://tu-dominio.com
- **Admin**: https://tu-dominio.com/admin/
- **API**: https://tu-dominio.com/api/v1/
