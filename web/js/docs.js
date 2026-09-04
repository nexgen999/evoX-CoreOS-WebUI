import {uiUrl} from "./config.js";
function titleFromPath(path){return path.split("/").pop().replace(/\.md$/i,"").replace(/[-_]+/g," ").replace(/\b\w/g,m=>m.toUpperCase());}
export async function loadDocs(cfg){
  const base=cfg.docs?.source?.rawBaseUrl;
  const branch=cfg.docs?.source?.branch||"main";
  const dir=(cfg.docs?.source?.directory||"docs").replace(/^\/|\/$/g,"");
  if(!base) return [];
  const api=cfg.docs.source.apiUrl||`https://api.github.com/repos/${cfg.docs.source.owner}/${cfg.docs.source.repo}/git/trees/${branch}?recursive=1`;
  const r=await fetch(api); if(!r.ok) throw new Error(`Impossible d'énumérer la documentation (${r.status}).`);
  const tree=await r.json();
  let docs=(tree.tree||[]).filter(x=>x.type==="blob"&&x.path.toLowerCase().endsWith(".md")&&(!dir||x.path.startsWith(dir+"/"))).map(x=>({path:x.path,title:titleFromPath(x.path),url:`${base.replace(/\/$/,"")}/${x.path}`}));
  const order=cfg.docs.order||[];
  const rank=p=>{const i=order.indexOf(p);return i<0?9999+i:p.includes("/")?5000:4000};
  docs.sort((a,b)=>{const ia=order.indexOf(a.path),ib=order.indexOf(b.path); if(ia>=0||ib>=0)return (ia<0?9999:ia)-(ib<0?9999:ib); return a.path.localeCompare(b.path);});
  return docs;
}
export async function loadDoc(doc){const r=await fetch(doc.url,{cache:"no-store"});if(!r.ok)throw new Error(`Document introuvable (${r.status}).`);return r.text();}
