// Router + init. Default view = "news". Fade suave al cambiar de vista.

import { $ } from "./dom.js";
import { state, loadAll, setView as setStateView } from "./data.js";
import { renderMenu, setHandlers } from "./menu.js";
import { shouldShowWelcome, startWelcome, skipWelcome } from "./welcome.js";
import {
    renderAbout, renderContact, renderNews,
    renderPublications, renderProject, renderPhotos,
} from "./views.js";

const VIEWS = new Set(["news", "publications", "photos", "about", "contact", "project"]);
const DEFAULT_VIEW = "news";
const FADE_MS = 180;

function readHash() {
    const h = location.hash.replace(/^#/, "");
    if (!h) return { view: DEFAULT_VIEW };
    const [view, ...rest] = h.split("/");
    return { view, payload: rest.join("/") || undefined };
}

let prevKey = null;

function viewKey() {
    return `${state.view}:${location.hash}`;
}

function setView(view, payload) {
    if (!VIEWS.has(view)) view = DEFAULT_VIEW;
    setStateView(view);
    const hash = `#${view}${payload ? "/" + payload : ""}`;
    if (location.hash !== hash) history.pushState({ view, payload }, "", hash);
    fadeRender();
    document.getElementById("viewer")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function navigate(view, payload) {
    if (view === "project") setView("project", payload);
    else setView(view);
}

function setLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    // Cambio de idioma → no fade (mismo contenido, refresco directo)
    renderNow();
}

function dispatch() {
    const { view, payload } = readHash();
    const v = view || state.view;
    switch (v) {
        case "about":        return renderAbout();
        case "contact":      return renderContact();
        case "news":         return renderNews();
        case "publications": return renderPublications();
        case "photos":       return renderPhotos();
        case "project":      return renderProject(payload);
        default:             return renderNews();
    }
}

function renderNow() {
    renderMenu();
    dispatch();
}

function fadeRender() {
    const key = viewKey();
    if (prevKey === null) {
        // Primera vez — sin fade
        prevKey = key;
        renderNow();
        return;
    }
    if (prevKey === key) {
        // Misma vista (p. ej. solo re-render por idioma) — directo
        renderNow();
        return;
    }
    prevKey = key;
    const vc = $("#viewer-content");
    vc.classList.add("is-leaving");
    setTimeout(() => {
        renderNow();
        // forzar reflow para que la transición de entrada cuente
        vc.classList.remove("is-leaving");
    }, FADE_MS);
}

window.addEventListener("hashchange", () => {
    const { view } = readHash();
    setStateView(VIEWS.has(view) ? view : DEFAULT_VIEW);
    fadeRender();
});

function startApp() {
    const { view } = readHash();
    setStateView(VIEWS.has(view) ? view : DEFAULT_VIEW);
    prevKey = null;
    fadeRender();
}

async function init() {
    try {
        await loadAll();
        setHandlers({ navigate, lang: setLang });

        if (shouldShowWelcome()) {
            startWelcome();
            document.addEventListener("welcome:done", startApp, { once: true });
        } else {
            skipWelcome();
            startApp();
        }
    } catch (err) {
        console.error(err);
        $("#viewer-content")?.replaceChildren(
            Object.assign(document.createElement("p"), {
                className: "muted",
                textContent: "Error cargando datos: " + err.message,
            })
        );
        $("#welcome").hidden = true;
        $("#app").hidden = false;
    }
}

init();
