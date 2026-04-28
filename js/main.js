// Bárbara Sánchez Barroso — portfolio
// Single-file SPA: loads data.json, builds menu, renders each view in #viewer-content.

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const el = (tag, attrs = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "on" && typeof v === "object") for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
        else if (v !== null && v !== undefined) node.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
        if (kid == null) continue;
        node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return node;
};

const state = {
    lang: "es",
    data: null,
    about: null,
    news: null,
    publications: null,
    projects: null,
    photos: null,
    view: "home",
};

const I18N = {
    about:        { es: "About",        en: "About",        ca: "About" },
    news:         { es: "News",         en: "News",         ca: "News" },
    work:         { es: "Work",         en: "Work",         ca: "Obra" },
    publications: { es: "Publications", en: "Publications", ca: "Publicacions" },
    photo:        { es: "Photo",        en: "Photo",        ca: "Photo" },
    back:         { es: "← back",       en: "← back",       ca: "← back" },
    no_photos:    { es: "Aún no hay fotos en el journal.", en: "No photos yet.", ca: "Encara no hi ha fotos." },
};
const t = (k) => (I18N[k] && I18N[k][state.lang]) || I18N[k]?.es || k;

// ---------- Data loading ----------
async function loadJSON(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
}

async function loadAll() {
    state.data = await loadJSON("data/data.json");
    const sources = state.data.sources;
    const [about, news, publications, projects, photos] = await Promise.all([
        loadJSON(sources.about).catch(() => null),
        loadJSON(sources.news).catch(() => null),
        loadJSON(sources.publications).catch(() => null),
        loadJSON(sources.projects).catch(() => null),
        loadJSON(sources.photos).catch(() => null),
    ]);
    state.about = about;
    state.news = news;
    state.publications = publications;
    state.projects = projects;
    state.photos = photos;
}

function loadProject(slug) {
    return (state.projects || []).find(p => p.slug === slug);
}

// ---------- Router ----------
function setView(view, payload) {
    state.view = view;
    document.body.dataset.view = view;
    history.replaceState({ view, payload }, "", `#${view}${payload ? "/" + payload : ""}`);
    render();
}

function readHash() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) return { view: "home" };
    const [view, ...rest] = hash.split("/");
    return { view, payload: rest.join("/") || undefined };
}

window.addEventListener("hashchange", () => {
    const { view, payload } = readHash();
    state.view = view;
    document.body.dataset.view = view;
    render();
});

// ---------- Menu ----------
function renderMenu() {
    // Sections
    const sections = state.data.menu.filter(m => m.key !== "work");
    const ul = $("#menu-sections ul");
    ul.replaceChildren(...sections.map(s =>
        el("li", {},
            el("a", {
                href: `#${s.key}`,
                "data-section": s.key,
                class: state.view === s.key ? "is-active" : "",
            }, s.label[state.lang] || s.label.es)
        )
    ));
    // Heading "Work" + collapsible toggle
    const heading = $(".menu-heading");
    heading.textContent = t("work");
    const worksNav = $("#menu-works");
    const toggleWorks = () => {
        worksNav.classList.toggle("is-open");
        heading.setAttribute("aria-expanded", worksNav.classList.contains("is-open"));
    };
    heading.onclick = toggleWorks;
    heading.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleWorks(); }
    };
    // Auto-open when on a project view
    if (state.view === "project") worksNav.classList.add("is-open");
    heading.setAttribute("aria-expanded", worksNav.classList.contains("is-open"));
    // Works list
    const works = state.projects || [];
    const ol = $("#works-list");
    ol.replaceChildren(...works.map(w =>
        el("li", {
            class: [
                w.published ? "" : "is-unpublished",
                state.view === "project" && location.hash.includes(w.slug) ? "is-active" : "",
            ].filter(Boolean).join(" "),
            "data-slug": w.slug,
            on: w.published ? { click: () => setView("project", w.slug) } : {},
            title: w.published ? "" : "Próximamente",
        }, w.title)
    ));
    // Title click → home
    $("#site-title").addEventListener("click", () => setView("home"), { once: false });
    // Back button
    $("#back-btn").textContent = t("back");
    $("#back-btn").onclick = () => setView("home");
    // Lang switch
    $$(".lang-btn").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.lang === state.lang);
        btn.onclick = () => {
            state.lang = btn.dataset.lang;
            document.documentElement.lang = state.lang;
            renderMenu();
            render();
        };
    });
}

// ---------- Views ----------
function renderHome() {
    const v = $("#viewer-content");
    const published = (state.projects || []).filter(p => p.published);
    if (!published.length) {
        v.replaceChildren(el("div", { class: "view-home is-air" }, el("p", {}, "—")));
        return;
    }
    const p = published[Math.floor(Math.random() * published.length)];
    const src = p.images && p.images[0];
    const air = `${(Math.random() * 15 + 3).toFixed(1)}vmin`;
    const wrap = el("div", { class: "view-home is-air", style: `--air: ${air}` });
    if (src) {
        const img = el("img", {
            src,
            alt: p.title,
            class: "hero-media",
            on: { click: () => setView("project", p.slug) },
        });
        wrap.appendChild(img);
    }
    v.replaceChildren(wrap);
}

function renderAbout() {
    const v = $("#viewer-content");
    const bio = state.about?.bio?.[state.lang]?.length
        ? state.about.bio[state.lang]
        : (state.about?.bio?.es || []);
    const contact = state.about?.contact;
    v.replaceChildren(el("article", { class: "view-about" },
        ...bio.map(p => el("p", {}, p)),
        contact ? el("div", { class: "contact" },
            el("p", {}, `${contact.email}`),
            el("p", {},
                contact.instagram_url
                    ? el("a", { href: contact.instagram_url, target: "_blank", rel: "noopener" }, contact.instagram)
                    : contact.instagram
            ),
        ) : null
    ));
}

function renderNews() {
    const v = $("#viewer-content");
    const items = state.news || [];
    v.replaceChildren(el("div", { class: "view-news" },
        ...items.map(n => el("article", { class: "news-item" },
            n.image ? el("div", {}, el("img", { src: n.image, alt: n.title || "", loading: "lazy" })) : el("div"),
            el("div", {},
                n.year ? el("div", { class: "news-year" }, n.year) : null,
                n.title ? el("div", { class: "news-title" }, n.title) : null,
                n.description ? el("div", { class: "news-desc" }, n.description) : null,
                n.links?.length ? el("div", { class: "news-links" },
                    ...n.links.map((u, i) => el("a", { href: u, target: "_blank", rel: "noopener" },
                        i === 0 ? "↗ link" : `↗ link ${i + 1}`
                    ))
                ) : null,
            )
        ))
    ));
}

function renderPublications() {
    const v = $("#viewer-content");
    const items = state.publications || [];
    v.replaceChildren(el("div", { class: "view-publications" },
        ...items.map(p => el("article", { class: "pub-item" },
            el("div", {},
                el("h3", {}, p.year ? `${p.year}. ${p.title}` : (p.title || "")),
                p.description ? el("div", { class: "pub-desc" }, p.description) : null,
                p.links?.length ? el("div", { class: "pub-links" },
                    ...p.links.map((u, i) => el("a", { href: u, target: "_blank", rel: "noopener" },
                        i === 0 ? "↗ link" : `↗ link ${i + 1}`
                    ))
                ) : null,
            ),
            p.image ? el("div", {}, el("img", { src: p.image, alt: p.title || "", loading: "lazy" })) : el("div"),
        ))
    ));
}

function renderWorkIndex() {
    const v = $("#viewer-content");
    const works = state.projects || [];
    v.replaceChildren(el("div", { class: "view-news" },
        ...works.map(w =>
            el("article", { class: "news-item" },
                el("div"),
                el("div", {},
                    el("div", { class: "news-title" }, w.title),
                    el("div", { class: "news-desc" }, w.published ? "Click on the title in the menu →" : "(Próximamente)"),
                )
            )
        )
    ));
}

function renderProject(slug) {
    const v = $("#viewer-content");
    const p = loadProject(slug);
    if (!p) {
        v.replaceChildren(el("p", { class: "news-desc" }, `Proyecto no encontrado: ${slug}`));
        return;
    }
    if (!p.published) {
        v.replaceChildren(el("p", { class: "news-desc" }, `${p.title} — próximamente`));
        return;
    }
    const info = p.info || {};
    const metaLine = [info.year, info.type, info.duration].filter(Boolean).join(" · ");
    const vimeoId = (p.video || "").match(/vimeo\.com\/(\d+)/)?.[1];
    v.replaceChildren(el("article", { class: "view-project" },
        // 1. Info técnica
        el("header", { class: "project-header" },
            el("h2", {}, p.title),
            metaLine ? el("div", { class: "project-meta" }, metaLine) : null,
        ),
        // 2. Texto
        p.text ? el("div", { class: "project-text" }, p.text) : null,
        // 3. Imágenes / fotogramas
        p.images?.length
            ? el("div", { class: "project-gallery" },
                ...p.images.map(src => el("img", { src, alt: "", loading: "lazy" }))
            )
            : null,
        // 4. Video (Vimeo trailer)
        vimeoId
            ? el("div", { class: "project-vimeo" },
                el("iframe", {
                    src: `https://player.vimeo.com/video/${vimeoId}`,
                    allow: "autoplay; fullscreen; picture-in-picture",
                    loading: "lazy",
                    referrerpolicy: "strict-origin-when-cross-origin",
                })
            )
            : null,
        // 5. Exhibition views (a veces)
        p.exhibition_views?.length
            ? el("section", {},
                el("div", { class: "project-section-title" }, "Exhibition views"),
                el("div", { class: "project-gallery" },
                    ...p.exhibition_views.map(src => el("img", { src, alt: "", loading: "lazy" }))
                ),
            )
            : null,
    ));
}

function renderPhotos() {
    const v = $("#viewer-content");
    const photos = state.photos?.photos || [];
    if (!photos.length) {
        v.replaceChildren(el("div", { class: "view-photos" },
            el("div", { class: "photos-empty" }, t("no_photos"))
        ));
        return;
    }
    v.replaceChildren(el("div", { class: "view-photos" },
        ...photos.map(p => el("img", {
            src: typeof p === "string" ? p : p.src,
            alt: typeof p === "object" && p.caption ? p.caption : "",
            loading: "lazy",
        }))
    ));
}

function render() {
    renderMenu();
    const { view, payload } = readHash();
    switch (view || state.view) {
        case "about":        return renderAbout();
        case "news":         return renderNews();
        case "publications": return renderPublications();
        case "work":         return renderWorkIndex();
        case "photo":        return renderPhotos();
        case "project":      return renderProject(payload);
        default:             return renderHome();
    }
}

// ---------- Init ----------
loadAll().then(() => {
    const { view, payload } = readHash();
    state.view = view || "home";
    document.body.dataset.view = state.view;
    render();
}).catch(err => {
    console.error(err);
    $("#viewer-content").replaceChildren(el("p", { class: "news-desc" },
        "Error cargando datos: " + err.message));
});
