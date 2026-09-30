
// ---------- helpers usados por los generadores (no tocar) ----------
function L(lines){ return lines.join("\n"); }                       // R6: array de líneas → string
function q(opt, s){
  const c=(opt&&opt.doubles===false)?"'":'"';
  let v=String(s==null?"":s).trim();
  if(v.startsWith("{") && v.endsWith("}")) return v;      // expresión JS: va sin comillas
  v=v.replace(/["']/g,"");                                 // sin comillas internas
  const num=/^-?\d+(\.\d+)?$/.test(v);
  return num ? "{"+v+"}" : c+v+c;                          // números van en { }
}
function cmt(opt, t){ return (opt&&opt.comentarios===false) ? null : "// "+t; }
function withC(arr){ return arr.filter(x=>x!==null); }              // saca los comentarios desactivados
function pascal(s){ return String(s||"").trim().split(/[^A-Za-z0-9]+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(""); }
function camel(s){ const p=pascal(s); return p? p[0].toLowerCase()+p.slice(1):""; }
function setterName(s){ return "set"+pascal(s); }
function splitList(s){ return String(s||"").split(",").map(x=>x.trim()).filter(Boolean); }
function parseLines(s){ return String(s||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean); }
function normKey(s){ return String(s||"").trim().replace(/[^A-Za-z0-9_]/g,"").replace(/^(\d)/,"_$1"); }
function esc0(s){ return String(s==null?"":s); }
function cmpExpr(ref, op, val){
  const vv=String(val||"").trim();
  const esNum=/^-?\d+(\.\d+)?$/.test(vv) || vv==="true" || vv==="false";
  const lit = esNum? vv : q({dobles:true}, vv);
  if(op==="includes") return ref+".includes("+lit+")";
  if(op==="===") return ref+" === "+lit;
  if(op==="==") return ref+" == "+lit;
  return ref+" "+op+" "+vv;
}
function descMetodo(m){
  return ({push:"navega guardando historial",replace:"navega SIN guardar historial",back:"vuelve atrás",forward:"avanza",refresh:"recarga la página"})[m]||m;
}
function pushLista(arr, st, opt, pad){
  // renderiza la <ul> interna de una lista (respeta Modo TP1)
  if(opt.tp1){
    arr.push(pad+"{itemsJSX} {/* Modo TP1: armá itemsJSX con forEach + push (ver generador Métodos de array) */}");
  } else {
    arr.push(pad+"{"+st+".map(item => (");
    arr.push(pad+"  <li key={item.id}>{item.nombre}</li>");
    arr.push(pad+"))}");
  }
}
