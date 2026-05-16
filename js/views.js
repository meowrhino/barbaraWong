// Renderers de cada vista.

import { $, el } from "./dom.js";
import { state, t, tf, tfa, findProject } from "./data.js";
import { openLightbox } from "./lightbox.js";

// ---------- Helpers ----------
function zoomable(img, getGallery, getIndex) {
    img.classList.add("is-zoomable");
    img.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(getGallery(), getIndex());
    });
}

function makeSlider(images, altBase = "") {
    let i = 0;
    const img = el("img", { src: images[0], alt: altBase ? `${altBase} 1` : "", loading: "lazy" });
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
function applyAdaptiveRatio(sliderEl, imageUrls) {
    if (!sliderEl || !imageUrls || imageUrls.length === 0) return;
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

// ---------- About ----------
export function renderAbout() {
    const v = $("#viewer-content");
    const bio = tfa(state.about?.bio);
    v.replaceChildren(el("article", { class: "view-about" },
        ...bio.map(p => el("p", {}, p))
    ));
}

// ---------- Contact ----------
export function renderContact() {
    const v = $("#viewer-content");
    const c = state.about?.contact || {};
    v.replaceChildren(el("article", { class: "view-contact" },
        c.email ? el("p", {}, el("a", { href: `mailto:${c.email.replace(" [@] ", "@")}` }, c.email)) : null,
        (c.instagram || c.instagram_url) ? el("p", {},
            c.instagram_url
                ? el("a", { href: c.instagram_url, target: "_blank", rel: "noopener" }, c.instagram || "instagram")
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
            const singleSrc = n.image || n.images?.[0];
            let media = null;
            if (n.images?.length > 1) {
                media = makeSlider(n.images, titleStr);
            } else if (singleSrc) {
                media = el("img", { src: singleSrc, alt: titleStr, loading: "lazy" });
                zoomable(media, () => [singleSrc], () => 0);
            }
            return el("article", { class: "news-item" },
                el("div", { class: "news-media" }, media),
                el("div", { class: "news-body" },
                    n.year ? el("div", { class: "news-year" }, String(n.year)) : null,
                    titleStr ? el("div", { class: "news-title" }, titleStr) : null,
                    n.description ? el("div", { class: "news-desc" }, tf(n.description)) : null,
                    n.links?.length ? el("div", { class: "news-links" },
                        ...n.links.map((u, i) => el("a", { href: u, target: "_blank", rel: "noopener" },
                            i === 0 ? "↗ link" : `↗ link ${i + 1}`
                        ))
                    ) : null,
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
                    el("h3", {}, p.year ? `${p.year}. ${titleStr}` : titleStr),
                    p.description ? el("div", { class: "pub-desc" }, tf(p.description)) : null,
                    p.links?.length ? el("div", { class: "pub-links" },
                        ...p.links.map((u, i) => el("a", { href: u, target: "_blank", rel: "noopener" },
                            i === 0 ? "↗ link" : `↗ link ${i + 1}`
                        ))
                    ) : null,
                ),
                el("div", { class: "pub-media" }, (() => {
                    const singleSrc = p.image || p.images?.[0];
                    if (p.images?.length > 1) return makeSlider(p.images, titleStr);
                    if (!singleSrc) return null;
                    const im = el("img", { src: singleSrc, alt: titleStr, loading: "lazy" });
                    zoomable(im, () => [singleSrc], () => 0);
                    return im;
                })())
            );
        })
    ));
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
    const info = tfa(p.info);
    const creditos = tfa(p.creditos);
    const links = Array.isArray(p.links) ? p.links : [];
    const gallerys = Array.isArray(p.gallerys) ? p.gallerys : [];

    v.replaceChildren(el("article", { class: "view-project" },
        el("header", { class: "project-header" },
            el("h2", {}, titleStr),
            fichaLine ? el("div", { class: "project-meta" }, fichaLine) : null,
        ),
        info.length
            ? el("div", { class: "project-info" }, ...info.map(par => el("p", {}, par)))
            : null,
        links.length
            ? el("div", { class: "project-links" },
                ...links.map(([name, url]) => el("a", { href: url, target: "_blank", rel: "noopener" }, `↗ ${name}`))
            )
            : null,
        ...gallerys.map(([name, imgs]) => {
            if (!imgs || !imgs.length) return null;
            const label = (name || "").toLowerCase();
            const altBase = `${titleStr} — ${name || "imagen"}`;
            let media;
            if (imgs.length > 1) {
                media = makeSlider(imgs, altBase);
                // Ratio adaptativo: el slider se amolda al promedio de su galería
                applyAdaptiveRatio(media, imgs);
            } else {
                media = el("img", { src: imgs[0], alt: `${altBase} 1`, loading: "lazy" });
                zoomable(media, () => imgs, () => 0);
            }
            return el("section", { class: "project-gallery-section" },
                media,
                label ? el("div", { class: "project-section-title gallery-caption" }, label) : null,
            );
        }),
        vimeoEmbed(p.trailer || p.video),
        creditos.length
            ? el("div", { class: "project-credits" },
                el("div", { class: "project-section-title" }, t("credits")),
                ...creditos.map(c => el("p", {}, c))
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
