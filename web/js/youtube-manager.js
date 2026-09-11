/**
 * Gestionnaire YouTube Creators pour evoX-CoreOS WebUI
 * Intégration Robuste pour GitHub Pages
 */

class EvoXYouTubeManager {
    constructor() {
        this.currentCreator = null;
    }

    init(creatorsFromConfig) {
        const creators = creatorsFromConfig || (typeof config !== 'undefined' && config.youtube_creators) || [];
        const grid = document.getElementById('youtube-creators-grid');
        if (!grid || !Array.isArray(creators)) return;

        grid.innerHTML = creators.map(c => {
            const avatarUrl = c.icon || `https://unavatar.io/youtube/${c.handle}`;
            const channelUrl = `https://www.youtube.com/@${c.handle}`;

            return `
                <div class="item-card">
                    <div>
                        <div class="tile-header">
                            <img src="${avatarUrl}" alt="${c.name}" class="tile-avatar-img" onerror="this.onerror=null; this.src='https://img.youtube.com/vi/default.jpg';">
                            <div>
                                <h3 style="margin:0;">${c.name}</h3>
                                <span style="font-size:0.75rem; color:var(--accent);">@${c.handle}</span>
                            </div>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">${c.description || 'Créateur YouTube PS5'}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button onclick="window.evoXYouTube.openCreator('${c.handle}', '${c.name.replace(/'/g, "\\'")}', '${c.featuredVideo || ''}')" class="btn btn-primary" style="flex: 1;">
                            <i class="fa-solid fa-play"></i> Visionner
                        </button>
                        <a href="${channelUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ouvrir sur YouTube">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    openCreator(handle, name, featuredVideo) {
        const container = document.getElementById('youtube-videos-container');
        const list = document.getElementById('youtube-videos-list');
        const channelNameDisplay = document.getElementById('youtube-channel-name');

        if (!container || !list) return;

        if (channelNameDisplay) channelNameDisplay.textContent = name;
        const channelUrl = `https://www.youtube.com/@${handle}`;

        let embedHtml = '';

        if (featuredVideo) {
            embedHtml = `
                <div style="grid-column: 1/-1; width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
                            <i class="fa-brands fa-youtube accent"></i> Vidéo récente sélectionnée pour <strong>${name}</strong>
                        </p>
                        <a href="${channelUrl}" target="_blank" class="btn btn-secondary btn-sm">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Accéder à la chaîne complète
                        </a>
                    </div>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 1px solid var(--border);">
                        <iframe src="https://www.youtube-nocookie.com/embed/${featuredVideo}?autoplay=1" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                </div>`;
        } else {
            embedHtml = `
                <div style="padding: 2rem; text-align: center; grid-column: 1/-1;" class="panel">
                    <i class="fa-brands fa-youtube accent" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Accès direct à la chaîne de ${name}</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">YouTube bloque l'affichage de la chaîne complète dans un cadre iFrame externe.</p>
                    <a href="${channelUrl}" target="_blank" class="btn btn-primary">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Ouvrir @${handle} sur YouTube
                    </a>
                </div>`;
        }

        list.innerHTML = embedHtml;
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

window.evoXYouTube = new EvoXYouTubeManager();
