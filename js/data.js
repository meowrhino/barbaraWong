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

async function loadJSON(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
}

export async function loadAll() {
    state.data = await loadJSON("data/data.json");
    const s = state.data.sources;
    const [menu, about, news, publications, projects, photos] = await Promise.all([
        loadJSON(s.menu).catch(() => null),
        loadJSON(s.about).catch(() => null),
        loadJSON(s.news).catch(() => null),
        loadJSON(s.publications).catch(() => null),
        loadJSON(s.projects).catch(() => null),
        loadJSON(s.photos).catch(() => null),
    ]);
    state.menu = menu || [];
    state.about = about || {};
    state.news = news || [];
    state.publications = publications || [];
    state.projects = projects || [];
    state.photos = photos || {};
    initLang();
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

// Actualiza <link rel="canonical">. Si la URL tiene ?lang= válido apunta a
// https://barbarawong.info/?lang=xx; si no, a la raíz. Nunca incluye el hash.
export function updateCanonical() {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) return;
    const allowed = state.data?.site?.languages || ["es", "en", "ca"];
    let lang = null;
    try {
        const p = new URLSearchParams(location.search).get("lang");
        if (allowed.includes(p)) lang = p;
    } catch {}
    link.setAttribute(
        "href",
        lang
            ? `https://barbarawong.info/?lang=${lang}`
            : "https://barbarawong.info/"
    );
}

export function findProject(slug) {
    return (state.projects || []).find(p => p.slug === slug);
}

// Setter centralizado para evitar mutaciones dispersas y mantener data-view en body sincronizado.
export function setView(view) {
    state.view = view;
    document.body.dataset.view = view;
}
