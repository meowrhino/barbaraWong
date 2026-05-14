// Menú: render, persiana móvil, lang switch, label activo, toggle works.

import { $, $$, el, cx, bindOnce } from "./dom.js";
import { state, t, tf } from "./data.js";
import { showWelcomeAgain } from "./welcome.js";

const MOBILE_MQ = window.matchMedia("(max-width: 768px)");

let onNavigate = () => {};
let onLang = () => {};

// Works: plegado por defecto siempre (desktop y móvil).
let worksOpen = false;

export function setHandlers({ navigate, lang }) {
    onNavigate = navigate;
    onLang = lang;
}

export function renderMenu() {
    renderSections();
    renderActiveLabel();
    renderLangSwitch();
    bindToggle();
}

function renderSections() {
    const items = state.menu || [];
    const ul = $("#menu-sections ul");
    ul.replaceChildren(...items.map(m => {
        if (m.key === "works") return renderWorksSection(m);
        const isActive = state.view === m.key;
        return el("li", { class: "menu-section" },
            el("a", {
                href: `#${m.key}`,
                "data-section": m.key,
                class: isActive ? "is-active" : "",
                on: { click: (e) => {
                    e.preventDefault();
                    onNavigate(m.key);
                    closePersiana();
                } },
            }, tf(m.label))
        );
    }));
}

function renderWorksSection(m) {
    const inWorks = state.view === "project";
    const cls = cx("menu-section", "menu-works", worksOpen && "is-open", inWorks && "is-active");

    const header = el("button", {
        class: "menu-works-toggle",
        type: "button",
        "aria-expanded": worksOpen ? "true" : "false",
        on: { click: (e) => {
            worksOpen = !worksOpen;
            const li = e.currentTarget.closest(".menu-works");
            if (li) li.classList.toggle("is-open", worksOpen);
            e.currentTarget.setAttribute("aria-expanded", worksOpen ? "true" : "false");
        } },
    }, tf(m.label));

    const inner = el("ol", { class: "works-list-inner" },
        ...(state.projects || []).map(w => {
            const slug = w.slug;
            const active = state.view === "project" && location.hash === `#project/${slug}`;
            const liCls = cx("work-item", !w.published && "is-unpublished", active && "is-active");
            return el("li", {
                class: liCls,
                "data-slug": slug,
                title: w.published ? "" : t("soon"),
                on: w.published ? { click: () => { onNavigate("project", slug); closePersiana(); } } : {},
            }, tf(w.title));
        })
    );
    const list = el("div", { class: "works-list" }, inner);

    return el("li", { class: cls }, header, list);
}

function renderActiveLabel() {
    const lbl = $("#nav-active");
    if (!lbl) return;
    const key = state.view === "project" ? "works" : state.view;
    const entry = (state.menu || []).find(m => m.key === key);
    lbl.textContent = entry ? tf(entry.label) : "";
}

function renderLangSwitch() {
    $$(".lang-btn").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.lang === state.lang);
        bindOnce(btn, n => n.addEventListener("click", () => {
            if (n.dataset.lang === state.lang) return;
            onLang(n.dataset.lang);
        }));
    });
}

function bindToggle() {
    const toggle = $("#nav-toggle");
    const nav = $("#nav");

    bindOnce(toggle, n => n.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = nav.classList.toggle("is-open");
        n.setAttribute("aria-expanded", open ? "true" : "false");
        n.textContent = open ? t("close_menu") : t("open_menu");
    }));
    toggle.textContent = nav.classList.contains("is-open") ? t("close_menu") : t("open_menu");

    bindOnce($("#site-name"), n => n.addEventListener("click", (e) => {
        e.preventDefault();
        closePersiana();
        showWelcomeAgain();
    }));

    // Mobile nav-top: el nombre lleva al welcome; la categoría activa abre el menú.
    // El resto del nav-top NO es clickable (evita aperturas accidentales).
    bindOnce($("#nav-top"), n => n.addEventListener("click", (e) => {
        if (!MOBILE_MQ.matches) return;
        if (e.target.closest("#nav-name")) {
            closePersiana();
            showWelcomeAgain();
            return;
        }
        if (e.target.closest("#nav-active")) {
            if (!nav.classList.contains("is-open")) openPersiana();
        }
    }));
}

function openPersiana() {
    if (!MOBILE_MQ.matches) return;
    const nav = $("#nav");
    if (!nav.classList.contains("is-open")) {
        nav.classList.add("is-open");
        const toggle = $("#nav-toggle");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = t("close_menu");
    }
}

function closePersiana() {
    if (!MOBILE_MQ.matches) return;
    const nav = $("#nav");
    if (nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        const toggle = $("#nav-toggle");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = t("open_menu");
    }
}
