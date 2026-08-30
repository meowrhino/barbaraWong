# Bárbara Sánchez Barroso — portfolio

Sitio web personal de Bárbara Sánchez Barroso (artista visual, cine analógico). SPA en HTML/CSS/JS vanilla, sin build, contenido en JSON, alojado en GitHub Pages. Dominio: **barbarawong.info**.

---

## Para el cliente (actualizar el contenido)

Todo el contenido vive en `data/`. Edita el JSON correspondiente, guarda, y haz commit. **Las imágenes deben estar en `.webp`** antes de subirlas (ver "Imágenes" abajo).

> 📖 Para una guía paso a paso pensada para alguien sin perfil técnico (qué es GitHub, cómo navegar la web, cómo añadir/quitar/ordenar en cada sección), ver **[GUIA_CLIENTE.md](GUIA_CLIENTE.md)**.

### Estructura de `data/`

```
data/
├── data.json           # Config global (sources, idiomas, welcome)
├── menu.json           # Etiquetas del menú lateral
├── about.json          # Bio + datos de contacto
├── news.json           # Noticias
├── publications.json   # Publicaciones
├── projects.json       # Obras
├── photos.json         # Configuración del diario fotográfico
├── _welcome/           # Vídeos de la pantalla de bienvenida (.webm)
├── _news/              # Imágenes de noticias (.webp, numeradas)
├── _publications/      # Imágenes de publicaciones (.webp, numeradas)
├── _photos/            # Diario fotográfico (.webp, numeradas)
└── _works/             # Carpetas por obra (galerías, fotogramas, etc.)
```

### Editar noticias (`data/news.json`)

Cada noticia es un objeto:

```json
{
  "year": "2026",
  "title": {
    "es": "Título en castellano",
    "en": "Title in English",
    "ca": "Títol en català"
  },
  "description": {
    "es": "Descripción larga.\n\nMúltiples párrafos con \\n\\n.",
    "en": "...",
    "ca": "..."
  },
  "image": "data/_news/075.webp",
  "images": ["data/_news/075_1.webp", "data/_news/075_2.webp"],
  "links": ["https://ejemplo.com"]
}
```

- `image` (singular) o `images` (array, múltiples → aparece slider con `‹ ›`).
- Si un idioma falta, el sitio cae al español. Tradúcelos para mejor experiencia.
- **Orden**: las noticias se renderizan en el orden del array (la primera, arriba). No hay campo de orden ni `id` (el `id` antiguo era decorativo y se eliminó).

### Editar obras (`data/projects.json`)

```json
{
  "slug": "el-slug-en-url",
  "title": { "es": "...", "en": "...", "ca": "..." },
  "published": true,
  "ficha_tecnica": {
    "year": "2026",
    "type": { "es": "...", "en": "...", "ca": "..." },
    "duration": "10:00 min"
  },
  "info": {
    "es": ["Párrafo 1", "Párrafo 2"],
    "en": ["..."],
    "ca": ["..."]
  },
  "links": [["Nombre del link", "https://..."]],
  "trailer": "https://vimeo.com/123456",
  "trailer_pos": "despues",
  "creditos": { "es": [...], "en": [...], "ca": [...] },
  "gallerys": [
    ["", ["poster.webp"]],
    ["fotogramas", ["fotogramas/01.webp", "..."]],
    ["exhibition views", ["exhibition/01.webp"]]
  ]
}
```

- **Orden de las obras**: el orden del array en `projects.json` (no hay campo `order`; se eliminó). Para reordenar, mueve el bloque de la obra.
- **Orden de render dentro de una obra**: cabecera (título + ficha) → info → links → galerías → tráiler → créditos. Con `"trailer_pos": "antes"` el tráiler se muestra **antes** de las galerías; por defecto (sin el campo o `"despues"`) va después.
- Cada entrada en `gallerys` es `["nombre", [imagenes]]`. Las rutas son **relativas a `data/_works/<slug>/`** (p. ej. `"poster.webp"` o `"fotogramas/01.webp"`). Si `nombre` es `""` no se muestra etiqueta; cualquier otro texto se muestra como subtítulo (respeta mayúsculas). Si hay más de una imagen, se renderiza como slider.
- `published: false` → la obra aparece tachada en el menú con "(próximamente)" y no es navegable.
- **Convención de carpeta**: `data/_works/<slug>/` (el nombre de la carpeta = el `slug` de la obra).

### Formato de texto (común a info, créditos, noticias y publicaciones)

Todos los textos largos comparten el mismo criterio:

- **Párrafo nuevo**: un elemento más en el array, **o** una línea en blanco (`\n\n`) dentro del string. Equivalentes.
- **Salto de línea**: `<br>` **o** un salto simple (`\n`).
- **Cursiva** `*texto*`, **negrita** `**texto**`. Para un asterisco literal: `\*`.
- En **títulos** y **nombres de galería** también valen `<br>`, `*` y `**`, y respetan mayúsculas.

### Editar diario fotográfico (`data/photos.json`)

```json
{ "count": 205, "ext": "webp", "dir": "data/_photos/" }
```

Las fotos viven en `data/_photos/1.webp`, `2.webp`, …, `N.webp`. Para añadir nuevas: súbelas numeradas correlativamente (siguiente número) y sube `count` al total. El orden de aparición es **aleatorio** en cada visita.

### Editar bio y contacto (`data/about.json`)

```json
{
  "bio": {
    "es": ["Párrafo 1", "Párrafo 2"],
    "en": ["..."],
    "ca": ["..."]
  },
  "contact": {
    "email": "tucorreo [@] dominio.com",
    "instagram": "@tuhandle",
    "instagram_url": "https://instagram.com/tuhandle"
  }
}
```

> Email se escribe con ` [@] ` (con espacios y corchetes) para evitar scraping de bots. El sitio lo reemplaza por `@` al renderizar el link.

### Welcome (pantalla de bienvenida)

Configurado en `data/data.json` → `welcome`. Los vídeos están en `data/_welcome/`, formato `.webm` (`1.webm`, `2.webm`, …). Para añadir uno: sube el vídeo a la carpeta y añade `{ "id": "5", "label": "05" }` al array.

### Imágenes

**Todas las imágenes del sitio deben ser `.webp`** (mucho más ligero que JPG/PNG). Hay dos vías para convertir:

**A) Herramienta del navegador (recomendada)**
- Clona/descarga [`imgToWeb`](https://github.com/meowrhino/imgToWeb).
- Abre `index.html` en el navegador, arrastra las imágenes, ajusta calidad (85% por defecto), descarga las `.webp`.

**B) Script Python local** (para conversión en masa)
```sh
python3 scripts/to_webp.py
```
Convierte todas las imágenes referenciadas en `projects.json` a `.webp` (calidad 85, máx 2000px) y actualiza el JSON. Usa esto solo si añades imágenes nuevas a `_works/` desde terminal.

---

## Para devs (heredando el proyecto)

### Stack

- HTML + CSS + JavaScript vanilla (ES modules nativos, sin bundler).
- Una sola página (`index.html`); el router usa el hash de la URL (`#news`, `#project/aiguarir`, …).
- Contenido en JSON cargado por `fetch` al iniciar.
- i18n simple basada en objetos `{ es, en, ca }` con fallback a `es`.
- Sin frameworks, sin npm. Cero dependencias en runtime.

### Estructura

```
.
├── index.html              # Único entrypoint
├── css/styles.css          # Único CSS
├── js/
│   ├── main.js             # Router + init
│   ├── data.js             # Estado global, i18n (tf, tfa), loadAll, setView
│   ├── dom.js              # Helpers: $, $$, el(), cx(), bindOnce()
│   ├── menu.js             # Sidebar: secciones, works toggle, lang switch
│   ├── views.js            # Renderers por vista (about, news, project, …)
│   ├── lightbox.js         # Visor fullscreen de imágenes (galerías con flechas ‹ ›)
│   ├── text.js             # Markdown inline mínimo (md())
│   └── welcome.js          # Pantalla de bienvenida con vídeo
├── data/                   # JSON + media (ver sección cliente)
├── assets/                 # Favicon
├── scripts/
│   └── to_webp.py          # Conversor masivo png/jpg → webp
├── robots.txt
├── sitemap.xml
└── README.md
```

### Helpers DOM (`js/dom.js`)

- `$(sel)` / `$$(sel)` — querySelector(All), $$ devuelve array.
- `el(tag, attrs, ...kids)` — crea nodos. `attrs.on = { click: fn }` para listeners. `attrs.class` para clase.
- `cx(...classes)` — concat de strings de clases, ignora falsy.
- `bindOnce(node, attach)` — añade listener idempotente (marca `node._bound`).

### Estado (`js/data.js`)

`state` es un singleton mutado solo desde `setView()` (que sincroniza `document.body.dataset.view`) y desde `loadAll()` al inicio. `state.lang` se cambia desde `setLang()` en `main.js`.

```js
state = { lang, view, data, menu, about, news, publications, projects, photos }
```

### i18n

```js
tf({ es: "hola", en: "hi" })   // "hola" si lang=es, "hi" si lang=en
tfa({ es: ["p1"], en: [] })    // ["p1"] siempre (fallback a otra lang si la actual está vacía)
t("close_menu")                // strings fijos en data.js → I18N
```

Si añades un string fijo nuevo en el UI, mételo en `I18N` dentro de `js/data.js`.

El idioma elegido se guarda en `localStorage` (clave `lang`) desde `setLang()` en `main.js`, y se recupera al cargar la web con `initLang()` en `js/data.js` (validando contra `site.languages`, con fallback a `site.default_lang`).

### Formato de texto (`js/text.js`)

`md(str)` aplica markdown inline mínimo (`**negrita**`, `*cursiva*`, `<br>`) escapando el resto del HTML. `richParagraphs(val)` lo envuelve para bloques: acepta array (cada item = `<p>`) o string (separa párrafos por línea en blanco `\n{2,}` y convierte `\n` simple en `<br>`). Se usa en info, créditos, noticias y publicaciones, de modo que el criterio de párrafos/saltos es único en toda la web.

### Router

Hash-based, sin History API para back/forward profundo. Vistas registradas en `VIEWS` en `main.js`. Proyectos se navegan con `#project/<slug>`. Cambio de vista hace fade de 180ms.

### Welcome

- Solo se muestra una vez por sesión (`sessionStorage.welcomeDone`).
- Vídeos en loop con crossfade aleatorio entre cada uno.
- Click en el nombre del sitio (desktop o móvil) **vuelve a mostrar el welcome** (limpia el flag).

### Correr local

Es JS vanilla con módulos ES, por lo que necesita servirse desde HTTP (no `file://`).

```sh
python3 -m http.server 8000
# o
npx serve .
```

Abre http://localhost:8000.

### Deploy

GitHub Pages desde la rama `main`, root del repo. Para activar dominio custom (`barbarawong.info`):
1. Configurar registros DNS (A/AAAA o CNAME apex) en el proveedor del dominio apuntando a GitHub Pages.
2. En el repo: Settings → Pages → Custom domain → `barbarawong.info`.
3. Crear archivo `CNAME` en la raíz con una sola línea: `barbarawong.info`.

> **Estado actual**: dominio NO conectado todavía (no hay `CNAME`). El sitio se sirve desde `https://meowrhino.github.io/barbaraWong/` mientras tanto.

### SEO

Configurado en `<head>` de `index.html`: title, description, keywords, Open Graph, Twitter Card, JSON-LD (Person + WebSite). `robots.txt` permite todo, `sitemap.xml` con las 3 URLs por idioma y la imagen destacada.

**Resultado en Google**: el meta `robots` es `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`, es decir, Google puede mostrar la descripción completa y miniatura grande (antes había un `nosnippet` que dejaba el resultado sin texto debajo del título). La descripción que se ve en el buscador es la del `<meta name="description">`, en inglés y escrita por Bárbara. La imagen social/miniatura es `data/_about/about.webp` (apaisada; las verticales se recortan mal). El bloque `<noscript>` incluye nombre, bio corta e imagen como respaldo para buscadores que no ejecutan JS.

Tras tocar esto: en [Search Console](https://search.google.com/search-console) → *Inspección de URLs* → pedir indexación de `https://barbarawong.info/`. Google tarda de días a un par de semanas en refrescar el resultado, y la miniatura la elige él (no se puede forzar).

**Limitación**: al ser SPA con hash routing, los buscadores no indexan las sub-vistas (`#news`, `#about`, etc.) por separado. Si esto se vuelve importante, habría que migrar a History API o pre-renderizar.

---

## Créditos

Web: [meowrhino.studio](https://meowrhino.studio)
Contenido: © Bárbara Sánchez Barroso
