/**
 * Lecteur de Changelog & Actualités pour evoX-CoreOS
 * Lit et formate le fichier CHANGELOG.md du dépôt maître.
 */

class EvoXChangelogReader {
    constructor() {
        this.entries = [];
    }

    async init(changelogUrl, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
                <i class="fa-solid fa-circle-notch fa-spin accent" style="font-size: 2rem;"></i>
                <p style="margin-top: 1rem;">Chargement du changelog evoX-CoreOS...</p>
            </div>`;

        try {
            let rawMd = await this.fetchText(changelogUrl);
            
            if (!rawMd && config.github?.dataRepository) {
                const fallbackUrl = `https://raw.githubusercontent.com/${config.github.dataRepository}/main/CHANGELOG.md`;
                rawMd = await this.fetchText(fallbackUrl);
            }

            if (!rawMd) {
                rawMd = await this.fetchText('CHANGELOG.md');
            }

            if (!rawMd) {
                throw new Error("Impossible de récupérer le fichier CHANGELOG.md");
            }

            this.entries = this.parseChangelog(rawMd);
            this.render(container);

        } catch (err) {
            console.error('[Changelog Error]', err);
            container.innerHTML = `
                <div style="padding: 1.5rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                    <i class="fa-solid fa-file-circle-exclamation accent" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Fichier <code>CHANGELOG.md</code> introuvable à la racine de <code>evoX-CoreOS</code>.</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
                        Assurez-vous qu'un fichier <code>CHANGELOG.md</code> existe sur la branche principale du dépôt.
                    </p>
                </div>`;
        }
    }

    async fetchText(url) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.text();
        } catch (_) {}
        return null;
    }

    parseChangelog(mdText) {
        const sections = mdText.split(/^##?\s+/m);
        const results = [];

        sections.forEach(sec => {
            const trimmed = sec.trim();
            if (!trimmed) return;

            const lines = trimmed.split('\n');
            const headerLine = lines[0] || 'Mise à jour';
            const bodyContent = lines.slice(1).join('\n').trim();

            const dateMatch = headerLine.match(/\((.*?)\)|-\s*(\d{4}-\d{2}-\d{2})|\[(.*?)\]/);
            const dateStr = dateMatch ? (dateMatch[1] || dateMatch[2] || dateMatch[3]) : '';

            results.push({
                title: headerLine,
                date: dateStr,
                body: bodyContent
            });
        });

        return results;
    }

    render(container) {
        if (this.entries.length === 0) {
            container.innerHTML = `<p style="padding: 1rem; text-align: center;">Le fichier CHANGELOG.md est vide.</p>`;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                <span><i class="fa-solid fa-newspaper accent"></i> Mises à jour & Releases : <strong>${this.entries.length}</strong> entrées</span>
                <button onclick="window.evoXChangelog.init(config.sources.changelog || 'https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/CHANGELOG.md', 'news-container')" class="btn btn-secondary btn-sm">
                    <i class="fa-solid fa-rotate"></i> Actualiser
                </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${this.entries.map(entry => {
                    const parsedHtml = typeof marked !== 'undefined' ? marked.parse(entry.body) : `<pre>${entry.body}</pre>`;
                    return `
                        <div class="panel" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                                <h3 style="font-size: 1.1rem; color: var(--text-main); margin: 0;"><i class="fa-solid fa-code-commit accent"></i> ${entry.title}</h3>
                                ${entry.date ? `<span class="badge"><i class="fa-regular fa-calendar"></i> ${entry.date}</span>` : ''}
                            </div>
                            <div class="changelog-body" style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
                                ${parsedHtml}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

window.evoXChangelog = new EvoXChangelogReader();
window.evoXRSS = window.evoXChangelog;
