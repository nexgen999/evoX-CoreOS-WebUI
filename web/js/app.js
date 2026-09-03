import {loadConfig, resolveUrl} from './config.js';
import {iconHtml} from './icons.js';
import {getProfile, getRepo} from './github.js';
import {readAllFeeds} from './rss.js';
import {loadStore} from './store.js';
import {loadDocs, loadDoc, sortDocs} from './docs.js';
import {markdown} from './markdown.js';

let cfg, repo, profile, repository;
let storeData = {items: [], errors: []};
let newsData = {items: [], errors: []};
let homeNewsData = {items: [], errors: []};
let docsData = [];
const state = {page:'home', query:'', category:'', subcategory:'', storeView:'list', doc:''};
const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const isExternal = u => /^https?:\/\//i.test(u||'');
function fmtDate(v){const d=new Date(v);return Number.isNaN(d.getTime())?String(v||''):new Intl.DateTimeFormat(cfg.site.language||'fr',{dateStyle:'medium',timeStyle:'short'}).format(d)}
function setTitle(label){$('#page-title').textContent=label;$('#page-kicker').textContent=cfg.site.name||'evoX Core OS'}
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)}
function navigate(id){location.hash=id;}

function nav(){
  $('#main-nav').innerHTML=(cfg.navigation||[]).filter(x=>x.enabled!==false).map(x=>`<a href="#${x.id}" class="nav-item ${state.page===x.id?'active':''}" data-page="${esc(x.id)}"><span class="nav-icon">${iconHtml(x.icon||'file')}</span><span>${esc(x.label)}</span></a>`).join('');
  document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',()=>{state.page=a.dataset.page;closeSidebarMobile()}));
}
function closeSidebarMobile(){$('#sidebar')?.classList.remove('open')}

function profileUI(){
  const p=profile||{}; const avatar=p.avatar_url||cfg.profile.avatar||'./web/assets/avatar-placeholder.svg';
  $('#profile').innerHTML=`<div class="profile-head"><img class="avatar" src="${esc(avatar)}" onerror="this.src='./web/assets/avatar-placeholder.svg'" alt=""><div><div class="profile-name">${esc(p.name||repo.owner||'GitHub User')}</div><div class="profile-handle">@${esc(p.login||repo.owner||'')}</div></div></div>${cfg.profile.showBio!==false?`<p class="bio">${esc(p.bio||cfg.profile.bioFallback||'')}</p>`:''}<div class="profile-meta">${cfg.profile.showLocation!==false&&(p.location||cfg.profile.locationFallback)?`<span>${iconHtml('pin')} ${esc(p.location||cfg.profile.locationFallback)}</span>`:''}${cfg.profile.showStats!==false&&p.public_repos!=null?`<span>${iconHtml('repo')} ${p.public_repos} repos</span>`:''}</div>`;
}
function socialAnchor(s, cls=''){
  const href=s.url||repo.githubUrl||'#';
  const icon=s.iconType==='image'?`<img src="${esc(resolveUrl(s.icon,repo))}" alt="">`:iconHtml(s.icon||'link');
  return `<a class="social ${cls}" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(s.label||'')}">${icon}${s.showLabel?`<span>${esc(s.label)}</span>`:''}</a>`;
}
function socialsUI(){
  const socials=(cfg.socials||[]).filter(s=>s.enabled!==false);
  const quick=(cfg.topbar?.quickDownloads||[]).filter(x=>x.enabled!==false&&x.url);
  const topDownloads=quick.map(x=>`<a class="top-action download-action" href="${esc(resolveUrl(x.url,repo))}" target="_blank" rel="noopener" title="${esc(x.label)}">${iconHtml(x.icon||'download')}<span>${esc(x.label)}</span></a>`).join('');
  $('#top-socials').innerHTML=topDownloads+socials.map(s=>socialAnchor(s,'top-social')).join('')+`<img class="top-avatar" src="${esc(profile?.avatar_url||cfg.profile?.avatar||'./web/assets/avatar-placeholder.svg')}" alt="">`;
  const follow=(cfg.sidebar?.followMe?.enabled!==false?socials:[]).map(s=>socialAnchor(s,'sidebar-social')).join('');
  const promo=cfg.sidebar?.promo||{};
  $('#sidebar-bottom').innerHTML=`<div class="follow-block"><div class="follow-title">${iconHtml('link')} <span>${esc(cfg.sidebar?.followMe?.title||'Suivez-moi')}</span></div><div class="sidebar-socials">${follow||'<span class="muted">Aucun réseau configuré.</span>'}</div></div>${promo.enabled===false?'':`<div class="sidebar-promo" style="background-image:url('${esc(resolveUrl(promo.background||'./web/assets/sidebar-bg.svg',repo))}')"><strong>${esc(promo.title||cfg.site.name)}</strong><span>${esc(promo.text||'One place. All your needs.')}</span></div>`}`;
}
function shell(){
  nav();profileUI();socialsUI();
  $('#global-brand-logo').src=resolveUrl(cfg.branding.logo||'./web/assets/logo.svg',repo);
  $('#global-brand-logo').alt=cfg.site.name||'evoX Core OS';
  $('#github-top').href=repo.githubUrl||'#';$('#github-top').style.display=repo.githubUrl?'inline-flex':'none';
}
function footer(){
  if(cfg.footer?.enabled===false)return '';
  const f=cfg.footer||{};
  const links=(f.links||[]).filter(x=>x.enabled!==false).map(x=>`<a href="${esc(resolveUrl(x.url,repo))}" ${x.newTab!==false?'target="_blank" rel="noopener"':''}>${esc(x.label)}</a>`).join(' <i>•</i> ');
  const badges=(f.badges||[]).filter(b=>b.enabled!==false&&b.image).map(b=>`<a href="${esc(resolveUrl(b.href||'#',repo))}" target="_blank" rel="noopener" title="${esc(b.label||'Badge')}"><img src="${esc(resolveUrl(b.image,repo))}" alt="${esc(b.alt||b.label||'Badge')}"></a>`).join('');
  return `<footer class="footer"><div class="footer-copy"><span>${esc(f.text||'')} ${f.showYear?'• '+new Date().getFullYear():''}</span>${links?`<span>${links}</span>`:''}</div><div class="badges">${badges}</div></footer>`;
}
function pageIntro(label, desc, icon='file'){
  return `<div class="page-intro"><div class="page-intro-icon">${iconHtml(icon)}</div><div><div class="eyebrow">${esc(cfg.site.name)}</div><h1>${esc(label)}</h1><p>${esc(desc||'')}</p></div></div>`;
}
function homeHero(){
  const h=cfg.home?.hero||{};
  return `<section class="home-hero" style="background-image:url('${esc(resolveUrl(h.background||'./web/assets/hero-bg.svg',repo))}')"><div class="home-hero-logo"><img src="${esc(resolveUrl(h.logo||cfg.branding.logo||'./web/assets/logo.svg',repo))}" alt="${esc(cfg.site.name)}"></div><div class="home-hero-copy"><div class="eyebrow">${esc(h.eyebrow||cfg.site.name)}</div><h1>${esc(h.title||cfg.branding.heroTitle||'Bienvenue sur evoX Core OS')}</h1><p>${esc(h.text||cfg.branding.heroText||'')}</p><div class="hero-actions">${(h.links||cfg.home?.heroLinks||[]).map(x=>`<a class="hero-chip" href="${esc(x.url||'#')}" ${isExternal(x.url)?'target="_blank" rel="noopener"':''}>${iconHtml(x.icon||'link')} ${esc(x.label)}</a>`).join('')}</div></div></section>`;
}
function categoryTiles(){
  const all=storeData.items||[]; const configured=(cfg.home?.categoryTiles||[]).filter(x=>x.enabled!==false);
  const cats=configured.length?configured:[...new Set(all.map(x=>x.category).filter(Boolean))].slice(0,6).map(x=>({label:x,icon:'folder'}));
  return cats.slice(0,6).map(c=>{const n=all.filter(x=>x.category===c.label).length;return `<a href="#store" class="home-cat" data-home-cat="${esc(c.label)}"><b>${iconHtml(c.icon||'folder')}</b><span>${esc(c.label)}</span><small>(${n})</small></a>`}).join('');
}
function homeNewsCards(){
  const items=(homeNewsData.items||[]).slice(0,cfg.homeNews?.maxItems||4);
  if(!items.length)return `<div class="empty home-empty">${esc(cfg.home?.emptyNewsText||'Les flux RSS / OPML apparaîtront ici automatiquement.')}</div>`;
  return items.map(n=>`<article class="home-news-item"><div class="home-news-thumb">${n.image?`<img src="${esc(n.image)}" alt="">`:`<div class="art-symbol">${iconHtml('rss')}</div>`}</div><div class="home-news-copy"><h3>${esc(n.title)}</h3><div class="home-meta"><span>${esc(n.source||'RSS')}</span><span>${iconHtml('clock')} ${esc(fmtDate(n.date))}</span></div><p>${esc(n.description||'').slice(0,190)}${(n.description||'').length>190?'…':''}</p>${n.link?`<a href="${esc(n.link)}" target="_blank" rel="noopener">Lire la suite →</a>`:''}</div></article>`).join('');
}
async function home(){
  setTitle('Home');
  if(!homeNewsData.items.length && !homeNewsData.errors.length) homeNewsData=await readAllFeeds(cfg,cfg.homeNews||{});
  if(!storeData.items.length&&!storeData.errors.length)storeData=await loadStore(cfg);
  const aio=(cfg.home?.quickDownloads||[]).filter(x=>x.enabled!==false).slice(0,4);
  const p=profile||{};
  const repoCount=p.public_repos??'—', fileCount=storeData.items.length||'—', catCount=new Set(storeData.items.map(x=>x.category).filter(Boolean)).size||'—';
  $('#content').innerHTML=`
    ${homeHero()}
    <div class="home-columns">
      <section class="home-news panel"><div class="panel-head"><div><h2>${iconHtml('rss')} Dernières News</h2><span>Actualités, mises à jour et infos du moment</span></div><a class="outline-btn" href="#news">Voir toutes les news →</a></div><div class="home-news-list">${homeNewsCards()}</div></section>
      <aside class="home-right">
        <section class="welcome-card panel" style="background-image:url('${esc(resolveUrl(cfg.home?.welcome?.background||'./web/assets/welcome-bg.svg',repo))}')"><div><h2>${esc(cfg.home?.welcome?.title||'👋 Bienvenue !')}</h2><p>${esc(cfg.home?.welcome?.text||'Passionné par le homebrew, le développement et les projets open source.')}</p><span>— ${esc(cfg.home?.welcome?.signature||repo.owner||'evoX')}</span></div></section>
        <section class="home-store panel"><div class="panel-head compact"><div><h2>${iconHtml('store')} Store</h2><span>${esc(cfg.home?.storeSubtitle||'Accédez à tous mes outils et fichiers')}</span></div></div><div class="home-search"><span>${iconHtml('search')}</span><input id="home-store-search" placeholder="Rechercher un fichier, un outil..."></div><div class="home-filters"><select id="home-cat"><option value="">Toutes les catégories</option>${[...new Set(storeData.items.map(x=>x.category).filter(Boolean))].sort().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select><select id="home-sub"><option value="">Toutes les sous-catégories</option></select><button id="home-reset">Réinitialiser</button></div><div class="home-categories">${categoryTiles()}</div></section>
        <section class="quick-card panel"><div class="panel-head compact"><div><h2>${iconHtml('download')} Ressources Rapides</h2></div></div><div class="quick-grid">${aio.map(x=>`<a class="quick-item" href="${esc(resolveUrl(x.url,repo))}" target="_blank" rel="noopener"><b>${iconHtml('download')}</b><span><strong>${esc(x.name)}</strong><small>${esc(x.description||'Pack complet (.zip)')}</small></span></a>`).join('')}<a class="quick-item" href="#docs"><b>${iconHtml('book')}</b><span><strong>Documentation</strong><small>Guides & tutos</small></span></a><a class="quick-item" href="#services"><b>${iconHtml('link')}</b><span><strong>Services</strong><small>Mes services / redirections</small></span></a></div></section>
        <section class="home-thanks" style="background-image:url('${esc(resolveUrl(cfg.home?.thanks?.background||'./web/assets/thanks-bg.svg',repo))}')"><b class="thanks-heart">♥</b><div><strong>${esc(cfg.home?.thanks?.title||'Un immense merci !')}</strong><small>${esc(cfg.home?.thanks?.text||'Merci à toutes les personnes qui me soutiennent, qui m’encouragent et qui font vivre cette communauté. Vous êtes géniaux !')}</small></div><em>${esc(cfg.home?.thanks?.signature||'Keep the spirit alive ! ♡')}</em></section>
        <section class="home-stats"><div><b>${esc(repoCount)}</b><small>Dépôts GitHub</small></div><div><b>${esc(fileCount)}</b><small>Fichiers disponibles</small></div><div><b>${esc(catCount)}</b><small>Catégories</small></div><div><b class="online">● Site en ligne</b><small>Détection automatique</small></div></section>
      </aside>
    </div>${footer()}`;
  $('#home-reset')?.addEventListener('click',()=>{ $('#home-store-search').value=''; $('#home-cat').value=''; $('#home-sub').innerHTML='<option value="">Toutes les sous-catégories</option>'; });
  $('#home-store-search')?.addEventListener('input',e=>{state.query=e.target.value;state.category=$('#home-cat').value;state.subcategory=$('#home-sub').value;navigate('store')});
  $('#home-cat')?.addEventListener('change',e=>{state.category=e.target.value;state.subcategory='';state.query=$('#home-store-search').value;fillHomeSubs();});
  $('#home-sub')?.addEventListener('change',e=>{state.subcategory=e.target.value;});
  document.querySelectorAll('[data-home-cat]').forEach(a=>a.addEventListener('click',()=>{state.category=a.dataset.homeCat;state.query='';}));
  function fillHomeSubs(){const vals=[...new Set(storeData.items.filter(x=>!state.category||x.category===state.category).map(x=>x.subcategory).filter(Boolean))].sort();$('#home-sub').innerHTML='<option value="">Toutes les sous-catégories</option>'+vals.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');}
}
function feedSourceControls(data){
  const sources=[...new Set(data.items.map(x=>x.source).filter(Boolean))];
  return `<div class="feed-controls"><button class="feed-filter ${!state.feed?'active':''}" data-feed="">Toutes <span>${data.items.length}</span></button>${sources.map(s=>`<button class="feed-filter ${state.feed===s?'active':''}" data-feed="${esc(s)}">${esc(s)} <span>${data.items.filter(x=>x.source===s).length}</span></button>`).join('')}<button class="btn ghost" id="refresh-news">↻ Actualiser</button></div>`;
}
async function news(){
  setTitle('News');
  if(!newsData.items.length&&!newsData.errors.length)newsData=await readAllFeeds(cfg,cfg.news||{});
  const filtered=(newsData.items||[]).filter(n=>!state.feed||n.source===state.feed);
  $('#content').innerHTML=`<div class="news-reader-head" style="background-image:url('${esc(resolveUrl(cfg.news?.background||'./web/assets/news-bg.svg',repo))}')"><div><div class="eyebrow">${esc(cfg.news?.eyebrow||'RSS / ATOM / OPML')}</div><h1>${esc(cfg.news?.title||'News')}</h1><p>${esc(cfg.news?.description||'Un lecteur de flux vivant, présenté comme un blog.')}</p></div><div class="reader-stat"><b>${filtered.length}</b><span>articles</span></div></div>${feedSourceControls(newsData)}${newsData.errors.length?`<div class="error">${esc(newsData.errors.map(e=>`${e.feed||e.source}: ${e.error}`).join(' • '))}</div>`:''}<div class="blog-feed">${filtered.map((n,i)=>`<article class="blog-post"><div class="blog-media">${n.image?`<img src="${esc(n.image)}" alt="">`:`<div class="blog-placeholder">${iconHtml('rss')}</div>`}</div><div class="blog-body"><div class="blog-meta"><span>${esc(n.source||'RSS')}</span><time>${esc(fmtDate(n.date))}</time></div><h2>${esc(n.title)}</h2><p>${esc(n.description||'')}</p><div class="blog-actions">${n.link?`<a class="btn" href="${esc(n.link)}" target="_blank" rel="noopener">Lire l'article ${iconHtml('external')}</a>`:''}<span class="blog-index">#${String(i+1).padStart(2,'0')}</span></div></div></article>`).join('')||'<div class="empty">Aucune actualité disponible.</div>'}</div>${footer()}`;
  document.querySelectorAll('[data-feed]').forEach(b=>b.addEventListener('click',()=>{state.feed=b.dataset.feed;news()}));
  $('#refresh-news')?.addEventListener('click',async()=>{newsData={items:[],errors:[]};await news()});
}
function downloads(){
  setTitle('Download'); const items=cfg.downloads?.items||[];
  $('#content').innerHTML=`${pageIntro(cfg.downloads?.title||'Download',cfg.downloads?.description||'Packs et fichiers prêts à télécharger.','download')}<div class="toolbar"><input id="dl-search" class="input" placeholder="Rechercher un fichier..." value="${esc(state.query)}"></div><div id="download-list" class="download-list"></div>${footer()}`;
  const draw=()=>{const q=state.query.toLowerCase();const rows=items.filter(i=>(`${i.name} ${i.filename} ${i.description} ${i.category}`).toLowerCase().includes(q));$('#download-list').innerHTML=rows.map(i=>`<article class="download-row"><div class="row-icon">${iconHtml(i.icon||'download')}</div><div class="row-main"><strong>${esc(i.name)}</strong><p>${esc(i.filename||i.description||'')} ${i.category?`• ${esc(i.category)}`:''}</p></div><a class="btn" href="${esc(resolveUrl(i.url,repo))}" target="_blank" rel="noopener">Télécharger ${iconHtml('download')}</a></article>`).join('')||'<div class="empty">Aucun fichier trouvé.</div>'};
  $('#dl-search')?.addEventListener('input',e=>{state.query=e.target.value;draw()});draw();
}
function store(){
  setTitle('Store'); const all=storeData.items||[]; const cats=[...new Set(all.map(x=>x.category).filter(Boolean))].sort();
  $('#content').innerHTML=`${pageIntro(cfg.store?.title||'Store',cfg.store?.description||'Catalogue dynamique alimenté par vos fichiers JSON.','store')}<div class="store-toolbar"><input id="store-search" class="input" placeholder="Rechercher un fichier, un outil..." value="${esc(state.query)}"><select id="store-category" class="select"><option value="">Toutes les catégories</option>${cats.map(c=>`<option value="${esc(c)}" ${state.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="store-subcategory" class="select"><option value="">Toutes les sous-catégories</option></select><div class="view-switch"><button data-view="list" class="${state.storeView==='list'?'active':''}" title="Vue liste">${iconHtml('list')}</button><button data-view="tile" class="${state.storeView==='tile'?'active':''}" title="Vue tuile">${iconHtml('grid')}</button></div><button id="store-reset" class="btn ghost">Réinitialiser</button></div>${storeData.errors.length?`<div class="error">${esc(storeData.errors.map(e=>`${e.source}: ${e.error}`).join(' • '))}</div>`:''}<div id="store-results" class="store-results ${state.storeView==='tile'?'tile-view':'list-view'}"></div>${footer()}<div id="store-modal" class="modal"></div>`;
  const cat=$('#store-category'),sub=$('#store-subcategory');
  const subOptions=()=>{const vals=[...new Set(all.filter(x=>!state.category||x.category===state.category).map(x=>x.subcategory).filter(Boolean))].sort();sub.innerHTML='<option value="">Toutes les sous-catégories</option>'+vals.map(x=>`<option value="${esc(x)}" ${state.subcategory===x?'selected':''}>${esc(x)}</option>`).join('')};
  const draw=()=>{const q=state.query.toLowerCase();const rows=all.filter(x=>(!state.category||x.category===state.category)&&(!state.subcategory||x.subcategory===state.subcategory)&&(`${x.name} ${x.filename} ${x.description} ${x.author} ${x.category} ${x.subcategory}`).toLowerCase().includes(q));$('#store-results').innerHTML=rows.map(x=>storeCard(x)).join('')||'<div class="empty">Aucun élément ne correspond aux filtres.</div>';document.querySelectorAll('[data-details]').forEach(b=>b.addEventListener('click',()=>openDetails(all.find(x=>x.id===b.dataset.details))));};
  $('#store-search').addEventListener('input',e=>{state.query=e.target.value;draw()});cat.addEventListener('change',e=>{state.category=e.target.value;state.subcategory='';subOptions();draw()});sub.addEventListener('change',e=>{state.subcategory=e.target.value;draw()});$('#store-reset').addEventListener('click',()=>{state.query=state.category=state.subcategory='';$('#store-search').value='';cat.value='';subOptions();draw()});document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.storeView=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===state.storeView));$('#store-results').className='store-results '+(state.storeView==='tile'?'tile-view':'list-view');draw()}));subOptions();draw();
}
function storeCard(x){return state.storeView==='list'?`<article class="store-list-row"><div class="store-icon">${x.icon?`<img src="${esc(resolveUrl(x.icon,repo))}" alt="">`:iconHtml('code')}</div><div class="store-list-main"><strong>${esc(x.name)}</strong><p>${esc(x.description||x.filename||'')}</p><div class="store-meta">${x.version?`<span>${esc(x.version)}</span>`:''}${x.category?`<span>${esc(x.category)}</span>`:''}${x.subcategory?`<span>${esc(x.subcategory)}</span>`:''}</div></div><div class="store-actions">${x.url?`<a class="btn" href="${esc(resolveUrl(x.url,repo))}" target="_blank" rel="noopener">Télécharger ${iconHtml('download')}</a>`:''}<button class="btn ghost" data-details="${esc(x.id)}">Détails</button></div></article>`:`<article class="store-tile"><div class="store-tile-art">${x.icon?`<img src="${esc(resolveUrl(x.icon,repo))}" alt="">`:iconHtml('code')}</div><h3>${esc(x.name)}</h3><p>${esc(x.description||x.filename||'')}</p><div class="store-meta">${x.category?`<span>${esc(x.category)}</span>`:''}${x.subcategory?`<span>${esc(x.subcategory)}</span>`:''}</div><div class="store-actions">${x.url?`<a class="btn" href="${esc(resolveUrl(x.url,repo))}" target="_blank" rel="noopener">Télécharger</a>`:''}<button class="btn ghost" data-details="${esc(x.id)}">Détails</button></div></article>`}
function openDetails(x){if(!x)return;const m=$('#store-modal');m.className='modal open';m.innerHTML=`<div class="modal-box"><button class="modal-close" id="modal-close">×</button><div class="eyebrow">${esc(x.category||'Store')}</div><h2>${esc(x.name)}</h2><p class="modal-description">${esc(x.description||x.filename||'')}</p><div class="modal-meta">${x.version?`<span>Version ${esc(x.version)}</span>`:''}${x.author?`<span>Par ${esc(x.author)}</span>`:''}${x.subcategory?`<span>${esc(x.subcategory)}</span>`:''}</div>${cfg.store.showChecksum&&x.checksum?`<pre>SHA-256: ${esc(x.checksum)}</pre>`:''}<div class="modal-actions">${x.url?`<a class="btn" href="${esc(resolveUrl(x.url,repo))}" target="_blank" rel="noopener">Télécharger ${iconHtml('download')}</a>`:''}${x.raw?.repo_url?`<a class="btn ghost" href="${esc(x.raw.repo_url)}" target="_blank" rel="noopener">Source ${iconHtml('external')}</a>`:''}</div></div>`;$('#modal-close').addEventListener('click',()=>m.className='modal');m.addEventListener('click',e=>{if(e.target===m)m.className='modal'},{once:true})}
async function docs(){
  setTitle('Documentation');
  if(!docsData.length){try{docsData=sortDocs(await loadDocs(cfg),cfg)}catch(e){$('#content').innerHTML=`${pageIntro('Documentation','Impossible de charger la documentation.','book')}<div class="error">${esc(e.message)}</div>${footer()}`;return}}
  const selected=state.doc||cfg.docs.homeDocument||docsData[0]?.relative; const item=docsData.find(x=>x.relative===selected)||docsData[0];
  const tree=buildDocTree(docsData);
  $('#content').innerHTML=`<div class="docs-layout"><aside class="docs-sidebar"><div class="docs-sidebar-title">${iconHtml('book')} Documentation</div>${renderDocTree(tree,item?.relative)}</aside><article id="doc-body" class="markdown">Chargement…</article></div>${footer()}`;
  document.querySelectorAll('[data-doc]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();state.doc=a.dataset.doc;navigate('docs/'+a.dataset.doc)}));
  if(item)try{$('#doc-body').innerHTML=markdown(await loadDoc(cfg,item))}catch(e){$('#doc-body').innerHTML=`<div class="error">Erreur de lecture : ${esc(e.message)}</div>`}
}
function buildDocTree(items){const root={name:'',dirs:{},files:[]};for(const item of items){const parts=item.relative.split('/').filter(Boolean);let node=root;parts.forEach((p,i)=>{if(i===parts.length-1)node.files.push({...item,name:p});else node=node.dirs[p]||(node.dirs[p]={name:p,dirs:{},files:[]})});}return root}
function renderDocTree(node,active,prefix=''){let html='';Object.values(node.dirs).sort((a,b)=>a.name.localeCompare(b.name)).forEach(d=>{html+=`<div class="doc-dir">${iconHtml('folder')} ${esc(d.name)}</div>${renderDocTree(d,active,prefix+d.name+'/')}`});node.files.sort((a,b)=>a.name.localeCompare(b.name)).forEach(f=>{html+=`<a class="doc-link ${f.relative===active?'active':''}" href="#docs/${f.relative.split('/').map(encodeURIComponent).join('/')}" data-doc="${esc(f.relative)}">${iconHtml('file')} ${esc(f.name)}</a>`});return html}
function thanks(){const d=cfg.thanks||{};setTitle('Remerciements');$('#content').innerHTML=`<div class="page-banner" style="background-image:url('${esc(resolveUrl(d.background||'./web/assets/thanks-bg.svg',repo))}')">${pageIntro(d.title||'Remerciements',d.text||'Merci à toutes les personnes qui font vivre le projet.','heart')}</div><div class="cards-grid">${(d.items||[]).map(x=>`<article class="info-card"><div class="feature-icon">${iconHtml(x.icon||'heart')}</div><h3>${esc(x.name)}</h3><p>${esc(x.text||'')}</p>${x.url?`<a class="btn ghost" href="${esc(resolveUrl(x.url,repo))}" target="_blank" rel="noopener">${esc(x.buttonLabel||'Visiter')} ${iconHtml('external')}</a>`:''}</article>`).join('')||'<div class="empty">Aucun remerciement configuré.</div>'}</div>${footer()}`}
function services(){const d=cfg.services||{};const ext=(d.external?.enabled!==false?d.external.items||[]:[]);const groups=d.local?.groups||[];const saved=localStorage.getItem('evox-console-ip')||d.local?.defaultIp||'';setTitle('Services');$('#content').innerHTML=`<div class="service-hero" style="background-image:url('${esc(resolveUrl(d.background||'./web/assets/services-bg.svg',repo))}')">${pageIntro(d.title||'Services',d.description||'Accédez à vos services externes et à vos interfaces locales.','link')}</div><section class="service-section"><div class="section-title"><h2>${esc(d.external?.title||'Services externes')}</h2><p>${esc(d.external?.description||'Liens vers vos services web publics.')}</p></div><div class="cards-grid">${ext.map(x=>`<a class="service-card" href="${esc(x.url||'#')}" target="_blank" rel="noopener"><div class="feature-icon">${iconHtml(x.icon||'external')}</div><div><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p></div>${iconHtml('external')}</a>`).join('')}</div></section><section class="service-section local-services"><div class="section-title"><div><h2>${esc(d.local?.title||'WebUI locale / Console')}</h2><p>${esc(d.local?.description||'Indiquez l’adresse IP de votre console puis ouvrez les WebUI configurées.')}</p></div><label class="ip-field"><span>${iconHtml('globe')} IP de la console</span><input id="console-ip" value="${esc(saved)}" placeholder="192.168.1.50" inputmode="decimal"></label></div>${groups.map(g=>`<div class="service-group"><h3>${iconHtml(g.icon||'folder')} ${esc(g.name)}</h3><div class="cards-grid">${(g.items||[]).map(x=>`<a class="service-card local" data-local-service="1" data-port="${esc(x.port||'')}" data-path="${esc(x.path||'/')}" data-protocol="${esc(x.protocol||d.local?.protocol||'http')}"><div class="feature-icon">${iconHtml(x.icon||'link')}</div><div><h3>${esc(x.name)}</h3><p>${esc(x.description||'')} ${x.port?`<small>Port ${esc(x.port)}</small>`:''}</p></div>${iconHtml('external')}</a>`).join('')}</div></div>`).join('')}</section>${footer()}`;
  $('#console-ip')?.addEventListener('input',e=>localStorage.setItem('evox-console-ip',e.target.value.trim()));
  document.querySelectorAll('[data-local-service]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const ip=$('#console-ip').value.trim();if(!ip){toast('Indiquez d’abord l’adresse IP de la console.');$('#console-ip').focus();return}const protocol=a.dataset.protocol||'http';const port=a.dataset.port;const path=a.dataset.path||'/';const url=`${protocol}://${ip}${port?':'+port:''}${path.startsWith('/')?path:'/'+path}`;window.open(url,'_blank','noopener');}));
}
function about(){const d=cfg.about||{};setTitle('About');$('#content').innerHTML=`<div class="page-banner" style="background-image:url('${esc(resolveUrl(d.background||'./web/assets/about-bg.svg',repo))}')">${pageIntro(d.title||'About',d.text||'À propos du projet.','info')}</div><div class="cards-grid">${(d.cards||[]).map(x=>`<article class="info-card"><div class="feature-icon">${iconHtml(x.icon||'check')}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div>${footer()}`}
async function render(){
  const parts=location.hash.replace(/^#/,'').split('/'); state.page=parts[0]||cfg.site.defaultPage||'home'; if(state.page==='docs')state.doc=parts.slice(1).map(decodeURIComponent).join('/');
  const exists=(cfg.navigation||[]).some(n=>n.id===state.page&&n.enabled!==false);if(!exists)state.page='home';nav();
  try{if(state.page==='home')await home();else if(state.page==='news')await news();else if(state.page==='downloads')downloads();else if(state.page==='store'){if(!storeData.items.length&&!storeData.errors.length)storeData=await loadStore(cfg);store()}else if(state.page==='docs')await docs();else if(state.page==='services')services();else if(state.page==='about')about();else if(state.page==='thanks')thanks();else await home()}catch(e){$('#content').innerHTML=`<div class="error"><h2>evoX Core OS</h2><p>Une erreur est survenue.</p><pre>${esc(e.stack||e.message||e)}</pre></div>`}
  document.querySelectorAll('[data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===state.page));
}
async function init(){
  try{cfg=await loadConfig();repo=cfg.repository;[profile,repository]=await Promise.all([cfg.profile?.enabled!==false?getProfile(cfg):null,getRepo(cfg)]);if(repository?.default_branch&&(cfg.repository.branch==='auto'||!cfg.repository.branch))cfg.repository.branch=repository.default_branch;repo=cfg.repository;for(const[k,v]of Object.entries(cfg.themeColors||{}))document.documentElement.style.setProperty(`--${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,v);shell();window.addEventListener('hashchange',render);$('#mobile-menu')?.addEventListener('click',()=>$('#sidebar')?.classList.toggle('open'));await render();}catch(e){$('#content').innerHTML=`<div class="error"><h2>evoX Core OS</h2><p>Impossible de charger la configuration.</p><pre>${esc(e.stack||e.message||e)}</pre></div>`}}
init();
