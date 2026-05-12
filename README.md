# 📌 Photo Board

Una galería de fotos interactiva estilo **tablero de corcho** con álbumes en formato **tira de película**.
Hecha con HTML, CSS y JavaScript puro — sin frameworks, sin dependencias propias.

---

## ✨ Funcionalidades

| Feature | Descripción |
|---|---|
| 🖼️ Tablero de corcho | Álbumes colgados con clips metálicos en hilos horizontales |
| 📽️ Vista filmstrip | Al abrir un álbum se muestra una tira de película con 2 filas |
| ➡️ Transición slide | Animación horizontal suave al abrir/cerrar álbumes |
| ➕ Agregar álbumes | Botón "+" para crear nuevos álbumes dinámicamente |
| 🗑️ Eliminar álbumes | Botón de eliminación con confirmación |
| 📸 Subir fotos | Clic en "Agregar fotos" o arrastrá archivos directo a la página |
| 🗜️ Compresión | Las imágenes se comprimen automáticamente a 800px antes de guardar |
| 🗑️ Eliminar fotos | Hover sobre una foto → botón ✕ para eliminarla |
| ↕️ Reordenar fotos | Drag & drop entre fotos dentro del álbum |
| 🔍 Búsqueda inteligente | Buscar álbumes y fotos ignorando mayúsculas y tildes (acentos) |
| 🌙 Modo oscuro | Toggle para alternar entre tema claro y oscuro |
| 🎨 Color del tablero | Color picker para personalizar el color del fondo |
| 📤 Exportar ZIP | Descargá todas las fotos del álbum como archivo .zip |
| 💾 Persistencia | Todo se guarda automáticamente en localStorage |
| ✏️ Editable | Títulos editables: tablero, subtítulo, nombre de álbum, pie de foto |
| 🔍 Lightbox | Clic en foto → vista ampliada con flechas y contador |
| ⌨️ Teclado | Flechas, Escape y Tab para navegar todo sin mouse |
| ♿ Accesibilidad | Atributos aria-*, role, foco visible, aria-live |
| 📱 Responsive | Adaptado para móviles y pantallas chicas |
| 🏷️ Favicon | Ícono dinámico de cámara de fotos integrado |

---

## 📁 Estructura del proyecto

```
photo-board/
├── index.html          # HTML principal
├── css/
│   └── style.css       # Todos los estilos
├── js/
│   ├── storage.js      # Capa de persistencia (localStorage)
│   └── app.js          # Lógica de la aplicación
├── .gitignore
└── README.md
```

---

## 🚀 Cómo usar

### Abrir directo
```bash
open index.html   # Mac
start index.html  # Windows
```

### Clonar desde GitHub
```bash
git clone https://github.com/tu-usuario/photo-board.git
cd photo-board
open index.html
```

---

## 🎨 Personalización

Cambiar álbumes por fila — en `js/app.js`:
```js
const ROW_SIZE = 4;
```

Cambiar calidad de compresión:
```js
const COMPRESS_W = 800; // ancho máximo en pixels
```

---

## 💾 Persistencia

Los datos se guardan automáticamente en `localStorage`. Para borrar todo:
```js
localStorage.removeItem('photoboard_v1');
```

> Las fotos se guardan como base64. Límite aproximado: 5MB. La compresión automática ayuda a no llenarlo.

---

## 📦 Dependencias externas

| Librería | Uso |
|---|---|
| [JSZip](https://stuk.github.io/jszip/) | Exportar álbum como .zip |
| [Google Fonts](https://fonts.google.com) | Tipografías (Permanent Marker + Caveat) |

Ambas desde CDN, no hay nada que instalar.

---

## ⌨️ Atajos de teclado

| Tecla | Acción |
|---|---|
| `Enter` / `Space` | Abrir álbum |
| `Escape` | Cerrar álbum / lightbox |
| `←` `→` | Navegar en lightbox |
| `Doble clic` en nombre | Renombrar |

---

## 📄 Licencia y Créditos

MIT — libre para usar, modificar y distribuir.
Desarrollado y mejorado por **Rodrigo Antunez**.
