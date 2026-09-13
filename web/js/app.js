document.addEventListener('DOMContentLoaded', () => {

    // 1. GESTION DE LA NAVIGATION PAR ONGLETS
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Retirer l'état actif de tous les boutons et onglets
            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activer l'onglet sélectionné
            btn.classList.add('active');
            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            // Charger le store Pegasus si on clique sur son onglet
            if (targetTab === 'pegasus-store') {
                loadPegasusStore();
            }
        });
    });

    // 2. CRÉDITS SUR LA PAGE D'ACCUEIL
    const creditsList = document.getElementById('credits-list');
    if (creditsList) {
        const credits = [
            'nexgen999',
            'ItsPLK for PLDMGR',
            'Master, Mustafa, SeregonWar, maj0r, ArkSama',
            'aldostools, VoX DoN, BX-AM',
            'Pippo, Phoenixx, Pegasus Dev, DLPS Team',
            'All Scene Community'
        ];

        creditsList.innerHTML = credits.map(c => `
            <li><i class="fa-solid fa-check accent"></i> ${c}</li>
        `).join('');
    }

    // 3. BOUTON DE COPIE URL
    const copyBtn = document.getElementById('btn-copy-pldmgr');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const urlText = document.getElementById('pldmgr-url-display')?.innerText;
            if (urlText) {
                navigator.clipboard.writeText(urlText).then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copié !';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copier';
                    }, 2000);
                });
            }
        });
    }

    // 4. MOTEUR DU PEGASUS STORE
    let rawCatalogData = [];

    const catalogSelect = document.getElementById('pegasus-catalog-select');
    const searchInput = document.getElementById('pegasus-search-input');

    if (catalogSelect) {
        catalogSelect.addEventListener('change', (e) => {
            fetchCatalog(e.target.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderPegasusItems();
        });
    }

    async function fetchCatalog(url) {
        const container = document.getElementById('pegasus-store-grid-container');
        if (!container) return;

        container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement des données du catalogue...</p>';

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Code erreur HTTP: ${res.status}`);
            
            const data = await res.json();

            // Tolérance multi-format des JSON
            if (Array.isArray(data)) {
                rawCatalogData = data;
            } else if (typeof data === 'object' && data !== null) {
                rawCatalogData = data.items || data.downloads || data.gameList || data.games || data.data || [];
            } else {
                rawCatalogData = [];
            }

            renderPegasusItems();

        } catch (err) {
            console.error("Erreur de chargement Pegasus Store :", err);
            container.innerHTML = `<div class="item-card" style="border-color: var(--accent); width: 100%;">
                <h3 style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger le catalogue</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">Détail : ${err.message}</p>
            </div>`;
        }
    }

    function renderPegasusItems() {
        const container = document.getElementById('pegasus-store-grid-container');
        const query = searchInput?.value.toLowerCase() || '';

        if (!container) return;

        const filtered = rawCatalogData.filter(item => {
            const title = item.title || item.name || item.filename || item.pkg_name || '';
            return String(title).toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="section-desc">Aucun élément disponible ou correspondant à la recherche.</p>';
            return;
        }

        container.innerHTML = filtered.map(item => {
            const title = item.title || item.name || item.filename || item.pkg_name || 'Fichier sans nom';
            const link = item.url || item.downloadUrl || item.link || item.direct_link || '#';

            return `
                <div class="item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h3 style="font-size: 0.95rem; word-break: break-word;"><i class="fa-solid fa-file-arrow-down accent"></i> ${title}</h3>
                    </div>
                    <a href="${link}" target="_blank" class="btn btn-primary btn-sm" style="margin-top: 1rem; width: 100%;">
                        <i class="fa-solid fa-download"></i> Télécharger
                    </a>
                </div>
            `;
        }).join('');
    }

    function loadPegasusStore() {
        if (catalogSelect && rawCatalogData.length === 0) {
            fetchCatalog(catalogSelect.value);
        }
    }

});
