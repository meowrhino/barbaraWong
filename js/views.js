// Renderers de cada vista.

import { $, el } from "./dom.js";
import { state, t, tf, tfa, findProject } from "./data.js";

// ---------- Helpers ----------
function makeSlider(images, altBase = "") {
    let i = 0;
    const img = el("img", { src: images[0], alt: altBase ? `${altBase} 1` : "", loading: "lazy" });
    const prev = el("button", { class: "slider-btn slider-prev", "aria-label": "anterior" }, "‹");
    const next = el("button", { class: "slider-btn slider-next", "aria-label": "siguiente" }, "›");
    prev.addEventListener("click", () => {
        i = (i - 1 + images.length) % images.length;
        img.src = images[i];
        if (altBase) img.alt = `${altBase} ${i + 1}`;
    });
    next.addEventListener("click", () => {
        i = (i + 1) % images.length;
        img.src = images[i];
        if (altBase) img.alt = `${altBase} ${i + 1}`;
    });
    return el("div", { class: "slider" }, prev, img, next);
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
            return el("article", { class: "news-item" },
                el("div", { class: "news-media" },
                    n.images?.length > 1
                        ? makeSlider(n.images, titleStr)
                        : (n.image || n.images?.[0])
                            ? el("img", { src: n.image || n.images[0], alt: titleStr, loading: "lazy" })
                            : null
                ),
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
                el("div", { class: "pub-media" },
                    p.images?.length > 1
                        ? makeSlider(p.images, titleStr)
                        : (p.image || p.images?.[0])
                            ? el("img", { src: p.image || p.images[0], alt: titleStr, loading: "lazy" })
                            : null
                )
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
        ...gallerys.map(([name, imgs]) =>
            (imgs && imgs.length)
                ? el("section", { class: "project-gallery-section" },
                    name && name !== "fotogramas" ? el("div", { class: "project-section-title" }, name) : null,
                    el("div", { class: "project-gallery" },
                        ...imgs.map((src, idx) => el("img", {
                            src,
                            alt: `${titleStr} — ${name || "imagen"} ${idx + 1}`,
                            loading: "lazy",
                        }))
                    )
                )
                : null
        ),
        vimeoEmbed(p.trailer || p.video),
        creditos.length
            ? el("div", { class: "project-credits" },
                el("div", { class: "project-section-title" }, "credits"),
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

    const imgs = Array.from({ length: count }, (_, i) =>
        el("img", {
            src: `${dir}${i + 1}.${ext}`,
            alt: `photo ${i + 1}`,
            loading: "lazy",
            on: { error: (e) => e.currentTarget.classList.add("is-missing") },
        })
    );
    v.replaceChildren(el("div", { class: "view-photos" }, ...imgs));
}
