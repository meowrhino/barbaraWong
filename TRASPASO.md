# Traspaso: la versión nueva a la copia de Bárbara

Bárbara ya tiene su copia, `barbarawong/web-manu`, que publica `barbarawong.info`
con Cloudflare (Workers, sin build: sirve los ficheros de `main` tal cual, menos
lo de `.assetsignore`), y **la edita ella, mucho** (noticias, obras, bio). Es la
versión de antes: un `projects.json` con todas las obras y sus fotos en
`data/_works/`, todo en una sola página (`#about`, `#project/…`). Tiene su SEO
trabajado (descripción, JSON-LD, `hreflang`, Search Console) y Google Analytics.

**Su contenido está aquí** (traído el 2026-10-18, hasta `2775c90`). Su SEO y su
analítica se conservan: la analítica solo va en su copia. Lo que haya cambiado
desde entonces hay que traerlo antes. Podemos escribir en su repo.

En su copia la Action de publicar no corre (lleva `if: github.repository_owner
== 'meowrhino'`) y Cloudflare construye con `wrangler.jsonc` (`node
build/build.mjs`, sale `dist/`).

Tiempo: unos 30 minutos, y un rato con ella: **cambia cómo edita las obras**
(de `data/projects.json` a una carpeta por obra en `projects/`, con
`project.json` y sus fotos; los campos `info`, `info_colapsable`, `creditos`,
`gallerys` y `ficha_tecnica` pasan a `text`, `more`, `credits`, `groups` y
`details`, y el orden a `data/site.json`). Noticias, publicaciones, diario y
sobre, igual que siempre. Hablarlo antes.

## Antes

- [ ] `main` de meowrhino al día y sin cambios a medias (`git status` limpio).
- [ ] ¿Ha tocado algo Bárbara desde `2775c90`?
      `gh api repos/barbarawong/web-manu/commits --jq '.[0:5][] | .sha[0:7]+" "+.commit.message'`.
      Si sí, pasar sus cambios aquí antes: lo de `data/` (news, publications, about, photos) tal
      cual; una obra de `data/projects.json` → `projects/<slug>/project.json` (los campos de
      arriba) y sus fotos de `data/_works/<slug>/` → `projects/<slug>/`.
- [ ] En Cloudflare, con ella: ver cómo está hecho el Worker de `barbarawong.info` (rama,
      comando de build vacío, carpeta de salida la raíz).

## 1. La versión nueva, en una rama de su copia

- [ ] `git push https://github.com/barbarawong/web-manu.git main:receta`
- [ ] En Cloudflare, en su Worker: **Settings → Build**: rama `receta`, comando
      `node build/build.mjs` (o que lo lea de `wrangler.jsonc`), salida `dist`. Mirar el
      `*.workers.dev` de la rama: la portada, `/about/`, una obra (`/els-peregrins/`), y que la
      analítica siga (en la pestaña Red, `googletagmanager`).

## 2. `main` pasa a ser la versión nueva

- [ ] Guardar la de antes: `git push https://github.com/barbarawong/web-manu.git <sha-de-su-main>:refs/heads/antes`.
- [ ] `git push --force-with-lease=main:<sha-de-su-main> https://github.com/barbarawong/web-manu.git main`
- [ ] En Cloudflare, rama de producción → **`main`**. Borrar la rama `receta`.

## 3. Comprobar en su dominio

- [ ] La portada (los vídeos y "entrar"), noticias, una obra, y un enlace de antes
      (`/#project/biophilia` lleva a `/biophilia/`).
- [ ] `view-source:` de una obra: el texto y las fotos en el HTML; `canonical` y `hreflang` con
      `barbarawong.info`, y su `robots` de siempre (no `noindex`).
- [ ] `/robots.txt` dice `Allow`; `/sitemap.xml` tiene todas las páginas.
- [ ] Compartir una obra por WhatsApp: sale su imagen (la og).

## 4. Search Console, con su cuenta de Google

- [ ] Enviar el `sitemap.xml` nuevo (ahora con todas las páginas).

## 5. Bárbara

Con ella delante, siguiendo [GUIA.md](GUIA.md):

- [ ] Editar una obra en su carpeta nueva, Commit, y verla publicada en un par de minutos.
- [ ] Qué pasa si algo está mal: no se publica y la web sigue como estaba.

## 6. Al acabar

- [ ] Fila de barbaraWong en `JAMstack/inventario.md` con las dos direcciones.
