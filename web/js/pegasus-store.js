window.evoXPegasusStore = {
    rawCatalogData: [],
    currentViewMode: 'grid',
    initialized: false,

    LOCAL_CATALOGS: [
        { name: "DLPS Catalog", url: "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pegasus-dl/dlps.json" },
        { name: "PFS Catalog", url: "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pegasus-dl/pfs.json" },
        { name: "Pippo Catalog", url: "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pegasus-dl/pippo.json" }
    ],

    init: function () {
        const container = document.getElementById('pegasus-store-app');
        if (!container) return;

        if (!this.initialized) {
            this.initialized = true;
            container.innerHTML = `
                <div class="store-controls" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;">
                    <select id="pegasus-catalog-select" class="form-control" style="max-width: 250px;"></select>
                    <input type="text" id="pegasus-search-input" class="form-control" placeholder="Rechercher..." style="flex: 1; min-width: 200px;">
                    <div class="view-toggle-btns" style="display: flex; gap: 0.5rem;">
                        <button id="btn-view-grid" class="btn btn-secondary active" type="button"><i class="fa-solid fa-border-all"></i></button>
                        <button id="btn-view-list" class="btn btn-secondary" type="button"><i class="fa-solid fa-list"></i></button>
                    </div>
                </div>
                <div id="pegasus-store-grid-container"></div>
            `;

            const selectEl = document.getElementById('pegasus-catalog-select');
            const searchEl = document.getElementById('pegasus-search-input');
            const btnGrid = document.getElementById('btn-view-grid');
            const btnList = document.getElementById('btn-view-list');

            selectEl.innerHTML = this.LOCAL_CATALOGS.map(cat => `<option value="${cat.url}">${cat.name}</option>`).join('');

            selectEl.addEventListener('change', (e) => {
                this.loadCatalog(e.target.value);
            });

            searchEl.addEventListener('input', () => {
                this.render();
            });

            btnGrid.addEventListener('click', () => {
                this.currentViewMode = 'grid';
                btnGrid.classList.add('active');
                btnList.classList.remove('active');
                this.render();
            });

            btnList.addEventListener('click', () => {
                this.currentViewMode = 'list';
                btnList.classList.add('active');
                btnGrid.classList.remove('active');
                this.render();
            });

            this.loadCatalog(this.LOCAL_CATALOGS[0].url);
        }
    },

    loadCatalog: async function (url) {
        const container = document.getElementById('pegasus-store-grid-container');
        if (!container) return;

        container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement du catalogue...</p>';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Code HTTP ${response.status}`);
            
            const data = await response.json();

            if (Array.isArray(data)) {
                this.rawCatalogData = data;
            } else if (typeof data === 'object' && data !== null) {
                this.rawCatalogData = data.items || data.downloads || data.gameList || data.games || data.data || [];
            } else {
                this.rawCatalogData = [];
            }

            this.render();
        } catch (err) {
            console.error("Erreur Pegasus Store :", err);
            container.innerHTML = `<p style="color: var(--accent); margin-top: 1rem;"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger le fichier (${err.message}).</p>`;
        }
    },

    render: function () {
        const container = document.getElementById('pegasus-store-grid-container');
        const searchVal = document.getElementById('pegasus-search-input')?.value.toLowerCase() || '';

        if (!container) return;

        const filteredData = this.rawCatalogData.filter(item => {
            const title = item.title || item.name || item.filename || item.pkg_name || '';
            return String(title).toLowerCase().includes(searchVal);
        });

        if (filteredData.length === 0) {
            container.innerHTML = '<p class="section-desc" style="margin-top: 1rem;">Aucun élément disponible ou correspondant à la recherche.</p>';
            return;
        }

        if (this.currentViewMode === 'grid') {
            container.className = 'store-grid';
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))';
            container.style.gap = '1rem';

            container.innerHTML = filteredData.map(item => {
                const title = item.title || item.name || item.filename || item.pkg_name || 'Élément sans nom';
                const downloadUrl = item.url || item.downloadUrl || item.link || item.direct_link || '#';

                return `
                    <div class="item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div class="tile-header" style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fa-solid fa-download accent"></i>
                                <h3 style="margin: 0; font-size: 0.95rem; word-break: break-word;">${title}</h3>
                            </div>
                        </div>
                        <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top: 1rem; text-align: center; text-decoration: none;">
                            <i class="fa-solid fa-download"></i> Télécharger
                        </a>
                    </div>
                `;
            }).join('');
        } else {
            container.className = 'store-list';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '0.5rem';

            container.innerHTML = filteredData.map(item => {
                const title = item.title || item.name || item.filename || item.pkg_name || 'Élément sans nom';
                const downloadUrl = item.url || item.downloadUrl || item.link || item.direct_link || '#';

                return `
                    <div class="item-card" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem;">
                        <span style="font-weight: 500; word-break: break-word; font-size: 0.9rem;">${title}</span>
                        <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="text-decoration: none;">
                            <i class="fa-solid fa-download"></i>
                        </a>
                    </div>
                `;
            }).join('');
        }
    }
};
