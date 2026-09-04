function stripComments(text) {
  let out = '', i = 0, quote = false, esc = false, line = false, block = false;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (line) { if (c === '\n') { line = false; out += c; } i++; continue; }
    if (block) { if (c === '*' && n === '/') { block = false; i += 2; } else i++; continue; }
    if (quote) { out += c; if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') quote = false; i++; continue; }
    if (c === '"') { quote = true; out += c; i++; continue; }
    if (c === '/' && n === '/') { line = true; i += 2; continue; }
    if (c === '/' && n === '*') { block = true; i += 2; continue; }
    out += c; i++;
  }
  return out;
}

function detectGitHubPages() {
  const host = location.hostname;
  const parts = location.pathname.split('/').filter(Boolean);
  const m = host.match(/^([^.]+)\.github\.io$/i);
  if (!m) return null;
  return {
    owner: m[1],
    name: parts[0] || m[1],
    pagesUrl: `https://${host}/${parts[0] || ''}`.replace(/\/$/, '')
  };
}

export async function loadConfig() {
  const r = await fetch('./web/data/config.json', { cache: 'no-store' });
  if (!r.ok) throw new Error(`Configuration introuvable (${r.status})`);

  const cfg = JSON.parse(stripComments(await r.text()));
  cfg.repository ??= {};
  cfg.uiRepository ??= {};
  cfg.paths ??= {};
  cfg.sourceSite ??= {};

  const detected = detectGitHubPages();

  // IMPORTANT : la détection de l'URL GitHub Pages concerne le dépôt WebUI,
  // pas le dépôt CoreOS qui contient les JSON/RSS. On ne remplace donc jamais
  // repository.name automatiquement.
  if (cfg.autoDetect?.enabled && detected) {
    if (cfg.autoDetect.uiRepository !== false) {
      cfg.uiRepository.owner = detected.owner;
      cfg.uiRepository.name = detected.name;
      cfg.uiRepository.pagesUrl = detected.pagesUrl;
    }
    if (cfg.autoDetect.owner === true && !cfg.repository.owner) {
      cfg.repository.owner = detected.owner;
    }
    if (cfg.autoDetect.repository === true && !cfg.repository.name) {
      cfg.repository.name = detected.name;
    }
  }

  cfg.repository.branch = cfg.repository.branch || 'main';
  cfg.uiRepository.branch = cfg.uiRepository.branch || 'main';

  if (!cfg.repository.githubUrl && cfg.repository.owner && cfg.repository.name)
    cfg.repository.githubUrl = `https://github.com/${cfg.repository.owner}/${cfg.repository.name}`;
  if (!cfg.repository.pagesUrl && cfg.repository.owner && cfg.repository.name)
    cfg.repository.pagesUrl = `https://${cfg.repository.owner}.github.io/${cfg.repository.name}`;
  if (!cfg.repository.rawBaseUrl && cfg.repository.owner && cfg.repository.name)
    cfg.repository.rawBaseUrl = `https://raw.githubusercontent.com/${cfg.repository.owner}/${cfg.repository.name}/${cfg.repository.branch}`;

  if (!cfg.uiRepository.githubUrl && cfg.uiRepository.owner && cfg.uiRepository.name)
    cfg.uiRepository.githubUrl = `https://github.com/${cfg.uiRepository.owner}/${cfg.uiRepository.name}`;
  if (!cfg.uiRepository.pagesUrl && cfg.uiRepository.owner && cfg.uiRepository.name)
    cfg.uiRepository.pagesUrl = `https://${cfg.uiRepository.owner}.github.io/${cfg.uiRepository.name}`;

  if (cfg.sourceSite.baseUrl) cfg.sourceSite.baseUrl = cfg.sourceSite.baseUrl.replace(/\/$/, '');
  return cfg;
}

export function resolveUrl(u, cfg) {
  if (!u) return '';
  if (/^(https?:|data:|blob:)/i.test(u) || u.startsWith('//')) return u;
  // Relative paths belong to the WebUI itself.
  return new URL(u, document.baseURI).href;
}

export function resolveDataUrl(u, cfg) {
  if (!u) return '';
  if (/^(https?:|data:|blob:)/i.test(u) || u.startsWith('//')) return u;
  const base = (cfg.sourceSite?.baseUrl || cfg.repository?.pagesUrl || location.origin).replace(/\/$/, '');
  return u.startsWith('/') ? base + u : `${base}/${u.replace(/^\/+/, '')}`;
}
