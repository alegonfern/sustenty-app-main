# Implementación de Logo en Sidebar

## Opción 1: Dos imágenes separadas (IMPLEMENTADA)

**Archivos necesarios:**
```
frontend/public/
  ├── logo-full.svg    # Logo completo con texto
  └── logo-icon.svg    # Solo icono/símbolo
```

**Exportar desde Inkscape:**
1. **Logo completo** (`logo-full.svg`):
   - Archivo → Guardar como → SVG Optimizado
   - O: Archivo → Exportar PNG (altura: 64px para retina)
   
2. **Logo icono** (`logo-icon.svg`):
   - Selecciona solo el símbolo/icono
   - Archivo → Guardar selección como → SVG Optimizado
   - O: Archivo → Exportar PNG (32x32px o 64x64px)

**Código ya implementado en:** `frontend/src/layout/Dashboard/Drawer/index.js`
- Muestra `logo-full.svg` cuando sidebar está abierto
- Muestra `logo-icon.svg` cuando sidebar está contraído
- Fallback a texto "Sustenty" / "S" si las imágenes no existen

---

## Opción 2: Una sola imagen con CSS (ALTERNATIVA)

Si prefieres usar una sola imagen y recortarla con CSS:

**Archivo necesario:**
```
frontend/public/logo.svg
```

**Código alternativo:**

```jsx
{open ? (
  <img 
    src="/logo.svg" 
    alt="Sustenty" 
    style={{ 
      height: 32,
      maxWidth: 180,
      objectFit: 'contain'
    }}
  />
) : (
  <img 
    src="/logo.svg" 
    alt="S" 
    style={{ 
      height: 32,
      width: 32,
      objectFit: 'cover',
      objectPosition: 'left center' // Muestra solo la parte izquierda
    }}
  />
)}
```

---

## Opción 3: SVG como componente React

Para mayor control, puedes importar el SVG directamente:

**1. Coloca el archivo en:**
```
frontend/src/assets/logo.svg
```

**2. Importa en el componente:**
```jsx
import { ReactComponent as LogoFull } from '../../../assets/logo-full.svg';
import { ReactComponent as LogoIcon } from '../../../assets/logo-icon.svg';
```

**3. Usa como componente:**
```jsx
{open ? (
  <LogoFull style={{ height: 32 }} />
) : (
  <LogoIcon style={{ height: 32, width: 32 }} />
)}
```

**Ventajas:**
- Control total del color con CSS
- Cambia colores dinámicamente según tema
- Menor tamaño de bundle

---

## Tips de Inkscape

### Optimizar SVG para web:
1. `Archivo → Limpiar documento`
2. `Archivo → Guardar como → SVG Optimizado`
3. Opciones recomendadas:
   - ☑ Simplificar colores
   - ☑ Convertir texto a trazados (si usas fuentes especiales)
   - ☑ Eliminar metadatos
   - ☑ Eliminar comentarios

### Exportar PNG con transparencia:
1. Selecciona el objeto
2. `Archivo → Exportar PNG`
3. Área de exportación: "Selección"
4. DPI: 96 (estándar) o 192 (retina)
5. ☑ Fondo transparente

### Dimensiones recomendadas:

| Elemento | Tamaño recomendado |
|----------|-------------------|
| Logo completo (SVG) | Altura: 32-40px |
| Logo completo (PNG) | Altura: 64-80px (retina) |
| Icono (SVG) | 32x32px o 40x40px |
| Icono (PNG) | 64x64px (retina) |
| Favicon | 32x32px, 16x16px |

---

## Prueba tus logos:

Después de colocar los archivos en `frontend/public/`:

1. Recarga la aplicación (F5)
2. El sidebar debería mostrar tu logo
3. Haz clic en el botón de menú para contraer/expandir
4. Verifica que cambia entre logo completo e icono

Si no se ven:
- Verifica la ruta: `http://localhost:3000/logo-full.svg`
- Abre la consola del navegador (F12) para ver errores
- El fallback mostrará "Sustenty" / "S" si hay problemas
