# Barbara Wong - Portfolio Web

Portfolio web de Barbara Wong desarrollado con HTML, CSS y JavaScript vanilla. Diseño mobile-first basado en JSONs para gestión de contenido.

## Características

- **Home**: Galería destacada con video/imagen + tabla de proyectos scrolleable
- **About**: Galería de imágenes + biografía
- **Eventos**: Sistema de noticias con modales "HOT NOW!" y página de eventos con scroll horizontal
- **Proyectos**: Estructura preparada para cargar proyectos dinámicamente
- **Responsive**: Diseño mobile-first optimizado para todos los dispositivos

## Estructura del proyecto

```
/
├── index.html              # Página principal
├── about.html              # Página about
├── events.html             # Página de eventos
├── projects.html           # Página de proyectos (stub)
├── 404.html                # Página de error
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── app.js              # Lógica de la home
│   ├── about.js            # Lógica del about
│   ├── events.js           # Lógica de eventos
│   ├── projects.js         # Lógica de proyectos
│   ├── router.js           # Helpers de navegación
│   ├── ui-modal.js         # Helpers de UI
│   └── utils.js            # Utilidades generales
├── data/
│   ├── home_gallery.json   # Galería destacada home
│   ├── tabla_home.json     # Tabla de proyectos
│   ├── news.json           # Noticias/eventos
│   ├── about_gallery.json  # Galería about
│   └── about_text.json     # Texto biografía
├── assets/
│   ├── img/                # Imágenes
│   └── video/              # Videos
└── projects/
    └── data/
        └── proyectos/      # Datos de proyectos (estructura lista)
```

## Configuración de GitHub Pages

1. Ve a Settings > Pages
2. En "Source", selecciona la rama `main` (o `master`)
3. En "Folder", selecciona `/ (root)`
4. Guarda los cambios
5. Tu sitio estará disponible en: `https://[tu-usuario].github.io/barbaraWong/`

## Tecnologías

- HTML5
- CSS3 (Flexbox, CSS Grid, Custom Properties)
- JavaScript ES6+ (Modules)
- Google Fonts (Inria Sans)

## Créditos

Desarrollado por [meowrhino.studio](https://meowrhino.studio)

## Licencia

© 2025 Barbara Wong. Todos los derechos reservados.
