# Configuración de Emails con Resend

## 🚀 Estado Actual

✅ **Todo el código está listo** - Solo falta la API key de Resend  
⚙️ **Modo actual**: Desarrollo (emails se muestran en logs de consola)  
📧 **Cuando agregues la API key**: Los emails se enviarán automáticamente

---

## 📋 Instrucciones para Activar Resend

### 1. Crear Cuenta en Resend

1. Ve a https://resend.com
2. Crea una cuenta gratuita
3. **Plan gratuito incluye**:
   - 100 emails/día
   - 3,000 emails/mes
   - Perfecto para desarrollo y producción inicial

### 2. Obtener API Key

1. Accede al dashboard de Resend
2. Ve a **Settings** → **API Keys**
3. Click en **Create API Key**
4. Copia la key (empieza con `re_...`)

### 3. Verificar tu Dominio (Opcional pero recomendado)

Para enviar desde `noreply@tu-dominio.com`:

1. En Resend, ve a **Domains** → **Add Domain**
2. Agrega tu dominio (ej: `sustenty.io`)
3. Configura los registros DNS que te indique Resend:
   - SPF
   - DKIM
   - DMARC
4. Espera a que verifique (5-10 minutos)

**Nota**: Mientras tanto, puedes usar el dominio por defecto de Resend.

### 4. Configurar en Sustenty

Agrega estas variables al archivo `.env` (backend):

```bash
# Resend API Key (obtenerla de https://resend.com/api-keys)
RESEND_API_KEY=re_tu_api_key_aquí

# Email del remitente (usar tu dominio verificado o el de Resend)
DEFAULT_FROM_EMAIL=Sustenty <noreply@tu-dominio.com>

# URL del frontend (para links en emails)
FRONTEND_URL=https://tu-dominio.com
```

### 5. Reiniciar el Backend

```bash
docker-compose restart backend
```

---

## ✅ Tipos de Emails Implementados

### 1. 🔐 Reset de Contraseña
- **Cuándo**: Usuario hace clic en "¿Olvidaste tu contraseña?"
- **Contenido**: Link para restablecer contraseña (válido 1 hora)
- **Vista**: `password_reset_request` en `views.py`

### 2. 🌱 Resumen Semanal
- **Cuándo**: Cada lunes automáticamente (si está habilitado en Settings)
- **Contenido**: 
  - Emisiones registradas en la semana
  - Documentos procesados
  - Puntuación de cumplimiento
- **Comando**: `python manage.py send_weekly_digest`

### 3. ⚠️ Alerta de Emisiones
- **Cuándo**: Las emisiones superan un umbral configurado
- **Contenido**: Detalles de la emisión y enlace al dashboard
- **Función**: `email_service.send_emission_alert()`

### 4. 🔔 Alerta de Cumplimiento
- **Cuándo**: Cambios en normativas o brechas de cumplimiento
- **Contenido**: Detalles de la regulación afectada
- **Función**: `email_service.send_compliance_alert()`

### 5. 📅 Recordatorio de Fechas
- **Cuándo**: X días antes de una fecha límite
- **Contenido**: Tarea pendiente y fecha límite
- **Función**: `email_service.send_deadline_reminder()`

---

## 🧪 Probar Emails en Desarrollo

### Opción 1: Sin API key (Modo consola)
Los emails se muestran en los logs del backend:

```bash
docker logs sustenty-app-main-backend-1 --tail 50
```

### Opción 2: Con API key de Resend
Los emails se envían realmente a tu email:

1. Agrega tu `RESEND_API_KEY` al `.env`
2. En Settings → Notificaciones, activa las que quieras probar
3. Prueba el reset de contraseña o ejecuta:

```bash
# Enviar resumen semanal a ti mismo
docker exec sustenty-app-main-backend-1 python manage.py send_weekly_digest --user-id=1
```

---

## 📊 Control de Notificaciones por Usuario

Cada usuario puede controlar sus preferencias en `/settings`:

```python
# Configuración guardada en UserSettings model
{
  "email_notifications": true,      # Master switch
  "push_notifications": false,
  "weekly_digest": true,            # Resumen semanal
  "alerts_emissions": true,         # Alertas de emisiones
  "alerts_compliance": true,        # Alertas de cumplimiento
  "alerts_deadlines": true          # Recordatorios
}
```

---

## 🔧 Archivos Modificados

| Archivo | Propósito |
|---------|-----------|
| `backend/requirements.txt` | Agregado `resend==0.8.0` |
| `backend/sustenty/settings.py` | Configuración de Resend |
| `backend/apps/api/email_service.py` | **NUEVO** - Servicio centralizado de emails |
| `backend/apps/api/views.py` | Actualizado reset password para usar Resend |
| `backend/apps/api/management/commands/send_weekly_digest.py` | **NUEVO** - Comando para resumen semanal |
| `.env.prod.example` | Variables de entorno actualizadas |

---

## 🎨 Plantillas de Email

Todas las plantillas incluyen:
- ✅ HTML responsivo
- ✅ Diseño con colores de marca (#80cfc5)
- ✅ Botones de call-to-action
- ✅ Links al dashboard
- ✅ Footer con opción de desactivar notificaciones
- ✅ Fallback en texto plano

---

## 🚀 Próximos Pasos

### Para activar ahora:
1. Crear cuenta en Resend (5 minutos)
2. Copiar API key
3. Agregar a `.env`: `RESEND_API_KEY=re_...`
4. Reiniciar backend: `docker-compose restart backend`
5. ¡Listo! Los emails funcionarán automáticamente

### Para producción:
1. Verificar dominio en Resend
2. Configurar DKIM/SPF
3. Actualizar `DEFAULT_FROM_EMAIL` con tu dominio
4. Configurar cron job o Celery para resumen semanal:

```bash
# Crontab: Cada lunes a las 9:00 AM
0 9 * * 1 cd /path/to/backend && python manage.py send_weekly_digest
```

---

## 💡 Tips

- **Límites del plan gratuito**: 100 emails/día es suficiente para ~100 usuarios activos
- **Monitoreo**: Resend tiene dashboard con analytics de entregas
- **Testing**: Usa tu propio email primero antes de enviar a usuarios
- **Personalización**: Las plantillas HTML están en `email_service.py` y se pueden personalizar fácilmente

---

## 📞 Soporte

- **Docs de Resend**: https://resend.com/docs
- **Status de Resend**: https://status.resend.com
- **Pricing**: https://resend.com/pricing
