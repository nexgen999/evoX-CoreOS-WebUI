(function () {
    let rawCatalogData = [];
    let currentViewMode = 'grid';

    // Adresses brutes vers les fichiers de ton dépôt nexgen999/evoX-CoreOS
    const LOCAL_CATALOGS = [
        { name: "DLPS Catalog", url: "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pegasus-dl/dlps.json" },
        { name: "PFS Catalog", url: "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pegasus-dl/pfs.json" },
        { name: "Pippo Catalog", url: "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pegasus-dl/pippo.json" }
    ];

    window.evoXPegasusStore = {
        init: function () {
            const container = document.getElementById('pegasus-store-app');
            
            if (!container) return;

            container.innerHTML = `
                <div class="store-controls" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;">
                    <select id="pegasus-catalog-select" class="form-control" style="max-width: 250px;"></select>
                    <input type="text" id="pegasus-search-input" class="form-control" placeholder="Rechercher un jeu ou un fichier..." style="flex: 1; min-width: 200px;">
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

            selectEl.innerHTML = LOCAL_CATALOGS.map(cat => `<option value="${cat.url}">${cat.name}</option>`).join('');

            selectEl.addEventListener('change', (e) => {
                this.loadCatalog(e.target.value);
            });

            searchEl.addEventListener('input', () => {
                this.render();
            });

            btnGrid.addEventListener('click', () => {
                currentViewMode = 'grid';
                btnGrid.classList.add('active');
                btnList.classList.remove('active');
                this.render();
            });

            btnList.addEventListener('click', () => {
                currentViewMode = 'list';
                btnList.classList.add('active');
                btnGrid.classList.remove('active');
                this.render();
            });

            this.loadCatalog(LOCAL_CATALOGS[0].url);
        },

        loadCatalog: async function (url) {
            const container = document.getElementById('pegasus-store-grid-container');
            if (!container) return;

            container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement du catalogue Pegasus...</p>';

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                
                const data = await response.json();

                if (Array.isArray(data)) {
                    rawCatalogData = data;
                } else if (Array.isArray(data.items)) {
                    rawCatalogData = data.items;
                } else if (Array.isArray(data.downloads)) {
                    rawCatalogData = data.downloads;
                } else if (Array.isArray(data.gameList)) {
                    rawCatalogData = data.gameList;
                } else {
                    rawCatalogData = [];
                }

                this.render();
            } catch (err) {
                console.error("Erreur de chargement Pegasus Store :", err);
                container.innerHTML = `<p style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Erreur lors de la récupération du catalogue (${err.message}).</p>`;
            }
        },

        render: function () {
            const container = document.getElementById('pegasus-store-grid-container');
            const searchVal = document.getElementById('pegasus-search-input')?.value.toLowerCase() || '';

            if (!container) return;

            const filteredData = rawCatalogData.filter(item => {
                const title = item.title || item.name || item.filename || '';
                return title.toLowerCase().includes(searchVal);
            });

            if (filteredData.length === 0) {
                container.innerHTML = '<p class="section-desc">Aucun élément ne correspond à votre recherche.</p>';
                return;
            }

            if (currentViewMode === 'grid') {
                container.className = 'store-grid';
                container.style.display = 'grid';
                container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                container.style.gap = '1rem';

                container.innerHTML = filteredData.map(item => {
                    const title = item.title || item.name || item.filename || 'Sans titre';
                    const downloadUrl = item.url || item.downloadUrl || item.link || '#';

                    return `
                        <div class="item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div class="tile-header" style="display: flex; align-items: center; gap: 0.75rem;">
                                    <i class="fa-solid fa-download accent"></i>
                                    <h3 style="margin: 0; font-size: 1rem; word-break: break-word;">${title}</h3>
                                </div>
                            </div>
                            <a href="${downloadUrl}" target="_blank" class="btn btn-primary" style="margin-top: 1rem; text-align: center; text-decoration: none;">
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
                    const title = item.title || item.name || item.filename || 'Sans titre';
                    const downloadUrl = item.url || item.downloadUrl || item.link || '#';

                    return `
                        <div class="item-card" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem;">
                            <span style="font-weight: 500; word-break: break-word;">${title}</span>
                            <a href="${downloadUrl}" target="_blank" class="btn btn-primary btn-sm" style="text-decoration: none;">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>
                    `;
                }).join('');
            }
        }
    };
})();
