// ========================================
// UI-MODAL.JS - Helpers para overlays y modales
// ========================================

/**
 * Abrir overlay con contenido
 * @param {string} overlayId - ID del overlay
 * @param {HTMLElement} content - Contenido a mostrar
 */
export function openOverlay(overlayId, content) {
    const overlay = document.getElementById(overlayId);
    const overlayContent = overlay.querySelector('.overlay-content');
    
    if (!overlay || !overlayContent) return;
    
    // Limpiar contenido anterior
    overlayContent.innerHTML = '';
    
    // Añadir nuevo contenido
    overlayContent.appendChild(content);
    
    // Mostrar overlay
    overlay.classList.add('active');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar overlay
 * @param {string} overlayId - ID del overlay
 */
export function closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    
    if (!overlay) return;
    
    overlay.classList.remove('active');
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

/**
 * Configurar overlay para cerrar al hacer clic fuera
 * @param {string} overlayId - ID del overlay
 */
export function setupOverlayClose(overlayId) {
    const overlay = document.getElementById(overlayId);
    
    if (!overlay) return;
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay(overlayId);
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay(overlayId);
        }
    });
}

/**
 * Crear elemento de imagen para overlay
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @returns {HTMLElement} - Elemento img
 */
export function createOverlayImage(src, alt = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    return img;
}

/**
 * Crear elemento de video para overlay
 * @param {string} src - URL del video
 * @param {Object} options - Opciones del video
 * @returns {HTMLElement} - Elemento video
 */
export function createOverlayVideo(src, options = {}) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = options.autoplay || false;
    video.loop = options.loop || false;
    video.muted = options.muted || false;
    video.playsInline = options.playsinline || true;
    
    if (options.poster) {
        video.poster = options.poster;
    }
    
    return video;
}
