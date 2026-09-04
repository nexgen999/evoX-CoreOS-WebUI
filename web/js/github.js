export async function getProfile(cfg){
  const owner=cfg.repository.owner; if(!owner)return null;
  const r=await fetch(`${cfg.repository.apiBase||'https://api.github.com'}/users/${encodeURIComponent(owner)}`); if(!r.ok)throw new Error(`GitHub profile: ${r.status}`); return r.json();
}
export async function getRepo(cfg){
  const r=cfg.repository; if(!r.owner||!r.name)return {default_branch:r.branch==='auto'?'main':r.branch};
  const res=await fetch(`${r.apiBase||'https://api.github.com'}/repos/${encodeURIComponent(r.owner)}/${encodeURIComponent(r.name)}`); if(!res.ok)throw new Error(`GitHub repository: ${res.status}`); return res.json();
}
