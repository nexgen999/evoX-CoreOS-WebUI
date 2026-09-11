/**
 * Gestionnaire YouTube Creators pour evoX-CoreOS WebUI
 * Utilise les instances publiques Invidious & Invidious API
 */

class EvoXYouTubeManager {
    constructor() {
        this.currentVideoId = null;
        // Instances Invidious publiques fiables
        this.invidiousInstances = [
            'https://inv.riverside.rocks',
            'https://invidious.drgns.space',
            'https://invidious.nerdvpn.de',
            'https://invidious.flokinet.to',
            'https://invidious.privacydev.net'
        ];
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
                        <button onclick="window.evoXYouTube.loadVideos('${c.channelId || c.handle}', '${c.name.replace(/'/g, "\\'")}', '${c.handle}')" class="btn btn-primary" style="flex: 1;">
                            <i class="fa-solid fa-play"></i> Voir les vidéos
                        </button>
                        <a href="${channelUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ouvrir sur YouTube">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadVideos(channelIdOrHandle, name, handle) {
        const container = document.getElementById('youtube-videos-container');
        const list = document.getElementById('youtube-videos-list');
        const channelNameDisplay = document.getElementById('youtube-channel-name');

        if (!container || !list) return;

        if (channelNameDisplay) channelNameDisplay.textContent = name;
        list.innerHTML = `<p style="padding:1rem; text-align:center; grid-column: 1/-1;"><i class="fa-solid fa-circle-notch fa-spin accent"></i> Chargement des vidéos de ${name}...</p>`;
        
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });

        let items = [];

        // 1. Essayer d'interroger les instances Invidious REST API
        for (const instance of this.invidiousInstances) {
            try {
                const endpoint = channelIdOrHandle.startsWith('UC')
                    ? `${instance}/api/v1/channels/${channelIdOrHandle}/latest`
                    : `${instance}/api/v1/channels/search?q=${handle}`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const res = await fetch(endpoint, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        items = data.slice(0, 10).map(v => ({
                            id: v.videoId,
                            title: v.title,
                            thumb: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
                            date: v.published ? new Date(v.published * 1000).toLocaleDateString() : ''
                        }));
                        break; // Succès, on sort de la boucle
                    }
                }
            } catch (_) {
                // Continuer vers l'instance suivante
            }
        }

        // 2. Fallback via Piped API si Invidious n'a pas répondu
        if (items.length === 0 && channelIdOrHandle.startsWith('UC')) {
            try {
                const res = await fetch(`https://pipedapi.kavin.rocks/channel/${channelIdOrHandle}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.relatedStreams) {
                        items = data.relatedStreams.slice(0, 10).map(v => {
                            const videoId = v.url.split('v=')[1];
                            return {
                                id: videoId,
                                title: v.title,
                                thumb: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                                date: v.uploadedDate || ''
                            };
                        });
                    }
                }
            } catch (_) {}
        }

        // Rendu final des tuiles vidéo
        if (items.length > 0) {
            list.innerHTML = items.map(v => `
                <div class="item-card" style="cursor:pointer;" onclick="window.evoXYouTube.playVideo('${v.id}', '${v.title.replace(/'/g, "\\'")}')">
                    <div style="position:relative; width:100%; height:140px; overflow:hidden; border-radius:6px; margin-bottom:0.5rem;">
                        <img src="${v.thumb}" style="width:100%; height:100%; object-fit:cover;">
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(230,0,51,0.85); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff;">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </div>
                    <h4 style="font-size:0.85rem; line-height:1.2; height:2.4em; overflow:hidden;">${v.title}</h4>
                    <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.3rem;"><i class="fa-regular fa-calendar"></i> ${v.date}</span>
                </div>
            `).join('');
        } else {
            const fallbackHandle = handle || channelIdOrHandle;
            list.innerHTML = `
                <div style="padding:1.5rem; text-align:center; grid-column: 1/-1;">
                    <p style="margin-bottom:0.75rem; color:var(--text-muted);">Le flux direct est bloqué par YouTube/CORS.</p>
                    <a href="https://www.youtube.com/@${fallbackHandle}" target="_blank" class="btn btn-primary btn-sm">
                        <i class="fa-brands fa-youtube"></i> Voir la chaîne sur YouTube
                    </a>
                </div>`;
        }
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
