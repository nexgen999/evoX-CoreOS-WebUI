/**
 * Application Core - evoX CoreOS WebUI
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Gestion des Onglets
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });

    // 2. Chargement du fichier de configuration
    let config = {};
    try {
        const res = await fetch('config.json');
        if (res.ok) {
            config = await res.json();
        }
    } catch (e) {
        console.warn('[Core] Impossible de charger config.json, passage aux valeurs par défaut.');
    }

    // 3. Initialisation des différents modules
    if (window.evoXStore && config.store_sources) {
        window.evoXStore.init(config.store_sources);
    }

    if (window.evoXPegasusStore && config.pegasus_store) {
        window.evoXPegasusStore.init(config.pegasus_store);
    }

    if (window.evoXWebkit) {
        window.evoXWebkit.init();
    }

    if (window.evoXWebUI) {
        window.evoXWebUI.init();
    }

    if (window.evoXYouTube) {
        window.evoXYouTube.init();
    }

    if (window.evoXChangelog) {
        window.evoXChangelog.init();
    }
});

/**
 * Utilitaire global pour le rendu d'icônes (FontAwesome vs Image)
 */
function renderTileIcon(iconData, fallbackClass = 'fa-box') {
    if (!iconData) {
        return `<i class="fa-solid ${fallbackClass} tile-icon"></i>`;
    }
    if (iconData.startsWith('http://') || iconData.startsWith('https://') || iconData.startsWith('data:image')) {
        return `<img src="${iconData}" alt="icon" class="tile-icon-img">`;
    }
    return `<i class="${iconData} tile-icon"></i>`;
}
