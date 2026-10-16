let config = {};

function renderTileIcon(iconInput, defaultIcon = 'fa-box') {
    if (!iconInput) {
        return `<i class="fa-solid ${defaultIcon} accent"></i>`;
    }
    
    if (iconInput.startsWith('http://') || iconInput.startsWith('https://') || iconInput.includes('/') || iconInput.match(/\.(png|jpg|jpeg|svg|webp)\$/i)) {
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

async function loadReleases() {
    const container = document.getElementById('aio-packs-container') || document.getElementById('aio-packs-grid');
    if (!container) return;

    const packAioUrl = config.releases?.aio_pack_json || 'https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/json/pack/pack_aio.json';

    try {
        const res = await fetch(packAioUrl);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        
        const packsData = await res.json();
        const items = Array.isArray(packsData) ? packsData : (packsData.packs || []);

        if (items.length === 0) {
            container.innerHTML = '<p style="padding: 2rem; text-align: center;">Aucun pack AIO disponible.</p>';
            return;
        }

        let rowsHtml = '';
        for (let i = 0; i < items.length; i++) {
            const pack = items[i];
            const name = pack.display_name || pack.name || 'Pack AIO';
            const fileName = pack.filename || 'archive.zip';
            const fileUrl = pack.url || '#';
            const packType = pack.pack_type ? pack.pack_type.toUpperCase() : 'AIO';
            const size = pack.size_mb ? pack.size_mb + ' Mo' : '-';

            rowsHtml += '<tr>' +
                '<td><strong>' + name + '</strong></td>' +
                '<td><span class="badge">' + packType + '</span></td>' +
                '<td><span style="color: var(--text-muted); font-size: 0.85rem;">' + size + '</span></td>' +
                '<td><span class="badge" style="background: var(--bg-hover); color: var(--accent);"><i class="fa-solid fa-file-zipper"></i> ' + fileName + '</span></td>' +
                '<td style="text-align: center;">' +
                    '<a href="' + fileUrl + '" target="_blank" class="btn btn-secondary btn-sm" title="Télécharger le pack">' +
                        '<i class="fa-solid fa-download"></i>' +
                    '</a>' +
                '</td>' +
            '</tr>';
        }

        container.className = 'store-list-view';
        container.innerHTML = '<table class="store-table">' +
            '<thead>' +
                '<tr>' +
                    '<th>Nom du Pack</th>' +
                    '<th>Type</th>' +
                    '<th>Taille</th>' +
                    '<th>Fichier Archive</th>' +
                    '<th style="text-align: center;">Action</th>' +
                '</tr>' +
            '</thead>' +
            '<tbody>' +
                rowsHtml +
            '</tbody>' +
        '</table>';

    } catch (err) {
        console.error('Erreur lors du chargement des packs AIO :', err);
        container.innerHTML = '<div style="padding: 1.5rem; text-align: center;"><p style="color: var(--accent);"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger la liste des packs AIO.</p></div>';
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

/**
 * Charge dynamiquement l'arborescence des fichiers .md du dossier docs via l'API GitHub
 */
async function loadWikiTree() {
    const wikiContent = document.getElementById('wiki-content');
    const wikiTree = document.getElementById('wiki-tree');
    if (!wikiContent || !wikiTree) return;

    const repoUser = config.github?.user || 'nexgen999';
    const repoName = config.github?.dataRepository || 'evoX-CoreOS-WebUI';
    const apiUrl = `https://api.github.com/repos/${repoUser}/${repoName}/contents/docs`;

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('API GitHub indisponible');
        
        const files = await res.json();
        const mdFiles = files.filter(f => f.name.endsWith('.md'));

        if (mdFiles.length === 0) {
            wikiTree.innerHTML = '<p style="padding:1rem; font-size:0.85rem;">Aucun document trouvé.</p>';
            return;
        }

        let listHtml = '<ul style="list-style:none; padding:0; margin:0;">';
        mdFiles.forEach((f, idx) => {
            const activeClass = idx === 0 ? 'style="font-weight:bold; color:var(--accent); cursor:pointer; padding:0.4rem 0;"' : 'style="cursor:pointer; padding:0.4rem 0;"';
            listHtml += `<li onclick="loadWikiPage('${f.path}', this)" ${activeClass}><i class="fa-solid fa-file-lines"></i> ${f.name}</li>`;
        });
        listHtml += '</ul>';

        wikiTree.innerHTML = listHtml;

        // Charge le premier fichier (ex: index.md) par défaut
        if (mdFiles.length > 0) {
            loadWikiPage(mdFiles[0].path);
        }
    } catch (e) {
        console.warn('Fallback wiki direct :', e);
        // Fallback local au cas où l'API est bloquée
        wikiTree.innerHTML = '<ul><li onclick="loadWikiPage(\'docs/index.md\', this)" style="cursor:pointer;"><i class="fa-solid fa-file"></i> index.md</li></ul>';
        loadWikiPage('docs/index.md');
    }
}

/**
 * Lit et affiche le contenu du fichier .md sélectionné
 */
async function loadWikiPage(filePath, element) {
    const wikiContent = document.getElementById('wiki-content');
    if (!wikiContent) return;

    if (element) {
        document.querySelectorAll('#wiki-tree li').forEach(el => {
            el.style.fontWeight = 'normal';
            el.style.color = '';
        });
        element.style.fontWeight = 'bold';
        element.style.color = 'var(--accent)';
    }

    try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const md = await res.text();
        wikiContent.innerHTML = marked.parse(md);
    } catch (e) {
        wikiContent.innerHTML = `<p style="color: var(--accent); padding:1rem;"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger la page (${filePath}).</p>`;
    }
}
