/**
 * Gestionnaire YouTube Creators pour evoX-CoreOS WebUI
 * Intégration iFrame native sans restriction CORS
 */

class EvoXYouTubeManager {
    constructor() {
        this.currentHandle = null;
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
                        <button onclick="window.evoXYouTube.openChannel('${c.handle}', '${c.name.replace(/'/g, "\\'")}')" class="btn btn-primary" style="flex: 1;">
                            <i class="fa-solid fa-play"></i> Ouvrir la chaîne
                        </button>
                        <a href="${channelUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ouvrir sur YouTube">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    openChannel(handle, name) {
        const container = document.getElementById('youtube-videos-container');
        const list = document.getElementById('youtube-videos-list');
        const channelNameDisplay = document.getElementById('youtube-channel-name');

        if (!container || !list) return;

        if (channelNameDisplay) channelNameDisplay.textContent = name;
        this.currentHandle = handle;

        const embedUrl = `https://www.youtube.com/embed?listType=user_uploads&list=${handle}`;
        const directUrl = `https://www.youtube.com/@${handle}`;

        list.innerHTML = `
            <div style="grid-column: 1/-1; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
                        <i class="fa-brands fa-youtube accent"></i> Flux direct de la chaîne <strong>@${handle}</strong>
                    </p>
                    <a href="${directUrl}" target="_blank" class="btn btn-secondary btn-sm">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Ouvrir dans YouTube
                    </a>
                </div>
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 1px solid var(--border);">
                    <iframe src="https://www.youtube-nocookie.com/embed?listType=user_uploads&list=${handle}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
            </div>`;

        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

window.evoXYouTube = new EvoXYouTubeManager();
