// Estado global, i18n, carga de JSON.

export const state = {
    lang: "es",
    data: null,
    menu: null,
    about: null,
    news: null,
    publications: null,
    projects: null,
    photos: null,
    view: "news",
};

export const I18N = {
    open_menu:    { es: "ver menú",     en: "see menu",     ca: "veure menú" },
    close_menu:   { es: "cerrar menú",  en: "close menu",   ca: "tancar menú" },
    no_photos:    { es: "Aún no hay fotos.", en: "No photos yet.", ca: "Encara no hi ha fotos." },
    soon:         { es: "(próximamente)",    en: "(coming soon)",  ca: "(properament)" },
    credits:      { es: "créditos",     en: "credits",      ca: "crèdits" },
    see_more:     { es: "ver más",      en: "see more",     ca: "veure més" },
    see_less:     { es: "ver menos",    en: "see less",     ca: "veure menys" },
    cv:           { es: "ver CV",       en: "see CV",       ca: "veure CV" },
};

export const t  = (k) => (I18N[k] && I18N[k][state.lang]) || I18N[k]?.es || k;

export const tf = (val) => {
    if (val == null) return "";
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (Array.isArray(val)) return val.join("\n");
    return val[state.lang] || val.es || val.en || val.ca || "";
};

// Devuelve un array localizado. Cae al siguiente idioma cuando el array está vacío.
export const tfa = (val) => {
    if (val == null) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val ? [val] : [];
    const order = [state.lang, "es", "en", "ca"];
    for (const lang of order) {
        const v = val[lang];
        if (Array.isArray(v) && v.length) return v;
        if (typeof v === "string" && v) return [v];
    }
    return [];
};

import { BUILT, loadData } from "./carga.js";

export async function loadAll() {
    const d = await loadData();
    state.data = d.data;
    state.menu = d.menu || [];
    state.about = d.about || {};
    state.news = d.news || [];
    state.publications = d.publications || [];
    state.projects = d.projects || [];
    state.photos = d.photos || {};
    initLang();
}

// ---------- Las direcciones ----------
// En la web construida cada vista tiene la suya, limpia: ./ (news),
// publications/, photos/, about/, contact/ y <slug>/ para un proyecto, con
// <base> en la raíz. En la vista previa (y los enlaces de antes), #vista/slug.

export const VIEWS = ["news", "publications", "photos", "about", "contact", "project"];
export const DEFAULT_VIEW = "news";

export function routeHref(view, payload) {
    if (!BUILT) return `#${view}${payload ? "/" + payload : ""}`;
    if (view === "project") return `${encodeURIComponent(payload)}/`;
    return view === DEFAULT_VIEW ? "./" : `${view}/`;
}

// la parte de la dirección después de la base: "", "about", "els-peregrins"…
function relPath() {
    const base = new URL(document.baseURI).pathname;
    const p = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : "";
    try { return decodeURIComponent(p).replace(/\/$/, ""); } catch { return p.replace(/\/$/, ""); }
}

export function readRoute() {
    const h = location.hash.replace(/^#/, "");
    if (h || !BUILT) {
        if (!h) return { view: DEFAULT_VIEW };
        const [view, ...rest] = h.split("/");
        const raw = rest.join("/");
        let payload = raw || undefined;
        try { if (raw) payload = decodeURIComponent(raw); } catch {}
        return { view, payload };
    }
    const rel = relPath();
    if (!rel) return { view: DEFAULT_VIEW };
    if (VIEWS.includes(rel)) return { view: rel };
    return { view: "project", payload: rel };
}

// Precedencia del idioma inicial:
//   1) parámetro ?lang= de la URL (si es uno de los idiomas del sitio)
//   2) localStorage
//   3) idioma por defecto del sitio
// Si llega un parámetro válido, se persiste también en localStorage.
export function initLang() {
    const allowed = state.data?.site?.languages || ["es", "en", "ca"];
    const fallback = state.data?.site?.default_lang || "es";

    let fromUrl = null;
    try {
        const p = new URLSearchParams(location.search).get("lang");
        if (allowed.includes(p)) fromUrl = p;
    } catch {}

    let saved = null;
    try {
        saved = localStorage.getItem("lang");
    } catch {}

    let lang;
    if (fromUrl) {
        lang = fromUrl;
        try { localStorage.setItem("lang", lang); } catch {}
    } else if (allowed.includes(saved)) {
        lang = saved;
    } else {
        lang = fallback;
    }

    state.lang = lang;
    document.documentElement.lang = lang;
    updateCanonical();
}

// Actualiza <link rel="canonical">: la dirección de la vista (en la web
// construida; en la vista previa, la raíz) con ?lang= si la URL lo lleva.
// Nunca incluye el hash.
export function updateCanonical() {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) return;
    const allowed = state.data?.site?.languages || ["es", "en", "ca"];
    let lang = null;
    try {
        const p = new URLSearchParams(location.search).get("lang");
        if (allowed.includes(p)) lang = p;
    } catch {}
    const site = window.__SITE__ || "https://barbarawong.info";
    const base = new URL(document.baseURI).pathname;
    const path = BUILT && location.pathname.startsWith(base) ? location.pathname.slice(base.length) : "";
    link.setAttribute("href", `${site}/${path}${lang ? `?lang=${lang}` : ""}`);
}

export function findProject(slug) {
    return (state.projects || []).find(p => p.slug === slug);
}

// Setter centralizado para evitar mutaciones dispersas y mantener data-view en body sincronizado.
export function setView(view) {
    state.view = view;
    document.body.dataset.view = view;
}
