/**
 * Gestionnaire YouTube Creators pour evoX-CoreOS WebUI
 * Affichage des cartes de créateurs avec redirection directe sur YouTube
 */

class EvoXYouTubeManager {
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
                    <div style="margin-top: 1rem;">
                        <a href="${channelUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fa-brands fa-youtube"></i> Voir la chaîne
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
}

window.evoXYouTube = new EvoXYouTubeManager();
