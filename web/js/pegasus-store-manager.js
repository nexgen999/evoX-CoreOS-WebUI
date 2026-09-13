/**
 * Gestionnaire Pegasus Store pour evoX-CoreOS WebUI
 */

class EvoXPegasusStoreManager {
    constructor() {
        this.rawItems = [];
    }

    async init(sources) {
        const selectEl = document.getElementById('pegasus-store-select');
        const searchInput = document.getElementById('pegasus-store-search');

        if (!selectEl || !Array.isArray(sources) || sources.length === 0) return;

        // Remplissage du menu déroulant des catalogues
        selectEl.innerHTML = sources.map(s => `<option value="${s.url}">${s.name}</option>`).join('');

        // Écouteurs d'événements
        selectEl.addEventListener('change', (e) => this.loadCatalog(e.target.value));
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAndRender());
        }

        // Chargement du premier catalogue par défaut
        await this.loadCatalog(sources[0].url);
    }

    async loadCatalog(url) {
        const container = document.getElementById('pegasus-store-grid');
        if (!container) return;

        container.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin accent"></i> Chargement du catalogue Pegasus...</p>';

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
            const data = await res.json();

            // Extraction des éléments selon le format JSON
            if (Array.isArray(data)) {
                this.rawItems = data;
            } else if (typeof data === 'object' && data !== null) {
                this.rawItems = data.items || data.downloads || data.gameList || data.games || [];
            } else {
                this.rawItems = [];
            }

            this.filterAndRender();
        } catch (err) {
            console.error('[Pegasus Store Error]', err);
            container.innerHTML = `
                <div style="padding: 1.5rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border); text-align: center; grid-column: 1 / -1;">
                    <i class="fa-solid fa-triangle-exclamation accent" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Impossible de charger le catalogue Pegasus.</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
                </div>`;
        }
    }

    filterAndRender() {
        const container = document.getElementById('pegasus-store-grid');
        const query = document.getElementById('pegasus-store-search')?.value.toLowerCase() || '';

        if (!container) return;

        const filtered = this.rawItems.filter(item => {
            const title = item.title || item.name || item.filename || '';
            return String(title).toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Aucun élément trouvé.</p>';
            return;
        }

        container.className = 'cards-grid';
        container.innerHTML = filtered.map(item => {
            const title = item.title || item.name || item.filename || 'Fichier Pegasus';
            const downloadUrl = item.url || item.downloadUrl || item.link || '#';
            const iconHtml = renderTileIcon(item.icon, 'fa-download');

            return `
                <div class="item-card">
                    <div>
                        <div class="tile-header">
                            ${iconHtml}
                            <h3 style="margin: 0; font-size: 0.95rem; word-break: break-word;">${title}</h3>
                        </div>
                        ${item.description ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">${item.description}</p>` : ''}
                    </div>
                    <a href="${downloadUrl}" target="_blank" class="btn btn-primary btn-sm" style="margin-top: 1rem; width: 100%; justify-content: center;">
                        <i class="fa-solid fa-download"></i> Télécharger
                    </a>
                </div>
            `;
        }).join('');
    }
}

window.evoXPegasusStore = new EvoXPegasusStoreManager();
