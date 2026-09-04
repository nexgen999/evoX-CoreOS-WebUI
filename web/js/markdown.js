function esc(s=""){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
export function markdown(src=""){
  const lines=src.replace(/\r\n/g,"\n").split("\n");let html="",inCode=false,code="";
  const inline=s=>esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");
  let list=false;
  const closeList=()=>{if(list){html+="</ul>";list=false}};
  for(const line of lines){
    if(line.startsWith("```")){if(inCode){html+=`<pre><code>${esc(code)}</code></pre>`;code="";inCode=false;}else{closeList();inCode=true;}continue;}
    if(inCode){code+=line+"\n";continue;}
    if(/^### /.test(line)){closeList();html+=`<h3>${inline(line.slice(4))}</h3>`;continue;}
    if(/^## /.test(line)){closeList();html+=`<h2>${inline(line.slice(3))}</h2>`;continue;}
    if(/^# /.test(line)){closeList();html+=`<h1>${inline(line.slice(2))}</h1>`;continue;}
    if(/^> /.test(line)){closeList();html+=`<blockquote>${inline(line.slice(2))}</blockquote>`;continue;}
    if(/^- /.test(line)||/^\* /.test(line)){if(!list){html+="<ul>";list=true;}html+=`<li>${inline(line.slice(2))}</li>`;continue;}
    if(!line.trim()){closeList();continue;}
    closeList();html+=`<p>${inline(line)}</p>`;
  }
  closeList();if(inCode)html+=`<pre><code>${esc(code)}</code></pre>`;return html;
}
