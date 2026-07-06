// Lightbox: overlay fullscreen para ampliar imágenes. Soporta galerías
// (flechas ‹ ›, teclas ← →) o imagen suelta. ESC o click fuera = cerrar.

import { $, el } from "./dom.js";

let overlay = null;
let imgEl = null;
let counterEl = null;
let prevBtn = null;
let nextBtn = null;
let images = [];
let idx = 0;
let prevBodyOverflow = "";
let closeBtnEl = null;
let lastFocusedEl = null;

function build() {
    if (overlay) return;
    imgEl = el("img", { class: "lb-img", alt: "" });
    counterEl = el("div", { class: "lb-counter" });
    prevBtn = el("button", { class: "lb-btn lb-prev", type: "button", "aria-label": "anterior" }, "‹");
    nextBtn = el("button", { class: "lb-btn lb-next", type: "button", "aria-label": "siguiente" }, "›");
    closeBtnEl = el("button", { class: "lb-btn lb-close", type: "button", "aria-label": "cerrar" }, "×");

    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    closeBtnEl.addEventListener("click", (e) => { e.stopPropagation(); close(); });
    imgEl.addEventListener("click", (e) => e.stopPropagation());

    overlay = el("div", { id: "lightbox", hidden: "", role: "dialog", "aria-modal": "true", "aria-label": "visor de imágenes" },
        closeBtnEl, prevBtn, imgEl, nextBtn, counterEl,
    );
    overlay.addEventListener("click", close);
    document.body.appendChild(overlay);
}

function show(newIdx) {
    if (!images.length) return;
    idx = ((newIdx % images.length) + images.length) % images.length;
    imgEl.src = images[idx];
    imgEl.alt = `imagen ${idx + 1} de ${images.length}`;
    counterEl.textContent = images.length > 1 ? `${idx + 1} / ${images.length}` : "";
    const multi = images.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
}

function onKey(e) {
    if (!overlay || overlay.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft" && images.length > 1) { e.preventDefault(); show(idx - 1); }
    else if (e.key === "ArrowRight" && images.length > 1) { e.preventDefault(); show(idx + 1); }
    else if (e.key === "Tab") trapFocus(e);
}

// Mantiene el foco dentro del diálogo mientras está abierto (ciclo entre sus botones visibles).
function trapFocus(e) {
    // Orden real en el DOM: closeBtnEl, prevBtn, nextBtn (imgEl y counterEl no son focuseables).
    const focusable = [closeBtnEl, prevBtn, nextBtn].filter(b => b && !b.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = prevBodyOverflow;
    imgEl.removeAttribute("src");
    // Devuelve el foco al elemento que abrió el lightbox, si sigue en el DOM.
    if (lastFocusedEl && lastFocusedEl.isConnected) {
        try { lastFocusedEl.focus(); } catch { /* noop */ }
    }
    lastFocusedEl = null;
}

export function openLightbox(imgs, startIndex = 0) {
    if (!imgs || !imgs.length) return;
    lastFocusedEl = document.activeElement;
    build();
    images = imgs.slice();
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.hidden = false;
    show(startIndex);
    closeBtnEl.focus();
}

export function initLightbox() {
    document.addEventListener("keydown", onKey);
}
