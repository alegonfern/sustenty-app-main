from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-key-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Confiar en el header X-Forwarded-Proto de Cloudflare/Nginx
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'rest_framework_simplejwt',
    'django_filters',
    'drf_spectacular',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    
    # Local apps
    'apps.api',
    'apps.carbon',
    'apps.esg',
    'apps.team',
    'apps.compliance',
]

SITE_ID = 1

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'sustenty.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sustenty.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='sustenty_db'),
        'USER': config('DB_USER', default='sustenty_user'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'Europe/Madrid'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS settings
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.5.45:3000",
    "http://app.sustenty.local:3000",
]

# Agregar orígenes HTTPS en producción
if not DEBUG:
    CORS_ALLOWED_ORIGINS += [
        "https://sustenty.com",
        "https://www.sustenty.com",
    ]

CORS_ALLOW_CREDENTIALS = True

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'Sustenty API',
    'DESCRIPTION': 'API REST para la aplicación Sustenty',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Celery Configuration (for async tasks)
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Django Allauth Configuration
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https' if not DEBUG else 'http'

# Frontend URL (ya definido arriba desde CORS settings)

# OAuth host handling (Cloudflare proxy compatible)

# Google OAuth2 Configuration
GOOGLE_OAUTH_CLIENT_ID = config('GOOGLE_OAUTH_CLIENT_ID', default='')
GOOGLE_OAUTH_CLIENT_SECRET = config('GOOGLE_OAUTH_CLIENT_SECRET', default='')

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# Redirigir después del login social
LOGIN_REDIRECT_URL = '/api/v1/auth/google/callback/'
SOCIALACCOUNT_LOGIN_ON_GET = True
ACCOUNT_EMAIL_VERIFICATION = 'none'

# Configuración de sesiones y CSRF
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

if not DEBUG:
    # Producción: cookies seguras (HTTPS via Cloudflare)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    CSRF_TRUSTED_ORIGINS = [
        'https://sustenty.com',
        'https://www.sustenty.com',
    ]
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
else:
    # Desarrollo: sin HTTPS
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'http://localhost:8000']

# Rest Auth Configuration
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'access-token',
    'JWT_AUTH_REFRESH_COOKIE': 'refresh-token',
    'JWT_AUTH_HTTPONLY': False,
}

# Email Configuration (Resend)
RESEND_API_KEY = config('RESEND_API_KEY', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Sustenty <noreply@sustenty.io>')
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Fallback a console si no hay Resend

# Si hay API key de Resend, no usamos el backend de Django por defecto
# Manejaremos el envío con Resend directamente en nuestro servicio
if RESEND_API_KEY:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Aún así dejamos console como backup
