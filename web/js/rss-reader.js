/**
 * Lecteur RSS / Atom Ultra-Robuste pour evoX-CoreOS
 * Conçu spécifiquement pour contourner les erreurs CORS, 403, 422 et 500 des flux GitHub.
 */

class EvoXRSSReader {
    constructor() {
        this.articles = [];
        this.cacheKey = 'evox_rss_cache_v1';
        this.cacheTTL = 10 * 60 * 1000; // Cache de 10 minutes
    }

    async init(opmlUrl, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Vérification du cache local
        const cached = this.getCache();
        if (cached && cached.length > 0) {
            this.articles = cached;
            this.render(container, true);
            return;
        }

        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
                <i class="fa-solid fa-circle-notch fa-spin accent" style="font-size: 2rem;"></i>
                <p style="margin-top: 1rem; color: var(--text-main);">Chargement du fichier OPML et récupération des flux...</p>
            </div>`;

        try {
            // Récupération du fichier OPML
            const opmlText = await this.fetchRawText(opmlUrl);
            if (!opmlText) {
                throw new Error("Impossible de lire le fichier OPML source.");
            }

            const feeds = this.parseOPML(opmlText);
            if (feeds.length === 0) {
                container.innerHTML = `<p style="padding: 1rem; color: #ff5555;">Aucun flux valide trouvé dans le fichier OPML.</p>`;
                return;
            }

            container.innerHTML = `
                <div style="padding: 1rem; background: var(--bg-card); border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--border);">
                    <i class="fa-solid fa-sync fa-spin accent"></i> Traitement de <strong>${feeds.length}</strong> sources RSS...
                </div>`;

            this.articles = [];

            // Traitement séquentiel ou par petits paquets pour ne pas être bannis par les limites IP
            const batchSize = 3;
            for (let i = 0; i < feeds.length; i += batchSize) {
                const batch = feeds.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(f => this.fetchSingleFeed(f)));
            }

            // Tri par date décroissante
            this.articles.sort((a, b) => b.date - a.date);

            // Sauvegarde dans le cache
            if (this.articles.length > 0) {
                this.setCache(this.articles);
            }

            this.render(container, false);

        } catch (err) {
            console.error('[EvoX RSS Error]', err);
            container.innerHTML = `
                <div style="color: #ff5555; padding: 1.5rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
                    <i class="fa-solid fa-triangle-exclamation"></i> Échec du chargement du fichier OPML.
                    <br><small style="color: var(--text-muted);">${err.message}</small>
                </div>`;
        }
    }

    parseOPML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const outlines = xmlDoc.querySelectorAll('outline[xmlUrl]');
        const feeds = [];

        outlines.forEach(outline => {
            const url = outline.getAttribute('xmlUrl');
            let title = outline.getAttribute('title') || outline.getAttribute('text') || 'Dépôt GitHub';

            if (url) {
                title = title.replace(/Release notes from /i, '')
                             .replace(/Commits to /i, '')
                             .replace(/master/i, '')
                             .replace(/main/i, '')
                             .trim();
                feeds.push({ title, url: url.trim() });
            }
        });

        return feeds;
    }

    async fetchSingleFeed(feed) {
        // Formateurs / Proxys optimisés pour contourner les erreurs 403/422/CORS
        const endpoints = [
            // API RSS2JSON publique (Format JSON propre)
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`,
            // Proxy AllOrigins Raw
            `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`,
            // Proxy CORS.sh / Corsproxy
            `https://corsproxy.io/?${encodeURIComponent(feed.url)}`
        ];

        for (const ep of endpoints) {
            try {
                const res = await fetch(ep, { headers: { 'Accept': 'application/json, text/xml, application/xml' } });
                if (!res.ok) continue;

                const contentType = res.headers.get('content-type') || '';

                // Si la réponse est du JSON (cas de rss2json)
                if (contentType.includes('json') || ep.includes('rss2json')) {
                    const data = await res.json();
                    if (data.status === 'ok' && Array.isArray(data.items)) {
                        data.items.forEach(item => {
                            this.articles.push({
                                title: item.title || 'Mise à jour',
                                link: item.link || '#',
                                date: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
                                feed: feed.title,
                                description: this.cleanText(item.description || item.content || '')
                            });
                        });
                        return; // Succès, on passe au flux suivant
                    }
                } else {
                    // Si la réponse est du XML
                    const text = await res.text();
                    if (text && !text.includes('<!DOCTYPE html>') && (text.includes('<rss') || text.includes('<feed') || text.includes('<entry>'))) {
                        this.parseXMLFeed(text, feed.title);
                        return; // Succès
                    }
                }
            } catch (_) {
                // Ignore silencieusement l'échec d'un proxy pour essayer le suivant
            }
        }
    }

    parseXMLFeed(xmlText, feedTitle) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const items = xml.querySelectorAll("entry, item");

        items.forEach(item => {
            const title = item.querySelector("title")?.textContent || "Nouvelle mise à jour";
            
            let link = "#";
            const linkElem = item.querySelector("link");
            if (linkElem) {
                link = linkElem.getAttribute("href") || linkElem.textContent || "#";
            }

            const pubDate = item.querySelector("updated, published, pubDate")?.textContent;
            const desc = item.querySelector("content, summary, description")?.textContent || "";

            this.articles.push({
                title: title.trim(),
                link: link.trim(),
                date: pubDate ? new Date(pubDate).getTime() : Date.now(),
                feed: feedTitle,
                description: this.cleanText(desc)
            });
        });
    }

    async fetchRawText(url) {
        // Tentative directe d'abord (fonctionne très bien si l'OPML est sur GitHub Pages)
        try {
            const r = await fetch(url);
            if (r.ok) return await r.text();
        } catch (_) {}

        // Fallback avec AllOrigins si CORS
        try {
            const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
            if (r.ok) return await r.text();
        } catch (_) {}

        return null;
    }

    cleanText(html) {
        if (!html) return 'Pas de détails fournis.';
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        const cleaned = text.replace(/\s+/g, ' ').trim();
        return cleaned.length > 180 ? cleaned.substring(0, 180) + '...' : cleaned;
    }

    getCache() {
        try {
            const data = sessionStorage.getItem(this.cacheKey);
            if (!data) return null;
            const parsed = JSON.parse(data);
            if (Date.now() - parsed.timestamp > this.cacheTTL) {
                sessionStorage.removeItem(this.cacheKey);
                return null;
            }
            return parsed.articles;
        } catch (_) {
            return null;
        }
    }

    setCache(articles) {
        try {
            sessionStorage.setItem(this.cacheKey, JSON.stringify({
                timestamp: Date.now(),
                articles: articles
            }));
        } catch (_) {}
    }

    forceRefresh(containerId, opmlUrl) {
        sessionStorage.removeItem(this.cacheKey);
        this.init(opmlUrl, containerId);
    }

    render(container, isCached) {
        if (this.articles.length === 0) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
                    <i class="fa-solid fa-circle-exclamation accent" style="font-size: 1.5rem;"></i>
                    <p style="margin-top: 0.5rem; color: var(--text-muted);">Aucun article n'a pu être chargé. Les proxys CORS ou les flux de données sont indisponibles temporairement.</p>
                    <button onclick="window.evoXRSS.forceRefresh('${container.id}', config.sources.opml)" class="btn btn-secondary btn-sm" style="margin-top:1rem;">
                        <i class="fa-solid fa-rotate"></i> Recharger la page
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                <span>
                    <i class="fa-solid fa-rss accent"></i> Actualités récupérées : <strong>${this.articles.length}</strong>
                    ${isCached ? '<small style="color:var(--text-muted); margin-left:0.5rem;">(Depuis le cache local)</small>' : ''}
                </span>
                <button onclick="window.evoXRSS.forceRefresh('${container.id}', config.sources.opml)" class="btn btn-secondary btn-sm" title="Forcer le rafraîchissement">
                    <i class="fa-solid fa-rotate"></i> Actualiser
                </button>
            </div>
            <div class="cards-grid">
                ${this.articles.map(art => {
                    const dateObj = new Date(art.date);
                    const formattedDate = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    
                    return `
                        <div class="item-card news-card">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                    <span class="badge" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        <i class="fa-brands fa-github"></i> ${art.feed}
                                    </span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
                                </div>
                                <h3 style="font-size: 1rem; margin-bottom: 0.5rem; line-height: 1.3;">${art.title}</h3>
                                <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">${art.description}</p>
                            </div>
                            <a href="${art.link}" target="_blank" class="btn btn-secondary btn-sm" style="margin-top: 1rem; text-align:center; display:block;">
                                Voir sur GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

window.evoXRSS = new EvoXRSSReader();
