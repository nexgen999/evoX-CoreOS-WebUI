import {sourceUrl} from "./config.js";
function normalize(item,type){
  return {
    id:`${type}:${item.name||item.filename||Math.random()}`,
    name:item.name||item.title||item.filename||"Sans nom",
    filename:item.filename||"",
    url:item.url||item.download||item.href||"",
    description:item.description||item.desc||"",
    version:item.version||"",
    author:item.author||"",
    category:item.category||type,
    subcategory:item.subcategory||item.sub_category||"",
    icon:item.icon||item.iconUrl||"",
    type
  };
}
export async function loadStore(cfg){
  const result={items:[],errors:[]};
  for(const source of (cfg.store?.sources||[])){
    if(source.enabled===false) continue;
    try{
      const r=await fetch(sourceUrl(source.url,cfg),{cache:"no-store"});
      if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const data=await r.json();
      const arr=data[source.arrayKey]||data.items||data.data||[];
      if(!Array.isArray(arr)) throw new Error(`Le champ "${source.arrayKey}" n'est pas un tableau.`);
      result.items.push(...arr.map(x=>normalize(x,source.category||source.id)));
    }catch(e){result.errors.push(`${source.label||source.id}: ${e.message}`);}
  }
  return result;
}
