let config = {};

// Helper universel de rendu d'icône / photo en bulle
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

function loadReleases() {
    const container = document.getElementById('aio-packs-grid');
    if (!config.releases?.packs) return;

    container.innerHTML = config.releases.packs.map(pack => `
        <div class="item-card">
            <div>
                <div class="tile-header">
                    ${renderTileIcon(pack.icon, 'fa-box')}
                    <h3 style="margin: 0;">${pack.name}</h3>
                </div>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">Pack AIO sous format ZIP.</p>
            </div>
            <a href="${config.releases.baseUrl}${pack.file}" class="btn btn-primary" style="margin-top: 1rem;">
                <i class="fa-solid fa-download"></i> Télécharger ${pack.file}
            </a>
        </div>
    `).join('');
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
