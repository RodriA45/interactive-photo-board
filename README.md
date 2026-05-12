# 📸 Interactive Photo Board

Una galería de fotos interactiva estilo **tablero de corcho** con álbumes en formato **tira de película (filmstrip)**.
Desarrollada con HTML, CSS y JavaScript puro — sin frameworks y sin dependencias complejas.

---

## ✨ Características Principales

| Característica | Descripción |
|---|---|
| 🖼️ Tablero de corcho | Álbumes colgados con clips metálicos en cables horizontales. |
| 📽️ Vista filmstrip | Al abrir un álbum, se muestra una tira de película inmersiva con 2 filas. |
| ➡️ Transición fluida | Animación horizontal (slide) suave al abrir y cerrar álbumes. |
| ➕ Gestión de álbumes | Crea nuevos álbumes dinámicamente y elimínalos con un solo clic. |
| 📸 Subida de fotos | Haz clic en "Agregar fotos" o arrastra los archivos (drag & drop) directamente a la página. |
| 🗜️ Compresión automática | Las imágenes se redimensionan y comprimen automáticamente a 800px para ahorrar espacio. |
| ↕️ Reordenar fotos | Arrastra y suelta (drag & drop) tus fotos dentro del álbum para reordenarlas fácilmente. ¡La primera foto será la portada! |
| 🔍 Búsqueda inteligente | Buscador de álbumes y fotos que ignora mayúsculas y tildes. |
| 🌙 Modo oscuro | Cambia instantáneamente entre el tema claro y oscuro. |
| 🎨 Color personalizable | Selector de color (color picker) para cambiar el fondo del tablero. |
| 📤 Exportar ZIP | Descarga todas las fotos de un álbum en formato `.zip` con un solo clic. |
| 💾 Persistencia local | Todos tus álbumes, fotos y colores se guardan automáticamente en tu navegador usando `localStorage`. |
| ✏️ Textos editables | Doble clic en los títulos para editar el nombre del tablero, subtítulo, álbum y pies de foto. |
| 🔍 Lightbox integrado | Haz clic en cualquier foto para verla ampliada con controles de navegación. |
| ⌨️ Navegación por teclado | Usa las flechas, `Escape` y `Tab` para navegar por la interfaz sin necesidad de usar el mouse. |
| ♿ Accesibilidad | Incluye atributos ARIA, roles y foco visible para mejorar la accesibilidad. |

---

## 📁 Estructura del Proyecto

```text
photo-board/
├── index.html          # Interfaz principal
├── css/
│   └── style.css       # Estilos y animaciones
├── js/
│   ├── storage.js      # Capa de persistencia (localStorage)
│   └── app.js          # Lógica principal de la aplicación
├── .gitignore
└── README.md
```

---

## 🚀 Cómo usar

### Abrir directamente
Puedes abrir el archivo `index.html` directamente en tu navegador favorito:
```bash
# Mac
open index.html

# Windows
start index.html
```

### Clonar desde GitHub
```bash
git clone https://github.com/RodriA45/interactive-photo-board.git
cd interactive-photo-board
# Abre el index.html en tu navegador
```

---

## 🎨 Personalización (Para Desarrolladores)

Cambiar la cantidad máxima de álbumes por fila (en `js/app.js`):
```javascript
const ROW_SIZE = 4;
```

Cambiar la calidad y el tamaño de la compresión automática:
```javascript
const COMPRESS_W = 800; // Ancho/alto máximo en píxeles
```

---

## 💾 Sobre la Persistencia de Datos

Los datos se guardan automáticamente en tu navegador usando `localStorage`. Si necesitas reiniciar la aplicación o borrar todos los datos, puedes ejecutar este comando en la consola de tu navegador (`F12`):
```javascript
localStorage.removeItem('photoboard_v1');
```

> **Nota:** Las fotos se guardan en formato `base64`. El límite aproximado de `localStorage` es de 5MB. La compresión automática ayuda a maximizar este espacio, pero está diseñado para un uso ligero.

---

## 📦 Dependencias Externas

| Librería | Uso |
|---|---|
| [JSZip](https://stuk.github.io/jszip/) | Permite exportar los álbumes completos como archivos comprimidos `.zip`. |
| [Google Fonts](https://fonts.google.com) | Se utilizan las tipografías "Permanent Marker" y "Caveat". |

*Ambas se cargan directamente desde un CDN, por lo que no es necesario ejecutar `npm install` ni instalar nada.*

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|---|---|
| `Enter` / `Espacio` | Abrir el álbum seleccionado |
| `Escape` | Cerrar un álbum o salir del modo Lightbox |
| `←` / `→` | Navegar entre fotos en el modo Lightbox |
| `Doble clic` | Renombrar álbumes y fotos |

---

## 📄 Licencia y Créditos

Este proyecto tiene licencia **MIT** — eres libre de usarlo, modificarlo y distribuirlo.

Desarrollado con ❤️ por **Rodrigo Antunez**. Puedes encontrar más sobre mí en mi [LinkedIn](https://www.linkedin.com/in/rodrigo-antunez-9523a6380).
