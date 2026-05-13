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
    state.about = about;
    state.news = news;
    state.publications = publications;
    state.projects = (projects || []).slice().sort((a, b) => (a.order || 999) - (b.order || 999));
    state.photos = photos;
}

export function findProject(slug) {
    return (state.projects || []).find(p => p.slug === slug);
}
