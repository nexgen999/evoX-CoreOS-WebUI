let rawStoreData = [];

async function loadStoreData(sources) {
    rawStoreData = [];
    const container = document.getElementById('store-grid');
    const categoriesSelect = document.getElementById('store-category-filter');
    
    container.innerHTML = 'Chargement des paquets...';
    
    for (const source of sources) {
        try {
            const res = await fetch(source.url);
            if (!res.ok) continue;
            const data = await res.json();
            const items = Array.isArray(data) ? data : (data.items || []);
            
            items.forEach(item => {
                rawStoreData.push({
                    ...item,
                    sourceName: source.name
                });
            });
        } catch (e) {
            console.warn(`Erreur lors du chargement de ${source.name}:`, e);
        }
    }

    populateCategories();
    renderStoreItems(rawStoreData);
}

function populateCategories() {
    const select = document.getElementById('store-category-filter');
    const categories = new Set(rawStoreData.map(i => i.category || i.sourceName).filter(Boolean));
    
    select.innerHTML = '<option value="all">Toutes les catégories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function renderStoreItems(items) {
    const container = document.getElementById('store-grid');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p>Aucun élément trouvé.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div>
                <h3>${item.title || item.name || 'Sans nom'}</h3>
                <span class="badge">${item.category || item.sourceName || 'General'}</span>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top:0.5rem;">
                    ${item.description || 'Pas de description disponible.'}
                </p>
            </div>
            <a href="${item.url || item.download_url || '#'}" target="_blank" class="btn btn-secondary" style="margin-top: 0.5rem; text-align:center;">
                <i class="fa-solid fa-download"></i> Télécharger
            </a>
        `;
        container.appendChild(card);
    });
}

// Filtres
document.getElementById('store-search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = rawStoreData.filter(i => 
        (i.title && i.title.toLowerCase().includes(query)) ||
        (i.name && i.name.toLowerCase().includes(query)) ||
        (i.description && i.description.toLowerCase().includes(query))
    );
    renderStoreItems(filtered);
});

document.getElementById('store-category-filter')?.addEventListener('change', (e) => {
    const cat = e.target.value;
    if (cat === 'all') {
        renderStoreItems(rawStoreData);
    } else {
        renderStoreItems(rawStoreData.filter(i => (i.category || i.sourceName) === cat));
    }
});
