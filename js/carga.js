// Lee el contenido (data/site.json, projects/<slug>/project.json y lo de data/:
// about, news, publications, photos) y lo pasa a la forma de antes con house.js.
//
// Las páginas que escribe el build llevan data-built en <html>. Sin él es la
// vista previa (Live Server, sin build): cada JSON se revisa con su esquema
// (schema/) como hace el build, y lo que esté mal sale en pantalla.

import { slugsOf, toOld } from "./house.js";
import { leerJSON, validar } from "./validar.js";

export const BUILT = document.documentElement.hasAttribute("data-built");

async function get(path) {
    const res = await fetch(path, BUILT ? {} : { cache: "no-store" });
    if (!res.ok) { if (!BUILT) showErrors([`no encuentro ${path}`]); throw new Error(`${path} → ${res.status}`); }
    try { return leerJSON(await res.text(), path); } catch (e) { showErrors([e.message]); throw e; }
}

async function checked(path, type) {
    const data = await get(path);
    if (!BUILT) {
        const errors = validar(data, await get(`schema/${type}.json`), path);
        if (errors.length) { showErrors(errors); throw new Error(errors.join("\n")); }
    }
    return data;
}

function showErrors(errors) {
    let box = document.getElementById("errores-vista-previa");
    if (!box) {
        box = document.createElement("pre");
        box.id = "errores-vista-previa";
        box.style.cssText = "position:fixed;inset:0;z-index:99999;margin:0;padding:2rem;overflow:auto;white-space:pre-wrap;"
            + "background:#fff;color:#000;font:15px/1.5 monospace;";
        box.textContent = "esto no se publicaría:\n\n";
        document.body.append(box);
    }
    box.textContent += errors.map((e) => `✗ ${e}`).join("\n") + "\n\narréglalo, guarda, y la página se recarga sola.\n";
}

export async function loadData() {
    const site = await checked("data/site.json", "site");
    const [projects, about, news, publications, photos] = await Promise.all([
        Promise.all(slugsOf(site).map(async (s) => [s, await checked(`projects/${s}/project.json`, "project")])).then(Object.fromEntries),
        ...["about", "news", "publications", "photos"].map((f) => checked(`data/${f}.json`, f)),
    ]);
    return { ...toOld(site, projects), about, news, publications, photos };
}
