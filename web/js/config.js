function stripComments(text){
  let out='', i=0, quote=false, esc=false, line=false, block=false;
  while(i<text.length){const c=text[i], n=text[i+1];
    if(line){if(c==='\n'){line=false;out+=c;}i++;continue;}
    if(block){if(c==='*'&&n==='/'){block=false;i+=2;}else{i++;}continue;}
    if(quote){out+=c;if(esc){esc=false;}else if(c==='\\'){esc=true;}else if(c==='"'){quote=false;}i++;continue;}
    if(c==='"'){quote=true;out+=c;i++;continue;}
    if(c==='/'&&n==='/'){line=true;i+=2;continue;}
    if(c==='/'&&n==='*'){block=true;i+=2;continue;}
    out+=c;i++;
  } return out;
}
function detectPages(){
  const host=location.hostname; const parts=location.pathname.split('/').filter(Boolean);
  const m=host.match(/^([^.]+)\.github\.io$/i); if(!m)return null;
  const repo=parts[0]||m[1]; return {owner:m[1],name:repo,pagesUrl:`https://${host}/${repo}`.replace(/\/$/,'')};
}
export async function loadConfig(){
  const r=await fetch('./web/data/config.json',{cache:'no-store'}); if(!r.ok)throw new Error(`Configuration introuvable (${r.status})`);
  const cfg=JSON.parse(stripComments(await r.text()));
  cfg.repository=cfg.repository||{}; cfg.paths=cfg.paths||{}; cfg.sourceSite=cfg.sourceSite||{};
  const d=detectPages();
  if(cfg.autoDetect?.enabled&&d){
    if(cfg.autoDetect.owner)cfg.repository.owner=d.owner;
    if(cfg.autoDetect.repository)cfg.repository.name=d.name;
    if(cfg.autoDetect.pagesUrl)cfg.repository.pagesUrl=d.pagesUrl;
  }
  if(cfg.repository.branch==='auto'||!cfg.repository.branch)cfg.repository.branch='main';
  if(!cfg.repository.githubUrl&&cfg.repository.owner&&cfg.repository.name)cfg.repository.githubUrl=`https://github.com/${cfg.repository.owner}/${cfg.repository.name}`;
  if(!cfg.repository.pagesUrl&&cfg.repository.owner&&cfg.repository.name)cfg.repository.pagesUrl=`https://${cfg.repository.owner}.github.io/${cfg.repository.name}`;
  if(!cfg.repository.rawBaseUrl&&cfg.repository.owner&&cfg.repository.name)cfg.repository.rawBaseUrl=`https://raw.githubusercontent.com/${cfg.repository.owner}/${cfg.repository.name}/${cfg.repository.branch}`;
  if(cfg.sourceSite.useForRelativeSources&&cfg.sourceSite.baseUrl)cfg.sourceSite.baseUrl=cfg.sourceSite.baseUrl.replace(/\/$/,'');
  return cfg;
}
export function resolveUrl(u,cfg){
  if(!u)return ''; if(/^https?:\/\//i.test(u)||/^data:/i.test(u)||u.startsWith('//'))return u;
  const base=(cfg.sourceSite?.baseUrl||cfg.repository?.pagesUrl||location.origin).replace(/\/$/,'');
  if(u.startsWith('/'))return base+u; return new URL(u,location.href).href;
}
