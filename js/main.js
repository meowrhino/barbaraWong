// Router + init. Default view = "news". Fade suave al cambiar de vista.

import { $ } from "./dom.js";
import { state, loadAll, setView as setStateView, updateCanonical, readRoute, routeHref, VIEWS as VIEW_LIST, DEFAULT_VIEW } from "./data.js";
import { BUILT } from "./carga.js";
import { renderMenu, setHandlers } from "./menu.js";
import { shouldShowWelcome, startWelcome, skipWelcome } from "./welcome.js";
import {
    renderAbout, renderContact, renderNews,
    renderPublications, renderProject, renderPhotos,
} from "./views.js";
import { initLightbox } from "./lightbox.js";

const VIEWS = new Set(VIEW_LIST);
const FADE_MS = 180;
const readHash = readRoute; // la vista: de la dirección (web construida) o del #

let prevKey = null;

function viewKey() {
    return `${state.view}:${location.pathname}${location.hash}`;
}

function setView(view, payload) {
    if (!VIEWS.has(view)) view = DEFAULT_VIEW;
    setStateView(view);
    const href = routeHref(view, payload);
    if (BUILT) {
        const url = new URL(href, document.baseURI);
        if (location.pathname !== url.pathname || location.hash) history.pushState({ view, payload }, "", url.pathname + location.search);
    } else if (location.hash !== href) history.pushState({ view, payload }, "", href);
    updateCanonical();
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
    try { localStorage.setItem("lang", lang); } catch {}
    // Reflejar el idioma en la URL (?lang=xx) preservando el hash actual.
    try {
        const url = new URL(location.href);
        url.searchParams.set("lang", lang);
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
    } catch {}
    updateCanonical();
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

function onRouteChange() {
    const { view } = readHash();
    setStateView(VIEWS.has(view) ? view : DEFAULT_VIEW);
    updateCanonical();
    fadeRender();
}
window.addEventListener("hashchange", onRouteChange);
window.addEventListener("popstate", () => { if (BUILT) onRouteChange(); });

function startApp() {
    const { view, payload } = readHash();
    // un enlace de antes (#about, #project/x) en la web construida: a su dirección limpia
    if (BUILT && location.hash && VIEWS.has(view)) {
        history.replaceState(null, "", new URL(routeHref(view, payload), document.baseURI).pathname + location.search);
    }
    setStateView(VIEWS.has(view) ? view : DEFAULT_VIEW);
    prevKey = null;
    fadeRender();
}

async function init() {
    try {
        await loadAll();
        setHandlers({ navigate, lang: setLang });
        initLightbox();

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
