function normalize(p){return p.replace(/^\//,'');}
export async function loadDocs(cfg){
  const d=cfg.docs||{}; const base=(d.sourceBaseUrl||'').replace(/\/$/,''); const files=[];
  if(Array.isArray(d.files)&&d.files.length){for(const f of d.files)files.push(typeof f==='string'?{path:f,title:f.split('/').pop().replace(/\.md$/i,'')}:f);return files;}
  // GitHub API recursive tree; works when docs are in a GitHub repository.
  if(cfg.repository.owner&&cfg.repository.name){try{const branch=cfg.repository.branch==='auto'?'main':cfg.repository.branch;const url=`${cfg.repository.apiBase||'https://api.github.com'}/repos/${cfg.repository.owner}/${cfg.repository.name}/git/trees/${encodeURIComponent(branch)}?recursive=1`;const r=await fetch(url);if(r.ok){const j=await r.json();const root=normalize(d.path||'docs/');for(const x of j.tree||[])if(x.type==='blob'&&x.path.startsWith(root)&&/\.md$/i.test(x.path))files.push({path:x.path.slice(root.length),title:x.path.split('/').pop().replace(/\.md$/i,'')});}}catch(e){}}
  return files;
}
export async function loadDoc(cfg,path){const d=cfg.docs||{};let url;if(d.sourceBaseUrl)url=d.sourceBaseUrl.replace(/\/$/,'')+'/'+path.replace(/^\//,'');else if(cfg.repository.rawBaseUrl)url=cfg.repository.rawBaseUrl.replace(/\/$/,'')+'/'+(d.path||'docs').replace(/^\//,'')+'/'+path.replace(/^\//,'');else url=new URL(`${d.path||'/docs/'}${path}`,location.href).href;const r=await fetch(url);if(!r.ok)throw new Error(`Documentation: ${r.status}`);return {path,content:await r.text()};}
export function sortDocs(items,order=[]){const idx=new Map(order.map((x,i)=>[typeof x==='string'?x:x.path,i]));return [...items].sort((a,b)=>{const ai=idx.has(a.path)?idx.get(a.path):99999,bi=idx.has(b.path)?idx.get(b.path):99999;return ai-bi||a.path.localeCompare(b.path);});}
