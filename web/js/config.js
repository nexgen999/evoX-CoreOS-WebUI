function detectGitHubPages(){
  const host=location.hostname; const path=location.pathname.split('/').filter(Boolean); const m=host.match(/^([^.]+)\.github\.io$/i);
  if(!m)return null;
  return {owner:m[1],name:path[0]||m[1],pagesUrl:`https://${host}${path[0]?'/'+path[0]:''}`.replace(/\/$/,'')};
}
export async function loadConfig(){
  const r=await fetch('./web/data/config.json',{cache:'no-store'}); if(!r.ok)throw new Error(`Configuration introuvable (${r.status})`); const cfg=await r.json();
  if(cfg.autoDetect?.enabled){const d=detectGitHubPages();if(d){if(cfg.autoDetect.owner&&(!cfg.repository.owner))cfg.repository.owner=d.owner;if(cfg.autoDetect.repository&&(!cfg.repository.name))cfg.repository.name=d.name;if(!cfg.repository.pagesUrl)cfg.repository.pagesUrl=d.pagesUrl;if(!cfg.repository.githubUrl&&cfg.repository.owner&&cfg.repository.name)cfg.repository.githubUrl=`https://github.com/${cfg.repository.owner}/${cfg.repository.name}`;}}
  if(cfg.sourceSite?.useForRelativeSources&&cfg.sourceSite.baseUrl)cfg.repository.pagesUrl=cfg.sourceSite.baseUrl.replace(/\/$/,'');
  return cfg;
}
export function resolveUrl(url,repo){
  if(!url)return '';
  if(/^https?:\/\//i.test(url)||/^data:/i.test(url))return url;
  if(url.startsWith('//'))return location.protocol+url;
  if(url.startsWith('#'))return url;
  const root=(repo?.pagesUrl||'').replace(/\/$/,'');
  if(url.startsWith('/'))return root?root+url:url;
  return new URL(url,location.href).href;
}
export function repoPagesUrl(repo){return repo?.pagesUrl||'';}
export function repoRawUrl(repo,path=''){return repo?.rawBaseUrl?repo.rawBaseUrl.replace(/\/$/,'')+'/'+path.replace(/^\//,''):'';}
