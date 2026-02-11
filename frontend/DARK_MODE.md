# Modo Oscuro / Dark Mode 🌙

## Características

El modo oscuro está completamente implementado en la aplicación Sustenty con las siguientes características:

### ✨ Funcionalidades

- **Toggle automático**: Botón para cambiar entre modo claro y oscuro
- **Persistencia**: La preferencia se guarda en `localStorage`
- **Detección del sistema**: Si es la primera vez, detecta la preferencia del sistema operativo
- **Integración completa**: Todos los componentes de Material-UI se adaptan automáticamente
- **Disponible en todas las páginas**: Login y Dashboard

### 🎨 Paleta de Colores

#### Modo Claro
- Fondo principal: `#fafafa`
- Fondo de tarjetas: `#ffffff`
- Texto principal: `#3f3f46`
- Texto secundario: `#71717a`
- Bordes: `#e4e4e7`

#### Modo Oscuro
- Fondo principal: `#09090b`
- Fondo de tarjetas: `#18181b`
- Texto principal: `#f4f4f5`
- Texto secundario: `#a1a1aa`
- Bordes: `#3f3f46`

### 📍 Ubicación del Toggle

1. **Dashboard Header**: Icono entre el selector de contexto y las notificaciones
2. **Página de Login**: Botón flotante en la esquina superior derecha

### 🛠️ Implementación Técnica

#### ThemeContext
```javascript
import { ThemeContext } from './context/ThemeContext';

// En cualquier componente
const { mode, toggleTheme } = useContext(ThemeContext);
```

#### Estructura
- **`src/context/ThemeContext.js`**: Context provider con lógica de tema
- **`src/index.js`**: Wrapper principal con ThemeProvider
- **`src/layout/Dashboard/Header/index.js`**: Toggle en dashboard
- **`src/pages/Login.js`**: Toggle en página de login

### 🎯 Componentes Adaptados

Todos los componentes de Material-UI se adaptan automáticamente:
- ✅ Cards
- ✅ Buttons
- ✅ Inputs
- ✅ AppBar
- ✅ Drawer
- ✅ Tables
- ✅ Menus
- ✅ Tooltips
- ✅ Chips

### 💾 Almacenamiento

La preferencia se guarda en:
```javascript
localStorage.setItem('themeMode', 'light' | 'dark')
```

### 🚀 Uso

Los usuarios pueden cambiar el tema en cualquier momento:
1. Click en el icono de sol/luna en el header
2. La preferencia se guarda automáticamente
3. Se mantiene en todas las sesiones

### 🎨 Personalización

Para modificar los colores del tema, edita:
```javascript
// src/context/ThemeContext.js
const theme = useMemo(() => createTheme({
  palette: {
    mode, // 'light' o 'dark'
    primary: { ... },
    // ... más colores
  }
}), [mode]);
```
