// ========================================
// EVENTS.JS - Lógica de la página de eventos
// ========================================

import { fetchJSON, isDateInRange, formatDate, getURLParams } from './utils.js';

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadEvents();
});

// ========================================
// CARGAR EVENTOS
// ========================================

async function loadEvents() {
    const data = await fetchJSON('data/news.json');
    
    if (!data || data.length === 0) {
        console.warn('No events data');
        return;
    }
    
    const container = document.getElementById('eventsContainer');
    const params = getURLParams();
    const targetEventIndex = params.event ? parseInt(params.event) : null;
    
    data.forEach((event, index) => {
        const card = createEventCard(event, index);
        container.appendChild(card);
    });
    
    // Scroll al evento específico si se pasó el parámetro
    if (targetEventIndex !== null && targetEventIndex < data.length) {
        setTimeout(() => {
            const targetCard = container.children[targetEventIndex];
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }, 100);
    }
}

// ========================================
// CREAR CARD DE EVENTO
// ========================================

function createEventCard(event, index) {
    const isActive = isDateInRange(event.start_date, event.end_date);
    
    const card = document.createElement('div');
    card.className = `event-card ${isActive ? 'active' : 'inactive'}`;
    card.dataset.eventIndex = index;
    
    const title = document.createElement('h2');
    title.className = 'event-title';
    title.textContent = event.title;
    
    const synopsis = document.createElement('p');
    synopsis.className = 'event-synopsis';
    synopsis.textContent = event.synopsis;
    
    const dates = document.createElement('div');
    dates.className = 'event-dates';
    dates.textContent = `${formatDate(event.start_date)} — ${formatDate(event.end_date)}`;
    
    card.appendChild(title);
    card.appendChild(synopsis);
    card.appendChild(dates);
    
    return card;
}
