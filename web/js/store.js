let rawStoreData = [];

async function loadStoreData(sources) {
    rawStoreData = [];
    const container = document.getElementById('store-grid');
    const categoriesSelect = document.getElementById('store-category-filter');
    
    if (container) container.innerHTML = '<p>Chargement du store...</p>';
    
    const counts = { Payloads: 0, PKGs: 0, FFPFSC: 0, Apps: 0 };

    for (const source of sources) {
        try {
            const res = await fetch(source.url);
            if (!res.ok) continue;
            const data = await res.json();
            
            // Gestion format tableau ou objet avec clef racine
            const items = Array.isArray(data) ? data : (data.items || data.files || []);
            
            if (counts.hasOwnProperty(source.name)) {
                counts[source.name] = items.length;
            }

            items.forEach(item => {
                rawStoreData.push({
                    title: item.name || item.title || item.filename || 'Sans nom',
                    category: item.category || source.name,
                    description: item.description || item.desc || 'Aucune description disponible.',
                    url: item.url || item.download || item.link || '#',
                    version: item.version || '',
                    sourceName: source.name
                });
            });
        } catch (e) {
            console.warn(`Erreur de chargement pour ${source.name}:`, e);
        }
    }

    // Mise à jour des compteurs sur la page Home
    if (document.getElementById('stat-payloads')) document.getElementById('stat-payloads').textContent = counts.Payloads;
    if (document.getElementById('stat-pkgs')) document.getElementById('stat-pkgs').textContent = counts.PKGs;
    if (document.getElementById('stat-ffpfsc')) document.getElementById('stat-ffpfsc').textContent = counts.FFPFSC;
    if (document.getElementById('stat-apps')) document.getElementById('stat-apps').textContent = counts.Apps;

    populateCategories();
    renderStoreItems(rawStoreData);
}

function populateCategories() {
    const select = document.getElementById('store-category-filter');
    if (!select) return;

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
    if (!container) return;
    
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
                <h3>${item.title} ${item.version ? `<small style="font-size:0.7em; color:var(--text-muted);">v${item.version}</small>` : ''}</h3>
                <span class="badge">${item.category}</span>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top:0.5rem;">
                    ${item.description}
                </p>
            </div>
            <a href="${item.url}" target="_blank" class="btn btn-secondary" style="margin-top: 0.75rem; text-align:center;">
                <i class="fa-solid fa-download"></i> Télécharger
            </a>
        `;
        container.appendChild(card);
    });
}

// Recherche & Filtrage
document.getElementById('store-search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = rawStoreData.filter(i => 
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
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
