import {resolveUrl} from "./config.js";
import {discoverFiles} from "./github.js";
function textOf(el,selector){return el.querySelector(selector)?.textContent?.trim()||""}
function first(el,names){for(const n of names){const v=textOf(el,n);if(v)return v}return""}
function dateVal(v){const d=new Date(v);return Number.isNaN(d.getTime())?v:d}
export async function readFeed(feed,cfg){
  const url=resolveUrl(feed.url,cfg.repository);
  const r=await fetch(url,{cache:"no-store"}); if(!r.ok)throw new Error(`${r.status}`);
  const xml=await r.text(); const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.querySelector("parsererror"))throw new Error("RSS/XML invalide");
  return [...doc.querySelectorAll("item, entry")].map((el,i)=>{
    let link=el.querySelector("link")?.getAttribute("href")||textOf(el,"link")||textOf(el,"guid");
    const desc=first(el,["description","summary","content"]);
    const media=el.querySelector("media\:content, media\:thumbnail, enclosure");
    const image=media?.getAttribute("url")||el.querySelector("image url")?.textContent||"";
    return {id:`${feed.id}-${i}-${link}`,source:feed.label,title:first(el,["title"])||"Sans titre",description:desc.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(),link,date:dateVal(first(el,["pubDate","published","updated","dc\:date"])),image};
  }).filter(x=>x.title);
}
async function readOPML(url,cfg){
  const r=await fetch(resolveUrl(url,cfg.repository),{cache:"no-store"}); if(!r.ok)throw new Error(`${r.status}`);
  const xml=await r.text(); const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.querySelector("parsererror"))throw new Error("OPML invalide");
  return [...doc.querySelectorAll("outline[xmlUrl]")].map((el,i)=>({id:`opml-${i}-${el.getAttribute("xmlUrl")}`,label:el.getAttribute("title")||el.getAttribute("text")||"OPML",url:el.getAttribute("xmlUrl"),enabled:true}));
}
export async function readAllFeeds(cfg, sectionCfg=cfg.news||{}){
  let feeds=(sectionCfg.feeds||[]).filter(f=>f.enabled!==false); const errors=[];
  const opmlFiles=[...(sectionCfg.opmlFiles||[]),...(sectionCfg.opml||[])];
  if(sectionCfg.autoDiscoverOpml!==false){
    try{const found=await discoverFiles(cfg,cfg.paths.rssDir||"/rss/",".opml"); for(const f of found)opmlFiles.push("/"+f.path)}catch(e){errors.push({feed:"auto-discovery OPML",error:e.message||"Erreur"})}
  }
  for(const opml of [...new Set(opmlFiles)]){try{feeds.push(...await readOPML(opml,cfg))}catch(e){errors.push({feed:opml,error:e.message||"OPML invalide"})}}
  if(sectionCfg.autoDiscover!==false){
    try{
      const discovered=await discoverFiles(cfg,cfg.paths.rssDir||"/rss/",".xml");
      const known=new Set(feeds.map(f=>resolveUrl(f.url,cfg.repository)));
      for(const f of discovered){const url=resolveUrl("/"+f.path,cfg.repository);if(!known.has(url))feeds.push({id:f.path,label:f.path.split("/").pop(),url:"/"+f.path,enabled:true})}
    }catch(e){errors.push({feed:"auto-discovery RSS",error:e.message||"Erreur"})}
  }
  const dedup=[...new Map(feeds.map(f=>[resolveUrl(f.url,cfg.repository),f])).values()];
  const results=await Promise.allSettled(dedup.map(f=>readFeed(f,cfg)));
  const items=[]; results.forEach((r,i)=>r.status==="fulfilled"?items.push(...r.value):errors.push({feed:dedup[i].label,error:r.reason?.message||"Erreur"}));
  items.sort((a,b)=>new Date(b.date)-new Date(a.date));
  return {items:items.slice(0,sectionCfg.maxItems||20),errors};
}
