/**
 * Moteur WebKit Intégré pour evoX-CoreOS WebUI
 */

class EvoXWebKitManager {
    constructor() {
        this.currentUrl = null;
    }

    init(sites) {
        const grid = document.getElementById('webkit-grid');
        if (!grid || !Array.isArray(sites)) return;

        grid.innerHTML = sites.map(site => `
            <div class="item-card">
                <div>
                    <h3><i class="fa-solid ${site.icon || 'fa-globe'} accent"></i> ${site.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">${site.description || site.url}</p>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="window.evoXWebKit.open('${site.url}', '${site.name}')" class="btn btn-primary" style="flex: 1;">
                        <i class="fa-solid fa-window-maximize"></i> Dans la page
                    </button>
                    <a href="${site.url}" target="_blank" class="btn btn-secondary btn-sm" title="Ouvrir dans un nouvel onglet">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    open(url, name) {
        const container = document.getElementById('webkit-frame-container');
        const iframe = document.getElementById('webkit-iframe');
        const title = document.getElementById('webframe-title');
        const extLink = document.getElementById('webframe-external-link');

        if (container && iframe) {
            this.currentUrl = url;
            iframe.src = url;
            if (title) title.innerHTML = `<i class="fa-solid fa-globe accent"></i> WebKit Viewer — <strong>${name}</strong>`;
            if (extLink) extLink.href = url;

            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    reload() {
        const iframe = document.getElementById('webkit-iframe');
        if (iframe && this.currentUrl) {
            iframe.src = this.currentUrl;
        }
    }

    close() {
        const container = document.getElementById('webkit-frame-container');
        const iframe = document.getElementById('webkit-iframe');
        if (container && iframe) {
            iframe.src = '';
            container.style.display = 'none';
            this.currentUrl = null;
        }
    }
}

window.evoXWebKit = new EvoXWebKitManager();
