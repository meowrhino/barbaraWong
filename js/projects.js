// ========================================
// PROJECTS.JS - Lógica de la página de proyectos (stub)
// ========================================

import { fetchJSON, getURLParams } from './utils.js';
import { navigateTo404 } from './router.js';

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadProject();
});

// ========================================
// CARGAR PROYECTO
// ========================================

async function loadProject() {
    const params = getURLParams();
    const slug = params.slug;
    
    if (!slug) {
        navigateTo404();
        return;
    }
    
    // Intentar cargar el JSON del proyecto
    const projectData = await fetchJSON(`projects/data/proyectos/${slug}/${slug}.json`);
    
    if (!projectData) {
        // Si no existe, redirigir a 404
        navigateTo404();
        return;
    }
    
    // Aquí se renderizaría el proyecto
    // Por ahora es un stub, la estructura está lista para futuras iteraciones
    const container = document.getElementById('projectContainer');
    container.innerHTML = `
        <h1>Proyecto: ${slug}</h1>
        <p>Estructura lista para implementación futura.</p>
    `;
}
