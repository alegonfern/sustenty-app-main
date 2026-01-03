# 🌱 SustentIA - Asistente de IA para Sostenibilidad

SustentIA es un asistente de inteligencia artificial integrado en la plataforma Sustenty que proporciona recomendaciones personalizadas sobre sostenibilidad, eficiencia energética, gestión de residuos y estrategias ambientales.

## ✨ Características

- 💬 **Chat Flotante**: Icono flotante accesible desde cualquier página
- 🤖 **IA Gratuita**: Powered by Groq (Llama 3.1) - 100% gratuito
- 🎯 **Contextual**: Conoce tus organizaciones y datos para recomendaciones específicas
- 📊 **Análisis Inteligente**: Analiza sectores, empleados y modos de operación
- 🌍 **Enfoque en Sostenibilidad**: Especializado en temas ambientales
- 💡 **Respuestas Predefinidas**: Funciona incluso sin API key configurada

## 🚀 Configuración

### Opción 1: Con IA Avanzada (Groq - Recomendado)

1. Obtén una API key gratuita en [Groq Console](https://console.groq.com/keys)
2. Agrega la API key a tu archivo `.env`:

```bash
GROQ_API_KEY=gsk_tu_api_key_aqui
```

3. Reinicia el contenedor backend:

```bash
docker-compose restart backend
```

**Beneficios con Groq:**

- Respuestas más naturales y contextuales
- Capacidad de análisis avanzado
- Conversaciones más fluidas
- Recomendaciones personalizadas

### Opción 2: Sin API Key (Sistema de Respuestas)

Si no configuras una API key, SustentIA funciona con un sistema inteligente de respuestas predefinidas que cubre:

- ✅ Reducción de emisiones de carbono
- ✅ Gestión de residuos
- ✅ Eficiencia energética
- ✅ Gestión del agua
- ✅ Cálculo de huella de carbono
- ✅ Análisis de organizaciones

## 💬 Uso

### Acceso Rápido

- **Click en el botón flotante** (esquina inferior derecha)
- **Atajo de teclado**: `Ctrl + K` para abrir el buscador (próximamente para chat)

### Preguntas Sugeridas

1. **"¿Qué puedo hacer para reducir emisiones?"**

   - Obtén estrategias de reducción de carbono

2. **"Analiza mis organizaciones"**

   - Recibe análisis personalizado de tus datos

3. **"Mejores prácticas de sostenibilidad"**

   - Conoce estándares y frameworks

4. **"Calcula mi huella de carbono"**
   - Aprende a medir tu impacto ambiental

### Ejemplos de Consultas

```
📝 "¿Cómo puedo implementar economía circular en mi empresa?"
📝 "Dame recomendaciones para el sector tecnología"
📝 "¿Qué KPIs de sostenibilidad debo medir?"
📝 "Cómo reducir el consumo de agua en oficinas"
📝 "Qué certificaciones ambientales existen"
```

## 🛠️ Arquitectura Técnica

### Frontend

- **Componente**: `/frontend/src/components/SustentIA.js`
- **Framework**: React + Material UI
- **Estado**: React Hooks (useState, useEffect)
- **Posición**: Botón flotante (Fab) con Dialog modal

### Backend

- **Endpoint**: `POST /api/v1/chat/`
- **Autenticación**: JWT (IsAuthenticated)
- **IA Provider**: Groq (Llama 3.1 8B Instant)
- **Fallback**: Sistema de respuestas basado en keywords

### Flujo de Datos

```
Usuario → SustentIA.js → API Request → Backend (/chat/)
                                          ↓
                              Contexto (user, organizations)
                                          ↓
                        ┌─────────────────┴──────────────────┐
                        ↓                                    ↓
                  API Key Exists?                      No API Key
                        ↓                                    ↓
                  Groq API Call                    Fallback Responses
                        ↓                                    ↓
                  AI Response ←────────────────────── Response
                        ↓
                  Usuario recibe respuesta
```

## 📊 Contexto Enviado a la IA

SustentIA envía automáticamente:

```json
{
  "message": "consulta del usuario",
  "context": {
    "user_id": 1,
    "username": "usuario",
    "organizations": [
      {
        "name": "Mi Empresa",
        "sector": "tecnologia",
        "employees": "50-200",
        "mode": "accion"
      }
    ]
  }
}
```

## 🎨 Personalización

### Modificar Respuestas Predefinidas

Edita `/backend/apps/api/views.py` en la función `generate_fallback_response()`:

```python
def generate_fallback_response(message, context):
    message_lower = message.lower()

    # Agrega nuevas keywords y respuestas
    if any(word in message_lower for word in ['nueva', 'keywords']):
        return """Tu respuesta personalizada aquí"""
```

### Cambiar Modelo de IA

En `/backend/apps/api/views.py`, línea del `chat_completion`:

```python
model="llama-3.1-8b-instant",  # Cambia por otro modelo de Groq
```

Modelos disponibles en Groq (gratuitos):

- `llama-3.1-8b-instant` (Rápido, recomendado)
- `llama-3.1-70b-versatile` (Más potente)
- `mixtral-8x7b-32768` (Contexto largo)

### Ajustar Temperatura y Tokens

```python
chat_completion = client.chat.completions.create(
    messages=[...],
    model="llama-3.1-8b-instant",
    temperature=0.7,  # 0-2 (0=determinista, 2=creativo)
    max_tokens=500    # Longitud máxima de respuesta
)
```

## 🔒 Seguridad y Privacidad

- ✅ **Autenticación requerida**: Solo usuarios autenticados pueden usar SustentIA
- ✅ **Datos privados**: Contexto solo incluye datos del usuario actual
- ✅ **API Key segura**: Variable de entorno, nunca expuesta al frontend
- ✅ **Sin almacenamiento**: Conversaciones no se guardan en la base de datos
- ✅ **Fallback seguro**: Funciona sin conexión externa si no hay API key

## 📈 Métricas y Límites

### Groq (Plan Gratuito)

- **Límite**: 30 requests/minuto
- **Tokens**: ~6,000 tokens/minuto
- **Costo**: $0 (100% gratuito)
- **Latencia**: ~300-500ms por respuesta

### Sistema de Fallback

- **Sin límites**: Respuestas instantáneas
- **Sin dependencias externas**: Funciona offline
- **Predecible**: Respuestas consistentes

## 🐛 Solución de Problemas

### Error: "Could not import Groq"

```bash
docker exec sustenty-app-main-backend-1 pip install groq==0.4.1
```

### Chat no responde

1. Verifica que el backend esté corriendo
2. Revisa logs: `docker logs sustenty-app-main-backend-1`
3. Confirma autenticación JWT válida

### Respuestas genéricas

- Si usas API key, verifica que sea válida
- Agrega más keywords al sistema de fallback

## 🚦 Roadmap

- [ ] Historial de conversaciones (localStorage)
- [ ] Sugerencias proactivas basadas en datos
- [ ] Integración con métricas de sostenibilidad
- [ ] Exportar recomendaciones a PDF
- [ ] Modo voz (speech-to-text)
- [ ] Soporte multiidioma

## 📚 Recursos

- [Groq Console](https://console.groq.com/)
- [Groq Docs](https://console.groq.com/docs)
- [GHG Protocol](https://ghgprotocol.org/)
- [CDP](https://www.cdp.net/)

---

**Desarrollado con 🌱 para un futuro más sostenible**
