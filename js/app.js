// ========================================
// APP.JS - Lógica de la home
// ========================================

import { fetchJSON, isDateInRange } from './utils.js';
import { openOverlay, closeOverlay, setupOverlayClose, createOverlayImage, createOverlayVideo } from './ui-modal.js';
import { navigateToProject, navigateToEvent } from './router.js';

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadFeaturedGallery();
    await loadProjectsTable();
    await loadNewsModals();
    setupOverlayClose('mediaOverlay');
});

// ========================================
// GALERÍA DESTACADA
// ========================================

async function loadFeaturedGallery() {
    const data = await fetchJSON('data/home_gallery.json');
    
    if (!data || data.length === 0) {
        console.warn('No featured gallery data');
        return;
    }
    
    const section = document.getElementById('featuredSection');
    
    // Solo mostramos el primer item (destacado)
    const item = data[0];
    
    if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || 'Featured image';
        img.loading = 'lazy';
        img.addEventListener('click', () => {
            openOverlay('mediaOverlay', createOverlayImage(item.src, item.alt));
        });
        section.appendChild(img);
    } else if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        video.muted = item.muted !== false;
        video.loop = item.loop !== false;
        video.autoplay = item.autoplay !== false;
        video.playsInline = item.playsinline !== false;
        
        if (item.poster) {
            video.poster = item.poster;
        }
        
        video.addEventListener('click', () => {
            openOverlay('mediaOverlay', createOverlayVideo(item.src, {
                autoplay: true,
                loop: item.loop,
                muted: item.muted,
                playsinline: item.playsinline,
                poster: item.poster
            }));
        });
        
        section.appendChild(video);
    }
}

// ========================================
// TABLA DE PROYECTOS
// ========================================

async function loadProjectsTable() {
    const data = await fetchJSON('data/tabla_home.json');
    
    if (!data || data.length === 0) {
        console.warn('No projects data');
        return;
    }
    
    const tableWrapper = document.querySelector('.table-wrapper');
    
    data.forEach(project => {
        const row = document.createElement('div');
        row.className = 'project-row';
        
        const name = document.createElement('div');
        name.className = 'project-name';
        name.textContent = project.name;
        
        const subtitle = document.createElement('div');
        subtitle.className = 'project-subtitle';
        subtitle.textContent = project.subtitle;
        
        row.appendChild(name);
        row.appendChild(subtitle);
        
        row.addEventListener('click', () => {
            navigateToProject(project.slug);
        });
        
        tableWrapper.appendChild(row);
    });
}

// ========================================
// NEWS MODALS (HOT NOW)
// ========================================

async function loadNewsModals() {
    const data = await fetchJSON('data/news.json');
    
    if (!data || data.length === 0) {
        return;
    }
    
    const container = document.getElementById('newsModalsContainer');
    
    data.forEach((news, index) => {
        if (isDateInRange(news.start_date, news.end_date)) {
            const modal = createNewsModal(news, index);
            container.appendChild(modal);
        }
    });
}

function createNewsModal(news, index) {
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    
    const hotLabel = document.createElement('div');
    hotLabel.className = 'news-hot-label';
    hotLabel.textContent = 'HOT NOW!';
    
    const title = document.createElement('div');
    title.className = 'news-modal-title';
    title.textContent = news.title;
    
    const synopsis = document.createElement('div');
    synopsis.className = 'news-modal-synopsis';
    synopsis.textContent = news.synopsis;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'news-modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.remove();
    });
    
    modal.appendChild(hotLabel);
    modal.appendChild(title);
    modal.appendChild(synopsis);
    modal.appendChild(closeBtn);
    
    // Clic en el modal (excepto el botón cerrar) navega a eventos
    modal.addEventListener('click', () => {
        navigateToEvent(index);
    });
    
    return modal;
}
