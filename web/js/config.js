function stripComments(text){
  let out="", i=0, quote=false, esc=false, line=false, block=false;
  while(i<text.length){
    const c=text[i], n=text[i+1];
    if(line){ if(c==="\n"){line=false;out+="\n";} i++; continue; }
    if(block){ if(c==="*"&&n==="/"){block=false;i+=2;} else i++; continue; }
    if(quote){ out+=c; if(esc) esc=false; else if(c==="\\") esc=true; else if(c==='"') quote=false; i++; continue; }
    if(c==='"'){quote=true;out+=c;i++;continue;}
    if(c==="/"&&n==="/"){line=true;i+=2;continue;}
    if(c==="/"&&n==="*"){block=true;i+=2;continue;}
    out+=c;i++;
  }
  return out;
}
function removeTrailingCommas(text){ return text.replace(/,\s*([}\]])/g,"$1"); }
function detectPagesRepository(){
  const host=location.hostname.match(/^([^.]+)\\.github\\.io$/i);
  if(!host) return null;
  const parts=location.pathname.split("/").filter(Boolean);
  if(!parts[0]) return {owner:host[1],name:host[1],pagesUrl:`https://${host[0]}`};
  return {owner:host[1],name:parts[0],pagesUrl:`https://${host[0]}/${parts[0]}`};
}
export async function loadConfig(){
  const r=await fetch("./web/data/config.json",{cache:"no-store"});
  if(!r.ok) throw new Error(`Configuration introuvable (${r.status}).`);
  const raw=await r.text();
  let cfg;
  try{cfg=JSON.parse(removeTrailingCommas(stripComments(raw)));}
  catch(e){throw new Error(`Configuration JSONC invalide : ${e.message}`);}
  if(cfg.autoDetect?.enabled && cfg.autoDetect.detectWebUIRepository){
    const detected=detectPagesRepository();
    if(detected){
      cfg.uiRepository??={};
      cfg.uiRepository.owner=detected.owner;
      cfg.uiRepository.name=detected.name;
      cfg.uiRepository.pagesUrl=detected.pagesUrl;
      cfg.uiRepository.githubUrl=`https://github.com/${detected.owner}/${detected.name}`;
    }
  }
  return cfg;
}
export function absoluteUrl(value,base){
  if(!value) return "";
  if(/^(https?:|data:|blob:|mailto:)/i.test(value)||value.startsWith("//")) return value;
  return new URL(value,base||document.baseURI).href;
}
export function sourceUrl(value,cfg){
  if(!value) return "";
  if(/^(https?:|data:|blob:)/i.test(value)||value.startsWith("//")) return value;
  const base=(cfg.sourceSite?.baseUrl||cfg.repository?.pagesUrl||"").replace(/\/$/,"");
  return value.startsWith("/") ? base+value : `${base}/${value.replace(/^\/+/,"")}`;
}
export function uiUrl(value){ return absoluteUrl(value,document.baseURI); }
