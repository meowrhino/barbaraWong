# Bárbara Sánchez Barroso — portfolio

Sitio web personal de Bárbara Sánchez Barroso (artista visual, cine analógico). SPA en HTML/CSS/JS vanilla, sin build, contenido en JSON, alojado en GitHub Pages. Dominio: **barbarawong.info**.

---

## Para el cliente (actualizar el contenido)

Todo el contenido vive en `data/`. Edita el JSON correspondiente, guarda, y haz commit. **Las imágenes deben estar en `.webp`** antes de subirlas (ver "Imágenes" abajo).

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
├── _welcome/           # Vídeos de la pantalla de bienvenida (.webm + .mp4)
├── _news/              # Imágenes de noticias (.webp, numeradas)
├── _publications/      # Imágenes de publicaciones (.webp, numeradas)
├── _photos/            # Diario fotográfico (.webp, numeradas)
└── _works/             # Carpetas por obra (galerías, fotogramas, etc.)
```

### Editar noticias (`data/news.json`)

Cada noticia es un objeto:

```json
{
  "id": 75,
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

### Editar obras (`data/projects.json`)

```json
{
  "slug": "el-slug-en-url",
  "order": 8,
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
  "creditos": { "es": [...], "en": [...], "ca": [...] },
  "gallerys": [
    ["", ["data/_works/08. Mi obra/poster.webp"]],
    ["fotogramas", ["data/_works/08. Mi obra/fotogramas/01.webp", "..."]],
    ["exhibition views", ["data/_works/08. Mi obra/exhibition/01.webp"]]
  ]
}
```

- **Orden de render dentro de una obra**: ficha técnica → info → links → cada galería (en el orden que estén en `gallerys`) → vídeo Vimeo → créditos.
- Cada entrada en `gallerys` es `["nombre", [imagenes]]`. Si `nombre` es `""` o `"fotogramas"`, no se muestra etiqueta. Si hay más de una imagen, se renderiza como slider.
- `published: false` → la obra aparece tachada en el menú con "(próximamente)" y no es navegable.
- Convención de carpeta: `data/_works/NN. Nombre/...` (numerada).

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

Configurado en `data/data.json` → `welcome`. Los vídeos están en `data/_welcome/`, formato dual `.webm` y `.mp4` con mismo nombre (`1.webm` + `1.mp4`, etc.). Para añadir uno: sube ambos formatos a la carpeta y añade `{ "id": "5", "label": "05" }` al array.

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

### Router

Hash-based, sin History API para back/forward profundo. Vistas registradas en `VIEWS` en `main.js`. Proyectos se navegan con `#project/<slug>`. Cambio de vista hace fade de 180ms.

### Welcome

- Solo se muestra una vez por sesión (`sessionStorage.welcomeDone`).
- Vídeos en loop con crossfade aleatorio entre cada uno.
- Botón de audio (mute/unmute), bocina SVG con ondas en estado on.
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

Configurado en `<head>` de `index.html`: title, description, keywords, Open Graph, Twitter Card, JSON-LD Person. `robots.txt` permite todo, `sitemap.xml` con la URL principal. **Limitación**: al ser SPA con hash routing, los buscadores no indexan las sub-vistas (`#news`, `#about`, etc.) por separado. Si esto se vuelve importante, habría que migrar a History API o pre-renderizar.

---

## Créditos

Web: [meowrhino.studio](https://meowrhino.studio)
Contenido: © Bárbara Sánchez Barroso
