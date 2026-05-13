// Welcome: vídeo aleatorio fullscreen, crossfade entre vídeos, selector inferior.
// Estrategia carbon-friendly: solo el vídeo actual hace preload completo.

import { $, el } from "./dom.js";
import { state } from "./data.js";

const SESSION_KEY = "welcomeDone";

let entries = [];          // [{ id, label, sources: [{src, type}] }]
let cur = null, nxt = null;
let curIdx = -1;
let keydownHandler = null;

function pickRandom() {
    if (!entries.length) return -1;
    if (entries.length === 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * entries.length); } while (i === curIdx);
    return i;
}

function applySources(video, entry, preload) {
    video.innerHTML = "";
    for (const s of entry.sources) {
        const source = document.createElement("source");
        source.src = s.src;
        source.type = s.type;
        video.appendChild(source);
    }
    video.preload = preload;
    video.load();
}

function setCurrent(idx) {
    curIdx = idx;
    applySources(cur, entries[idx], "auto");
    cur.play().catch(() => {});
    refreshThumbs();
}

function queueNext() {
    const nextIdx = pickRandom();
    if (nextIdx < 0 || nextIdx === curIdx) return;
    applySources(nxt, entries[nextIdx], "metadata");
    nxt._nextIdx = nextIdx;
}

function swap() {
    if (!nxt._nextIdx && nxt._nextIdx !== 0) {
        queueNext();
        return;
    }
    const old = cur;
    cur = nxt;
    nxt = old;
    curIdx = cur._nextIdx;
    cur._nextIdx = undefined;
    cur.classList.add("is-current");
    nxt.classList.remove("is-current");
    cur.preload = "auto";
    cur.play().catch(() => {});
    refreshThumbs();
    queueNext();
}

function attachEnded(video) {
    video.addEventListener("ended", () => {
        if (video !== cur) return;
        swap();
    });
}

function buildThumbs() {
    const wrap = $("#welcome-thumbs");
    wrap.replaceChildren(...entries.map((e, i) => el("button", {
        class: "welcome-thumb",
        type: "button",
        "data-idx": String(i),
        "aria-label": `Vídeo ${e.label}`,
        on: { click: (ev) => {
            ev.stopPropagation();
            if (i === curIdx) return;
            setCurrent(i);
            queueNext();
        } },
    }, e.label)));
    refreshThumbs();
}

function refreshThumbs() {
    const buttons = document.querySelectorAll(".welcome-thumb");
    buttons.forEach((b, i) => b.classList.toggle("is-active", i === curIdx));
}

function done() {
    const w = $("#welcome");
    const app = $("#app");
    sessionStorage.setItem(SESSION_KEY, "1");
    w.classList.add("is-fading-out");
    if (keydownHandler) {
        document.removeEventListener("keydown", keydownHandler);
        keydownHandler = null;
    }
    setTimeout(() => {
        w.hidden = true;
        app.hidden = false;
        $("#welcome-video-a").pause();
        $("#welcome-video-b").pause();
        document.dispatchEvent(new CustomEvent("welcome:done"));
    }, 400);
}

export function shouldShowWelcome() {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
}

export function startWelcome() {
    const cfg = state.data?.welcome;
    if (!cfg || !Array.isArray(cfg.videos) || cfg.videos.length === 0) {
        done();
        return;
    }
    const formats = Array.isArray(cfg.formats) && cfg.formats.length ? cfg.formats : ["webm"];
    const mime = { webm: "video/webm", mp4: "video/mp4" };
    entries = cfg.videos.map(v => ({
        id: v.id,
        label: v.label || v.id,
        sources: formats.map(f => ({ src: `${cfg.dir}${v.id}.${f}`, type: mime[f] || "" })),
    }));

    cur = $("#welcome-video-a");
    nxt = $("#welcome-video-b");
    attachEnded(cur);
    attachEnded(nxt);

    setCurrent(pickRandom());
    queueNext();
    buildThumbs();

    $("#welcome").hidden = false;

    $("#enter-btn").addEventListener("click", done);
    keydownHandler = (e) => {
        if ($("#welcome").hidden) return;
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
            e.preventDefault();
            done();
        }
    };
    document.addEventListener("keydown", keydownHandler);
}

export function skipWelcome() {
    $("#welcome").hidden = true;
    $("#app").hidden = false;
}
