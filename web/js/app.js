let config = {};

function renderTileIcon(iconInput, defaultIcon = 'fa-box') {
    if (!iconInput) {
        return `<i class="fa-solid ${defaultIcon} accent"></i>`;
    }
    
    if (iconInput.startsWith('http://') || iconInput.startsWith('https://') || iconInput.includes('/') || iconInput.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
        return `<img src="${iconInput}" alt="icon" class="tile-avatar-img">`;
    }

    return `<i class="fa-solid ${iconInput} accent"></i>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initNavigation();
    loadDashboardInfo();
    loadReleases();
    loadPegasusCatalogs();
    loadWikiTree();
    
    if (window.evoXWebKit && config.webkit) {
        window.evoXWebKit.init(config.webkit);
    }

    if (window.evoXWebUI && config.ps5_webui) {
        window.evoXWebUI.init(config.ps5_webui);
    }

    if (window.evoXYouTube && config.youtube_creators) {
        window.evoXYouTube.init(config.youtube_creators);
    }

    if (window.loadStoreData && config.sources?.json) {
        loadStoreData(config.sources.json);
    }

    if (window.evoXChangelog) {
        const changelogUrl = config.sources?.changelog || 'CHANGELOG.md';
        window.evoXChangelog.init(changelogUrl, 'news-container');
    }
});

async function loadConfig() {
    try {
        const res = await fetch('web/data/config.json');
        config = await res.json();
    } catch (e) {
        console.error('Impossible de charger config.json', e);
    }
}

function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const activeTab = document.getElementById(`tab-${tabId}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeTab) activeTab.classList.add('active');
}

function loadDashboardInfo() {
    if (config.github) {
        document.getElementById('gh-user').textContent = config.github.user;
        document.getElementById('active-repo-display').textContent = config.github.dataRepository;
    }

    const pldmgrDisplay = document.getElementById('pldmgr-url-display');
    const pldmgrBtn = document.getElementById('btn-copy-pldmgr');
    const pldmgrUrl = config.sources?.pldmgr || (config.sources?.json && config.sources.json[0]?.url) || '';

    if (pldmgrDisplay) {
        pldmgrDisplay.textContent = pldmgrUrl || 'Non configuré';
    }

    if (pldmgrBtn && pldmgrUrl) {
        pldmgrBtn.onclick = () => copyToClipboard(pldmgrUrl, pldmgrBtn);
    }

    if (config.credits) {
        document.getElementById('credits-list').innerHTML = config.credits.map(c => `<li><i class="fa-solid fa-check accent"></i> ${c}</li>`).join('');
    }

    if (config.socials) {
        document.getElementById('footer-socials').innerHTML = config.socials.map(s => `<a href="${s.url}" target="_blank">${renderTileIcon(s.icon, 'fa-link')}</a>`).join('');
    }
}

/**
 * Récupère dynamiquement les packs AIO depuis le JSON sur GitHub
 */
async function loadReleases() {
    const container = document.getElementById('aio-packs-grid');
    if (!container) return;

    // URL distante du fichier pack_aio.json
    const packAioUrl = 'https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pack/pack_aio.json';

    try {
        const res = await fetch(packAioUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const packsData = await res.json();
        const items = Array.isArray(packsData) ? packsData : (packsData.packs || packsData.releases || []);

        if (items.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1;">Aucun pack AIO disponible pour le moment.</p>';
            return;
        }

        container.innerHTML = items.map(pack => {
            const name = pack.name || pack.title || 'Pack AIO';
            const fileUrl = pack.url || pack.file || pack.downloadUrl || '#';
            const icon = pack.icon || 'fa-box-archive';
            const description = pack.description || 'Pack AIO disponible en téléchargement direct.';
            const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'Télécharger';

            return `
                <div class="item-card">
                    <div>
                        <div class="tile-header">
                            ${renderTileIcon(icon, 'fa-box-archive')}
                            <h3 style="margin: 0;">${name}</h3>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">${description}</p>
                    </div>
                    <a href="${fileUrl}" target="_blank" class="btn btn-primary" style="margin-top: 1rem; width: 100%; justify-content: center; text-decoration: none;">
                        <i class="fa-solid fa-download"></i> ${fileName}
                    </a>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Erreur lors du chargement des packs AIO distant :', err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 1rem; background: var(--panel-bg, #1a1a1a); border-radius: 8px; border: 1px solid var(--border);">
                <p><i class="fa-solid fa-triangle-exclamation accent"></i> Impossible de charger la liste des packs AIO.</p>
            </div>`;
    }
}

function loadPegasusCatalogs() {
    const container = document.getElementById('pegasus-container');
    if (!config.sources?.pegasus) return;

    container.innerHTML = config.sources.pegasus.map(cat => `
        <div class="item-card">
            <div>
                <div class="tile-header">
                    ${renderTileIcon(cat.icon, 'fa-copy')}
                    <h3 style="margin: 0;">${cat.name}</h3>
                </div>
                <p style="word-break: break-all; font-size:0.85rem; color: var(--text-muted); margin: 0.5rem 0;">${cat.url}</p>
            </div>
            <button onclick="copyToClipboard('${cat.url}', this)" class="btn btn-secondary">
                <i class="fa-solid fa-copy"></i> Copier l'URL
            </button>
        </div>
    `).join('');
}

function copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = `<i class="fa-solid fa-check accent"></i> Copié !`;
        setTimeout(() => {
            btnElement.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Erreur de copie :', err);
    });
}

async function loadWikiTree() {
    const wikiContent = document.getElementById('wiki-content');
    const wikiTree = document.getElementById('wiki-tree');
    
    try {
        const res = await fetch('docs/index.md');
        if (res.ok) {
            const md = await res.text();
            wikiContent.innerHTML = marked.parse(md);
        } else {
            wikiContent.innerHTML = "<p>Aucune documentation dans `docs/index.md`.</p>";
        }
    } catch (e) {
        wikiContent.innerHTML = "<p>Erreur de chargement du wiki.</p>";
    }

    wikiTree.innerHTML = `<ul><li onclick="loadWikiTree()"><i class="fa-solid fa-file"></i> index.md</li></ul>`;
}
