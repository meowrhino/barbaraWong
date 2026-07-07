# Guía para mantener y actualizar la web

Esta guía está pensada para que puedas **entender** y **actualizar** la web tú misma, sin saber programar. Está dividida en bloques: empieza por entender cómo funciona y, cuando lo tengas claro, pasa a la parte de editar.

> Regla de oro: **el contenido (textos, imágenes, obras, noticias) lo puedes tocar tú. El código (las carpetas `js/` y `css/`) NO se toca** salvo que sepas lo que haces o lo haga quien lleva la parte técnica.

---

## 1. ¿Cómo está hecha esta web? (la idea general)

Tu web es un **sitio estático**. Eso significa que **no tiene base de datos ni panel de administración** tipo WordPress. En su lugar:

- Todos los **textos** viven en unos archivos de texto llamados **JSON** (dentro de la carpeta `data/`).
- Todas las **imágenes** viven en carpetas dentro de `data/`.
- Cuando alguien entra en la web, el navegador lee esos archivos y los muestra.

**Ventaja:** es rapidísima, segura y casi gratis de mantener. **Lo que cambia el contenido es editar esos archivos de texto.** Eso es todo el "mantenimiento" habitual.

---

## 2. ¿Qué es GitHub?

**GitHub es el lugar donde viven todos los archivos de tu web, online.** Piensa en él como un Google Drive especializado:

- Guarda **todos los archivos** del sitio (textos, imágenes, código).
- Guarda el **historial completo** de cambios: cada modificación queda registrada y **siempre se puede deshacer** si algo sale mal.
- **Tu web se actualiza sola** cuando cambian los archivos en GitHub. No hay que "subir por FTP" ni nada raro: editas en GitHub → al cabo de uno o dos minutos, la web ya muestra el cambio.

La dirección de tu repositorio (así se llama la "carpeta" en GitHub) es:
**https://github.com/meowrhino/barbaraWong**

Para editar necesitas una **cuenta de GitHub** y que te hayan dado **permiso de edición** sobre ese repositorio. Eso lo gestiona la persona técnica.

### Vocabulario mínimo de GitHub

| Palabra | Qué significa en cristiano |
|---|---|
| **Repositorio** (repo) | La carpeta con todos los archivos de la web. |
| **Commit** | "Guardar" un cambio con una pequeña descripción. Cada commit queda en el historial. |
| **Push / subir** | Mandar tus cambios a GitHub para que se publiquen. |
| **Branch / rama** | Una versión paralela. La principal se llama `main` y es la que se publica. |

---

## 3. El "visual": cómo se ve y se navega la web

Esto es lo que ve cualquier visitante. Conviene que lo conozcas para entender dónde acaba cada cosa que editas.

### La pantalla de bienvenida
- Al entrar, se ven **vídeos a pantalla completa** con un botón **"entrar"**.
- Una vez dentro, si **haces clic en el nombre** ("Bárbara Sánchez Barroso" arriba), **vuelves a la bienvenida**.

### El menú y las secciones
El menú lleva a estas secciones (definidas en `data/menu.json`):

| Sección | Qué muestra | Archivo que la alimenta |
|---|---|---|
| **noticias** | Novedades, estrenos, exposiciones | `data/news.json` |
| **obras** | Tus proyectos / películas | `data/projects.json` |
| **publicaciones** | Textos, catálogos, publicaciones | `data/publications.json` |
| **diario** | Diario fotográfico (orden aleatorio) | `data/photos.json` |
| **sobre** | Biografía + foto | `data/about.json` |
| **contacto** | Email, Instagram + foto | `data/about.json` |

- En **móvil** el menú está plegado: se abre con **"ver menú"**.
- Arriba hay un **selector de idioma** (es / en / ca). Cada texto se muestra en el idioma elegido.

### Dentro de una obra
Al abrir una obra ves, de arriba a abajo:
1. **Título**
2. **Ficha técnica** (año · tipo · duración)
3. **Texto (info)**
4. **Enlaces**
5. **Galerías** de imágenes (si hay varias imágenes, aparece un **slider** con flechas `‹ ›`)
6. **Tráiler** de Vimeo
7. **Créditos**

> El tráiler normalmente va **después** de las galerías, pero se puede poner **antes** (ver punto 6 de la guía de edición).

- Al hacer **clic en una imagen**, se abre en grande (**lightbox**) para verla con detalle.

---

## 4. Dónde vive cada cosa (mapa de la carpeta `data/`)

```
data/
├── data.json           # Configuración general (NO tocar salvo necesidad)
├── menu.json           # Nombres del menú
├── about.json          # Biografía + contacto + sus fotos
├── news.json           # Noticias
├── publications.json   # Publicaciones
├── projects.json       # Obras
├── photos.json         # Configuración del diario fotográfico
├── _about/             # Fotos de sobre/contacto
├── _news/              # Imágenes de noticias
├── _publications/      # Imágenes de publicaciones
├── _photos/            # Fotos del diario
├── _works/             # Una carpeta por obra (sus galerías)
└── PDF/                # CV en PDF (cv_es.pdf, cv_en.pdf, cv_cat.pdf)
```

Las carpetas que empiezan por guion bajo (`_`) son **donde van las imágenes**. Los archivos `.json` son **donde van los textos**.

---

## 5. Cómo editar el contenido (paso a paso, desde GitHub)

La forma más sencilla, sin instalar nada, es editar directamente en la web de GitHub:

1. Entra en **https://github.com/meowrhino/barbaraWong** (con tu cuenta y permisos).
2. Abre la carpeta `data/` y haz clic en el archivo que quieras editar (p. ej. `news.json`).
3. Pulsa el **icono del lápiz** (✏️ "Edit this file"), arriba a la derecha del archivo.
4. Haz tus cambios en el texto.
5. Baja hasta el botón verde **"Commit changes"**, escribe una frase corta de qué cambiaste (p. ej. "Añado noticia del estreno") y confirma.
6. Espera **1–2 minutos** y recarga la web: tu cambio ya debería verse.

> ⚠️ **Lo más importante al editar JSON:** respeta las **comillas** `"`, las **comas** `,` y las **llaves** `{ }` / **corchetes** `[ ]`. Un solo símbolo fuera de sitio puede dejar una sección en blanco. Si tienes dudas, pega el texto en **https://jsonlint.com** y te dirá si está bien escrito *antes* de guardar.

### Los tres idiomas
Casi todos los textos tienen tres versiones: español (`es`), inglés (`en`) y catalán (`ca`):

```json
"title": {
  "es": "Título en castellano",
  "en": "Title in English",
  "ca": "Títol en català"
}
```

Si dejas un idioma vacío, la web muestra automáticamente el español. Aun así, lo ideal es rellenar los tres.

---

## 6. Reglas de formato de texto (¡importante y unificado!)

Estas reglas funcionan **igual en todos los textos largos** (info de obras, créditos, descripciones de noticias y publicaciones). Memorizas una vez y vale para todo:

| Quieres... | Escribes... | Ejemplo |
|---|---|---|
| **Párrafo nuevo** (con espacio entre medias) | Un elemento más en la lista **o** una línea en blanco `\n\n` | `["Primer párrafo", "Segundo párrafo"]` |
| **Salto de línea** (pegado, sin espacio) | `<br>` **o** un salto simple `\n` | `"Línea uno<br>Línea dos"` |
| **Cursiva** | `*texto*` | `Una película *muy* especial` → Una película *muy* especial |
| **Negrita** | `**texto**` | `**Importante**` → **Importante** |
| **Un asterisco de verdad** | `\*` (con barra delante) | `5 \* 3` → 5 * 3 |

Ejemplo de un texto de obra con párrafos (formato lista):

```json
"info": {
  "es": [
    "Primer párrafo de la sinopsis.",
    "Segundo párrafo, con una palabra en *cursiva* y otra en **negrita**."
  ],
  "en": ["..."],
  "ca": ["..."]
}
```

El mismo texto también se puede escribir como un solo bloque separando párrafos con una línea en blanco (`\n\n`). **Las dos formas dan el mismo resultado.**

### Títulos y nombres de galería
- En los **títulos** de obra puedes usar `<br>` para partir en dos líneas, y `*cursiva*` / `**negrita**`.
- Los **nombres de galería** y los **títulos** **respetan las mayúsculas** tal y como las escribas (el menú y la navegación, en cambio, se ven siempre en minúscula, es parte del diseño).

### Imágenes verticales
- Si una galería tiene fotos verticales y en pantalla de ordenador quedan demasiado grandes, añade la palabra `VERTICAL` al nombre de alguno de sus archivos (por ejemplo `1_VERTICAL.webp`). Toda esa galería se mostrará más estrecha (420px en vez de 720px) para que quepa mejor en pantalla.

---

## 7. Editar cada sección

### Noticias — `data/news.json`
Cada noticia es un bloque entre llaves `{ ... }`:

```json
{
  "year": "2026",
  "title": { "es": "...", "en": "...", "ca": "..." },
  "description": { "es": "...", "en": "...", "ca": "..." },
  "image": "data/_news/075.webp",
  "links": ["https://ejemplo.com"]
}
```

- **Añadir una noticia:** copia un bloque `{ ... }` completo, pégalo dentro de los corchetes `[ ... ]` y cambia los textos. Separa los bloques con una **coma** `,` (todos menos el último).
- **Quitar una noticia:** borra su bloque `{ ... }` entero (y la coma que lo acompaña).
- **Ordenar:** las noticias salen en el **orden del archivo** — la primera de la lista, arriba. Para subir una noticia, mueve su bloque más arriba.
- **Varias imágenes:** usa `"images": ["...", "..."]` en lugar de `"image"` y aparecerá un slider.
- **Imágenes:** van en `data/_news/` en formato `.webp` (ver §8); conviene numerarlas (`075.webp`, …).
- **Sobre el campo `id`:** en las noticias antiguas verás un `"id": 75`. **No hace nada** (ni afecta al orden). Puedes dejarlo o borrarlo, da igual.

### Obras (`data/projects.json`)

```json
{
  "slug": "mi-obra",
  "title": { "es": "...", "en": "...", "ca": "..." },
  "published": true,
  "ficha_tecnica": {
    "year": "2026",
    "type": { "es": "...", "en": "...", "ca": "..." },
    "duration": "10:00 min"
  },
  "info": { "es": ["..."], "en": ["..."], "ca": ["..."] },
  "info_colapsable": { "es": [], "en": [], "ca": [] },
  "links": [["Nombre del enlace", "https://..."]],
  "trailer": "https://vimeo.com/123456",
  "trailer_pos": "despues",
  "creditos": { "es": ["..."], "en": ["..."], "ca": ["..."] },
  "gallerys": [
    ["", ["poster.webp"]],
    ["fotogramas", ["fotogramas/1.webp", "fotogramas/2.webp"]]
  ]
}
```

**Añadir una obra (paso a paso):**
1. Elige un **`slug`**: nombre corto sin espacios ni acentos, con guiones (`mi-obra-nueva`). Saldrá en la dirección de la web.
2. Crea la carpeta `data/_works/mi-obra-nueva/` y sube ahí sus imágenes en `.webp` (ver §8).
3. Copia un bloque de obra existente, pégalo en la **posición** donde quieras que aparezca y cambia sus datos (`slug`, `title`, ficha, `info`, `gallerys`…).

**Quitar una obra:** dos formas —
- **Ocultarla** (reversible): pon `"published": false`. Sale tachada con "(próximamente)" y no se puede abrir. No borres nada más.
- **Borrarla del todo:** elimina su bloque `{ ... }` del archivo (y, si quieres, su carpeta de imágenes).

**Ordenar las obras:** salen en el **orden del archivo**. Para mover una obra, **corta y pega su bloque entero** más arriba o más abajo en la lista. (No hay número de orden: manda la posición en el archivo.)

Otros campos:
- **`slug`** debe coincidir con el **nombre de la carpeta** de imágenes: `data/_works/mi-obra/`.
- **`trailer_pos`** (opcional): `"antes"` pone el tráiler antes de las galerías; sin el campo (o `"despues"`), va después.
- **Galerías**: cada una es `["nombre", ["lista de imágenes"]]`. Las rutas son **relativas a la carpeta de la obra**: `"1.webp"` → `data/_works/mi-obra/1.webp`; si está en una subcarpeta, `"subcarpeta/1.webp"`. Con más de una imagen, se ve como slider.
- **`info_colapsable`** (opcional): texto extra que solo aparece si el visitante pulsa un enlace "ver más" debajo del texto principal (`info`). Se rellena igual que `info` (mismas reglas de párrafos, idiomas, cursiva/negrita — ver §6). Si lo dejas vacío (`[]` en los tres idiomas, como sale por defecto), simplemente no aparece ningún "ver más" en esa obra.

### Sobre y contacto (`data/about.json`)

```json
{
  "bio": { "es": ["Párrafo 1", "Párrafo 2"], "en": ["..."], "ca": ["..."] },
  "image": "data/_about/about.webp",
  "contact": {
    "email": "tucorreo [@] dominio.com",
    "instagram": "@tuhandle",
    "instagram_url": "https://instagram.com/tuhandle",
    "image": "data/_about/contact.webp"
  }
}
```

- **Editar textos:** cambia los párrafos de `bio` (cada elemento de la lista = un párrafo) y los datos de `contact`.
- **Cambiar las fotos:** sustituye `about.webp` / `contact.webp` dentro de `data/_about/` por las nuevas en `.webp`. Si mantienes el **mismo nombre**, no hace falta tocar el JSON; si las llamas distinto, actualiza la ruta `"image"`.

> El email se escribe con ` [@] ` (con corchetes y espacios) a propósito, para evitar que los robots de spam lo recojan. La web lo convierte en `@` automáticamente.

### CV — `data/PDF/`
Si subes tu currículum en PDF a la carpeta `data/PDF/` con estos nombres exactos:

```
data/PDF/cv_es.pdf
data/PDF/cv_en.pdf
data/PDF/cv_cat.pdf
```

la web muestra automáticamente un enlace **"ver CV"** justo debajo del texto de la sección "sobre", en el idioma que esté viendo la persona. Si falta el PDF de un idioma concreto, simplemente no aparece el enlace en ese idioma (no da error). No hace falta tocar ningún JSON: basta con subir el archivo con el nombre correcto.

### Diario fotográfico — `data/photos.json`

```json
{ "count": 205, "ext": "webp", "dir": "data/_photos/" }
```

Cómo funciona: las fotos se llaman `1.webp`, `2.webp`, …, `N.webp` dentro de `data/_photos/`, y **`count` indica cuántas hay**. Se muestran en **orden aleatorio** en cada visita. La numeración debe ir **seguida, sin huecos** (si falta la `50.webp`, esa foto saldría rota).

**Añadir fotos:**
1. Conviértelas a `.webp` con imgToWeb (ver §8). Para numerarlas correlativas puedes usar el modo **"solo renombrar"**.
2. Súbelas a `data/_photos/` con los **siguientes números**: si hay 205, las nuevas son `206.webp`, `207.webp`, …
3. Cambia `count` al **nuevo total**.

**Quitar fotos:** como la numeración no puede tener huecos, lo más seguro es:
1. Borra las fotos que no quieras.
2. **Renumera** las que quedan para que vayan de `1` a `N` sin saltos. Lo más cómodo: arrástralas todas a imgToWeb en modo **"solo renombrar"**, que te las renumera de una vez; descarga y vuelve a subirlas.
3. Ajusta `count` al **nuevo total**.

---

## 8. Convertir imágenes a `.webp` (herramienta imgToWeb)

**Todas las imágenes de la web deben estar en formato `.webp`** (pesa mucho menos que JPG o PNG, así la web carga rápido). Antes de subir cualquier imagen, conviértela con esta herramienta gratuita:

### 👉 https://meowrhino.github.io/imgToWeb/
*(funciona mejor en **ordenador** — Brave, Chrome, etc.)*

Tiene **dos modos**:

**1) Convertir a webp** (el habitual)
1. Arrastra las imágenes a la página (o pulsa **"seleccionar archivos"**). Acepta JPG, PNG, GIF, HEIC, TIFF…
2. Elige la **calidad** (con **85%** vas bien).
3. Pulsa **"descargar todo (zip)"** y descomprime el zip: dentro tienes tus `.webp`.

**2) Solo renombrar** (no convierte, solo **renumera** los archivos)
- Útil sobre todo para el **diario de fotos** cuando borras o reordenas y necesitas que la numeración quede seguida (`1, 2, 3…`). Puedes ordenar por orden de subida o alfabético.

### Subir las imágenes a GitHub
Dentro de la carpeta correcta del repositorio, pulsa **"Add file" → "Upload files"**, arrastra los `.webp` y haz commit.

Nombres de archivo: simples, **sin acentos ni espacios** (`1.webp`, `poster.webp`, `fotogramas/1.webp`). Para una obra nueva, crea la carpeta `data/_works/<slug>/` y mete ahí sus imágenes.

---

## 9. Cómo se publica todo

No hay un botón de "publicar" aparte. **Cada vez que haces un commit en GitHub (en la rama `main`), la web se actualiza sola** en uno o dos minutos. Si no ves el cambio, recarga la página (a veces ayuda forzar recarga con Cmd/Ctrl + Shift + R).

---

## 10. Si algo se rompe

- **Una sección sale en blanco** → casi seguro es un error de JSON (una coma de más, una comilla que falta). Revisa el último archivo que tocaste en https://jsonlint.com.
- **Quiero deshacer un cambio** → GitHub guarda todo el historial. En el repositorio puedes ver los commits y volver a una versión anterior. Si no te ves capaz, avisa a la persona técnica: nada se pierde.
- **No toques** las carpetas `js/` ni `css/` ni el archivo `index.html` salvo que sepas qué haces: ahí está el funcionamiento de la web.

---

## 11. Quién mantiene qué

- **Contenido** (textos, imágenes, noticias, obras, fotos): lo puedes llevar tú desde GitHub.
- **Código y diseño** (cómo se ve y se comporta la web): lo lleva la parte técnica → [meowrhino.studio](https://meowrhino.studio).

Ante la duda, **es mejor preguntar que romper**. Y recuerda: en GitHub **todo cambio se puede deshacer**.
