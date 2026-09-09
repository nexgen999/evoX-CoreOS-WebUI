let rawStoreData = [];

// Fonction utilitaire pour extraire les tableaux récursifs ou imbriqués dans les JSON
function extractItemsFromJSON(data) {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) {
        for (const key of ['items', 'files', 'payloads', 'pkgs', 'apps', 'ffpfsc', 'data', 'list']) {
            if (Array.isArray(data[key])) return data[key];
        }
        // Recherche de la première propriété qui contient un tableau
        for (const key in data) {
            if (Array.isArray(data[key])) return data[key];
        }
    }
    return [];
}

async function loadStoreData(sources) {
    rawStoreData = [];
    const container = document.getElementById('store-grid');
    if (container) container.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin accent"></i> Chargement des catalogues JSON...</p>';

    const counts = { Payloads: 0, PKGs: 0, FFPFSC: 0, Apps: 0 };

    for (const source of sources) {
        try {
            const res = await fetch(source.url);
            if (!res.ok) continue;
            
            const data = await res.json();
            const items = extractItemsFromJSON(data);

            if (counts.hasOwnProperty(source.name)) {
                counts[source.name] = items.length;
            }

            items.forEach(item => {
                rawStoreData.push({
                    title: item.title || item.name || item.filename || item.app_name || 'Sans nom',
                    category: item.category || source.name,
                    subcategory: item.subcategory || item.sub_category || item.type || item.section || 'Général',
                    description: item.description || item.desc || item.info || 'Aucune description fournie.',
                    url: item.url || item.download || item.download_url || item.link || item.path || '#',
                    version: item.version || item.ver || '',
                    sourceName: source.name
                });
            });

        } catch (e) {
            console.warn(`Erreur de chargement pour ${source.name}:`, e);
        }
    }

    // Mise à jour synchrone des compteurs sur la Home
    if (document.getElementById('stat-payloads')) document.getElementById('stat-payloads').textContent = counts.Payloads;
    if (document.getElementById('stat-pkgs')) document.getElementById('stat-pkgs').textContent = counts.PKGs;
    if (document.getElementById('stat-ffpfsc')) document.getElementById('stat-ffpfsc').textContent = counts.FFPFSC;
    if (document.getElementById('stat-apps')) document.getElementById('stat-apps').textContent = counts.Apps;

    populateFilters();
    renderStoreItems(rawStoreData);
}

function populateFilters() {
    const catSelect = document.getElementById('store-category-filter');
    const subCatSelect = document.getElementById('store-subcategory-filter');
    
    if (!catSelect) return;

    const categories = new Set(rawStoreData.map(i => i.category || i.sourceName).filter(Boolean));
    catSelect.innerHTML = '<option value="all">Toutes les catégories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
    });

    updateSubcategories();
}

function updateSubcategories() {
    const catSelect = document.getElementById('store-category-filter');
    const subCatSelect = document.getElementById('store-subcategory-filter');
    if (!subCatSelect) return;

    const selectedCat = catSelect ? catSelect.value : 'all';
    
    const filteredItems = selectedCat === 'all' 
        ? rawStoreData 
        : rawStoreData.filter(i => (i.category || i.sourceName) === selectedCat);

    const subcategories = new Set(filteredItems.map(i => i.subcategory).filter(Boolean));

    subCatSelect.innerHTML = '<option value="all">Toutes les sous-catégories</option>';
    subcategories.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subCatSelect.appendChild(opt);
    });
}

function renderStoreItems(items) {
    const container = document.getElementById('store-grid');
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">Aucun paquet correspondant trouvé.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
                    <h3>${item.title}</h3>
                    ${item.version ? `<span class="badge" style="background:var(--bg-hover); color:var(--accent); font-size:0.75rem;">v${item.version}</span>` : ''}
                </div>
                <div style="margin: 0.4rem 0;">
                    <span class="badge">${item.category}</span>
                    ${item.subcategory !== 'Général' ? `<span class="badge" style="opacity:0.8;">${item.subcategory}</span>` : ''}
                </div>
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

function filterStore() {
    const query = document.getElementById('store-search')?.value.toLowerCase() || '';
    const cat = document.getElementById('store-category-filter')?.value || 'all';
    const subcat = document.getElementById('store-subcategory-filter')?.value || 'all';

    const filtered = rawStoreData.filter(i => {
        const matchesQuery = i.title.toLowerCase().includes(query) || i.description.toLowerCase().includes(query);
        const matchesCat = (cat === 'all') || ((i.category || i.sourceName) === cat);
        const matchesSubCat = (subcat === 'all') || (i.subcategory === subcat);

        return matchesQuery && matchesCat && matchesSubCat;
    });

    renderStoreItems(filtered);
}

// Événements
document.getElementById('store-search')?.addEventListener('input', filterStore);

document.getElementById('store-category-filter')?.addEventListener('change', () => {
    updateSubcategories();
    filterStore();
});

document.getElementById('store-subcategory-filter')?.addEventListener('change', filterStore);
