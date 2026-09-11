/**
 * Gestionnaire d'Accès WebUI PS5
 */

class EvoXWebUIManager {
    constructor() {
        this.storageKey = 'evox_ps5_ip_address';
        this.currentIp = localStorage.getItem(this.storageKey) || '192.168.1.50';
    }

    init(services) {
        const ipInput = document.getElementById('ps5-ip-input');
        if (ipInput) {
            ipInput.value = this.currentIp;
            ipInput.addEventListener('input', (e) => {
                this.currentIp = e.target.value.trim();
                localStorage.setItem(this.storageKey, this.currentIp);
                this.renderGrid(services);
            });
        }

        this.renderGrid(services);
    }

    renderGrid(services) {
        const container = document.getElementById('ps5-webui-grid');
        if (!container || !Array.isArray(services)) return;

        const ip = this.currentIp || '192.168.1.50';

        container.innerHTML = services.map(srv => {
            const fullUrl = `http://${ip}:${srv.port}${srv.path || ''}`;
            
            return `
                <div class="item-card">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                            <h3><i class="fa-solid ${srv.icon || 'fa-circle-dot'} accent"></i> ${srv.name}</h3>
                            <span class="badge" style="color:var(--accent);">Port ${srv.port}</span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">${srv.description || 'Service WebUI PS5'}</p>
                        <code style="display:block; margin-top:0.5rem; font-size:0.8rem; background:var(--bg-hover); padding:0.25rem 0.5rem; border-radius:4px; word-break:break-all;">${fullUrl}</code>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button onclick="window.evoXWebUI.openFrame('${fullUrl}', '${srv.name}')" class="btn btn-primary" style="flex: 1;">
                            <i class="fa-solid fa-window-maximize"></i> Dans la page
                        </button>
                        <a href="${fullUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ouvrir dans un nouvel onglet">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    openFrame(url, name) {
        const container = document.getElementById('ps5-webui-frame-container');
        const iframe = document.getElementById('ps5-webui-iframe');
        const title = document.getElementById('ps5-webui-title');
        const extLink = document.getElementById('ps5-webui-external-link');

        // Avertissement si le site maître est en HTTPS et l'IP PS5 en HTTP
        if (window.location.protocol === 'https:' && url.startsWith('http:')) {
            console.warn('[WebUI] Avertissement Mixed Content: le site principal est en HTTPS mais la PS5 est interrogée en HTTP.');
        }

        if (container && iframe) {
            iframe.src = url;
            if (title) title.innerHTML = `<i class="fa-solid fa-server accent"></i> WebUI Viewer — <strong>${name}</strong>`;
            if (extLink) extLink.href = url;

            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    closeFrame() {
        const container = document.getElementById('ps5-webui-frame-container');
        const iframe = document.getElementById('ps5-webui-iframe');
        if (container && iframe) {
            iframe.src = '';
            container.style.display = 'none';
        }
    }
}

window.evoXWebUI = new EvoXWebUIManager();
