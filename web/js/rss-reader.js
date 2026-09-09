/**
 * Lecteur RSS/Atom Surpuissant pour evoX-CoreOS
 * Optimisé pour les flux GitHub (Releases / Commits) & Fichiers OPML
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
            <div class="rss-loading" style="padding: 2rem; text-align: center;">
                <i class="fa-solid fa-circle-notch fa-spin accent" style="font-size: 2rem;"></i>
                <p style="margin-top: 1rem;">Chargement du fichier OPML et analyse des flux GitHub...</p>
            </div>`;

        try {
            const xmlText = await this.fetchWithFallback(opmlUrl);
            const feedUrls = this.parseOPML(xmlText);

            if (feedUrls.length === 0) {
                container.innerHTML = '<p class="rss-error" style="padding:1rem; color:#ff5555;">Aucun flux valide trouvé dans le fichier OPML.</p>';
                return;
            }

            container.innerHTML = `
                <div style="padding: 1rem; background: var(--bg-panel); border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fa-solid fa-sync fa-spin accent"></i> Analyse de <strong>${feedUrls.length}</strong> sources en cours...
                </div>`;

            this.articles = [];
            
            // Traitement par lots (batching) pour éviter d'être bloqué par GitHub / Proxies
            const batchSize = 5;
            for (let i = 0; i < feedUrls.length; i += batchSize) {
                const batch = feedUrls.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(feed => this.fetchFeed(feed)));
            }

            this.articles.sort((a, b) => b.date - a.date);
            this.render(container);

        } catch (err) {
            console.error('Erreur globale RSS:', err);
            container.innerHTML = `
                <div class="rss-error" style="color: #ff5555; padding: 1.5rem; background: var(--bg-panel); border-radius: 8px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Échec du chargement du fichier OPML (<code>${opmlUrl}</code>). 
                    Vérifiez que le fichier existe bien à la racine ou dans le sous-dossier spécifié.
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
                // Nettoyage du nom pour afficher le nom du repo GitHub proprement
                if (title.includes('Release notes from') || title.includes('Commits to')) {
                    title = title.replace('Release notes from ', '').replace('Commits to ', '').replace('master', '').replace('main', '');
                }
                feeds.push({ title: title.trim(), url: url.trim() });
            }
        });

        return feeds;
    }

    async fetchFeed(feed) {
        try {
            const content = await this.fetchWithFallback(feed.url);
            
            // Format JSON (si renvoyé par un service comme rss2json)
            if (content.startsWith('{')) {
                const data = JSON.parse(content);
                if (data.items) {
                    data.items.forEach(item => {
                        this.articles.push({
                            title: item.title || 'Nouvelle release',
                            link: item.link || '#',
                            date: new Date(item.pubDate || Date.now()),
                            feed: feed.title,
                            description: this.cleanDescription(item.description || item.content || '')
                        });
                    });
                }
                return;
            }

            // Document XML (RSS ou Atom de GitHub)
            const parser = new DOMParser();
            const xml = parser.parseFromString(content, "text/xml");
            
            // Support RSS (<item>) et Atom (<entry>)
            const items = xml.querySelectorAll("entry, item");

            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "Nouvelle mise à jour";
                
                // Extraction du lien GitHub
                let link = "#";
                const linkElem = item.querySelector("link");
                if (linkElem) {
                    link = linkElem.getAttribute("href") || linkElem.textContent || "#";
                }

                // Date
                const pubDate = item.querySelector("updated, published, pubDate")?.textContent;
                
                // Description / Release notes
                const desc = item.querySelector("content, summary, description")?.textContent || "";

                this.articles.push({
                    title: title.trim(),
                    link: link.trim(),
                    date: pubDate ? new Date(pubDate) : new Date(),
                    feed: feed.title,
                    description: this.cleanDescription(desc)
                });
            });
        } catch (e) {
            console.warn(`[RSS] Échec pour ${feed.title}:`, e);
        }
    }

    async fetchWithFallback(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 sec max par requête

        // 1. Tentative directe
        try {
            const direct = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (direct.ok) return await direct.text();
        } catch (_) {}

        // 2. Proxies Fallback
        for (const proxyFn of this.proxies) {
            try {
                const pController = new AbortController();
                const pTimeout = setTimeout(() => pController.abort(), 6000);
                const res = await fetch(proxyFn(url), { signal: pController.signal });
                clearTimeout(pTimeout);
                if (res.ok) {
                    const text = await res.text();
                    if (text && text.length > 50) return text;
                }
            } catch (_) {}
        }

        throw new Error(`Impossible de récupérer le flux: ${url}`);
    }

    cleanDescription(html) {
        if (!html) return 'Pas de détails fournis.';
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        const cleaned = text.replace(/\s+/g, ' ').trim();
        return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
    }

    render(container) {
        if (this.articles.length === 0) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: var(--bg-panel); border-radius: 8px;">
                    <i class="fa-solid fa-circle-exclamation accent" style="font-size: 1.5rem;"></i>
                    <p style="margin-top: 0.5rem;">Aucun article ou release n'a pu être récupéré depuis le fichier OPML.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="news-stats-bar" style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-panel); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                <span><i class="fa-solid fa-rss accent"></i> Flux Actifs : <strong>${this.articles.length}</strong> actualités extraites</span>
                <button onclick="window.evoXRSS.init(config.sources.opml, 'news-container')" class="btn btn-secondary btn-sm"><i class="fa-solid fa-rotate"></i> Actualiser</button>
            </div>
            <div class="cards-grid">
                ${this.articles.map(art => `
                    <div class="item-card news-card">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                <span class="badge" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="fa-brands fa-github"></i> ${art.feed}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${isNaN(art.date) ? 'Récents' : art.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            </div>
                            <h3 style="font-size: 1rem; margin-bottom: 0.5rem; line-height: 1.3;">${art.title}</h3>
                            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">${art.description}</p>
                        </div>
                        <a href="${art.link}" target="_blank" class="btn btn-secondary btn-sm" style="margin-top: 1rem; text-align:center; display:block;">
                            Voir sur GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.evoXRSS = new EvoXRSSReader();
