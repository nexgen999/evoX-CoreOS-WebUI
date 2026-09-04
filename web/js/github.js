import {sourceUrl} from "./config.js";
async function get(url){
  const r=await fetch(url,{headers:{"Accept":"application/vnd.github+json"}});
  if(!r.ok) throw new Error(`GitHub API ${r.status} — ${url}`);
  return r.json();
}
export async function getProfile(cfg){
  const u=cfg.profile?.githubUser||cfg.repository?.owner;
  if(!u) return null;
  return get(`https://api.github.com/users/${encodeURIComponent(u)}`);
}
export async function getRepo(cfg){
  const owner=cfg.repository?.owner,name=cfg.repository?.name;
  if(!owner||!name) return null;
  return get(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
}
export async function listDocs(cfg){
  const base=cfg.docs?.source?.baseUrl||cfg.uiRepository?.githubApiRoot;
  if(!base) return [];
  return get(`${base.replace(/\/$/,"")}/git/trees/${encodeURIComponent(cfg.docs.source.branch||"main")}?recursive=1`);
}
export async function discoverFiles(cfg,dir){
  const root=(cfg.repository?.githubApiRoot||"https://api.github.com/repos/"+cfg.repository.owner+"/"+cfg.repository.name).replace(/\/$/,"");
  return get(`${root}/git/trees/${encodeURIComponent(cfg.repository.branch||"main")}?recursive=1`);
}
