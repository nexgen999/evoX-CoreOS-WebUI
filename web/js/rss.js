function text(el,name){return el?.querySelector(name)?.textContent?.trim()||""}
function attr(el,name){return el?.getAttribute(name)||""}
function firstLink(el){
  const links=[...el.querySelectorAll("link")];
  const atom=links.find(x=>attr(x,"href"));
  return atom?attr(atom,"href"):(links[0]?.textContent?.trim()||"");
}
function clean(s=""){const d=document.createElement("div");d.innerHTML=s;return (d.textContent||d.innerText||"").replace(/\s+/g," ").trim();}
function parseXml(xml,url,label){
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.querySelector("parsererror")) throw new Error("XML invalide");
  const root=doc.documentElement;
  const isAtom=root?.localName==="feed";
  const nodes=[...doc.querySelectorAll(isAtom?"entry":"item")];
  const title=text(doc,isAtom?"feed > title":"channel > title")||label||"Flux";
  return nodes.map(n=>({
    title:text(n,"title")||"Sans titre",
    description:clean(text(n,isAtom?"summary,content":"description,content")),
    link:firstLink(n),
    date:text(n,"pubDate,published,updated")||"",
    image: n.querySelector("media\\:content,content")?.getAttribute("url") || n.querySelector("enclosure")?.getAttribute("url") || "",
    source:label||title,
    sourceUrl:url
  }));
}
async function fetchText(url){
  const r=await fetch(url,{cache:"no-store"});
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.text();
}
function opmlUrls(xml){
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  return [...doc.querySelectorAll("outline[xmlUrl]")].map(x=>({url:x.getAttribute("xmlUrl"),label:x.getAttribute("title")||x.getAttribute("text")||"Flux"}));
}
export async function readSources(cfg,section){
  const items=[],errors=[],sources=[...(section?.feeds||[])];
  for(const opml of section?.opml||[]){
    try{
      const xml=await fetchText(opml.url||opml);
      opmlUrls(xml).forEach(x=>sources.push(x));
    }catch(e){errors.push(`OPML: ${opml.label||opml.url||opml} — ${e.message}`);}
  }
  for(const s of sources){
    try{
      const u=s.url||s;
      const xml=await fetchText(u);
      const label=s.label||s.name||u;
      items.push(...parseXml(xml,u,label));
    }catch(e){errors.push(`${s.label||s.url||s} — ${e.message}`);}
  }
  items.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  return {items,errors};
}
