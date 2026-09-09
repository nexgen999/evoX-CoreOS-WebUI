let config = {};

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initNavigation();
    initPS5Config();
    loadDashboardInfo();
    loadReleases();
    loadPegasusCatalogs();
    loadWikiTree();
    
    if (window.loadStoreData && config.sources?.json) {
        loadStoreData(config.sources.json);
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
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
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

    if (config.credits) {
        const creditsList = document.getElementById('credits-list');
        creditsList.innerHTML = config.credits.map(c => `<li><i class="fa-solid fa-check accent"></i> ${c}</li>`).join('');
    }

    // Socials
    if (config.socials) {
        const socialsContainer = document.getElementById('footer-socials');
        socialsContainer.innerHTML = config.socials.map(s => `<a href="${s.url}" target="_blank"><i class="${s.icon}"></i></a>`).join('');
    }
}

function loadReleases() {
    const container = document.getElementById('aio-packs-grid');
    if (!config.releases || !config.releases.packs) return;

    container.innerHTML = config.releases.packs.map(pack => `
        <div class="item-card">
            <div>
                <h3><i class="fa-solid ${pack.icon || 'fa-box'} accent"></i> ${pack.name}</h3>
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
    if (!config.sources || !config.sources.pegasus) return;

    container.innerHTML = config.sources.pegasus.map(cat => `
        <div class="item-card">
            <h3>${cat.name}</h3>
            <p style="word-break: break-all; font-size:0.8rem; color: var(--text-muted);">${cat.url}</p>
            <button onclick="navigator.clipboard.writeText('${cat.url}')" class="btn btn-secondary" style="margin-top: 0.5rem;">
                <i class="fa-solid fa-copy"></i> Copier l'URL
            </button>
        </div>
    `).join('');
}

function initPS5Config() {
    const ipInput = document.getElementById('ps5-ip');
    const portInput = document.getElementById('ps5-port');
    
    if (config.ps5) {
        ipInput.value = config.ps5.defaultIp;
        portInput.value = config.ps5.defaultPort;
    }

    document.getElementById('btn-connect-ps5').addEventListener('click', () => {
        const target = `http://${ipInput.value}:${portInput.value}`;
        window.open(target, '_blank');
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
            wikiContent.innerHTML = "<p>Aucune documentation trouvée dans `docs/index.md`.</p>";
        }
    } catch (e) {
        wikiContent.innerHTML = "<p>Erreur lors du chargement de la documentation.</p>";
    }

    wikiTree.innerHTML = `<ul><li onclick="loadWikiTree()"><i class="fa-solid fa-file"></i> index.md</li></ul>`;
}
