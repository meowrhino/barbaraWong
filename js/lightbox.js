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

function build() {
    if (overlay) return;
    imgEl = el("img", { class: "lb-img", alt: "" });
    counterEl = el("div", { class: "lb-counter" });
    prevBtn = el("button", { class: "lb-btn lb-prev", type: "button", "aria-label": "anterior" }, "‹");
    nextBtn = el("button", { class: "lb-btn lb-next", type: "button", "aria-label": "siguiente" }, "›");
    const closeBtn = el("button", { class: "lb-btn lb-close", type: "button", "aria-label": "cerrar" }, "×");

    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); close(); });
    imgEl.addEventListener("click", (e) => e.stopPropagation());

    overlay = el("div", { id: "lightbox", hidden: "", role: "dialog", "aria-modal": "true" },
        closeBtn, prevBtn, imgEl, nextBtn, counterEl,
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
}

function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = prevBodyOverflow;
    imgEl.removeAttribute("src");
}

export function openLightbox(imgs, startIndex = 0) {
    if (!imgs || !imgs.length) return;
    build();
    images = imgs.slice();
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.hidden = false;
    show(startIndex);
}

export function initLightbox() {
    document.addEventListener("keydown", onKey);
}
