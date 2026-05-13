// Helpers DOM mínimos.

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Construye un string de clases ignorando falsy values.
//   cx("a", cond && "b", "")  →  "a b"   |   cx("a", false)  →  "a"
export const cx = (...classes) => classes.filter(Boolean).join(" ");

// Bind idempotente — solo añade el listener una vez por elemento.
//   bindOnce(btn, node => node.addEventListener("click", handler))
export function bindOnce(node, attach) {
    if (!node || node._bound) return;
    node._bound = true;
    attach(node);
}

export function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "on" && typeof v === "object") {
            for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
        } else {
            node.setAttribute(k, v === true ? "" : v);
        }
    }
    for (const kid of kids.flat()) {
        if (kid == null || kid === false) continue;
        node.appendChild(typeof kid === "string" || typeof kid === "number"
            ? document.createTextNode(String(kid))
            : kid);
    }
    return node;
}
