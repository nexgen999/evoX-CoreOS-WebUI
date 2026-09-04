import {loadConfig, resolveUrl, repoPagesUrl, repoRawUrl} from './config.js';
import {iconHtml} from './icons.js';
import {getProfile, getRepo} from './github.js';
import {readAllFeeds} from './rss.js';
import {loadStore} from './store.js';
import {loadDocs, loadDoc, sortDocs} from './docs.js';
import {markdown} from './markdown.js';

let cfg = null, repo = null, profile = null, repository = null;
let storeData = {items: [], errors: []};
let newsData = {items: [], errors: []};
let homeNewsData = {items: [], errors: []};
let docsData = [];
const state = {page:'home', query:'', category:'', subcategory:'', storeView:'list', serviceTab:'webkit', serviceView:'tiles', doc:''};
const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const isExternal = u => /^https?:\/\//i.test(u || '');
const arr = v => Array.isArray(v) ? v : [];
function fmtDate(v){ const d=new Date(v); return Number.isNaN(d.getTime()) ? String(v||'') : new Intl.DateTimeFormat(cfg.site.language||'fr',{dateStyle:'medium',timeStyle:'short'}).format(d); }
function setTitle(label){ $('#page-title').textContent=label; $('#page-kicker').textContent=cfg.site.name||'evoX Core OS'; document.title=`${label} · ${cfg.site.name||'evoX Core OS'}`; }
function toast(msg){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),2600); }
function navigate(id){ location.hash=id; }
function closeSidebarMobile(){ $('#sidebar')?.classList.remove('open'); }
function resolve(u, base='data'){ return resolveUrl(u, repo, base); }

function nav(){
  $('#main-nav').innerHTML=arr(cfg.navigation).filter(x=>x.enabled!==false).map(x=>`<a href="#${esc(x.id)}" class="nav-item ${state.page===x.id?'active':''}" data-page="${esc(x.id)}"><span class="nav-icon">${iconHtml(x.icon||'file')}</span><span>${esc(x.label)}</span></a>`).join('');
  document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',()=>{state.page=a.dataset.page;closeSidebarMobile();}));
}
function profileUI(){
  const p=profile||{}; const avatar=p.avatar_url||cfg.profile.avatar||'./web/assets/avatar-placeholder.svg';
  $('#profile').innerHTML=`<div class="profile-head"><img class="avatar" src="${esc(avatar)}" onerror="this.src='./web/assets/avatar-placeholder.svg'" alt=""><div><div class="profile-name">${esc(p.name||repo.owner||'GitHub User')}</div><div class="profile-handle">@${esc(p.login||repo.owner||'')}</div></div></div>${cfg.profile.showBio!==false?`<p class="bio">${esc(p.bio||cfg.profile.bioFallback||'')}</p>`:''}<div class="profile-meta">${cfg.profile.showLocation!==false&&(p.location||cfg.profile.locationFallback)?`<span>${iconHtml('pin')} ${esc(p.location||cfg.profile.locationFallback)}</span>`:''}${cfg.profile.showStats!==false&&p.public_repos!=null?`<span>${iconHtml('repo')} ${p.public_repos} repos</span>`:''}</div>`;
}
function socialAnchor(s, cls=''){
  const href=s.url||'#'; const icon=s.iconType==='image' ? `<img src="${esc(resolve(s.icon))}" alt="">` : iconHtml(s.icon||'link');
  return `<a class="social ${cls}" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(s.label||'')}">${icon}${s.showLabel?`<span>${esc(s.label)}</span>`:''}</a>`;
}
function socialsUI(){
  const socials=arr(cfg.socials).filter(s=>s.enabled!==false);
  const quick=arr(cfg.header?.quickDownloads||cfg.topbar?.quickDownloads).filter(x=>x.enabled!==false&&x.url);
  $('#top-socials').innerHTML=quick.map(x=>`<a class="top-action" href="${esc(resolve(x.url))}" target="_blank" rel="noopener" title="${esc(x.label)}">${iconHtml(x.icon||'download')}<span>${esc(x.label)}</span></a>`).join('')+socials.map(s=>socialAnchor(s,'top-social')).join('')+`<img class="top-avatar" src="${esc(profile?.avatar_url||cfg.profile?.avatar||'./web/assets/avatar-placeholder.svg')}" onerror="this.src='./web/assets/avatar-placeholder.svg'" alt="">`;
  const follow=cfg.sidebar?.followMe?.enabled===false?'':socials.map(s=>socialAnchor(s,'sidebar-social')).join('');
  const promo=cfg.sidebar?.promo||{};
  $('#sidebar-bottom').innerHTML=`<div class="follow-block"><div class="follow-title">${iconHtml('link')} <span>${esc(cfg.sidebar?.followMe?.title||'Suivez-moi')}</span></div><div class="sidebar-socials">${follow||'<span class="muted">Aucun réseau configuré.</span>'}</div></div>${promo.enabled===false?'':`<div class="sidebar-promo" style="background-image:url('${esc(resolve(promo.background||'./web/assets/sidebar-bg.svg'))}')"><strong>${esc(promo.title||cfg.site.name)}</strong><span>${esc(promo.text||'One place. All your needs.')}</span></div>`}`;
}
function shell(){
  nav(); profileUI(); socialsUI();
  $('#global-brand-logo').src=resolve(cfg.branding.logo||'./web/assets/logo.svg'); $('#global-brand-logo').alt=cfg.site.name||'evoX Core OS';
  $('#github-top').href=repo.githubUrl||'#'; $('#github-top').style.display=repo.githubUrl?'inline-flex':'none';
}
function footer(){
  const f=cfg.footer||{}; if(f.enabled===false)return '';
  const links=arr(f.links).filter(x=>x.enabled!==false).map(x=>`<a href="${esc(resolve(x.url))}" ${x.newTab!==false?'target="_blank" rel="noopener"':''}>${esc(x.label)}</a>`).join(' <i>•</i> ');
  const badges=arr(f.badges).filter(b=>b.enabled!==false&&b.image).map(b=>`<a href="${esc(resolve(b.href||'#'))}" target="_blank" rel="noopener" title="${esc(b.label||'Badge')}"><img src="${esc(resolve(b.image))}" alt="${esc(b.alt||b.label||'Badge')}"></a>`).join('');
  return `<footer class="footer"><div class="footer-copy"><span>${esc(f.text||'')} ${f.showYear?'• '+new Date().getFullYear():''}</span>${links?`<span>${links}</span>`:''}</div><div class="badges">${badges}</div></footer>`;
}
function pageIntro(label, desc, icon='file', background){
  const bg=background||'./web/assets/news-bg.svg';
  return `<div class="page-banner" style="background-image:url('${esc(resolve(bg))}')"><div class="page-intro"><div class="page-intro-icon">${iconHtml(icon)}</div><div><div class="eyebrow">${esc(cfg.site.name)}</div><h1>${esc(label)}</h1><p>${esc(desc||'')}</p></div></div></div>`;
}
function homeHero(){
  const h=cfg.home?.hero||{};
  return `<section class="home-hero" style="background-image:url('${esc(resolve(h.background||'./web/assets/hero-bg.svg'))}')"><div class="home-hero-logo"><img src="${esc(resolve(h.logo||cfg.branding.logo||'./web/assets/logo.svg'))}" alt="${esc(cfg.site.name)}"></div><div class="home-hero-copy"><div class="eyebrow">${esc(h.eyebrow||cfg.site.name)}</div><h1>${esc(h.title||'Bienvenue sur evoX Core OS')}</h1><p>${esc(h.text||'')}</p><div class="hero-actions">${arr(h.links).map(x=>`<a class="hero-chip" href="${esc(x.url||'#')}" ${isExternal(x.url)?'target="_blank" rel="noopener"':''}>${iconHtml(x.icon||'link')} ${esc(x.label)}</a>`).join('')}</div></div></section>`;
}
function categoryTiles(){
  const all=storeData.items||[]; const configured=arr(cfg.home?.categoryTiles).filter(x=>x.enabled!==false);
  const cats=configured.length?configured:[...new Set(all.map(x=>x.category).filter(Boolean))].slice(0,6).map(x=>({label:x,icon:'folder'}));
  return cats.slice(0,6).map(c=>{const n=all.filter(x=>x.category===c.label).length;return `<a href="#store" class="home-cat" data-home-cat="${esc(c.label)}"><b>${iconHtml(c.icon||'folder')}</b><span>${esc(c.label)}</span><small>(${n})</small></a>`}).join('');
}
function homeNewsCards(){
  const items=(homeNewsData.items||[]).slice(0,cfg.homeNews?.maxItems||4);
  if(!items.length)return `<div class="empty home-empty">${esc(cfg.home?.emptyNewsText||'Les flux RSS / OPML apparaîtront ici automatiquement.')}</div>`;
  return items.map(n=>`<article class="home-news-item"><div class="home-news-thumb">${n.image?`<img src="${esc(n.image)}" alt="">`:`<div class="art-symbol">${iconHtml('rss')}</div>`}</div><div class="home-news-copy"><h3>${esc(n.title)}</h3><div class="home-meta"><span>${esc(n.source||'RSS')}</span><span>${iconHtml('clock')} ${esc(fmtDate(n.date))}</span></div><p>${esc(n.description||'').slice(0,190)}${(n.description||'').length>190?'…':''}</p>${n.link?`<a href="${esc(n.link)}" target="_blank" rel="noopener">Lire la suite →</a>`:''}</div></article>`).join('');
}
function homeRight(){
  const aio=arr(cfg.downloads?.items).filter(x=>x.enabled!==false).slice(0,4);
  return `<aside class="home-right"><section class="welcome-card panel" style="background-image:url('${esc(resolve(cfg.home?.welcome?.background||'./web/assets/welcome-bg.svg'))}')"><div><h2>${esc(cfg.home?.welcome?.title||'👋 Bienvenue !')}</h2><p>${esc(cfg.home?.welcome?.text||'Passionné par le homebrew, le développement et les projets open source.')}</p><span>— ${esc(cfg.home?.welcome?.signature||repo.owner||'evoX')}</span></div></section><section class="home-store panel"><div class="panel-head compact"><div><h2>${iconHtml('store')} Store</h2><span>${esc(cfg.home?.storeSubtitle||'Accédez à tous mes outils et fichiers')}</span></div></div><div class="home-search"><span>${iconHtml('search')}</span><input id="home-store-search" placeholder="Rechercher un fichier, un outil..."></div><div class="home-filters"><select id="home-cat"><option value="">Toutes les catégories</option>${[...new Set(storeData.items.map(x=>x.category).filter(Boolean))].sort().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select><select id="home-sub"><option value="">Toutes les sous-catégories</option></select><button class="outline-btn" id="home-reset">Réinitialiser</button></div><div class="home-categories">${categoryTiles()}</div></section><section class="quick-panel panel"><div class="panel-head compact"><div><h2>${iconHtml('download')} Ressources Rapides</h2></div></div><div class="quick-grid">${aio.map(x=>`<a class="quick-card" href="${esc(resolve(x.url))}" target="_blank" rel="noopener">${iconHtml('download')}<div><b>${esc(x.name)}</b><small>${esc(x.description||'Pack complet')}</small></div></a>`).join('')}${cfg.home?.quickLinks?.map(x=>`<a class="quick-card" href="${esc(x.url)}" ${isExternal(x.url)?'target="_blank" rel="noopener"':''}>${iconHtml(x.icon||'link')}<div><b>${esc(x.label)}</b><small>${esc(x.text||'')}</small></div></a>`).join('')||''}</div></section></aside>`;
}
function home(){
  setTitle('Home');
  const load=async()=>{ if(!homeNewsData.items.length&&!homeNewsData.errors.length)homeNewsData=await readAllFeeds(cfg,cfg.homeNews||{}); if(!storeData.items.length&&!storeData.errors.length)storeData=await loadStore(cfg); };
  return load().then(()=>{const p=profile||{}; const repoCount=p.public_repos??'—', fileCount=storeData.items.length||'—', catCount=new Set(storeData.items.map(x=>x.category).filter(Boolean)).size||'—'; $('#content').innerHTML=`${homeHero()}<div class="home-columns"><section class="home-news panel"><div class="panel-head"><div><h2>${iconHtml('rss')} Dernières News</h2><span>Actualités, mises à jour et infos du moment</span></div><a class="outline-btn" href="#news">Voir toutes les news →</a></div><div class="home-news-list">${homeNewsCards()}</div></section>${homeRight()}</div><div class="home-bottom"><section class="thanks-strip panel" style="background-image:url('${esc(resolve(cfg.home?.thanks?.background||'./web/assets/thanks-bg.svg'))}')"><div>${iconHtml('heart')}<div><h3>${esc(cfg.home?.thanks?.title||'Un immense merci !')}</h3><p>${esc(cfg.home?.thanks?.text||'Merci à toutes les personnes qui me soutiennent, qui m’encouragent et qui font vivre cette communauté. Vous êtes géniaux !')}</p></div></div><em>${esc(cfg.home?.thanks?.slogan||'Keep the spirit alive !')} ♡</em></section><section class="stats-strip panel"><div><b>${repoCount}</b><span>Dépôts GitHub</span></div><div><b>${fileCount}</b><span>Fichiers disponibles</span></div><div><b>${catCount}</b><span>Catégories</span></div><div class="online"><b>● Site en ligne</b><span>${esc(cfg.home?.statusText||'Détection automatique activée')}</span></div></section></div>${footer()}`; bindHome();});
}
function bindHome(){
  $('#home-store-search')?.addEventListener('input',e=>{state.query=e.target.value;updateHomeCategories();});
  $('#home-cat')?.addEventListener('change',e=>{state.category=e.target.value;updateHomeCategories();});
  $('#home-sub')?.addEventListener('change',e=>{state.subcategory=e.target.value;updateHomeCategories();});
  $('#home-reset')?.addEventListener('click',()=>{state.query=state.category=state.subcategory='';['home-store-search','home-cat','home-sub'].forEach(id=>{const el=$('#'+id);if(el)el.value='';});updateHomeCategories();});
  document.querySelectorAll('[data-home-cat]').forEach(a=>a.addEventListener('click',()=>{state.category=a.dataset.homeCat;}));
}
function updateHomeCategories(){
  const q=state.query.toLowerCase(); const cats=[...new Set(storeData.items.filter(x=>(!state.category||x.category===state.category)&&(!q||JSON.stringify(x).toLowerCase().includes(q))).map(x=>x.subcategory).filter(Boolean))].sort();
  const sub=$('#home-sub'); if(sub){const cur=state.subcategory;sub.innerHTML='<option value="">Toutes les sous-catégories</option>'+cats.map(x=>`<option ${x===cur?'selected':''} value="${esc(x)}">${esc(x)}</option>`).join('');}
}
function news(){
  setTitle('News'); const n=cfg.news||{};
  $('#content').innerHTML=`${pageIntro(n.title||'News',n.description||'Lecteur RSS / Atom / OPML présenté comme un blog.','rss',n.background)}<div class="reader-toolbar panel"><div><b>${iconHtml('rss')} Lecteur de flux</b><span>${(newsData.items||[]).length} article(s) chargé(s)</span></div><div class="reader-actions"><select id="news-source"><option value="">Toutes les sources</option>${[...new Set((newsData.items||[]).map(x=>x.source).filter(Boolean))].sort().map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select><button class="outline-btn" id="news-refresh">Actualiser</button></div></div><div id="news-list" class="blog-list"></div>${newsData.errors?.length?`<div class="notice">${newsData.errors.map(e=>`<div>${esc(e)}</div>`).join('')}</div>`:''}${footer()}`;
  renderNewsList(); $('#news-source').addEventListener('change',renderNewsList); $('#news-refresh').addEventListener('click',async()=>{newsData=await readAllFeeds(cfg,n);news();});
}
function renderNewsList(){
  const src=$('#news-source')?.value||''; const items=(newsData.items||[]).filter(x=>!src||x.source===src).sort((a,b)=>new Date(b.date)-new Date(a.date));
  $('#news-list').innerHTML=items.length?items.map(n=>`<article class="blog-card panel"><div class="blog-image">${n.image?`<img src="${esc(n.image)}" alt="">`:`<div class="art-symbol large">${iconHtml('rss')}</div>`}</div><div class="blog-body"><div class="blog-meta"><span>${esc(n.source||'RSS')}</span><span>${iconHtml('clock')} ${esc(fmtDate(n.date))}</span></div><h2>${esc(n.title)}</h2><p>${esc(n.description||'')}</p><div class="blog-foot">${n.link?`<a class="primary-btn" href="${esc(n.link)}" target="_blank" rel="noopener">Lire l’article ${iconHtml('external')}</a>`:''}</div></div></article>`).join(''):`<div class="empty">Aucun article disponible.</div>`;
}
function downloads(){
  setTitle('Download'); const d=cfg.downloads||{}; const items=arr(d.items).filter(x=>x.enabled!==false);
  $('#content').innerHTML=`${pageIntro(d.title||'Download',d.description||'Packs et fichiers prêts à télécharger.','download',d.background)}<div class="download-toolbar panel"><input id="download-search" placeholder="Rechercher un téléchargement..."><span>${items.length} ressource(s)</span></div><div id="download-list" class="download-list"></div>${otherDownloads()}${footer()}`;
  const render=()=>{const q=($('#download-search').value||'').toLowerCase();$('#download-list').innerHTML=items.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`<a class="download-row panel" href="${esc(resolve(x.url))}" target="_blank" rel="noopener"><div class="feature-icon">${iconHtml(x.icon||'download')}</div><div><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p><small>${esc(x.filename||x.url||'')}</small></div><span class="row-arrow">${iconHtml('external')}</span></a>`).join('')||'<div class="empty">Aucun téléchargement.</div>';};
  $('#download-search').addEventListener('input',render);render();
  document.querySelectorAll('.copy-catalog').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);toast('URL copiée dans le presse-papiers.');b.textContent='✓ Copié';setTimeout(()=>b.innerHTML=iconHtml('code')+' Copier l’URL',1600);}catch(e){toast('Copie impossible : sélectionnez l’URL manuellement.');}}));
}
function otherDownloads(){
  const o=cfg.downloads?.otherDownloads||{}; if(o.enabled===false)return '';
  const items=arr(o.items).filter(x=>x.enabled!==false);
  return `<section class="section-block"><div class="section-title"><div><div class="eyebrow">${esc(o.eyebrow||'OTHER DOWNLOADS')}</div><h2>${esc(o.title||'Other Download')}</h2><p>${esc(o.description||'Ajoutez ici d’autres packs, archives ou ressources.')}</p></div></div><div class="other-download-grid">${items.map(x=>x.copyOnly?`<article class="other-card panel catalog-card"><div class="feature-icon">${iconHtml(x.icon||'code')}</div><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p><code>${esc(x.url)}</code><button class="primary-btn copy-catalog" data-copy="${esc(x.url)}">${iconHtml('code')} Copier l’URL</button></article>`:`<a class="other-card panel" href="${esc(resolve(x.url))}" target="_blank" rel="noopener"><div class="feature-icon">${iconHtml(x.icon||'download')}</div><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p><small>${esc(x.filename||'Télécharger')}</small></a>`).join('')}</div></section>`;
}
async function store(){
  setTitle('Store'); const s=cfg.store||{}; const cats=[...new Set(storeData.items.map(x=>x.category).filter(Boolean))].sort();
  $('#content').innerHTML=`${pageIntro('Store',s.description||'Catalogue dynamique JSON avec recherche, catégories, sous-catégories et téléchargement.','store',s.background)}<div class="store-toolbar panel"><div class="store-search"><span>${iconHtml('search')}</span><input id="store-search" placeholder="Rechercher un fichier, un outil..."></div><select id="store-cat"><option value="">Toutes les catégories</option>${cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select><select id="store-sub"><option value="">Toutes les sous-catégories</option></select><button class="outline-btn" id="store-reset">Réinitialiser</button><div class="view-switch"><button class="view-btn active" data-view="list">☰</button><button class="view-btn" data-view="tiles">▦</button></div></div><div id="store-results"></div>${storeData.errors?.length?`<div class="notice">${storeData.errors.map(e=>`<div>${esc(e)}</div>`).join('')}</div>`:''}${footer()}`;
  $('#store-search').value=state.query;$('#store-cat').value=state.category; bindStore(); renderStore();
}
function filteredStore(){
  const q=state.query.toLowerCase(); return storeData.items.filter(x=>(!state.category||x.category===state.category)&&(!state.subcategory||x.subcategory===state.subcategory)&&(!q||JSON.stringify(x).toLowerCase().includes(q)));
}
function bindStore(){
  $('#store-search').addEventListener('input',e=>{state.query=e.target.value;renderStore();});
  $('#store-cat').addEventListener('change',e=>{state.category=e.target.value;state.subcategory='';renderStore();});
  $('#store-sub').addEventListener('change',e=>{state.subcategory=e.target.value;renderStore();});
  $('#store-reset').addEventListener('click',()=>{state.query=state.category=state.subcategory='';$('#store-search').value='';$('#store-cat').value='';renderStore();});
  document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click',()=>{state.storeView=b.dataset.view;document.querySelectorAll('.view-btn').forEach(x=>x.classList.toggle('active',x===b));renderStore();}));
}
function renderStore(){
  const items=filteredStore(); const subs=[...new Set(storeData.items.filter(x=>!state.category||x.category===state.category).map(x=>x.subcategory).filter(Boolean))].sort(); const sub=$('#store-sub'); if(sub){sub.innerHTML='<option value="">Toutes les sous-catégories</option>'+subs.map(x=>`<option ${x===state.subcategory?'selected':''} value="${esc(x)}">${esc(x)}</option>`).join('');}
  const el=$('#store-results'); if(!el)return;
  if(state.storeView==='tiles') el.innerHTML=`<div class="store-grid">${items.map(storeTile).join('')}</div>`; else el.innerHTML=`<div class="store-list">${items.map(storeRow).join('')}</div>`;
}
function itemIcon(x){return x.icon?`<img src="${esc(resolve(x.icon))}" alt="">`:`<span>${iconHtml(x.iconName||'file')}</span>`;}
function storeRow(x){return `<article class="store-row panel"><div class="store-icon">${itemIcon(x)}</div><div class="store-main"><h3>${esc(x.name||x.title||'Sans nom')}</h3><div class="chips"><span>${esc(x.category||'')}</span>${x.subcategory?`<span>${esc(x.subcategory)}</span>`:''}${x.version?`<span>v${esc(x.version)}</span>`:''}</div><p>${esc(x.description||'')}</p><small>${esc(x.filename||'')}</small></div><div class="store-actions">${x.url?`<a class="primary-btn" href="${esc(resolve(x.url))}" target="_blank" rel="noopener">${iconHtml('download')} Télécharger</a>`:''}</div></article>`;}
function storeTile(x){return `<article class="store-tile panel"><div class="store-tile-icon">${itemIcon(x)}</div><div class="chips"><span>${esc(x.category||'')}</span>${x.subcategory?`<span>${esc(x.subcategory)}</span>`:''}</div><h3>${esc(x.name||x.title||'Sans nom')}</h3><p>${esc(x.description||'')}</p><div class="store-tile-foot">${x.version?`<small>v${esc(x.version)}</small>`:''}${x.url?`<a class="primary-btn small" href="${esc(resolve(x.url))}" target="_blank" rel="noopener">${iconHtml('download')} Télécharger</a>`:''}</div></article>`;}
function serviceTabs(){
  const tabs=arr(cfg.services?.tabs).filter(x=>x.enabled!==false); return tabs.map((x,i)=>`<button class="service-tab ${state.serviceTab===(x.id||'')?'active':''}" data-service-tab="${esc(x.id)}">${iconHtml(x.icon||'link')} ${esc(x.label)}</button>`).join('');
}
function serviceCard(x, local=false){
  const icon=x.iconType==='image'?`<img src="${esc(resolve(x.icon))}" alt="">`:iconHtml(x.icon||'link');
  const href=local?null:(x.url||'#');
  return `<article class="service-card panel"><div class="feature-icon">${icon}</div><div class="service-card-body"><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p>${local?`<small>Port ${esc(x.port||'')} ${esc(x.path||'/')}</small>`:''}</div>${local?`<button class="icon-link local-open" data-port="${esc(x.port||'')}" data-path="${esc(x.path||'/')}" data-protocol="${esc(x.protocol||'http')}">${iconHtml('external')}</button>`:`<a class="icon-link" href="${esc(href)}" target="_blank" rel="noopener">${iconHtml('external')}</a>`}</article>`;
}
function services(){
  setTitle('Services'); const s=cfg.services||{}; const tabs=arr(s.tabs).filter(x=>x.enabled!==false); if(!tabs.some(x=>x.id===state.serviceTab))state.serviceTab=tabs[0]?.id||'webkit';
  const current=tabs.find(x=>x.id===state.serviceTab)||{};
  $('#content').innerHTML=`<div class="service-head panel" style="background-image:url('${esc(resolve(s.background||'./web/assets/services-bg.svg'))}')"><div class="service-head-bubble"><div class="feature-icon">${iconHtml(current.icon||'link')}</div><div><div class="eyebrow">${esc(cfg.site.name)}</div><h1>${esc(s.title||'Services')}</h1><p>${esc(s.description||'Accédez à vos services externes et à vos interfaces locales.')}</p></div></div><div class="service-tabs">${serviceTabs()}</div></div><div class="service-content">${renderServiceTab(current)}</div>${footer()}`;
  document.querySelectorAll('[data-service-tab]').forEach(b=>b.addEventListener('click',()=>{state.serviceTab=b.dataset.serviceTab;services();}));
  document.querySelectorAll('.local-open').forEach(b=>b.addEventListener('click',()=>openLocalService(b)));
  document.querySelectorAll('[data-service-view]').forEach(b=>b.addEventListener('click',()=>{state.serviceView=b.dataset.serviceView;services();}));
  $('#ps5-ip')?.addEventListener('input',e=>{localStorage.setItem('evox.ps5.ip',e.target.value.trim());});
}
function renderServiceTab(tab){
  if(tab.type==='webui'){const ip=localStorage.getItem('evox.ps5.ip')||cfg.services?.webui?.defaultIp||'';const groups=arr(tab.groups);return `<section class="service-section"><div class="section-heading"><div><h2>${esc(tab.title||'WebUI PS5')}</h2><p>${esc(tab.description||'Indiquez l’adresse IP de votre console puis ouvrez les WebUI configurées.')}</p></div><label class="ip-box">${iconHtml('globe')} IP de la console <input id="ps5-ip" value="${esc(ip)}" placeholder="192.168.1.50"></label></div>${groups.map(g=>`<div class="service-group"><h3>${iconHtml(g.icon||'folder')} ${esc(g.name)}</h3><div class="service-grid">${arr(g.items).map(x=>serviceCard(x,true)).join('')}</div></div>`).join('')}</section>`;}
  const items=arr(tab.items); const view=state.serviceView; return `<section class="service-section"><div class="section-heading"><div><h2>${esc(tab.title||tab.label||'Services')}</h2><p>${esc(tab.description||'Ajoutez vos services dans la configuration.')}</p></div><div class="view-switch"><button class="view-btn ${view==='list'?'active':''}" data-service-view="list">☰</button><button class="view-btn ${view==='tiles'?'active':''}" data-service-view="tiles">▦</button><button class="view-btn ${view==='cards'?'active':''}" data-service-view="cards">▤</button></div></div><div class="service-grid ${view==='list'?'service-list':''} ${view==='cards'?'service-cards':''}">${items.map(x=>serviceCard(x,false)).join('')}</div></section>`;
}
function openLocalService(b){const ip=$('#ps5-ip')?.value.trim()||localStorage.getItem('evox.ps5.ip')||'';if(!ip){toast('Indiquez d’abord l’adresse IP de la PS5.');$('#ps5-ip')?.focus();return;}const port=b.dataset.port;const path=(b.dataset.path||'/').startsWith('/')?b.dataset.path:'/'+b.dataset.path;const url=`${b.dataset.protocol||'http'}://${ip}${port?':'+port:''}${path}`;window.open(url,'_blank','noopener');}
async function docs(){
  setTitle('Documentation'); if(!docsData.length)docsData=sortDocs(await loadDocs(cfg),cfg.docs?.order||[]); const d=cfg.docs||{}; const selected=state.doc||docsData[0]?.path;
  if(!selected){$('#content').innerHTML=`${pageIntro('Documentation','Aucun document trouvé dans le dossier configuré.','book',d.background)}${footer()}`;return;}
  const doc=await loadDoc(cfg,selected); $('#content').innerHTML=`<div class="docs-layout"><aside class="docs-sidebar"><div class="docs-title">${iconHtml('book')} ${esc(d.title||'Documentation')}</div>${docsData.map(x=>`<a href="#docs/${encodeURIComponent(x.path)}" class="doc-link ${x.path===selected?'active':''}">${iconHtml(x.icon||'file')}<span>${esc(x.title||x.path)}</span></a>`).join('')}</aside><article class="doc-page panel"><div class="doc-meta"><span>${esc(doc.path)}</span></div><div class="markdown">${markdown(doc.content||'')}</div></article></div>${footer()}`;
}
function about(){const d=cfg.about||{};setTitle('About');$('#content').innerHTML=`${pageIntro(d.title||'About',d.description||'À propos du projet.','info',d.background)}<div class="cards-grid">${arr(d.cards).map(x=>`<article class="info-card panel"><div class="feature-icon">${iconHtml(x.icon||'check')}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div>${footer()}`;}
function thanks(){const d=cfg.thanks||{};setTitle('Remerciements');$('#content').innerHTML=`${pageIntro(d.title||'Remerciements',d.description||'Merci à celles et ceux qui font vivre le projet.','heart',d.background)}<div class="thanks-page panel" style="background-image:url('${esc(resolve(d.background||'./web/assets/thanks-bg.svg'))}')"><div class="big-heart">${iconHtml('heart')}</div><h2>${esc(d.message||'Un immense merci à la communauté !')}</h2><p>${esc(d.text||'Votre soutien, vos retours et vos contributions permettent à evoX Core OS de continuer à évoluer.')}</p><div class="thanks-grid">${arr(d.items).map(x=>`<div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div></div>${footer()}`;}
async function render(){
  const parts=location.hash.replace(/^#/,'').split('/'); state.page=parts[0]||cfg.site.defaultPage||'home'; if(state.page==='docs')state.doc=parts.slice(1).map(decodeURIComponent).join('/');
  const exists=arr(cfg.navigation).some(n=>n.id===state.page&&n.enabled!==false); if(!exists)state.page='home'; nav();
  try{if(state.page==='home')await home();else if(state.page==='news'){if(!newsData.items.length&&!newsData.errors.length)newsData=await readAllFeeds(cfg,cfg.news||{});news();}else if(state.page==='downloads')downloads();else if(state.page==='store'){if(!storeData.items.length&&!storeData.errors.length)storeData=await loadStore(cfg);store();}else if(state.page==='docs')await docs();else if(state.page==='services')services();else if(state.page==='about')about();else if(state.page==='thanks')thanks();else await home();document.querySelectorAll('[data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===state.page));}catch(e){console.error(e);$('#content').innerHTML=`<div class="error"><h2>evoX Core OS</h2><p>Une erreur est survenue.</p><pre>${esc(e.stack||e.message||e)}</pre></div>`;}}
async function init(){try{cfg=await loadConfig();repo=cfg.repository;[profile,repository]=await Promise.all([cfg.profile?.enabled!==false?getProfile(cfg):null,getRepo(cfg)]);if(repository?.default_branch&&(cfg.repository.branch==='auto'||!cfg.repository.branch))cfg.repository.branch=repository.default_branch;repo=cfg.repository;for(const[k,v]of Object.entries(cfg.themeColors||{}))document.documentElement.style.setProperty(`--${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,v);shell();window.addEventListener('hashchange',render);$('#mobile-menu')?.addEventListener('click',()=>$('#sidebar')?.classList.toggle('open'));await render();}catch(e){console.error(e);$('#content').innerHTML=`<div class="error"><h2>evoX Core OS</h2><p>Impossible de charger la configuration.</p><pre>${esc(e.stack||e.message||e)}</pre></div>`;}}
init();
