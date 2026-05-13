// Router + init. Decide welcome vs SPA. Sin vista home: la default es "news".

import { $ } from "./dom.js";
import { state, loadAll } from "./data.js";
import { renderMenu, setHandlers } from "./menu.js";
import { shouldShowWelcome, startWelcome, skipWelcome } from "./welcome.js";
import {
    renderAbout, renderContact, renderNews,
    renderPublications, renderProject, renderPhotos,
} from "./views.js";

const VIEWS = new Set(["news", "publications", "photos", "about", "contact", "project"]);
const DEFAULT_VIEW = "news";

function readHash() {
    const h = location.hash.replace(/^#/, "");
    if (!h) return { view: DEFAULT_VIEW };
    const [view, ...rest] = h.split("/");
    return { view, payload: rest.join("/") || undefined };
}

function setView(view, payload) {
    if (!VIEWS.has(view)) view = DEFAULT_VIEW;
    state.view = view;
    document.body.dataset.view = view;
    const hash = `#${view}${payload ? "/" + payload : ""}`;
    if (location.hash !== hash) history.pushState({ view, payload }, "", hash);
    render();
    document.getElementById("viewer")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function navigate(view, payload) {
    if (view === "project") setView("project", payload);
    else setView(view);
}

function setLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    render();
}

function render() {
    renderMenu();
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

window.addEventListener("hashchange", () => {
    const { view } = readHash();
    state.view = VIEWS.has(view) ? view : DEFAULT_VIEW;
    document.body.dataset.view = state.view;
    render();
});

function startApp() {
    const { view } = readHash();
    state.view = VIEWS.has(view) ? view : DEFAULT_VIEW;
    document.body.dataset.view = state.view;
    render();
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
