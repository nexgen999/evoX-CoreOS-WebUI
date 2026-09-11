/**
 * Gestionnaire YouTube Creators pour evoX-CoreOS WebUI
 */

class EvoXYouTubeManager {
    constructor() {
        this.currentVideoId = null;
    }

    /**
     * Initialise la grille des créateurs à partir de config.js ou du paramètre
     */
    init(creatorsFromInit) {
        const creators = creatorsFromInit || (window.evoXConfig && window.evoXConfig.youtubeCreators) || [];
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

    /**
     * Charge et affiche les vidéos avec multi-fallback
     */
    async loadVideos(channelIdOrHandle, name, handle) {
        const container = document.getElementById('youtube-videos-container');
        const list = document.getElementById('youtube-videos-list');
        const channelNameDisplay = document.getElementById('youtube-channel-name');

        if (!container || !list) return;

        if (channelNameDisplay) channelNameDisplay.textContent = name;
        list.innerHTML = `<p style="padding:1rem; text-align:center; grid-column: 1/-1;"><i class="fa-solid fa-circle-notch fa-spin accent"></i> Récupération des dernières vidéos...</p>`;
        
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });

        let items = [];

        // Tentative 1 : RSS2JSON Standard
        try {
            const feedUrl = channelIdOrHandle.startsWith('UC') 
                ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdOrHandle}`
                : `https://www.youtube.com/feeds/videos.xml?user=${channelIdOrHandle}`;
            
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
            const data = await res.json();
            
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                items = data.items.map(v => {
                    const videoId = v.link.includes('v=') ? v.link.split('v=')[1].split('&')[0] : v.guid.split(':').pop();
                    return {
                        id: videoId,
                        title: v.title,
                        thumb: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                        date: new Date(v.pubDate).toLocaleDateString()
                    };
                });
            }
        } catch (e) {
            console.warn('[YouTube API1 Exception]', e);
        }

        // Tentative 2 : Contournement CORS Proxy avec parseur XML natif
        if (items.length === 0 && channelIdOrHandle.startsWith('UC')) {
            try {
                const targetXml = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdOrHandle}`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetXml)}`;
                
                const res = await fetch(proxyUrl);
                const data = await res.json();
                
                if (data.contents) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                    const entries = Array.from(xmlDoc.querySelectorAll("entry")).slice(0, 10);
                    
                    items = entries.map(entry => {
                        const videoId = entry.querySelector("videoId")?.textContent || entry.querySelector("id")?.textContent?.replace('yt:video:', '');
                        const title = entry.querySelector("title")?.textContent || "Vidéo YouTube";
                        const published = entry.querySelector("published")?.textContent;
                        
                        return {
                            id: videoId,
                            title: title,
                            thumb: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                            date: published ? new Date(published).toLocaleDateString() : ''
                        };
                    });
                }
            } catch (e) {
                console.warn('[YouTube API2 Exception]', e);
            }
        }

        // Rendu HTML des vidéos
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
                <div style="padding:1rem; text-align:center; grid-column: 1/-1;">
                    <p style="margin-bottom:0.5rem;">Impossible de charger le flux direct dans la page actuellement (Restriction YouTube/CORS).</p>
                    <a href="https://www.youtube.com/@${fallbackHandle}" target="_blank" class="btn btn-secondary btn-sm">
                        <i class="fa-brands fa-youtube"></i> Voir directement la chaîne sur YouTube
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
