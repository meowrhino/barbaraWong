// ========================================
// UTILS.JS - Funciones helper generales
// ========================================

// Cache simple para JSONs
const jsonCache = {};

/**
 * Fetch JSON con cache
 * @param {string} path - Ruta al archivo JSON
 * @returns {Promise<any>} - Datos del JSON
 */
export async function fetchJSON(path) {
    if (jsonCache[path]) {
        return jsonCache[path];
    }
    
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Error fetching ${path}: ${response.status}`);
        }
        const data = await response.json();
        jsonCache[path] = data;
        return data;
    } catch (error) {
        console.error('Error loading JSON:', error);
        return null;
    }
}

/**
 * Parsear fecha en formato YYYY-MM-DD
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} - Objeto Date
 */
export function parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Verificar si la fecha actual está entre dos fechas
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {boolean} - True si está entre las fechas
 */
export function isDateInRange(startDate, endDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    return now >= start && now <= end;
}

/**
 * Formatear fecha para mostrar
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
export function formatDate(dateString) {
    const date = parseDate(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Obtener parámetros de URL
 * @returns {Object} - Objeto con los parámetros
 */
export function getURLParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

// Preparado para i18n (futuro)
// Por ahora todos los textos están en castellano
export const i18n = {
    es: {
        error_loading: 'Error al cargar los datos',
        no_projects: 'No hay proyectos disponibles',
        no_events: 'No hay eventos disponibles',
        hot_now: 'HOT NOW!',
        back_home: 'volver a la home'
    }
};

export function getText(key, lang = 'es') {
    return i18n[lang]?.[key] || key;
}
