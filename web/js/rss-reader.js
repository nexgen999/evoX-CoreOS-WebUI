/**
 * Lecteur RSS unifié pour evoX-CoreOS
 * Utilise la lecture d'OPML et un fallback d'aggrégation
 */

class EvoXRSSReader {
    constructor() {
        this.articles = [];
        this.cacheKey = 'evox_rss_news_cache';
    }

    async init(opmlUrl, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Vérification du cache
        const cached = sessionStorage.getItem(this.cacheKey);
        if (cached) {
            try {
                this.articles = JSON.parse(cached);
                this.render(container);
                return;
            } catch (_) {}
        }

        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
                <i class="fa-solid fa-circle-notch fa-spin accent" style="font-size: 2rem;"></i>
                <p style="margin-top: 1rem;">Chargement des actualités...</p>
            </div>`;

        try {
            // Tentative de chargement d'un JSON pré-agrégé si disponible (ex: rss/news.json)
            const jsonNewsUrl = opmlUrl.replace('source_aio.opml', 'news.json');
            let loadedFromJson = false;

            try {
                const resJson = await fetch(jsonNewsUrl);
                if (resJson.ok) {
                    const data = await resJson.json();
                    if (Array.isArray(data) && data.length > 0) {
                        this.articles = data;
                        loadedFromJson = true;
                    }
                }
            } catch (_) {}

            // Si pas de news.json, on parcourt l'OPML avec proxy dédié
            if (!loadedFromJson) {
                const resOpml = await fetch(opmlUrl);
                if (!resOpml.ok) throw new Error("Impossible de lire le fichier OPML");
                const xmlText = await resOpml.text();
                
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                const outlines = Array.from(xmlDoc.querySelectorAll('outline[xmlUrl]')).slice(0, 15); // Limite aux 15 premiers pour éviter les erreurs de quota

                const fetchPromises = outlines.map(async (outline) => {
                    const url = outline.getAttribute('xmlUrl');
                    let title = outline.getAttribute('title') || outline.getAttribute('text') || 'GitHub';
                    title = title.replace(/Release notes from /i, '').replace(/Commits to /i, '').trim();

                    try {
                        // Utilisation du proxy rss2json
                        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
                        const r = await fetch(apiUrl);
                        if (r.ok) {
                            const d = await r.json();
                            if (d.status === 'ok' && d.items) {
                                d.items.forEach(item => {
                                    this.articles.push({
                                        title: item.title,
                                        link: item.link,
                                        date: new Date(item.pubDate).getTime(),
                                        feed: title,
                                        description: this.cleanText(item.description || item.content || '')
                                    });
                                });
                            }
                        }
                    } catch (_) {}
                });

                await Promise.allSettled(fetchPromises);
                this.articles.sort((a, b) => b.date - a.date);
            }

            if (this.articles.length > 0) {
                sessionStorage.setItem(this.cacheKey, JSON.stringify(this.articles));
            }

            this.render(container);

        } catch (err) {
            container.innerHTML = `
                <div style="padding: 1.5rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                    <i class="fa-solid fa-rss accent" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Les flux RSS en direct sont actuellement bloqués par les politiques CORS de GitHub.</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
                        Pour afficher les actualités sans erreur, génère un fichier <code>news.json</code> dans ton dépôt <code>evoX-CoreOS/rss/</code>.
                    </p>
                </div>`;
        }
    }

    cleanText(html) {
        if (!html) return 'Pas de détails fournis.';
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.trim().substring(0, 160) + '...';
    }

    render(container) {
        if (this.articles.length === 0) {
            container.innerHTML = `<p style="padding: 1rem; text-align: center;">Aucune actualité trouvée.</p>`;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                <span><i class="fa-solid fa-rss accent"></i> Actualités : <strong>${this.articles.length}</strong> entrées</span>
                <button onclick="sessionStorage.removeItem('evox_rss_news_cache'); window.evoXRSS.init(config.sources.opml, 'news-container')" class="btn btn-secondary btn-sm">
                    <i class="fa-solid fa-rotate"></i> Actualiser
                </button>
            </div>
            <div class="cards-grid">
                ${this.articles.map(art => `
                    <div class="item-card news-card">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                                <span class="badge" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis;"><i class="fa-brands fa-github"></i> ${art.feed}</span>
                                <span style="font-size:0.75rem; color: var(--text-muted);">${isNaN(art.date) ? '' : new Date(art.date).toLocaleDateString()}</span>
                            </div>
                            <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem;">${art.title}</h3>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">${art.description}</p>
                        </div>
                        <a href="${art.link}" target="_blank" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem; text-align:center; display:block;">
                            Voir sur GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.evoXRSS = new EvoXRSSReader();
