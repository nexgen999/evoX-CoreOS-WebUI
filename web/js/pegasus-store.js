/**
 * pegasus-store.js — Module d'affichage du Pegasus Store
 */

(function () {
    let rawCatalogData = [];
    let currentViewMode = 'grid'; // 'grid' ou 'list'

    window.evoXPegasusStore = {
        init: function (config) {
            const storeConfig = config?.sources?.pegasus_store;
            const navBtn = document.getElementById('nav-btn-pegasus-store');

            // Masquer ou afficher l'onglet selon config.json
            if (!storeConfig || storeConfig.visible !== true) {
                if (navBtn) navBtn.style.display = 'none';
                return;
            }

            if (navBtn) navBtn.style.display = 'inline-block';

            // Remplissage du select de catalogues via config.sources.pegasus
            const selectEl = document.getElementById('pegasus-catalog-select');
            const pegasusSources = config?.sources?.pegasus || [];

            if (!selectEl) return;
            selectEl.innerHTML = '';

            if (pegasusSources.length === 0) {
                selectEl.innerHTML = '<option value="">Aucun catalogue disponible</option>';
                return;
            }

            pegasusSources.forEach((src) => {
                const opt = document.createElement('option');
                opt.value = src.url;
                opt.textContent = src.name || src.url;
                selectEl.appendChild(opt);
            });

            // Events
            selectEl.addEventListener('change', () => this.loadCatalog(selectEl.value));
            
            const searchInput = document.getElementById('pegasus-store-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => this.render());
            }

            const btnGrid = document.getElementById('btn-ps-view-grid');
            const btnList = document.getElementById('btn-ps-view-list');

            if (btnGrid && btnList) {
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
            }

            // Chargement du premier catalogue par défaut
            if (pegasusSources.length > 0) {
                this.loadCatalog(pegasusSources[0].url);
            }
        },

        loadCatalog: async function (url) {
            const container = document.getElementById('pegasus-store-container');
            if (!container) return;

            container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement du catalogue Pegasus...</p>';

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

                const data = await response.json();
                
                // Adaptation de la structure JSON (supporte array direct, data.items, ou data.downloads)
                if (Array.isArray(data)) {
                    rawCatalogData = data;
                } else if (Array.isArray(data.items)) {
                    rawCatalogData = data.items;
                } else if (Array.isArray(data.downloads)) {
                    rawCatalogData = data.downloads;
                } else {
                    rawCatalogData = [];
                }

                this.render();
            } catch (err) {
                console.error("Erreur de chargement du catalogue Pegasus:", err);
                container.innerHTML = `<p style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Erreur lors de la récupération des données (${err.message}).</p>`;
            }
        },

        render: function () {
            const container = document.getElementById('pegasus-store-container');
            const searchVal = (document.getElementById('pegasus-store-search')?.value || '').toLowerCase().trim();

            if (!container) return;

            // Filtrage par recherche
            const filtered = rawCatalogData.filter((item) => {
                const name = (item.title || item.name || '').toLowerCase();
                const desc = (item.description || item.summary || '').toLowerCase();
                const cat = (item.category || '').toLowerCase();
                return name.includes(searchVal) || desc.includes(searchVal) || cat.includes(searchVal);
            });

            if (filtered.length === 0) {
                container.innerHTML = '<p class="section-desc">Aucun élément ne correspond à votre recherche.</p>';
                return;
            }

            if (currentViewMode === 'grid') {
                container.className = 'cards-grid';
                container.innerHTML = filtered.map((item) => this.createCardHtml(item)).join('');
            } else {
                container.className = 'store-list-view';
                container.innerHTML = `
                    <table class="store-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Détails</th>
                                <th>Téléchargements</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map((item) => this.createRowHtml(item)).join('')}
                        </tbody>
                    </table>
                `;
            }
        },

        createCardHtml: function (item) {
            const title = item.title || item.name || 'Fichier sans titre';
            const img = item.image || item.cover || item.icon || 'web/assets/logo.png';
            const desc = item.description || item.summary || 'Aucune description disponible.';
            const size = item.size ? `<span class="badge">💾 ${item.size}</span>` : '';
            const cat = item.category ? `<span class="badge">📁 ${item.category}</span>` : '';

            return `
                <div class="item-card">
                    <div>
                        <img src="${img}" alt="${title}" class="pegasus-card-img" onerror="this.src='web/assets/logo.png'">
                        <h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">${title}</h3>
                        <div class="pegasus-item-meta">${cat} ${size}</div>
                        <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.3;">${desc}</p>
                    </div>
                    <div class="pegasus-download-group">
                        ${this.generateDownloadButtons(item)}
                    </div>
                </div>
            `;
        },

        createRowHtml: function (item) {
            const title = item.title || item.name || 'Fichier sans titre';
            const img = item.image || item.cover || item.icon || 'web/assets/logo.png';
            const desc = item.description || item.summary || 'Aucune description.';
            const size = item.size ? `<span class="badge">💾 ${item.size}</span>` : '';

            return `
                <tr>
                    <td>
                        <img src="${img}" alt="${title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;" onerror="this.src='web/assets/logo.png'">
                    </td>
                    <td style="font-weight: 600;">${title}</td>
                    <td class="table-desc">${desc} ${size}</td>
                    <td>
                        <div class="pegasus-download-group">
                            ${this.generateDownloadButtons(item)}
                        </div>
                    </td>
                </tr>
            `;
        },

        generateDownloadButtons: function (item) {
            // Traitement des liens (soit tableau item.links, soit chaîne unique item.url / item.download)
            if (Array.isArray(item.links) && item.links.length > 0) {
                return item.links.map((link) => `
                    <a href="${link.url}" target="_blank" rel="noopener" class="btn-download-host">
                        <i class="fa-solid fa-download"></i> ${link.name || link.host || 'Lien'}
                    </a>
                `).join('');
            }

            const singleUrl = item.url || item.download || item.link;
            if (singleUrl) {
                return `
                    <a href="${singleUrl}" target="_blank" rel="noopener" class="btn-download-host">
                        <i class="fa-solid fa-download"></i> Télécharger
                    </a>
                `;
            }

            return '<span style="font-size: 0.75rem; color: var(--text-muted);">Aucun lien</span>';
        }
    };
})();
