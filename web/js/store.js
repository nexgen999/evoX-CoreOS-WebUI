let rawStoreData = [];
let currentViewMode = 'grid'; // 'grid' ou 'list'

function extractItemsFromJSON(data) {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) {
        for (const key of ['items', 'files', 'payloads', 'pkgs', 'apps', 'ffpfsc', 'data', 'list']) {
            if (Array.isArray(data[key])) return data[key];
        }
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

            const masterCategory = source.name;

            if (counts.hasOwnProperty(masterCategory)) {
                counts[masterCategory] = items.length;
            }

            items.forEach(item => {
                rawStoreData.push({
                    title: item.title || item.name || item.filename || item.app_name || 'Sans nom',
                    masterCategory: masterCategory,
                    subcategory: item.subcategory || item.sub_category || item.type || item.section || item.category || 'Non spécifié',
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

    if (document.getElementById('stat-payloads')) document.getElementById('stat-payloads').textContent = counts.Payloads;
    if (document.getElementById('stat-pkgs')) document.getElementById('stat-pkgs').textContent = counts.PKGs;
    if (document.getElementById('stat-ffpfsc')) document.getElementById('stat-ffpfsc').textContent = counts.FFPFSC;
    if (document.getElementById('stat-apps')) document.getElementById('stat-apps').textContent = counts.Apps;

    populateMasterCategories(sources);
    updateSubcategories();
    filterStore();
}

function populateMasterCategories(sources) {
    const catSelect = document.getElementById('store-category-filter');
    if (!catSelect) return;

    catSelect.innerHTML = '<option value="all">Tous les JSON (Global)</option>';
    sources.forEach(src => {
        const opt = document.createElement('option');
        opt.value = src.name;
        opt.textContent = src.name;
        catSelect.appendChild(opt);
    });
}

function updateSubcategories() {
    const catSelect = document.getElementById('store-category-filter');
    const subCatSelect = document.getElementById('store-subcategory-filter');
    if (!subCatSelect) return;

    const selectedCat = catSelect ? catSelect.value : 'all';
    
    const filteredItems = selectedCat === 'all' 
        ? rawStoreData 
        : rawStoreData.filter(i => i.masterCategory === selectedCat);

    const subcategories = new Set();
    filteredItems.forEach(i => {
        if (i.subcategory) subcategories.add(i.subcategory);
    });

    subCatSelect.innerHTML = '<option value="all">Toutes les sous-catégories</option>';
    Array.from(subcategories).sort().forEach(sub => {
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
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">Aucun paquet ne correspond à votre recherche.</p>';
        return;
    }

    if (currentViewMode === 'grid') {
        container.className = 'cards-grid';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
                        <h3>${item.title}</h3>
                        ${item.version ? `<span class="badge" style="background:var(--bg-hover); color:var(--accent); font-size:0.75rem;">v${item.version}</span>` : ''}
                    </div>
                    <div style="margin: 0.4rem 0; display:flex; gap:0.4rem; flex-wrap:wrap;">
                        <span class="badge">${item.masterCategory}</span>
                        ${item.subcategory !== 'Non spécifié' ? `<span class="badge" style="opacity:0.8; background:rgba(255,255,255,0.08);">${item.subcategory}</span>` : ''}
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
    } else {
        container.className = 'store-list-view';
        const table = document.createElement('table');
        table.className = 'store-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Fichier JSON</th>
                    <th>Sous-Catégorie</th>
                    <th>Version</th>
                    <th>Description</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td><strong>${item.title}</strong></td>
                        <td><span class="badge">${item.masterCategory}</span></td>
                        <td>${item.subcategory !== 'Non spécifié' ? `<span class="badge" style="opacity:0.8;">${item.subcategory}</span>` : '<span style="opacity:0.4;">-</span>'}</td>
                        <td>${item.version ? `v${item.version}` : '-'}</td>
                        <td class="table-desc">${item.description}</td>
                        <td>
                            <a href="${item.url}" target="_blank" class="btn btn-secondary btn-sm">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    }
}

function filterStore() {
    const query = document.getElementById('store-search')?.value.toLowerCase() || '';
    const cat = document.getElementById('store-category-filter')?.value || 'all';
    const subcat = document.getElementById('store-subcategory-filter')?.value || 'all';

    const filtered = rawStoreData.filter(i => {
        const matchesQuery = i.title.toLowerCase().includes(query) || i.description.toLowerCase().includes(query);
        const matchesCat = (cat === 'all') || (i.masterCategory === cat);
        const matchesSubCat = (subcat === 'all') || (i.subcategory === subcat);

        return matchesQuery && matchesCat && matchesSubCat;
    });

    renderStoreItems(filtered);
}

function setStoreViewMode(mode) {
    currentViewMode = mode;
    document.getElementById('btn-view-grid')?.classList.toggle('active', mode === 'grid');
    document.getElementById('btn-view-list')?.classList.toggle('active', mode === 'list');
    filterStore();
}

document.getElementById('store-search')?.addEventListener('input', filterStore);

document.getElementById('store-category-filter')?.addEventListener('change', () => {
    updateSubcategories();
    filterStore();
});

document.getElementById('store-subcategory-filter')?.addEventListener('change', filterStore);

document.getElementById('btn-view-grid')?.addEventListener('click', () => setStoreViewMode('grid'));
document.getElementById('btn-view-list')?.addEventListener('click', () => setStoreViewMode('list'));
