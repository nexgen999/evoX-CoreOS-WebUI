document.addEventListener('DOMContentLoaded', () => {

    // --- NAVIGATION ENTRE ONGLETS ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            // Déclencheurs de chargement dynamique
            if (targetTab === 'news') loadChangelog();
            if (targetTab === 'store-json') loadPayloadsJson();
            if (targetTab === 'pegasus-store') initPegasusStore();
        });
    });

    // --- CRÉDITS ---
    const creditsList = document.getElementById('credits-list');
    if (creditsList) {
        const credits = [
            'nexgen999', 'ItsPLK for PLDMGR',
            'Master, Mustafa, SeregonWar, maj0r, ArkSama',
            'aldostools, VoX DoN, BX-AM',
            'Pippo, Phoenixx, Pegasus Dev, DLPS Team',
            'All Scene Community'
        ];
        creditsList.innerHTML = credits.map(c => `<li><i class="fa-solid fa-check accent"></i> ${c}</li>`).join('');
    }

    // --- COPIE URL ---
    const copyBtn = document.getElementById('btn-copy-pldmgr');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const urlText = document.getElementById('pldmgr-url-display')?.innerText;
            if (urlText) {
                navigator.clipboard.writeText(urlText).then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copié !';
                    setTimeout(() => copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copier', 2000);
                });
            }
        });
    }

    // --- CHARGEMENT DU CHANGELOG.MD (NEWS & FEEDS) ---
    async function loadChangelog() {
        const container = document.getElementById('news-container');
        if (!container) return;

        container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement du CHANGELOG.md...</p>';

        try {
            const res = await fetch('https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/CHANGELOG.md');
            if (!res.ok) throw new Error(`Code HTTP ${res.status}`);
            const markdownText = await res.text();

            if (window.marked) {
                container.innerHTML = `<div class="item-card markdown-body">${window.marked.parse(markdownText)}</div>`;
            } else {
                container.innerHTML = `<div class="item-card"><pre style="white-space: pre-wrap;">${markdownText}</pre></div>`;
            }
        } catch (err) {
            container.innerHTML = `<p style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Erreur au chargement du Changelog : ${err.message}</p>`;
        }
    }

    // --- CHARGEMENT DE PAYLOADS.JSON (STORE JSON) ---
    async function loadPayloadsJson() {
        const container = document.getElementById('store-json-container');
        if (!container) return;

        container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement de payloads.json...</p>';

        try {
            const res = await fetch('json/payloads.json');
            if (!res.ok) throw new Error(`Code HTTP ${res.status}`);
            const data = await res.json();

            const items = Array.isArray(data) ? data : (data.payloads || data.items || []);

            if (items.length === 0) {
                container.innerHTML = '<p class="section-desc">Aucun payload trouvé dans le JSON.</p>';
                return;
            }

            container.className = 'store-grid';
            container.innerHTML = items.map(item => `
                <div class="item-card">
                    <h3><i class="fa-solid fa-cube accent"></i> ${item.name || item.title || 'Payload'}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.5rem 0;">${item.description || 'Pas de description.'}</p>
                    ${item.url ? `<a href="${item.url}" target="_blank" class="btn btn-primary btn-sm"><i class="fa-solid fa-download"></i> Télécharger</a>` : ''}
                </div>
            `).join('');
        } catch (err) {
            container.innerHTML = `<p style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de lire payloads.json : ${err.message}</p>`;
        }
    }

    // --- PEGASUS STORE DYNAMIQUE ---
    let pegasusInit = false;

    function initPegasusStore() {
        if (pegasusInit) return;
        pegasusInit = true;

        const selectEl = document.getElementById('pegasus-catalog-select');
        const searchEl = document.getElementById('pegasus-search-input');

        if (selectEl) {
            selectEl.addEventListener('change', (e) => fetchPegasusCatalog(e.target.value));
            fetchPegasusCatalog(selectEl.value);
        }

        if (searchEl) {
            searchEl.addEventListener('input', () => renderPegasusStore());
        }
    }

    let pegasusItems = [];

    async function fetchPegasusCatalog(url) {
        const container = document.getElementById('pegasus-store-grid-container');
        if (!container) return;

        container.innerHTML = '<p class="section-desc"><i class="fa-solid fa-spinner fa-spin"></i> Chargement du catalogue...</p>';

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Code HTTP ${res.status}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                pegasusItems = data;
            } else if (typeof data === 'object' && data !== null) {
                pegasusItems = data.items || data.downloads || data.gameList || data.games || [];
            } else {
                pegasusItems = [];
            }

            renderPegasusStore();
        } catch (err) {
            container.innerHTML = `<p style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Erreur catalogue : ${err.message}</p>`;
        }
    }

    function renderPegasusStore() {
        const container = document.getElementById('pegasus-store-grid-container');
        const query = document.getElementById('pegasus-search-input')?.value.toLowerCase() || '';

        if (!container) return;

        const filtered = pegasusItems.filter(item => {
            const title = item.title || item.name || item.filename || '';
            return String(title).toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="section-desc">Aucun élément trouvé.</p>';
            return;
        }

        container.className = 'store-grid';
        container.innerHTML = filtered.map(item => `
            <div class="item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 style="font-size: 0.95rem; word-break: break-word;"><i class="fa-solid fa-download accent"></i> ${item.title || item.name || 'Fichier'}</h3>
                </div>
                <a href="${item.url || item.downloadUrl || '#'}" target="_blank" class="btn btn-primary btn-sm" style="margin-top: 1rem;">
                    <i class="fa-solid fa-download"></i> Télécharger
                </a>
            </div>
        `).join('');
    }

});
