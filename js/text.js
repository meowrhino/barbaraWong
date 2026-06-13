// Helpers de texto (sin DOM). Compartidos por views.js y menu.js.

// Markdown inline mínimo: **bold**, *italic* y <br> para salto de línea.
// Escapa el resto del HTML. Para escribir un asterisco literal: \*
export function md(str) {
    if (str == null) return "";
    let s = String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    // Único HTML permitido: <br>, <br/> y <br /> como salto de línea.
    s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
    // Placeholder en zona de uso privado (U+E000) para proteger los \* literales.
    const PH = String.fromCharCode(0xE000);
    s = s.replace(/\\\*/g, PH);
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
    s = s.replace(new RegExp(PH, "g"), "*");
    return s;
}
