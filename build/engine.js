
/* ============================================================
   MOTOR GENÉRICO — no hace falta tocarlo para agregar temas.
   Lee las constantes TEORIA, GENERADORES y MAPA_CARPETAS.
   ============================================================ */

// ---------- helpers ----------
const L = arr => arr.join("\n");                       // arma código desde array de líneas
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function pascal(s){
  s = String(s||"").trim(); if(!s) return "";
  return s.split(/[^A-Za-z0-9]+/).filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join("");
}
function camel(s){ const p=pascal(s); return p? p.charAt(0).toLowerCase()+p.slice(1):""; }
function splitList(s){ return String(s||"").split(",").map(x=>x.trim()).filter(Boolean); }
function parseLines(s){ return String(s||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean); }
function setterName(nombre){ return "set"+pascal(nombre); }

// comillas según opción global (opt.dobles: true/false)
function q(opt, s){ return opt.dobles ? '"'+s+'"' : "'"+s+"'"; }
// comentario según opción: devuelve null si están apagados (se filtran con withC)
function cmt(opt, txt){ return opt.comentarios ? ("// "+txt) : null; }
function withC(arr){ return arr.filter(x=>x!==null); }

// ---------- estado + persistencia (R10, todo en try/catch) ----------
const LS_KEY = "super-dai-v1";
let state = { seccion:"teoria", temaT:"mapa", temaG:"comandos", openGen:null, busqueda:"",
              opts:{comentarios:true, dobles:true, tp1:false}, vals:{} };
function saveState(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){} }
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){ const s = JSON.parse(raw); if(s && typeof s==="object"){ Object.assign(state, s); } }
  }catch(e){}
}

// ---------- copiar al portapapeles con fallback (R3) ----------
function copyTextFallback(txt){
  let ok=false;
  try{
    const ta=document.createElement("textarea");
    ta.value=txt; ta.setAttribute("readonly","");
    ta.style.position="fixed"; ta.style.left="-9999px"; ta.style.top="0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try{ ta.setSelectionRange(0,ta.value.length); }catch(e){}
    ok=document.execCommand("copy");
    document.body.removeChild(ta);
  }catch(e){}
  showCopied(ok);
}
function doCopy(txt){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>showCopied(true), ()=>copyTextFallback(txt));
  } else copyTextFallback(txt);
}
let toastTimer=null;
function showCopied(ok){
  const t=document.getElementById("toast");
  t.textContent = ok ? "✅ ¡Copiado!" : "❌ No se pudo copiar";
  t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),1500);
}

// ---------- buscador: texto plano -> HTML con <mark> ----------
function hl(texto){
  const safe = esc(texto);
  const term = state.busqueda || "";
  if(!term) return safe;
  try{
    const rx = new RegExp("("+term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi");
    return safe.replace(rx, "<mark>$1</mark>");
  }catch(e){ return safe; }
}
function inlineFmt(texto){ // `codigo` -> <code>, **negrita** -> <b>
  let h = esc(texto);
  h = h.replace(/`([^`]+)`/g, (m,p1)=>'<code class="inline">'+hl(p1)+"</code>");
  h = h.replace(/\*\*([^*]+)\*\*/g, (m,p1)=>"<b>"+hl(p1)+"</b>");
  return h;
}
function tableHTML(t){
  let h="<table><thead><tr>";
  t.head.forEach(c=>{ h+="<th>"+inlineFmt(c)+"</th>"; });
  h+="</tr></thead><tbody>";
  t.rows.forEach(r=>{ h+="<tr>"; r.forEach(c=>{ h+="<td>"+inlineFmt(c)+"</td>"; }); h+="</tr>"; });
  return h+"</tbody></table>";
}
function flowHTML(f){
  let h='<div class="flowrow">';
  f.parts.forEach(p=>{
    if(p.arrow) h+='<span class="farrow">'+esc(p.arrow)+"</span>";
    else h+='<span class="fbox '+(p.lado==="BACK"?"back":"front")+'">'+esc(p.t)+"</span>";
  });
  return h+"</div>";
}
function renderBloques(list){
  let h="";
  (list||[]).forEach(b=>{
    if(b.t==="h3") h+="<h3>"+inlineFmt(b.x)+"</h3>";
    else if(b.t==="p") h+='<p style="margin:6px 0;font-size:14px;line-height:1.55">'+inlineFmt(b.x)+"</p>";
    else if(b.t==="ul") h+="<ul class='keys'>"+b.items.map(i=>"<li>"+inlineFmt(i)+"</li>").join("")+"</ul>";
    else if(b.t==="warn") h+="<ul class='warn-list'>"+b.items.map(i=>"<li>"+inlineFmt(i)+"</li>").join("")+"</ul>";
    else if(b.t==="table") h+=tableHTML(b);
    else if(b.t==="flow") h+=flowHTML(b);
    else if(b.t==="code") h+=codeBlockStr("", b.x||"", /BACK/.test(b.x||"")?"BACK":"FRONT");
    else if(b.t==="note") h+='<p class="hint" style="font-size:13px;margin:6px 0">'+inlineFmt(b.x)+"</p>";
  });
  return h;
}

// ---------- sidebar + navegación ----------
function temasDe(seccion){
  if(seccion==="teoria"){
    const arr=[{id:"mapa", nombre:"🗺️ Mapa de carpetas"}];
    TEORIA.forEach(t=>arr.push({id:t.id, nombre:t.nombre}));
    return arr;
  }
  return GENERADORES.map(g=>({id:g.id, nombre:g.nombre}));
}
function temaActivo(){ return state.seccion==="teoria" ? state.temaT : state.temaG; }
function setTema(id){
  if(state.seccion==="teoria") state.temaT=id; else state.temaG=id;
  state.openGen=null; saveState(); renderContenido(); renderSidebar();
}
function renderSidebar(){
  const nav=document.getElementById("sidebar");
  const temas=temasDe(state.seccion);
  let btns="";
  temas.forEach(t=>{
    btns+='<button class="theme-btn'+(t.id===temaActivo()?" active":"")+'" data-tema="'+esc(t.id)+'">'+esc(t.nombre)+"</button>";
  });
  const optsHtml='<select aria-label="Elegir tema">'+temas.map(t=>'<option value="'+esc(t.id)+'"'+(t.id===temaActivo()?" selected":"")+">"+esc(t.nombre)+"</option>").join("")+"</select>";
  nav.innerHTML=btns+optsHtml;
  nav.querySelectorAll(".theme-btn").forEach(b=>b.addEventListener("click",()=>setTema(b.dataset.tema)));
  const sel=nav.querySelector("select");
  sel.addEventListener("change",()=>setTema(sel.value));
}

// ---------- Teoría ----------
function teoriaPorId(id){ return TEORIA.find(t=>t.id===id); }
function renderTeoria(container){
  const id=temaActivo();
  if(id==="mapa"){ renderMapa(container); return; }
  const t=teoriaPorId(id);
  if(!t){ container.innerHTML='<div class="missing">Falta cargar este apunte.</div>'; return; }
  let h='<div class="card"><h2>'+inlineFmt(t.nombre)+"</h2>"
      + '<p class="theory-intro">'+inlineFmt(t.intro)+"</p>"
      + renderBloques([{t:"h3",x:"Conceptos y reglas clave"},{t:"ul",items:t.claves||[]}])
      + "</div>";
  if(t.donde && t.donde.length){
    h+='<div class="card"><h3 style="margin-top:0">📍 Dónde va cada archivo</h3>'
      + tableHTML({head:["Lado","Carpeta exacta","Archivo","Qué contiene"], rows:t.donde})+"</div>";
  }
  if(t.codigos && t.codigos.length){
    h+='<div class="card"><h3 style="margin-top:0">Código base</h3>';
    t.codigos.forEach(c=>{ h+=codeBlockStr(c.titulo, c.archivo, c.lado); });
    h+="</div>";
  }
  if(t.errores && t.errores.length){
    h+='<div class="card"><h3 style="margin-top:0">⚠️ Errores típicos</h3><ul class="warn-list">'
      + t.errores.map(e=>"<li>"+inlineFmt(e)+"</li>").join("") + "</ul></div>";
  }
  h+='<div class="card">'+renderBloques(t.extra||[])+"</div>";
  container.innerHTML=h;
  montarCodigos(container, collectCodigos(t));
}
// junta los códigos de codigos[] y extra[] (bloques {t:"code", x:"ruta — 🟣 BACK"}) en orden
function collectCodigos(t){
  const list=[];
  (t.codigos||[]).forEach(c=>list.push(c));
  (t.extra||[]).forEach(b=>{
    if(b.t==="code"){
      const x=b.x||"";
      list.push({ titulo:"Código", archivo:x.replace(/\s*—\s*(🟣 BACK|🔵 FRONT)/,""), lado:/BACK/.test(x)?"BACK":"FRONT", codigo:b.codigo });
    }
  });
  return list;
}
function codeBlockStr(title, archivo, lado){
  const badge = lado==="BACK" ? '<span class="badge back">🟣 BACK</span>'
              : lado==="FRONT" ? '<span class="badge front">🔵 FRONT</span>' : "";
  return '<div class="codeblock"><div class="code-head"><span class="code-title">'+esc(title||"Código")+"</span>"
    +badge+(archivo?' <span class="code-file">· '+esc(archivo)+"</span>":"")
    +'</div><pre class="code"></pre></div>';
}
function montarCodigos(root, codigos){
  const blocks=root.querySelectorAll(".codeblock");
  codigos.forEach((c,i)=>{
    if(!blocks[i]) return;
    blocks[i].querySelector("pre.code").textContent=c.codigo;   // textContent: nunca innerHTML (R6)
    const btn=document.createElement("button");
    btn.className="btn-copy"; btn.type="button"; btn.textContent="📋 Copiar";
    btn.addEventListener("click",()=>doCopy(c.codigo));         // copia el string original
    blocks[i].querySelector(".code-head").appendChild(btn);
  });
}

// ---------- Mapa de carpetas ----------
function renderMapa(container){
  const M=MAPA_CARPETAS;
  let h='<div class="card"><h2>🗺️ Mapa de carpetas</h2>'
    +'<p class="theory-intro">'+inlineFmt(M.intro)+'</p><div class="tree">';
  M.tree.forEach(l=>{
    const cls = l.side==="front"?"front":l.side==="back"?"back":"plain";
    h+='<span class="tl '+cls+(l.info?' click tl-info" data-info="'+esc(l.path)+'" tabindex="0':'')+'">'+esc(l.line)+"</span>";
  });
  h+='</div><div id="map-detail" class="map-detail" style="display:none"></div></div>';
  h+='<div class="card"><h3 style="margin-top:0">Reglas para ubicar un archivo</h3>'
    + tableHTML({head:["Pregunta","Respuesta (ruta exacta)"], rows:M.reglas})+"</div>";
  h+='<div class="card"><h3 style="margin-top:0">¿Qué va en BACK y qué en FRONT?</h3>'
    + tableHTML({head:["Tema","🟣 BACK","🔵 FRONT"], rows:M.backFront})+"</div>";
  h+='<div class="card"><h3 style="margin-top:0">Flujo de arquitectura</h3>'+renderBloques(M.flujos)
    +'<p class="hint">'+inlineFmt(M.notaPuertos)+"</p></div>";
  h+='<div class="card"><h3 style="margin-top:0">Estilos provistos por los docentes (TP1) y su destino</h3>'
    + tableHTML({head:["Archivo provisto","Copiarlo a"], rows:M.estilosTP1})+"</div>";
  container.innerHTML=h;
  const det=container.querySelector("#map-detail");
  container.querySelectorAll(".tl-info").forEach(el=>{
    const show=()=>{
      container.querySelectorAll(".tl.sel").forEach(x=>x.classList.remove("sel"));
      el.classList.add("sel");
      det.style.display="block";
      det.innerHTML="<b>"+esc(el.dataset.info)+"</b><br>"+inlineFmt(M.info[el.dataset.info]||"Sin datos.");
    };
    el.addEventListener("click",show);
    el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();show();} });
  });
}

// ---------- Generador ----------
function generadoresTema(){
  const g=GENERADORES.find(x=>x.id===temaActivo());
  if(!g || !g.generadores || !g.generadores.length) return null;
  return g;
}
function valKey(tid,gid,fid_){ return tid+"|"+gid+"|"+fid_; }
function getVal(tid,gid,f){
  const k=valKey(tid,gid,f.id);
  if(Object.prototype.hasOwnProperty.call(state.vals,k)) return state.vals[k];
  return f.default!==undefined?f.default:(f.tipo==="checkbox"?false:"");
}
function currentOpts(){ return { comentarios:state.opts.comentarios, dobles:state.opts.dobles, tp1:state.opts.tp1 }; }
function collectVals(tid,g){
  const v={}; g.campos.forEach(f=>{ v[f.id]=getVal(tid,g.id,f); }); return v;
}
function renderGenerador(container){
  const g=generadoresTema();
  if(!g){ container.innerHTML='<div class="missing">Falta cargar este apunte (no hay generadores).</div>'; return; }
  let h='<div class="card" style="padding:14px 18px"><h2 style="margin-bottom:4px">'+inlineFmt(g.nombre)+"</h2>"
      + '<p class="hint">'+inlineFmt(g.desc||"Completá los datos: el código se genera al instante.")+"</p></div>";
  g.generadores.forEach(gen=>{
    h+='<div class="gen-card'+(state.openGen===gen.id?" open":"")+'" data-gen="'+esc(gen.id)+'">'
      + '<div class="gen-head" role="button" tabindex="0"><span class="chev">▶</span><span class="gt">'+esc(gen.titulo)+"</span></div>"
      + '<div class="gen-body"><div class="gen-grid"><div class="in-col"></div><div class="out-col"></div></div></div></div>';
  });
  container.innerHTML=h;
  g.generadores.forEach(gen=>{
    const card=container.querySelector('[data-gen="'+CSS.escape(gen.id)+'"]');
    const head=card.querySelector(".gen-head");
    const toggle=()=>{ state.openGen = state.openGen===gen.id ? null : gen.id; saveState(); renderContenido(); };
    head.addEventListener("click",toggle);
    head.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();} });
    if(state.openGen===gen.id) buildGenBody(card, g, gen);
  });
}
function fieldDomId(tid,genId,fId){ return "f-"+tid+"-"+genId+"-"+fId; }
function fieldHTML(tid,gen,f){
  const val=getVal(tid,gen,f);
  const idA=esc(fieldDomId(tid,gen.id,f.id));
  if(f.tipo==="checkbox"){
    return '<div class="field check"><input type="checkbox" id="'+idA+'"'+(val?" checked":"")+'>'
      +'<label for="'+idA+'">'+esc(f.label)+"</label></div>";
  }
  let inner;
  if(f.tipo==="select"){
    inner='<select id="'+idA+'">'+f.opciones.map(o=>{
      const ov=(typeof o==="string")?o:o.v, ol=(typeof o==="string")?o:o.l;
      return '<option value="'+esc(ov)+'"'+(String(val)===String(ov)?" selected":"")+">"+esc(ol)+"</option>";
    }).join("")+"</select>";
  } else if(f.tipo==="textarea"){
    inner='<textarea id="'+idA+'" placeholder="'+esc(f.placeholder||"")+'">'+esc(val)+"</textarea>";
  } else if(f.tipo==="number"){
    inner='<input type="number" id="'+idA+'" value="'+esc(val)+'" placeholder="'+esc(f.placeholder||"")+'">';
  } else {
    inner='<input type="text" id="'+idA+'" value="'+esc(val)+'" placeholder="'+esc(f.placeholder||"")+'">';
  }
  return '<div class="field"><label for="'+idA+'">'+esc(f.label)+"</label>"+inner
    +(f.hint?'<div class="hint">'+esc(f.hint)+"</div>":"")+"</div>";
}
function buildGenBody(card, tema, gen){
  const inCol=card.querySelector(".in-col");
  const outCol=card.querySelector(".out-col");
  const tid=tema.id;
  inCol.innerHTML = gen.campos.map(f=>fieldHTML(tid,gen,f)).join("")
    + '<button class="btn-reset" type="button">↺ Restaurar valores de ejemplo</button>';
  gen.campos.forEach(f=>{
    const el=document.getElementById(fieldDomId(tid,gen.id,f.id));
    if(!el) return;
    const ev=(f.tipo==="checkbox"||f.tipo==="select")?"change":"input";
    el.addEventListener(ev,()=>{
      state.vals[valKey(tid,gen.id,f.id)] = f.tipo==="checkbox" ? el.checked : el.value;
      saveState(); regen();
    });
  });
  inCol.querySelector(".btn-reset").addEventListener("click",()=>{
    gen.campos.forEach(f=>{ delete state.vals[valKey(tid,gen.id,f.id)]; });
    saveState(); renderContenido();
  });
  function regen(){
    const v=collectVals(tid,gen);
    const opt=currentOpts();
    let files=[];
    try{ files=gen.salida(v,opt)||[]; }
    catch(e){ files=[{archivo:"(error del generador)",lado:"FRONT",codigo:"Error al generar: "+e.message}]; }
    // validación mínima: aviso PascalCase (el código ya usa la versión corregida)
    gen.campos.forEach(f=>{
      if(f.validate!=="pascal") return;
      const el=document.getElementById(fieldDomId(tid,gen.id,f.id));
      if(!el) return;
      const fieldEl=el.closest(".field");
      let av=fieldEl.querySelector(".aviso");
      const raw=String(v[f.id]||"");
      if(raw.trim() && raw.trim()!==pascal(raw)){
        if(!av){ av=document.createElement("div"); av.className="aviso"; fieldEl.appendChild(av); }
        av.textContent="Nombre corregido a PascalCase: "+pascal(raw);
      } else if(av) av.remove();
    });
    let h="";
    files.forEach((fl,i)=>{
      const badge = fl.lado==="BACK" ? '<span class="badge back">🟣 BACK</span>' : '<span class="badge front">🔵 FRONT</span>';
      h+='<div class="codeblock" data-i="'+i+'"><div class="code-head">'+badge
        +' <span class="code-file">· '+esc(fl.archivo)+'</span></div><pre class="code"></pre></div>';
    });
    if(files.length>1) h+='<button class="btn-copy-all" type="button" style="margin-top:6px">📋 Copiar todo</button>';
    if(!files.length) h='<p class="hint">Marcá alguna opción para generar código.</p>';
    outCol.innerHTML=h;
    outCol.querySelectorAll(".codeblock").forEach(blk=>{
      const i=+blk.dataset.i, fl=files[i];
      blk.querySelector("pre.code").textContent=fl.codigo;   // nunca innerHTML para código (R6)
      const btn=document.createElement("button");
      btn.className="btn-copy"; btn.type="button"; btn.textContent="📋 Copiar código";
      btn.addEventListener("click",()=>doCopy(fl.codigo));   // copia el string original
      blk.querySelector(".code-head").appendChild(btn);
    });
    const all=outCol.querySelector(".btn-copy-all");
    if(all) all.addEventListener("click",()=>{
      doCopy(files.map(fl=>"// ===== "+fl.archivo+" ("+fl.lado+") =====\n"+fl.codigo).join("\n\n"));
    });
  }
  regen();
}

// ---------- render principal ----------
function renderContenido(){
  const c=document.getElementById("contenido");
  c.innerHTML='<div class="legend"><span>Leyenda:</span><span class="badge front">🔵 FRONT</span>'
    +'<span class="badge back">🟣 BACK</span><span>· atajo <b>/</b> para buscar</span></div>'
    +'<div id="themedata"></div>';
  const box=document.getElementById("themedata");
  if(state.seccion==="teoria") renderTeoria(box); else renderGenerador(box);
}
function renderTopbar(){
  document.getElementById("tab-teoria").classList.toggle("active",state.seccion==="teoria");
  document.getElementById("tab-generador").classList.toggle("active",state.seccion==="generador");
  document.getElementById("opt-comentarios").checked=state.opts.comentarios;
  document.getElementById("opt-comillas").checked=state.opts.dobles;
  document.getElementById("opt-tp1").checked=state.opts.tp1;
  document.getElementById("lbl-comillas").textContent=state.opts.dobles?"dobles":"simples";
  document.getElementById("wrap-tp1").classList.toggle("on",state.opts.tp1);
}
function init(){
  loadState();
  if(state.temaT!=="mapa" && !teoriaPorId(state.temaT)) state.temaT="mapa";
  if(!GENERADORES.find(g=>g.id===state.temaG)) state.temaG=(GENERADORES[0]&&GENERADORES[0].id)||"comandos";
  renderTopbar(); renderSidebar(); renderContenido();
  document.getElementById("tab-teoria").addEventListener("click",()=>{state.seccion="teoria";saveState();renderTopbar();renderSidebar();renderContenido();});
  document.getElementById("tab-generador").addEventListener("click",()=>{state.seccion="generador";saveState();renderTopbar();renderSidebar();renderContenido();});
  document.getElementById("opt-comentarios").addEventListener("change",e=>{state.opts.comentarios=e.target.checked;saveState();renderContenido();});
  document.getElementById("opt-comillas").addEventListener("change",e=>{state.opts.dobles=e.target.checked;saveState();renderTopbar();renderContenido();});
  document.getElementById("opt-tp1").addEventListener("change",e=>{state.opts.tp1=e.target.checked;saveState();renderTopbar();renderContenido();});
  const bus=document.getElementById("buscador");
  bus.addEventListener("input",()=>{
    state.busqueda=bus.value.trim();
    if(state.seccion!=="teoria"){state.seccion="teoria";renderTopbar();renderSidebar();}
    renderContenido();
  });
  document.addEventListener("keydown",e=>{
    const ae=document.activeElement;
    if(e.key==="/" && ae!==bus && !(ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName))){
      e.preventDefault(); bus.focus();
    }
  });
}
document.addEventListener("DOMContentLoaded", init);
