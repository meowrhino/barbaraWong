/* ============================================================
   build.mjs — data/ + projects/ + index.html (la plantilla) → dist/, la web
   tal cual se publica.        node build/build.mjs

   La web sigue siendo una sola aplicación (la portada con vídeo, el menú,
   las vistas que se cambian sin recargar), pero cada vista tiene ahora su
   dirección, con su title, description, canonical, hreflang y og:image, y
   su contenido escrito en el HTML (en castellano):
     /                  noticias (y la portada)
     /publications/  /photos/  /about/  /contact/
     /<slug>/           un proyecto
   Antes todo era la misma página (#about, #project/<slug>…); esos enlaces
   siguen valiendo y llevan a la dirección nueva.

   En nuestra copia (meowrhino.github.io) no se indexa y no va la analítica
   de Bárbara (Google Analytics); en la suya, barbarawong.info, sí.

   Si algo está mal (una coma, un campo mal escrito, una foto que no está)
   para y dice qué, y no se publica nada: la web se queda como estaba.
   ============================================================ */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugsOf, toOld } from '../js/house.js';
import { leerJSON, validar } from '../js/validar.js';
import { md, plain } from '../js/text.js';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'dist');
const at = (...p) => join(ROOT, ...p);
const fail = (msg) => { console.error(`\n✗ ${msg}\n\nNo se ha publicado nada: la web sigue como estaba.\n`); process.exit(1); };

/* ---------- leer y revisar ---------- */

const read = (rel) => {
  if (!existsSync(at(rel))) fail(`no encuentro ${rel}`);
  try { return leerJSON(readFileSync(at(rel), 'utf8'), rel); } catch (e) { fail(e.message); }
};
const schema = (t) => JSON.parse(readFileSync(at('schema', `${t}.json`), 'utf8'));
const errors = [];
const checked = (rel, t) => { const d = read(rel); errors.push(...validar(d, schema(t), rel)); return d; };
const site = checked('data/site.json', 'site');
const [about, news, publications, photos] = ['about', 'news', 'publications', 'photos'].map((f) => checked(`data/${f}.json`, f));
const projects = {};
for (const slug of errors.length ? [] : slugsOf(site)) {
  const rel = `projects/${slug}/project.json`;
  if (projects[slug]) { errors.push(`data/site.json: "${slug}" está dos veces en "lists"`); continue; }
  if (!existsSync(at(rel))) { errors.push(`data/site.json: "lists" dice "${slug}", y no hay ningún ${rel}`); continue; }
  const before = errors.length;
  const p = projects[slug] = checked(rel, 'project');
  if (errors.length > before) continue;
  for (const g of p.groups || []) for (const f of g.photos) {
    if (!/^(https?:|data\/)/.test(f) && !existsSync(at('projects', slug, f))) errors.push(`${rel}: no encuentro projects/${slug}/${f}`);
  }
}
// las fotos de noticias, publicaciones, about y el diario
const media = (rel, list) => { for (const f of list) if (f && !/^https?:/.test(f) && !existsSync(at(f))) errors.push(`${rel}: no encuentro ${f}`); };
for (const [rel, items] of [['data/news.json', news], ['data/publications.json', publications]]) for (const n of items || []) media(rel, [n.image, ...(n.images || [])]);
media('data/about.json', [about.image, about.contact?.image]);
for (let i = 1; i <= (photos.count || 0); i++) {
  const f = `${photos.dir || 'data/_photos/'}${i}.${photos.ext || 'webp'}`;
  if (!existsSync(at(f))) { errors.push(`data/photos.json: "count" dice ${photos.count}, y no encuentro ${f}`); break; }
}
for (const v of site.welcome?.videos || []) for (const ext of site.welcome.formats || ['webm']) media('data/site.json', [`data/_welcome/${v.id}.${ext}`]);
if (errors.length) fail([...new Set(errors)].join('\n✗ '));
const data = toOld(site, projects);

/* Dónde se publica, según dónde se construye (JAMstack, patrones §5): en la
   Action de GitHub (nuestra copia), meowrhino.github.io/<repo>/, sin indexar
   y sin la analítica; en cualquier otro sitio (Cloudflare, en la copia de
   Bárbara), la raíz con el dominio de site.json → "url". */
const github = process.env.GITHUB_ACTIONS === 'true';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/');
const BASE = github ? `/${repo}` : '';
const SITE = github ? `https://${owner}.github.io${BASE}` : String(site.url || '').replace(/\/+$/, '');
const INDEX = !github && !!site.url;

/* ---------- la imagen al compartir, con sharp ---------- */

const projectPhoto = (slug) => {
  const f = (projects[slug].groups || []).flatMap((g) => g.photos)[0];
  return f && !/^https?:/.test(f) ? (f.startsWith('data/') ? f : `projects/${slug}/${f}`) : null;
};
const visible = slugsOf(site).filter((s) => projects[s].visible !== false);
let sharp = null;
try { sharp = (await import('sharp')).default; } catch (e) {
  console.warn(`⚠ sin sharp (${e.code || e.message}): al compartir sale la foto de "sobre" tal cual. Se arregla con: npm ci`);
}
const ogs = new Map();
const ogSources = [['home', about.image, 'cover'], ...visible.map((s) => [s, projectPhoto(s), 'contain']).filter(([, f]) => f)];
for (const [key, src, fit] of sharp ? ogSources : []) {
  const cached = at('.cache', 'og', `${key}.jpg`);
  try {
    if (!(existsSync(cached) && statSync(cached).mtimeMs >= statSync(at(src)).mtimeMs)) {
      mkdirSync(dirname(cached), { recursive: true });
      const img = fit === 'cover'
        ? sharp(at(src)).resize(1200, 630, { fit: 'cover' })
        : sharp(at(src)).resize(1104, 534, { fit: 'contain', background: '#ffffff' }).extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#ffffff' });
      await img.flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }).toFile(cached);
    }
    ogs.set(key, cached);
  } catch (e) {
    console.warn(`⚠ ${src}: sharp no la puede leer (${e.message})`);
  }
}
const ogUrl = (key) => (ogs.has(key) ? `${SITE}/og/${key}.jpg` : ogs.has('home') ? `${SITE}/og/home.jpg` : `${SITE}/${about.image}`);

/* ---------- el contenido, en castellano ---------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (v) => (v == null ? '' : typeof v === 'object' && !Array.isArray(v) ? v.es ?? v.en ?? v.ca ?? '' : v);
const paras = (v) => { const x = pick(v); return (Array.isArray(x) ? x : String(x || '').split(/\n\s*\n/)).map((p) => String(p).trim()).filter(Boolean); };
const ps = (v) => paras(v).map((p) => `<p>${md(p).replace(/\n/g, '<br>')}</p>`).join('');
const cut = (s) => (s.length <= 160 ? s : s.slice(0, 157).trimEnd() + '…');
const label = (key) => pick(site.menu.find((m) => m.key === key)?.label) || key;
const href = (view, slug) => (view === 'project' ? `${encodeURIComponent(slug)}/` : view === 'news' ? './' : `${view}/`);
const imgs = (list, alt) => list.filter(Boolean).map((src, i) => `<img src="${esc(src)}" alt="${esc(alt)}${list.length > 1 ? ` ${i + 1}` : ''}" loading="lazy" decoding="async">`).join('');
const linkList = (links) => (links?.length ? `<div class="links">${links.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">↗ link${i ? ` ${i + 1}` : ''}</a>`).join(' ')}</div>` : '');

const menuHtml = site.menu.map((m) => m.key === 'works'
  ? `<li class="menu-section menu-works"><button class="menu-works-toggle" type="button">${esc(label('works'))}</button><div class="works-list"><ol class="works-list-inner">${slugsOf(site).map((s) => {
    const t = md(pick(projects[s].title));
    return projects[s].visible === false ? `<li class="work-item is-unpublished">${t}</li>` : `<li class="work-item"><a href="${href('project', s)}">${t}</a></li>`;
  }).join('')}</ol></div></li>`
  : `<li class="menu-section"><a href="${href(m.key)}" data-section="${m.key}">${esc(label(m.key))}</a></li>`).join('');

const VIEWS = {
  news: () => `<div class="view-news">${news.map((n) => `<article class="news-item"><div class="news-media">${imgs([n.image, ...(n.images || [])], plain(pick(n.title)))}</div><div class="news-body">${n.year ? `<div class="news-year">${esc(n.year)}</div>` : ''}${pick(n.title) ? `<div class="news-title">${md(pick(n.title))}</div>` : ''}<div class="news-desc">${ps(n.description)}</div>${linkList(n.links)}</div></article>`).join('')}</div>`,
  publications: () => `<div class="view-publications">${publications.map((p) => `<article class="pub-item"><div class="pub-body"><h3>${md(p.year ? `${p.year}. ${pick(p.title)}` : pick(p.title))}</h3><div class="pub-desc">${ps(p.description)}</div>${linkList(p.links)}</div><div class="pub-media">${imgs([p.image, ...(p.images || [])], plain(pick(p.title)))}</div></article>`).join('')}</div>`,
  photos: () => `<div class="view-photos">${imgs(Array.from({ length: photos.count || 0 }, (_, i) => `${photos.dir || 'data/_photos/'}${i + 1}.${photos.ext || 'webp'}`), 'diary')}</div>`,
  about: () => `<div class="view-about">${imgs([about.image], '')}${ps(about.bio)}</div>`,
  contact: () => { const c = about.contact || {}; return `<div class="view-contact">${imgs([c.image], '')}${c.email ? `<p>${esc(c.email)}</p>` : ''}${c.instagram_url ? `<p><a href="${esc(c.instagram_url)}" target="_blank" rel="noopener">${esc(c.instagram || 'instagram')}</a></p>` : ''}</div>`; },
  project: (slug) => {
    const p = projects[slug];
    const d = p.details || {};
    const meta = [d.year, pick(d.type), d.duration].filter(Boolean).join(' · ');
    const links = (p.links || []).map((l) => (Array.isArray(l) ? { label: l[0], url: l[1] } : { label: pick(l.label) || l.url, url: l.url }));
    return `<article class="view-project"><header class="project-header"><h2>${md(pick(p.title))}</h2>${meta ? `<div class="project-meta">${esc(meta)}</div>` : ''}</header>`
      + `<div class="project-info">${ps(p.text)}${ps(p.more)}</div>`
      + (links.length ? `<div class="project-links">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">↗ ${esc(l.label)}</a>`).join(' ')}</div>` : '')
      + (p.groups || []).map((g) => `<section class="project-gallery"><div class="project-section-title">${md(pick(g.title))}</div>${imgs(g.photos.map((f) => (/^(https?:|data\/)/.test(f) ? f : `projects/${slug}/${f}`)), `${plain(pick(p.title))} — ${plain(pick(g.title))}`)}</section>`).join('')
      + (paras(p.credits).length ? `<div class="project-credits"><div class="project-section-title">créditos</div>${ps(p.credits)}</div>` : '')
      + '</article>';
  },
};

/* ---------- las páginas ---------- */

function swap(html, find, replace) {
  if (!find.test(html)) fail(`no encuentro ${find} en index.html: el build lo necesita para escribir las páginas.`);
  return html.replace(find, replace);
}
const set = (html, re, value) => swap(html, re, (_, a, b) => `${a}${esc(value)}${b}`);
const TEMPLATE = readFileSync(at('index.html'), 'utf8');
const homeDesc = (/<meta name="description" content="([^"]*)"/.exec(TEMPLATE) || [])[1] || site.title;

function page({ view, slug, path, title, desc, image }) {
  const url = `${SITE}/${path}`;
  let html = TEMPLATE.replaceAll('https://barbarawong.info', SITE);
  html = swap(html, /<html lang="es">/, '<html lang="es" data-built>');
  html = swap(html, /(<meta charset="UTF-8">)/, `$1\n    <base href="${BASE}/">\n    <script>window.__SITE__ = ${JSON.stringify(SITE)};</script>`);
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = set(html, /(<meta name="description" content=")[^"]*(")/, desc);
  html = set(html, /(<meta property="og:description" content=")[^"]*(")/, desc);
  html = set(html, /(<meta name="twitter:description" content=")[^"]*(")/, desc);
  html = set(html, /(<meta property="og:title" content=")[^"]*(")/, title);
  html = set(html, /(<meta name="twitter:title" content=")[^"]*(")/, title);
  html = set(html, /(<link rel="canonical" href=")[^"]*(")/, url);
  html = set(html, /(<meta property="og:url" content=")[^"]*(")/, url);
  html = set(html, /(<meta property="og:image" content=")[^"]*(")/, image);
  html = set(html, /(<meta name="twitter:image" content=")[^"]*(")/, image);
  html = swap(html, /<meta property="og:image:width" content="\d+">\s*<meta property="og:image:height" content="\d+">/, '<meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">');
  for (const l of ['es', 'en', 'ca']) html = set(html, new RegExp(`(<link rel="alternate" hreflang="${l}" href=")[^"]*(")`), `${url}?lang=${l}`);
  html = set(html, /(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, url);
  if (!INDEX) {
    html = swap(html, /<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex">');
    // la analítica es de Bárbara: en nuestra copia, fuera
    html = swap(html, /\s*<!-- Google Analytics 4[^>]*-->\s*<script async src="https:\/\/www\.googletagmanager\.com[^"]*"><\/script>\s*<script>[\s\S]*?<\/script>/, '');
  }
  html = swap(html, /<body data-view="news">/, `<body data-view="${view}">`);
  html = swap(html, /(<a id="site-name" href=")#news(")/, '$1./$2');
  html = swap(html, /(<nav id="menu-sections" aria-label="Secciones">\s*<ul>)(<\/ul>)/, `$1${menuHtml}$2`);
  return swap(html, /(<div id="viewer-content">)(<\/div>)/, `$1${VIEWS[view](slug)}$2`);
}

const pages = [
  { view: 'news', path: '', title: site.title, desc: homeDesc, image: ogUrl('home') },
  ...['publications', 'photos', 'about', 'contact'].map((v) => ({
    view: v, path: `${v}/`, title: `${label(v)} · ${site.title}`,
    desc: v === 'about' ? cut(plain(paras(about.bio)[0] || homeDesc)) : homeDesc, image: ogUrl('home'),
  })),
  ...visible.map((s) => ({
    view: 'project', slug: s, path: `${encodeURIComponent(s)}/`, title: `${plain(pick(projects[s].title))} · ${site.title}`,
    desc: cut(plain(paras(projects[s].text)[0] || pick(projects[s].title))), image: ogUrl(s),
  })),
];

/* ---------- escribir dist/ ---------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
// de projects/ solo lo que se ve (no los .docx ni las notas de trabajo)
const MEDIA = /\.(webp|jpe?g|png|gif|svg|webm|mp4|mov|pdf|json)$/i;
for (const f of ['css', 'js', 'fonts', 'assets', 'data', 'projects']) cpSync(at(f), join(OUT, f), {
  recursive: true, filter: (x) => !x.endsWith('.DS_Store') && (f !== 'projects' || statSync(x).isDirectory() || MEDIA.test(x)),
});
mkdirSync(join(OUT, 'og'), { recursive: true });
for (const [key, cached] of ogs) cpSync(cached, join(OUT, 'og', `${key}.jpg`));
for (const p of pages) { mkdirSync(join(OUT, p.path), { recursive: true }); writeFileSync(join(OUT, p.path, 'index.html'), page(p)); }
writeFileSync(join(OUT, '404.html'), page({ ...pages[0], title: site.title }).replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex">'));

const alt = (u) => ['es', 'en', 'ca'].map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${u}?lang=${l}"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${u}"/>`;
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.flatMap((p) => ['es', 'en', 'ca'].map((l) => `  <url>\n    <loc>${SITE}/${p.path}?lang=${l}</loc>\n${alt(`${SITE}/${p.path}`)}\n  </url>`)).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), INDEX ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`✓ dist/: ${pages.length} páginas (${visible.length} proyectos)${INDEX ? ` · se indexa (${SITE})` : ' · sin indexar, sin analítica'}`);
