let config = {};

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initNavigation();
    loadDashboardInfo();
    loadReleases();
    loadPegasusCatalogs();
    loadWikiTree();
    
    // Chargement du store JSON
    if (window.loadStoreData && config.sources?.json) {
        loadStoreData(config.sources.json);
    }

    // Chargement du lecteur RSS dédié
    if (window.evoXRSS && config.sources?.opml) {
        window.evoXRSS.init(config.sources.opml, 'news-container');
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

    if (config.credits) {
        document.getElementById('credits-list').innerHTML = config.credits.map(c => `<li><i class="fa-solid fa-check accent"></i> ${c}</li>`).join('');
    }

    if (config.socials) {
        document.getElementById('footer-socials').innerHTML = config.socials.map(s => `<a href="${s.url}" target="_blank"><i class="${s.icon}"></i></a>`).join('');
    }
}

function loadReleases() {
    const container = document.getElementById('aio-packs-grid');
    if (!config.releases?.packs) return;

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
    if (!config.sources?.pegasus) return;

    container.innerHTML = config.sources.pegasus.map(cat => `
        <div class="item-card">
            <h3>${cat.name}</h3>
            <p style="word-break: break-all; font-size:0.85rem; color: var(--text-muted); margin: 0.5rem 0;">${cat.url}</p>
            <button onclick="copyToClipboard('${cat.url}', this)" class="btn btn-secondary">
                <i class="fa-solid fa-copy"></i> Copier l'URL
            </button>
        </div>
    `).join('');
}

function copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = `<i class="fa-solid fa-check"></i> Copié !`;
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
