/**
 * Lecteur RSS surpuissant autonome pour evoX-CoreOS
 * Analyse OPML + Multi-Proxy CORS Fallback + Rendu réactif
 */

class EvoXRSSReader {
    constructor() {
        this.articles = [];
        this.proxies = [
            url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            url => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
        ];
    }

    async init(opmlUrl, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="rss-loading" style="padding: 1.5rem; text-align: center;">
                <i class="fa-solid fa-spinner fa-spin accent"></i> Chargement et analyse des flux OPML...
            </div>`;

        try {
            const xmlText = await this.fetchWithFallback(opmlUrl);
            const feedUrls = this.parseOPML(xmlText);

            if (feedUrls.length === 0) {
                container.innerHTML = '<p class="rss-error">Aucun flux valide trouvé dans le fichier OPML.</p>';
                return;
            }

            container.innerHTML = `<p style="padding: 1rem;"><i class="fa-solid fa-sync fa-spin"></i> Récupération de ${feedUrls.length} sources RSS en cours...</p>`;
            
            this.articles = [];
            const fetchPromises = feedUrls.map(feed => this.fetchFeed(feed));
            await Promise.allSettled(fetchPromises);

            this.articles.sort((a, b) => b.date - a.date);
            this.render(container);

        } catch (err) {
            console.error('Erreur globale RSS:', err);
            container.innerHTML = `<p class="rss-error" style="color: #ff5555; padding: 1rem;"><i class="fa-solid fa-triangle-exclamation"></i> Échec du chargement des flux OPML. Vérifiez la connexion ou les règles CORS.</p>`;
        }
    }

    parseOPML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const outlines = xmlDoc.querySelectorAll('outline[xmlUrl]');
        const feeds = [];

        outlines.forEach(outline => {
            const url = outline.getAttribute('xmlUrl');
            const title = outline.getAttribute('title') || outline.getAttribute('text') || 'Feed RSS';
            if (url) feeds.push({ title, url });
        });

        return feeds;
    }

    async fetchFeed(feed) {
        try {
            const content = await this.fetchWithFallback(feed.url);
            
            // Si la réponse est un JSON (proxy rss2json)
            if (content.startsWith('{')) {
                const data = JSON.parse(content);
                if (data.items) {
                    data.items.forEach(item => {
                        this.articles.push({
                            title: item.title,
                            link: item.link,
                            date: new Date(item.pubDate || Date.now()),
                            feed: feed.title,
                            description: this.cleanDescription(item.description || item.content || '')
                        });
                    });
                }
                return;
            }

            // Sinon analyse du document XML Atom / RSS
            const parser = new DOMParser();
            const xml = parser.parseFromString(content, "text/xml");
            const items = xml.querySelectorAll("item, entry");

            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "Sans titre";
                const link = item.querySelector("link")?.getAttribute("href") || item.querySelector("link")?.textContent || "#";
                const pubDate = item.querySelector("pubDate, updated, published")?.textContent;
                const desc = item.querySelector("description, summary, content")?.textContent || "";

                this.articles.push({
                    title,
                    link,
                    date: pubDate ? new Date(pubDate) : new Date(),
                    feed: feed.title,
                    description: this.cleanDescription(desc)
                });
            });
        } catch (e) {
            console.warn(`Erreur sur le flux RSS [${feed.title}]:`, e);
        }
    }

    async fetchWithFallback(url) {
        // Essai direct d'abord
        try {
            const direct = await fetch(url);
            if (direct.ok) return await direct.text();
        } catch (_) {}

        // Fallback sur les proxies
        for (const proxyFn of this.proxies) {
            try {
                const res = await fetch(proxyFn(url));
                if (res.ok) return await res.text();
            } catch (_) {}
        }
        throw new Error(`Impossible de récupérer : ${url}`);
    }

    cleanDescription(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.trim().substring(0, 180) + (text.length > 180 ? '...' : '');
    }

    render(container) {
        if (this.articles.length === 0) {
            container.innerHTML = '<p>Aucune actualité disponible pour le moment.</p>';
            return;
        }

        container.innerHTML = `
            <div class="news-stats-bar" style="margin-bottom: 1rem;">
                <span><i class="fa-solid fa-newspaper accent"></i> <strong>${this.articles.length}</strong> articles récupérés</span>
            </div>
            <div class="news-grid-cards cards-grid">
                ${this.articles.map(art => `
                    <div class="item-card news-card">
                        <div>
                            <div class="news-card-header" style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                                <span class="badge">${art.feed}</span>
                                <span class="news-date" style="font-size: 0.8rem; opacity: 0.7;"><i class="fa-regular fa-clock"></i> ${isNaN(art.date) ? '' : art.date.toLocaleDateString()}</span>
                            </div>
                            <h3><a href="${art.link}" target="_blank" class="news-title-link" style="text-decoration:none; color:inherit;">${art.title}</a></h3>
                            <p class="news-desc" style="color: var(--text-muted); font-size: 0.85rem; margin-top:0.5rem;">${art.description}</p>
                        </div>
                        <a href="${art.link}" target="_blank" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem; display:inline-block; text-align:center;">
                            Lire l'article <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.evoXRSS = new EvoXRSSReader();
