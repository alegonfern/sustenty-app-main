# Configuración de Google OAuth2 para Login con Gmail

## Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre a tu proyecto (ej: "Sustenty App")

## Paso 2: Habilitar la API de Google+

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Google+ API"
3. Haz clic en **Enable** (Habilitar)

## Paso 3: Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Si es tu primera vez, configura la pantalla de consentimiento:

   - **User Type**: External
   - **App name**: Sustenty
   - **User support email**: tu email
   - **Developer contact**: tu email
   - Guarda y continúa

4. Selecciona **Application type**: **Web application**
5. Dale un nombre (ej: "Sustenty Web Client")
6. En **Authorized JavaScript origins**, agrega:
   ```
   http://localhost:3000
   http://localhost:8000
   ```
7. En **Authorized redirect URIs**, agrega:
   ```
   http://localhost:8000/accounts/google/login/callback/
   ```
8. Haz clic en **Create**

## Paso 4: Guardar las credenciales

Verás dos valores importantes:

- **Client ID**: empieza con algo como `123456789-abc...googleusercontent.com`
- **Client Secret**: una cadena aleatoria

## Paso 5: Configurar variables de entorno en el backend

Edita el archivo `.env` en la carpeta `backend/` y agrega:

```env
GOOGLE_OAUTH_CLIENT_ID=tu-client-id-aqui
GOOGLE_OAUTH_CLIENT_SECRET=tu-client-secret-aqui
```

## Paso 6: Ejecutar migraciones

```bash
docker exec sustenty-app-main-backend-1 python manage.py migrate
```

## Paso 7: Configurar el Site en Django Admin

1. Accede al admin: http://localhost:8000/admin/
2. Ve a **Sites**
3. Edita el site existente (ID=1):
   - **Domain name**: `localhost:8000`
   - **Display name**: `Sustenty`
4. Guarda los cambios

## Paso 8: Configurar la Social Application en Django Admin

1. En el admin, ve a **Social applications**
2. Haz clic en **Add social application**
3. Completa:
   - **Provider**: Google
   - **Name**: Google OAuth
   - **Client id**: pega tu Client ID de Google
   - **Secret key**: pega tu Client Secret
   - **Sites**: selecciona el site "Sustenty" (localhost:8000)
4. Guarda

## Paso 9: Probar el login

1. Ve a http://localhost:3000/login
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. ¡Listo! Deberías ser redirigido al dashboard

## Troubleshooting

### Error 400: redirect_uri_mismatch

- Verifica que la URL de callback en Google Cloud Console sea exactamente:
  `http://localhost:8000/accounts/google/login/callback/`

### Error: Site matching query does not exist

- Ve al Django admin y configura el Site correctamente (Paso 7)

### Error: Social application not found

- Ve al Django admin y crea la Social Application (Paso 8)

## Para Producción

Cuando despliegues a producción:

1. En Google Cloud Console, agrega tus URLs de producción:

   - **Authorized JavaScript origins**: `https://tudominio.com`
   - **Authorized redirect URIs**: `https://tudominio.com/accounts/google/login/callback/`

2. Actualiza las variables de entorno en producción

3. En Django admin de producción, actualiza:
   - El Site con tu dominio real
   - La Social Application si es necesario
