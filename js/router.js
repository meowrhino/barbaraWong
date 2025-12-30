// ========================================
// ROUTER.JS - Helpers de navegación
// ========================================

/**
 * Navegar a una página
 * @param {string} url - URL de destino
 */
export function navigateTo(url) {
    window.location.href = url;
}

/**
 * Navegar a la página de proyecto
 * @param {string} slug - Slug del proyecto
 */
export function navigateToProject(slug) {
    navigateTo(`projects.html?slug=${slug}`);
}

/**
 * Navegar a la página de eventos con un evento específico
 * @param {number} eventIndex - Índice del evento
 */
export function navigateToEvent(eventIndex) {
    navigateTo(`events.html?event=${eventIndex}`);
}

/**
 * Navegar a la home
 */
export function navigateToHome() {
    navigateTo('index.html');
}

/**
 * Navegar a la página 404
 */
export function navigateTo404() {
    navigateTo('404.html');
}

/**
 * Verificar si existe un proyecto
 * @param {string} slug - Slug del proyecto
 * @returns {Promise<boolean>} - True si existe
 */
export async function projectExists(slug) {
    try {
        const response = await fetch(`projects/data/proyectos/${slug}/${slug}.json`);
        return response.ok;
    } catch (error) {
        return false;
    }
}
