# Bárbara Sánchez Barroso — portfolio

La web de Bárbara Sánchez Barroso (artista visual, cine analógico): la portada con vídeos, y
noticias, obras, publicaciones, diario, sobre y contacto, en castellano, inglés y catalán.
Dominio: **barbarawong.info**. Hecha por [meowrhino.studio](https://meowrhino.studio) con la
receta del estudio ([meowrhino/JAMstack](https://github.com/meowrhino/JAMstack)), en su forma
de **SPA con pre-render** (las vistas cambian sin recargar, con un fundido). Para Bárbara:
[GUIA.md](GUIA.md). Traspaso: [TRASPASO.md](TRASPASO.md). Si el build falla: [CLAUDE.md](CLAUDE.md).

```
barbaraWong/
├── data/site.json          # nombre, idiomas, menú, vídeos de la portada; "lists" → "works":
│                           #   qué obras salen y en qué orden
├── data/                   # about, news, publications, photos (.json) y sus imágenes
│                           #   (_about, _news, _publications, _photos, _welcome, PDF)
├── projects/<slug>/        # una obra: project.json + sus imágenes (con subcarpetas)
├── schema/                 # qué campos lleva cada JSON (VS Code, el build y la vista previa)
├── index.html              # la plantilla de todas las páginas (y la vista previa)
├── build/build.mjs         # → dist/: una página por vista y por obra, con su contenido dentro
├── js/carga.js             # lee los JSON (y los revisa en la vista previa)
├── js/house.js             # la forma de la casa → la de antes (la usan carga.js y el build)
├── js/validar.js           # el JSON Schema sin dependencias (de JAMstack)
├── js/                     # main (router), menu, views, welcome, lightbox, data, text, dom
├── fonts/                  # Chivo Mono en woff2 (sin Google Fonts)
└── referencia/, referencias.md   # material de diseño (no se publica)
```

## Cómo funciona

- **El build** (`npm ci && node build/build.mjs`) escribe una página por vista (`/` noticias,
  `/publications/`, `/photos/`, `/about/`, `/contact/`) y por obra (`/<slug>/`), con su title,
  description, canonical, `hreflang` (`?lang=es|en|ca`, como tenía Bárbara) y og:image
  (1200×630, **sharp**, en `.cache/`), y el contenido en castellano dentro. Al cargar, el JS
  pinta lo de siempre en el idioma de quien llega. El sitemap lleva cada página en los tres
  idiomas. De `projects/` solo publica imágenes, vídeos y PDF (no los `.docx`).
- **Las direcciones**: el router (`js/main.js`, `js/data.js` → `routeHref`, `readRoute`) cambia
  de vista con `history.pushState` a la dirección limpia, con `<base>` en la raíz. Los enlaces de
  antes (`#about`, `#project/<slug>`) siguen valiendo y pasan a la nueva. En la vista previa, el
  `#` de siempre.
- **La analítica (GA4)** es de Bárbara: va en `index.html` y el build la quita en nuestra copia.
- **Vista previa**: Live Server sobre la carpeta. Sin `data-built` en `<html>`, `js/carga.js`
  revisa los JSON con `schema/` y enseña en pantalla lo que pararía el build.
- **Publicar**: nuestra copia, con la Action en `meowrhino.github.io/barbaraWong/` sin indexar ni
  analítica; la de Bárbara, con Workers Builds (`wrangler.jsonc`) en su dominio. Si falla, un issue.

## Detalles que conviene saber

- **Imágenes verticales**: si el nombre lleva `VERTICAL` (`posterVERTICAL.webp`), en la galería
  sale más estrecha.
- **El email** de contacto se escribe con ` [@] ` y la web lo convierte.
- **El CV**: `data/PDF/cv_es.pdf`, `cv_en.pdf`, `cv_cat.pdf`; si falta el de un idioma, no sale
  el enlace.
- **El diario**: `data/photos.json` → `count` dice cuántas fotos hay en `data/_photos/`
  (`1.webp`…); el build comprueba que estén todas.
