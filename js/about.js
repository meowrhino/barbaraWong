// ========================================
// ABOUT.JS - Lógica de la página about
// ========================================

import { fetchJSON } from './utils.js';
import { openOverlay, setupOverlayClose, createOverlayImage } from './ui-modal.js';

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadAboutGallery();
    await loadAboutText();
    setupOverlayClose('imageOverlay');
});

// ========================================
// GALERÍA ABOUT
// ========================================

async function loadAboutGallery() {
    const data = await fetchJSON('data/about_gallery.json');
    
    if (!data || data.length === 0) {
        console.warn('No about gallery data');
        return;
    }
    
    const gallery = document.getElementById('aboutGallery');
    
    data.forEach(imageSrc => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'About gallery image';
        img.loading = 'lazy';
        
        img.addEventListener('click', () => {
            openOverlay('imageOverlay', createOverlayImage(imageSrc));
        });
        
        gallery.appendChild(img);
    });
}

// ========================================
// TEXTO ABOUT
// ========================================

async function loadAboutText() {
    const data = await fetchJSON('data/about_text.json');
    
    if (!data || !data.paragraphs || data.paragraphs.length === 0) {
        console.warn('No about text data');
        return;
    }
    
    const textSection = document.getElementById('aboutText');
    
    data.paragraphs.forEach(paragraphText => {
        const p = document.createElement('p');
        p.textContent = paragraphText;
        textSection.appendChild(p);
    });
}
