export async function githubJson(cfg,path){const u=`${cfg.repository.apiBase}/repos/${encodeURIComponent(cfg.repository.owner)}/${encodeURIComponent(cfg.repository.name)}/${path}`;const r=await fetch(u);if(!r.ok)throw new Error(`GitHub API ${r.status}: ${path}`);return r.json();}
export async function getProfile(cfg){const r=await fetch(`${cfg.repository.apiBase}/users/${encodeURIComponent(cfg.repository.owner)}`);if(!r.ok)throw new Error(`GitHub profile ${r.status}`);return r.json();}
export async function getRepo(cfg){return githubJson(cfg,'');}
export async function getTree(cfg,root=''){const branch=cfg.repository.branch;return githubJson(cfg,`git/trees/${encodeURIComponent(branch)}?recursive=1`);}
