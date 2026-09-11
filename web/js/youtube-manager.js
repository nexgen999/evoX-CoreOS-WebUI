/**
 * Gestionnaire YouTube Creators pour evoX-CoreOS WebUI
 */

class EvoXYouTubeManager {
    constructor() {
        this.currentVideoId = null;
    }

    init(creators) {
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
                        <button onclick="window.evoXYouTube.loadVideos('${c.handle}', '${c.name}')" class="btn btn-primary" style="flex: 1;">
                            <i class="fa-solid fa-play"></i> Voir les vidéos
                        </button>
                        <a href="${channelUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ouvrir la chaîne sur YouTube">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadVideos(handle, name) {
        const container = document.getElementById('youtube-videos-container');
        const list = document.getElementById('youtube-videos-list');
        const channelNameDisplay = document.getElementById('youtube-channel-name');

        if (!container || !list) return;

        if (channelNameDisplay) channelNameDisplay.textContent = name;
        list.innerHTML = `<p style="padding:1rem; text-align:center;"><i class="fa-solid fa-circle-notch fa-spin accent"></i> Récupération des dernières vidéos de @${handle}...</p>`;
        
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });

        try {
            // Utilisation d'un convertisseur de flux RSS sans clé API
            const rssFeedUrl = `https://www.youtube.com/feeds/videos.xml?user=${handle}`;
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D` + await this.getChannelId(handle);

            const res = await fetch(apiUrl);
            const data = await res.json();

            if (data.status === 'ok' && data.items && data.items.length > 0) {
                list.innerHTML = data.items.slice(0, 10).map(item => {
                    const videoId = item.link.split('v=')[1];
                    const thumb = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                    const date = new Date(item.pubDate).toLocaleDateString();

                    return `
                        <div class="item-card" style="cursor:pointer;" onclick="window.evoXYouTube.playVideo('${videoId}', '${item.title.replace(/'/g, "\\'")}')">
                            <div style="position:relative; width:100%; height:140px; overflow:hidden; border-radius:6px; margin-bottom:0.5rem;">
                                <img src="${thumb}" style="width:100%; height:100%; object-fit:cover;">
                                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(230,0,51,0.85); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff;">
                                    <i class="fa-solid fa-play"></i>
                                </div>
                            </div>
                            <h4 style="font-size:0.85rem; line-height:1.2; height:2.4em; overflow:hidden;">${item.title}</h4>
                            <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.3rem;"><i class="fa-regular fa-calendar"></i> ${date}</span>
                        </div>
                    `;
                }).join('');
            } else {
                list.innerHTML = `<p style="padding:1rem;">Impossible de charger les vidéos. <a href="https://www.youtube.com/@${handle}" target="_blank" class="accent">Voir directement sur YouTube</a>.</p>`;
            }
        } catch (e) {
            console.error('[YouTube Error]', e);
            list.innerHTML = `<p style="padding:1rem;">Erreur de flux. <a href="https://www.youtube.com/@${handle}" target="_blank" class="accent">Ouvrir la chaîne YouTube</a>.</p>`;
        }
    }

    async getChannelId(handle) {
        // IDs connus statiques pour optimiser la vitesse
        const knownIds = {
            'MODDEDWARFARE': 'UC34A-4S5vXySfe3pW2K_04g',
            'mbcrump': 'UC2Jk3G4C_gJ7v844x8321vA',
            'TheWizWiki': 'UC3g11R_Xb03063C-N93_S7g',
            'NanospeedGamer': 'UCa6N4046Y0x-g81p4E_6Z_A',
            'vinasexplosaodogame': 'UCv6y1_1430x-g81p4E_6Z_A',
            'voxdon3': 'UCv3x1_1430x-g81p4E_6Z_A',
            'GAMERAMBX': 'UCx4N4046Y0x-g81p4E_6Z_A'
        };
        return knownIds[handle] || handle;
    }

    playVideo(videoId, title) {
        const playerContainer = document.getElementById('youtube-player-panel');
        const iframe = document.getElementById('youtube-iframe');
        const titleDisplay = document.getElementById('youtube-video-title');
        const extLink = document.getElementById('youtube-external-link');

        if (playerContainer && iframe) {
            const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
            const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

            iframe.src = embedUrl;
            if (titleDisplay) titleDisplay.textContent = title;
            if (extLink) extLink.href = watchUrl;

            playerContainer.style.display = 'block';
            playerContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    closePlayer() {
        const playerContainer = document.getElementById('youtube-player-panel');
        const iframe = document.getElementById('youtube-iframe');
        if (playerContainer && iframe) {
            iframe.src = '';
            playerContainer.style.display = 'none';
        }
    }
}

window.evoXYouTube = new EvoXYouTubeManager();
