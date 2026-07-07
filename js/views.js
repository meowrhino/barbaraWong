// Renderers de cada vista.

import { $, el } from "./dom.js";
import { state, t, tf, tfa, findProject } from "./data.js";
import { openLightbox } from "./lightbox.js";
import { md, safeHref } from "./text.js";


// Texto rico → párrafos. Criterio ÚNICO para info, créditos, news y publications.
// Acepta array (cada item = un párrafo) o string con líneas en blanco (\n\n = párrafo).
// Dentro de un párrafo: \n o <br> = salto de línea; *cursiva* y **negrita**.
function richParagraphs(val) {
    return tfa(val)
        .join("\n\n")
        .split(/\n{2,}/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => el("p", { html: md(s).replace(/\n/g, "<br>") }));
}

// ---------- Helpers ----------
function zoomable(img, getGallery, getIndex) {
    img.classList.add("is-zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "ampliar imagen");
    const open = (e) => {
        e.stopPropagation();
        openLightbox(getGallery(), getIndex());
    };
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); }
    });
}

function makeSlider(images, altBase = "") {
    let i = 0;
    const img = el("img", { src: images[0], alt: altBase ? `${altBase} 1` : "", loading: "lazy", decoding: "async" });
    const prev = el("button", { class: "slider-btn slider-prev", "aria-label": "anterior" }, "‹");
    const next = el("button", { class: "slider-btn slider-next", "aria-label": "siguiente" }, "›");
    prev.addEventListener("click", (e) => {
        e.stopPropagation();
        i = (i - 1 + images.length) % images.length;
        img.src = images[i];
        if (altBase) img.alt = `${altBase} ${i + 1}`;
    });
    next.addEventListener("click", (e) => {
        e.stopPropagation();
        i = (i + 1) % images.length;
        img.src = images[i];
        if (altBase) img.alt = `${altBase} ${i + 1}`;
    });
    zoomable(img, () => images, () => i);
    return el("div", { class: "slider" }, prev, img, next);
}

// Calcula el aspect-ratio promedio de un conjunto de imágenes y lo aplica
// al contenedor del slider. Carga las imágenes en paralelo solo para leer
// sus dimensiones naturales (los navegadores cachean, así que el slider
// real las reutiliza). Si alguna falla se ignora.
function measureAdaptiveRatio(sliderEl, imageUrls) {
    const ratios = [];
    let done = 0;
    const finish = () => {
        if (done < imageUrls.length) return;
        if (!ratios.length) return;
        const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
        sliderEl.style.aspectRatio = String(avg);
    };
    imageUrls.forEach(url => {
        const probe = new Image();
        probe.onload = () => {
            if (probe.naturalWidth && probe.naturalHeight) {
                ratios.push(probe.naturalWidth / probe.naturalHeight);
            }
            done++;
            finish();
        };
        probe.onerror = () => { done++; finish(); };
        probe.src = url;
    });
}

// Difiere la medición del ratio hasta que el slider esté cerca del viewport,
// para no descargar todas las imágenes de todas las galerías de golpe.
function applyAdaptiveRatio(sliderEl, imageUrls) {
    if (!sliderEl || !imageUrls || imageUrls.length === 0) return;
    if (typeof IntersectionObserver === "undefined") {
        measureAdaptiveRatio(sliderEl, imageUrls);
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                observer.disconnect();
                measureAdaptiveRatio(sliderEl, imageUrls);
            }
        }
    }, { root: null, rootMargin: "200px" });
    observer.observe(sliderEl);
}

// Media de un item (news/publications): slider si hay varias imágenes,
// si no una única imagen zoomable. Devuelve null si no hay imagen.
function itemMedia(item, titleStr) {
    const singleSrc = item.image || item.images?.[0];
    if (item.images?.length > 1) {
        return makeSlider(item.images, titleStr);
    }
    if (!singleSrc) return null;
    const img = el("img", { src: singleSrc, alt: titleStr, loading: "lazy", decoding: "async" });
    zoomable(img, () => [singleSrc], () => 0);
    return img;
}

// Lista de links "↗ link" / "↗ link N". Devuelve null si no hay links.
function linkList(links, className) {
    if (!links?.length) return null;
    return el("div", { class: className },
        ...links.map((u, i) => el("a", { href: safeHref(u), target: "_blank", rel: "noopener" },
            i === 0 ? "↗ link" : `↗ link ${i + 1}`
        ))
    );
}

function vimeoEmbed(url) {
    const id = (url || "").match(/vimeo\.com\/(\d+)/)?.[1];
    if (!id) return null;
    return el("div", { class: "project-vimeo" },
        el("iframe", {
            src: `https://player.vimeo.com/video/${id}`,
            allow: "autoplay; fullscreen; picture-in-picture",
            loading: "lazy",
            referrerpolicy: "strict-origin-when-cross-origin",
            allowfullscreen: "",
            title: "Vimeo trailer",
        })
    );
}

// Resuelve las rutas de una galería de proyecto: si ya son absolutas
// (http(s):// o data/) se dejan tal cual, si no se anteponen a la carpeta del proyecto.
function resolveGalleryImages(imgs, slug) {
    const base = `data/_works/${slug}/`;
    return imgs.map(src => /^(?:https?:\/\/|data\/)/.test(src) ? src : base + src);
}

// Construye una sección de galería de proyecto (slider o imagen única + caption).
function gallerySection(name, imgs, slug, titleStr) {
    if (!imgs || !imgs.length) return null;
    const full = resolveGalleryImages(imgs, slug);
    const label = name || "";
    const altBase = `${titleStr} — ${name || "imagen"}`;
    let media;
    if (full.length > 1) {
        media = makeSlider(full, altBase);
        // Ratio adaptativo: el slider se amolda al promedio de su galería
        applyAdaptiveRatio(media, full);
    } else {
        media = el("img", { src: full[0], alt: `${altBase} 1`, loading: "lazy", decoding: "async" });
        zoomable(media, () => full, () => 0);
    }
    return el("section", { class: "project-gallery-section" },
        media,
        label ? el("div", { class: "project-section-title gallery-caption", html: md(label) }) : null,
    );
}

// CV: un PDF por idioma en data/PDF/. Cacheamos el resultado del HEAD por
// ruta para no repetir la comprobación cada vez que se re-renderiza la vista.
const CV_FILES = { es: "cv_es.pdf", en: "cv_en.pdf", ca: "cv_cat.pdf" };
const cvExistsCache = new Map();

function checkCvExists(path) {
    if (cvExistsCache.has(path)) return cvExistsCache.get(path);
    const promise = fetch(path, { method: "HEAD" })
        .then(r => r.ok)
        .catch(() => false);
    cvExistsCache.set(path, promise);
    return promise;
}

// ---------- About ----------
export function renderAbout() {
    const v = $("#viewer-content");
    const a = state.about || {};
    const bio = tfa(a.bio);
    const cvContainer = el("p", { class: "view-about-cv" });
    v.replaceChildren(el("article", { class: "view-about" },
        ...bio.map(p => el("p", { html: md(p) })),
        cvContainer,
        a.image ? el("img", { class: "view-about-image", src: a.image, alt: "", loading: "lazy", decoding: "async" }) : null,
        el("p", { class: "view-about-web" },
            "web:",
            el("a", { href: "https://meowrhino.studio", target: "_blank", rel: "noopener" }, "meowrhino.studio")
        ),
    ));

    const cvFile = CV_FILES[state.lang];
    if (!cvFile) return;
    const cvPath = `data/PDF/${cvFile}`;
    checkCvExists(cvPath).then(ok => {
        if (!ok) return;
        // La vista puede haber cambiado mientras esperábamos el fetch.
        if (!cvContainer.isConnected) return;
        cvContainer.replaceChildren(el("a", { href: cvPath, download: "" }, t("cv")));
    });
}

const ICON_EMAIL = `<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5"><rect x="2.5" y="5" width="19" height="14" rx="2"></rect><polyline points="2.5,6.5 12,13 21.5,6.5"></polyline></svg>`;
const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"></circle></svg>`;

// ---------- Contact ----------
export function renderContact() {
    const v = $("#viewer-content");
    const c = state.about?.contact || {};
    const email = c.email ? c.email.replace(" [@] ", "@") : null;
    v.replaceChildren(el("article", { class: "view-contact" },
        c.image ? el("img", { class: "view-contact-image", src: c.image, alt: "", loading: "lazy", decoding: "async" }) : null,
        email ? el("p", {},
            el("span", { class: "contact-icon", "aria-hidden": "true", html: ICON_EMAIL }),
            el("a", { href: safeHref(`mailto:${email}`) }, email)
        ) : null,
        (c.instagram || c.instagram_url) ? el("p", {},
            el("span", { class: "contact-icon", "aria-hidden": "true", html: ICON_INSTAGRAM }),
            c.instagram_url
                ? el("a", { href: safeHref(c.instagram_url), target: "_blank", rel: "noopener" }, c.instagram || "instagram")
                : c.instagram
        ) : null,
    ));
}

// ---------- News ----------
export function renderNews() {
    const v = $("#viewer-content");
    const items = state.news || [];
    v.replaceChildren(el("div", { class: "view-news" },
        ...items.map(n => {
            const titleStr = tf(n.title) || "";
            const media = itemMedia(n, titleStr);
            return el("article", { class: "news-item" },
                el("div", { class: "news-media" }, media),
                el("div", { class: "news-body" },
                    n.year ? el("div", { class: "news-year" }, String(n.year)) : null,
                    titleStr ? el("div", { class: "news-title", html: md(titleStr) }) : null,
                    n.description ? el("div", { class: "news-desc" }, ...richParagraphs(n.description)) : null,
                    linkList(n.links, "news-links"),
                )
            );
        })
    ));
}

// ---------- Publications ----------
export function renderPublications() {
    const v = $("#viewer-content");
    const items = state.publications || [];
    v.replaceChildren(el("div", { class: "view-publications" },
        ...items.map(p => {
            const titleStr = tf(p.title) || "";
            return el("article", { class: "pub-item" },
                el("div", { class: "pub-body" },
                    el("h3", { html: md(p.year ? `${p.year}. ${titleStr}` : titleStr) }),
                    p.description ? el("div", { class: "pub-desc" }, ...richParagraphs(p.description)) : null,
                    linkList(p.links, "pub-links"),
                ),
                el("div", { class: "pub-media" }, itemMedia(p, titleStr))
            );
        })
    ));
}

// Botón "ver más" / "ver menos" + bloque de info adicional colapsable.
// Devuelve [botón, div] listos para insertar en el árbol.
function infoMoreToggle(paragraphs) {
    const more = el("div", { class: "project-info project-info-more", hidden: "" }, ...paragraphs);
    const btn = el("button", { class: "project-more-toggle", "aria-expanded": "false" }, t("see_more"));
    btn.addEventListener("click", () => {
        const isHidden = more.hidden;
        more.hidden = !isHidden;
        btn.setAttribute("aria-expanded", String(isHidden));
        btn.textContent = isHidden ? t("see_less") : t("see_more");
    });
    return [btn, more];
}

// ---------- Project ----------
export function renderProject(slug) {
    const v = $("#viewer-content");
    const p = findProject(slug);
    if (!p) {
        v.replaceChildren(el("p", { class: "muted" }, `Proyecto no encontrado: ${slug}`));
        return;
    }
    if (!p.published) {
        v.replaceChildren(el("p", { class: "muted" }, `${tf(p.title)} — ${t("soon")}`));
        return;
    }

    const titleStr = tf(p.title);
    const ficha = p.ficha_tecnica || {};
    const fichaLine = [ficha.year, tf(ficha.type), ficha.duration].filter(Boolean).join(" · ");
    const info = richParagraphs(p.info);
    const infoMore = richParagraphs(p.info_colapsable);
    const creditos = richParagraphs(p.creditos);
    // Solo se aceptan pares bien formados: una entrada rota no debe tirar toda la obra.
    const links = (Array.isArray(p.links) ? p.links : [])
        .filter(l => Array.isArray(l) && l[0] && l[1]);
    const gallerys = (Array.isArray(p.gallerys) ? p.gallerys : [])
        .filter(g => Array.isArray(g) && Array.isArray(g[1]));
    const trailerNode = vimeoEmbed(p.trailer || p.video);
    // trailer_pos: "antes" muestra el trailer antes de las galerías; por defecto va después.
    const trailerBefore = ["antes", "pre"].includes((p.trailer_pos || "").toLowerCase());

    v.replaceChildren(el("article", { class: "view-project" },
        el("header", { class: "project-header" },
            el("h2", { html: md(titleStr) }),
            fichaLine ? el("div", { class: "project-meta" }, fichaLine) : null,
        ),
        info.length
            ? el("div", { class: "project-info" }, ...info)
            : null,
        ...(infoMore.length ? infoMoreToggle(infoMore) : []),
        links.length
            ? el("div", { class: "project-links" },
                ...links.map(([name, url]) => el("a", { href: safeHref(url), target: "_blank", rel: "noopener" }, `↗ ${name}`))
            )
            : null,
        trailerBefore ? trailerNode : null,
        ...gallerys.map(([name, imgs]) => gallerySection(name, imgs, p.slug, titleStr)),
        trailerBefore ? null : trailerNode,
        creditos.length
            ? el("div", { class: "project-credits" },
                el("div", { class: "project-section-title" }, t("credits")),
                ...creditos
            )
            : null,
    ));
}

// ---------- Photos ----------
export function renderPhotos() {
    const v = $("#viewer-content");
    const ph = state.photos;
    const count = ph?.count || 0;
    const dir = ph?.dir || "data/_photos/";
    const ext = ph?.ext || "webp";

    if (!count) {
        v.replaceChildren(el("div", { class: "view-photos" },
            el("p", { class: "muted" }, t("no_photos"))
        ));
        return;
    }

    const order = Array.from({ length: count }, (_, i) => i + 1);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    const urls = order.map(n => `${dir}${n}.${ext}`);
    const imgs = urls.map((src, idx) => {
        const im = el("img", {
            src,
            alt: `diary ${idx + 1}`,
            loading: "lazy",
            decoding: "async",
            on: { error: (e) => e.currentTarget.classList.add("is-missing") },
        });
        zoomable(im, () => urls, () => idx);
        return im;
    });
    const wrap = el("div", { class: "view-photos" }, ...imgs);
    // En desktop: convertir scroll vertical (rueda) en scroll horizontal.
    // En móvil la rueda no aplica y el flex pasa a columna (ver CSS).
    wrap.addEventListener("wheel", (e) => {
        // Si la galería ya no puede scrollear horizontal (móvil apilado), no hacemos nada.
        if (wrap.scrollWidth <= wrap.clientWidth) return;
        // Priorizar el delta dominante; algunos trackpads dan deltaX también.
        const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (delta === 0) return;
        wrap.scrollLeft += delta;
        e.preventDefault();
    }, { passive: false });
    v.replaceChildren(wrap);
}
