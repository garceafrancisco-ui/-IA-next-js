
// =====================================================================
// ======================  AGREGAR NUEVOS GENERADORES ACÁ  =============
// ---------- Constante GENERADORES: un objeto por tema -----------------
// Cada generador: { id, titulo, campos:[{id,label,tipo,default,placeholder,hint,options,validate}], salida:(v,opt)=>[{archivo,lado,codigo}] }
// opt = { comentarios, dobles, tp1 }   |   helpers disponibles: L, q, cmt, withC, pascal, camel, splitList, parseLines, setterName
// =====================================================================
const GENERADORES = [

/* ============ 0 · Comandos y puesta en marcha ============ */
{
  id:"comandos",
  nombre:"0 · Comandos y puesta en marcha",
  desc:"Comandos para crear el proyecto, instalar paquetes, levantar dos instancias del front y armar los .gitignore. Fuente: apuntes 4 y 6 + instructivo de múltiples instancias.",
  generadores:[
    {
      id:"setup",
      titulo:"Crear proyecto e instalar paquetes",
      campos:[
        { id:"proyecto", label:"Nombre del proyecto", tipo:"text", default:"pio-chat", placeholder:"pio-chat" },
        { id:"backend", label:"Nombre de la carpeta del backend", tipo:"text", default:"backend", placeholder:"backend" },
        { id:"express", label:"express (back)", tipo:"checkbox", default:true },
        { id:"cors", label:"cors (back)", tipo:"checkbox", default:true },
        { id:"socketio", label:"socket.io (back)", tipo:"checkbox", default:true },
        { id:"sessions", label:"express-session (back)", tipo:"checkbox", default:true },
        { id:"mysql2", label:"mysql2 (back, TP Integrador)", tipo:"checkbox", default:false },
        { id:"sockclient", label:"socket.io-client (front)", tipo:"checkbox", default:true },
        { id:"popup", label:"reactjs-popup (front, TP Integrador)", tipo:"checkbox", default:false },
        { id:"clsx", label:"clsx (front)", tipo:"checkbox", default:false },
        { id:"crossenv", label:"cross-env (front, --save-dev)", tipo:"checkbox", default:true }
      ],
      salida:(v,opt)=>{
        const backPkgs=[]; if(v.express)backPkgs.push("express"); if(v.cors)backPkgs.push("cors");
        if(v.socketio)backPkgs.push("socket.io"); if(v.sessions)backPkgs.push("express-session"); if(v.mysql2)backPkgs.push("mysql2");
        const frontPkgs=[]; if(v.sockclient)frontPkgs.push("socket.io-client"); if(v.popup)frontPkgs.push("reactjs-popup"); if(v.clsx)frontPkgs.push("clsx");
        const A=[
          cmt(opt,"1) Verificar Node y npm"),
          "node -v",
          "npm -v",
          "",
          cmt(opt,"2) Crear el FRONT (Next.js)"),
          "npx create-next-app@latest "+v.proyecto+"/frontend",
          "cd "+v.proyecto+"/frontend",
          "npm run dev"
        ];
        if(frontPkgs.length){ A.push("", cmt(opt,"3) Paquetes del frontend")); A.push("npm i "+frontPkgs.join(" ")); }
        if(v.crossenv){ A.push("npm install --save-dev cross-env"); }
        const bdir=(v.backend&&v.backend.trim())?v.backend.trim():"backend";
        const B=[
          cmt(opt,"4) Crear el BACKEND (dentro de "+bdir+"/)"),
          "mkdir "+bdir+" && cd "+bdir,
          "npm init -y",
          "touch index.js"
        ];
        if(backPkgs.length){ B.push("", cmt(opt,"5) Paquetes del backend")); B.push("npm i "+backPkgs.join(" ")); }
        B.push("", cmt(opt,"6) Correr el backend"),"node index.js");
        return [
          { archivo:"Terminal — creación + frontend", lado:"FRONT", codigo:L(withC(A)) },
          { archivo:"Terminal — backend/", lado:"BACK", codigo:L(withC(B)) }
        ];
      }
    },
    {
      id:"instancias",
      titulo:"Múltiples instancias del front (dev:a / dev:b)",
      campos:[
        { id:"config", label:"Archivo de config de Next", tipo:"select", default:"next.config.mjs",
          opciones:["next.config.js","next.config.mjs","next.config.ts"] },
        { id:"portA", label:"Puerto instancia A", tipo:"number", default:3000 },
        { id:"portB", label:"Puerto instancia B", tipo:"number", default:3001 }
      ],
      salida:(v,opt)=>{
        const cfg=v.config;
        const nextCfg = cfg.endsWith(".ts")
          ? L(['const nextConfig: import("next").NextConfig = {',
               '  distDir: process.env.NEXT_DIST_DIR || ".next",',
               '};',
               '',
               'export default nextConfig;'])
          : L(['const nextConfig = {',
               '  distDir: process.env.NEXT_DIST_DIR || ".next",',
               '};',
               '',
               'export default nextConfig;']);
        const scripts = L([
          '"scripts": {',
          '  "dev": "next dev",',
          '  "build": "next build",',
          '  "start": "next start",',
          '  "lint": "next lint",',
          `  "dev:a": "cross-env NEXT_DIST_DIR=.next-a PORT=${v.portA} next dev",`,
          `  "dev:b": "cross-env NEXT_DIST_DIR=.next-b PORT=${v.portB} next dev"`,
          '}'
        ]);
        const cmd = L([
          cmt(opt,"Instalar cross-env (una sola vez)"),
          "npm install --save-dev cross-env",
          "",
          cmt(opt,"En .gitignore del frontend: reemplazar .next/ por .next*"),
          "",
          cmt(opt,"Levantar CADA instancia en SU PROPIA terminal:"),
          "npm run dev:a    // http://localhost:"+v.portA,
          "npm run dev:b    // http://localhost:"+v.portB
        ].filter(x=>x!==null));
        return [
          { archivo:"frontend/"+cfg, lado:"FRONT", codigo:nextCfg },
          { archivo:"frontend/package.json (fragmento scripts)", lado:"FRONT", codigo:scripts },
          { archivo:"Terminal (en frontend/)", lado:"FRONT", codigo:cmd }
        ];
      }
    },
    {
      id:"gitignore",
      titulo:".gitignore de frontend y backend (+ entrega del RAR)",
      campos:[
        { id:"rar", label:"Nombre del RAR a entregar", tipo:"text", default:"5A_TP2_APELLIDO1_APELLIDO2.rar", placeholder:"5A_TPn_APELLIDO1_APELLIDO2.rar", hint:"Sin node_modules ni .next* dentro del RAR." }
      ],
      salida:(v,opt)=>{
        const gf=L(["# dependencies","/node_modules","","# next.js","/.next*","","# production","/build","","# misc",".DS_Store","*.pem","","# env files",".env*.local"]);
        const gb=L(["node_modules/","*.env"]);
        const rar=L([
          cmt(opt,"Antes de comprimir en "+(v.rar||"RAR")+":"),
          "rm -rf backend/node_modules frontend/node_modules",
          "rm -rf frontend/.next* 2>/dev/null",
          "",
          cmt(opt,"El RAR se llama: "+(v.rar||"5A_TPn_APELLIDO1_APELLIDO2.rar"))
        ].filter(x=>x!==null));
        return [
          { archivo:"frontend/.gitignore", lado:"FRONT", codigo:gf },
          { archivo:"backend/.gitignore", lado:"BACK", codigo:gb },
          { archivo:"Entrega (terminal, desde PROYECTO/)", lado:"FRONT", codigo:rar }
        ];
      }
    }
  ]
},

/* ============ 1 · Componentes básicos ============ */
{
  id:"basicos",
  nombre:"Creación de componentes básicos en NextJS",
  generadores:[
    {
      id:"pagina",
      titulo:"Página nueva (src/app/<ruta>/page.js)",
      campos:[
        { id:"ruta", label:"Nombre de la ruta", tipo:"text", default:"ranking", placeholder:"ranking" },
        { id:"componente", label:"Nombre del componente de la página (auto)", tipo:"text", default:"", placeholder:"(auto: RankingPage)", hint:"Dejalo vacío para que se calcule solo desde la ruta." },
        { id:"titulo", label:"Título (h1)", tipo:"text", default:"Ranking de notas", placeholder:"Ranking" },
        { id:"texto", label:"Texto (p)", tipo:"text", default:"Listado de notas del curso", placeholder:"Párrafo" },
        { id:"client", label:"\"use client\" (si va a usar hooks o eventos)", tipo:"checkbox", default:false }
      ],
      salida:(v,opt)=>{
        const comp = pascal(v.componente)|| (pascal(v.ruta)+"Page") || "MiPagina";
        const arr=[];
        if(v.client) arr.push('"use client";','');
        arr.push(cmt(opt,"Página de la ruta /"+(v.ruta||"")));
        arr.push("export default function "+comp+"(){");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <h1>"+(v.titulo||"Título")+"</h1>");
        arr.push("      <p>"+(v.texto||"Texto")+"</p>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/"+(v.ruta||"mi-ruta")+"/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"layout",
      titulo:"Layout (src/app/<ruta>/layout.js)",
      campos:[
        { id:"ruta", label:"Nombre de la ruta", tipo:"text", default:"panel", placeholder:"panel" },
        { id:"header", label:"Título del header", tipo:"text", default:"Pío Panel", placeholder:"Título" },
        { id:"links", label:"Links del nav (uno por línea: Texto|/ruta)", tipo:"textarea", default:"Inicio|/\nNotas|/notas\nRanking|/ranking", placeholder:"Texto|/ruta" },
        { id:"footer", label:"Texto del footer", tipo:"text", default:"Instituto Pío IX — DAI", placeholder:"Footer" },
        { id:"children", label:"children", tipo:"select", default:"desestructurado", opciones:["desestructurado","props.children"] }
      ],
      salida:(v,opt)=>{
        const links=parseLines(v.links).map(l=>l.split("|"));
        const des = v.children==="desestructurado";
        const ch = des?"children":"props.children";
        const arr=[];
        arr.push(cmt(opt,"Layout de la ruta /"+(v.ruta||"")));
        arr.push("export default function "+(pascal(v.ruta)+"Layout"||"Layout")+"({ children }){");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <header><h1>"+(v.header||"Título")+"</h1></header>");
        arr.push("      <nav>");
        links.forEach(l=>{
          arr.push("        <a href=\""+(l[1]||"/")+"\">"+(l[0]||"Link")+"</a>");
        });
        arr.push("      </nav>");
        arr.push("      <main>{"+ch+"}</main>");
        arr.push("      <footer>"+(v.footer||"")+"</footer>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        if(!des){ // usa props: cambiar firma
          arr.splice(1,1,"export default function "+(pascal(v.ruta)+"Layout"||"Layout")+"(props){");
        }
        return [{ archivo:"src/app/"+(v.ruta||"mi-ruta")+"/layout.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"componente",
      titulo:"Componente (src/components/<Nombre>.js)",
      campos:[
        { id:"nombre", label:"Nombre del componente (PascalCase)", tipo:"text", default:"Button", placeholder:"Button", validate:"pascal" },
        { id:"etiqueta", label:"Etiqueta raíz", tipo:"select", default:"button", opciones:["button","h1","p","div"] },
        { id:"props", label:"Props", tipo:"select", default:"desestructuradas",
          opciones:[{v:"sin",l:"sin props"},{v:"objeto",l:"props (objeto)"},{v:"desestructuradas",l:"desestructuradas { onClick, children }"},{v:"personalizadas",l:"personalizadas { text, onClick }"}] },
        { id:"texto", label:"Texto", tipo:"text", default:"Haz clic acá", placeholder:"Texto interno" },
        { id:"evento", label:"evento onClick", tipo:"checkbox", default:true },
        { id:"handler", label:"Nombre de la función", tipo:"text", default:"manejarClick", placeholder:"manejarClick" }
      ],
      salida:(v,opt)=>{
        const N=pascal(v.nombre)||"MiComponente";
        const needsClient = v.evento || v.props==="desestructuradas" || v.props==="personalizadas";
        const arr=[];
        if(needsClient) arr.push('"use client";','');
        let firma="()";
        if(v.props==="objeto") firma="(props)";
        else if(v.props==="desestructuradas") firma="({ onClick, children })";
        else if(v.props==="personalizadas") firma="({ text, onClick })";
        arr.push("export default function "+N+firma+"{");
        const et=v.etiqueta||"div";
        const contenido = (v.props==="desestructuradas") ? "{children}"
                        : (v.props==="personalizadas") ? "{text}"
                        : (v.props==="objeto") ? "{props.children}"
                        : esc0(v.texto);
        const clickAttr = v.evento ? " onClick={"+(v.handler||"manejarClick")+"}" : "";
        if(contenido.includes("<")||true){
          arr.push("  return (");
          arr.push("    <"+et+clickAttr+">");
          arr.push("      "+contenido);
          arr.push("    </"+et+">");
          arr.push("  );");
        }
        arr.push("}");
        return [{ archivo:"src/components/"+N+".js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"usar",
      titulo:"Usar un componente en una página",
      campos:[
        { id:"nombre", label:"Nombre del componente", tipo:"text", default:"Button", placeholder:"Button", validate:"pascal" },
        { id:"props", label:"Props a pasar (clave=valor, una por línea)", tipo:"textarea", default:"onClick={manejarClick}", placeholder:"clave=valor" },
        { id:"forma", label:"Forma de la etiqueta", tipo:"select", default:"larga", opciones:[{v:"larga",l:"forma larga (con children)"},{v:"corta",l:"forma corta (prop text)"}] },
        { id:"children", label:"Children (forma larga)", tipo:"text", default:"Haz clic acá", placeholder:"Contenido entre etiquetas" },
        { id:"carpeta", label:"Carpeta de componentes", tipo:"select", default:"@", opciones:[{v:"@",l:"src/components (@/components)"},{v:"app",l:"src/app/components (../components)"}] }
      ],
      salida:(v,opt)=>{
        const N=pascal(v.nombre)||"MiComponente";
        const impPath = v.carpeta==="@" ? "@/components/"+N : "../components/"+N;
        const props=parseLines(v.props);
        const attrStr = props.length?(" "+props.map(p=>{
          const idx=p.indexOf("="); if(idx<0)return p;
          const k=p.slice(0,idx).trim(), val=p.slice(idx+1).trim();
          if(val.startsWith("{")) return k+"="+val;             // ya viene como {fn}
          const num=/^-?\d+$/.test(val);
          return k+"="+(num?"{"+val+"}":q(opt,val));
        }).join(" ")) : "";
        const arr=[];
        arr.push(cmt(opt,"Importar arriba de todo (después de \"use client\" si lo hay)"));
        arr.push("import "+N+" from \""+impPath+"\";");
        arr.push("");
        if(v.forma==="larga"){
          arr.push("<"+N+attrStr+">"+(v.children||"")+"</"+N+">");
        } else {
          arr.push("<"+N+" text="+q(opt,v.children||"")+" />");
        }
        return [{ archivo:"(pegar en tu page.js / componente)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    }
  ]
},

/* ============ 2 · Componentes compuestos ============ */
{
  id:"compuestos",
  nombre:"Creación de componentes compuestos en React",
  generadores:[
    {
      id:"compuesto",
      titulo:"Componente compuesto + sus base + página",
      campos:[
        { id:"nombre", label:"Nombre del compuesto", tipo:"text", default:"Form", placeholder:"Form", validate:"pascal" },
        { id:"base", label:"Componentes base que combina (coma)", tipo:"text", default:"Title, Button", placeholder:"Title, Button" },
        { id:"props", label:"Props del compuesto (coma)", tipo:"text", default:"title, buttonText, onButtonClick", placeholder:"title, buttonText, onButtonClick" },
        { id:"inputs", label:"Campos input (uno por línea: type|placeholder)", tipo:"textarea", default:"text|Usuario\npassword|Contraseña", placeholder:"text|Usuario" },
        { id:"ruta", label:"Ruta de import de los base", tipo:"select", default:"./", opciones:[{v:"./",l:"./ (misma carpeta)"},{v:"@/components/",l:"@/components/"}] },
        { id:"paginaRuta", label:"Ruta de la página que lo usa", tipo:"text", default:"login", placeholder:"login" },
        { id:"title", label:"title (para el compuesto)", tipo:"text", default:"Iniciar sesión", placeholder:"Título" },
        { id:"buttonText", label:"buttonText", tipo:"text", default:"Entrar", placeholder:"Texto del botón" },
        { id:"handler", label:"Nombre de la función onClick", tipo:"text", default:"handleLoginClick", placeholder:"handleLoginClick" }
      ],
      salida:(v,opt)=>{
        const N=pascal(v.nombre)||"Form";
        const bases=splitList(v.base).map(b=>pascal(b)).filter(Boolean);
        const props=splitList(v.props);
        const propSigla = props.length?("{ "+props.join(", ")+" }"):"()";
        const inputs=parseLines(v.inputs).map(l=>l.split("|"));
        const files=[];
        // --- componentes base (Title con text, Button con onClick/children) ---
        bases.forEach(B=>{
          const isBtn = /button/i.test(B);
          const arr=[];
          if(isBtn) arr.push('"use client";','');
          arr.push(cmt(opt,"Componente base usado por "+N));
          if(isBtn){
            arr.push("export default function "+B+"({ onClick, children }){");
            arr.push("  return <button onClick={onClick}>{children}</button>;");
          } else {
            arr.push("export default function "+B+"({ text }){");
            arr.push("  return <h1>{text}</h1>;");
          }
          arr.push("}");
          files.push({ archivo:"src/components/"+B+".js", lado:"FRONT", codigo:L(withC(arr)) });
        });
        // --- el compuesto ---
        {
          const arr=[];
          arr.push('"use client";','');
          bases.forEach(B=>arr.push("import "+B+" from \""+v.ruta+B+"\";"));
          arr.push("");
          arr.push("export default function "+N+propSigla.replace("()","({"+"})").replace("({ })","()")+"{");
          // firma limpia:
          arr.pop();
          arr.push("export default function "+N+"({ "+props.join(", ")+" }){");
          arr.push("  return (");
          arr.push("    <div>");
          if(bases.some(B=>/title|h1/i.test(B))){
            const T=bases.find(B=>/title|h1/i.test(B));
            arr.push("      <"+T+" text={"+(props[0]||"title")+"} />");
          }
          inputs.forEach(inp=>{
            arr.push("      <input type=\""+(inp[0]||"text")+"\" placeholder=\""+(inp[1]||"")+"\" />");
          });
          if(bases.some(B=>/button/i.test(B))){
            const Btn=bases.find(B=>/button/i.test(B));
            arr.push("      <"+Btn+" onClick={"+(props[props.length-1]||"onButtonClick")+"}>{"+(props[1]||"buttonText")+"}</"+Btn+">");
          }
          arr.push("    </div>");
          arr.push("  );");
          arr.push("}");
          files.push({ archivo:"src/components/"+N+".js", lado:"FRONT", codigo:L(withC(arr)) });
        }
        // --- la página ---
        {
          const arr=[];
          arr.push('"use client";','');
          arr.push("import "+N+" from \"@/components/"+N+"\";","");
          const PageComp = pascal(v.paginaRuta)+"Page";
          arr.push("export default function "+PageComp+"(){");
          arr.push("  const "+(v.handler||"handleClick")+" = () => {");
          arr.push("    console.log(\""+N+" enviado\");");
          arr.push("  };","");
          arr.push(cmt(opt,"flujo de la prop: página → "+N+" → base → <elemento>"));
          arr.push("  return (");
          const pasados = props.map((p,i)=>{
            if(/on|handle|click/i.test(p)) return p+"={"+(v.handler||"handleClick")+"}";
            if(i===0) return p+"="+q(opt,v.title||"");
            return p+"="+q(opt,v.buttonText||"");
          }).join(" ");
          arr.push("    <"+N+" "+pasados+" />");
          arr.push("  );");
          arr.push("}");
          files.push({ archivo:"src/app/"+(v.paginaRuta||"pagina")+"/page.js", lado:"FRONT", codigo:L(withC(arr)) });
        }
        return files;
      }
    }
  ]
},

/* ============ 3 · Hooks, Event y Conditional Rendering ============ */
{
  id:"hooks",
  nombre:"React hooks, objeto Event y Conditional Rendering",
  generadores:[
    {
      id:"usestate",
      titulo:"useState",
      campos:[
        { id:"estado", label:"Nombre del estado", tipo:"text", default:"cuenta", placeholder:"cuenta" },
        { id:"setter", label:"setEstado (auto)", tipo:"text", default:"", placeholder:"(auto: setCuenta)" },
        { id:"tipoInicial", label:"valorInicial", tipo:"select", default:"0", opciones:["0","\"\" (string vacío)","false","[] (array)","{} (objeto)"] },
        { id:"custom", label:"Valor inicial personalizado", tipo:"text", default:"", placeholder:"(opcional, pisa lo de arriba)" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"estado";
        const set=v.setter&&v.setter.trim()?v.setter.trim():setterName(st);
        let ini;
        if(v.custom&&v.custom.trim()) ini=v.custom.trim();
        else if(v.tipoInicial==="0") ini="0";
        else if(v.tipoInicial.startsWith("\"\"")) ini='""';
        else if(v.tipoInicial==="false") ini="false";
        else if(v.tipoInicial==="[] (array)") ini="[]";
        else ini="{}";
        const arr=[cmt(opt,"useState: memoria del componente; al usar el setter se vuelve a renderizar")];
        arr.push("const ["+st+", "+set+"] = useState("+ini+");");
        return [{ archivo:"(dentro del componente)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"useeffect",
      titulo:"useEffect",
      campos:[
        { id:"tipo", label:"Tipo", tipo:"select", default:"montar",
          opciones:[{v:"montar",l:"[] solo al montar"},{v:"dep",l:"[x] cuando cambia x"},{v:"render",l:"sin array (cada render)"},{v:"cleanup",l:"con cleanup (setInterval)"}] },
        { id:"deps", label:"Array de dependencias", tipo:"text", default:"cuenta", placeholder:"cuenta" },
        { id:"contenido", label:"Contenido", tipo:"select", default:"log", opciones:[{v:"log",l:"console.log"},{v:"title",l:"document.title"},{v:"fetch",l:"fetch"}] }
      ],
      salida:(v,opt)=>{
        const body = v.contenido==="title" ? '    document.title = "Cuenta: " + cuenta;'
                   : v.contenido==="fetch" ? '    fetch("http://localhost:3001/api/estudiantes")\n      .then(res => res.json())\n      .then(data => console.log(data));'
                   : '    console.log("efecto ejecutado");';
        const arr=[];
        if(v.tipo==="montar"){
          arr.push("useEffect(() => {",body,"  }, []);");
        } else if(v.tipo==="dep"){
          const d=splitList(v.deps).join(", ")||"x";
          arr.push("useEffect(() => {",body,"  }, ["+d+"]);");
        } else if(v.tipo==="render"){
          arr.push(cmt(opt,"⚠️ corre en CADA render (cuidado con loops)"));
          arr.push("useEffect(() => {",body,"  });");
        } else {
          arr.push("useEffect(() => {");
          arr.push("  const id = setInterval(() => console.log(\"tic\"), 1000);");
          arr.push("  return () => clearInterval(id); // cleanup al desmontar");
          arr.push("}, []);");
        }
        return [{ archivo:"(dentro del componente)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"contador",
      titulo:"Contador completo (src/app/contador/page.js)",
      campos:[
        { id:"estado", label:"Nombre del estado", tipo:"text", default:"cuenta", placeholder:"cuenta" },
        { id:"paso", label:"Paso", tipo:"number", default:1, placeholder:"1" },
        { id:"inc", label:"Nombre de incrementar", tipo:"text", default:"incrementar", placeholder:"incrementar" },
        { id:"dec", label:"Nombre de decrementar", tipo:"text", default:"decrementar", placeholder:"decrementar" },
        { id:"rst", label:"Nombre de resetear", tipo:"text", default:"resetear", placeholder:"resetear" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"cuenta"; const set=setterName(st); const paso=v.paso||1;
        const arr=[
          '"use client";',
          'import { useState } from "react";',''];
        arr.push("export default function ContadorPage(){");
        arr.push("  const ["+st+", "+set+"] = useState(0);","");
        arr.push(cmt(opt,"Suma de a "+paso));
        arr.push("  const "+(v.inc||"incrementar")+" = () => {");
        arr.push("    "+set+"("+st+" + "+paso+");");
        arr.push("  };","");
        arr.push("  const "+(v.dec||"decrementar")+" = () => {");
        arr.push("    "+set+"("+st+" - "+paso+");");
        arr.push("  };","");
        arr.push("  const "+(v.rst||"resetear")+" = () => {");
        arr.push("    "+set+"(0);");
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <p>Valor: {"+st+"}</p>");
        arr.push("      <button onClick={"+(v.inc||"incrementar")+"}>+</button>");
        arr.push("      <button onClick={"+(v.dec||"decrementar")+"}>-</button>");
        arr.push("      <button onClick={"+(v.rst||"resetear")+"}>Resetear</button>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/contador/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"input",
      titulo:"Input controlado (event.target.value)",
      campos:[
        { id:"estado", label:"Nombre del estado", tipo:"text", default:"texto", placeholder:"texto" },
        { id:"placeholder", label:"placeholder", tipo:"text", default:"Escribí algo...", placeholder:"Escribí..." },
        { id:"handler", label:"Nombre del handler", tipo:"text", default:"manejarCambio", placeholder:"manejarCambio" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"texto"; const set=setterName(st);
        const arr=[
          '"use client";',
          'import { useState } from "react";',''];
        arr.push("export default function Page(){");
        arr.push("  const ["+st+", "+set+"] = useState(\"\");","");
        arr.push(cmt(opt,"el objeto Event llega solo como argumento"));
        arr.push("  const "+(v.handler||"manejarCambio")+" = (event) => {");
        arr.push("    "+set+"(event.target.value);");
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <input type=\"text\" value={"+st+"} onChange={"+(v.handler||"manejarCambio")+"} placeholder=\""+esc0(v.placeholder)+"\" />");
        arr.push("      <p>Escribiste: {"+st+"}</p>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"form",
      titulo:"Formulario controlado (estado objeto)",
      campos:[
        { id:"campos", label:"Campos (coma)", tipo:"text", default:"nombre, edad, especialidad", placeholder:"nombre, edad, especialidad" }
      ],
      salida:(v,opt)=>{
        const campos=splitList(v.campos);
        const objIni="{ "+campos.map(c=>c+": \"\"").join(", ")+" }";
        const arr=[
          '"use client";',
          'import { useState } from "react";',''];
        arr.push("export default function Form(){");
        arr.push("  const [datos, setDatos] = useState("+objIni+");","");
        arr.push(cmt(opt,"UN solo handler: lee name y value del event.target"));
        arr.push("  const manejarCambio = (event) => {");
        arr.push("    const { name, value } = event.target;");
        arr.push("    setDatos({ ...datos, [name]: value });");
        arr.push("  };","");
        arr.push(cmt(opt,"preventDefault corta el envío por defecto del form"));
        arr.push("  const manejarSubmit = (event) => {");
        arr.push("    event.preventDefault();");
        arr.push("    console.log(datos);");
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <form onSubmit={manejarSubmit}>");
        campos.forEach(c=>{
          arr.push("      <input name=\""+c+"\" value={datos."+c+"} onChange={manejarCambio} placeholder=\""+pascal(c)+"\" />");
        });
        arr.push("      <button type=\"submit\">Enviar</button>");
        arr.push("    </form>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/components/Form.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"cond",
      titulo:"Conditional Rendering",
      campos:[
        { id:"metodo", label:"Método", tipo:"select", default:"ternario", opciones:["&&","ternario","función if/else"] },
        { id:"estado", label:"Variable de estado", tipo:"text", default:"isLoading", placeholder:"isLoading" },
        { id:"verdadero", label:"Texto si verdadero", tipo:"text", default:"Cargando...", placeholder:"Si true" },
        { id:"falso", label:"Texto si falso", tipo:"text", default:"¡Datos listos!", placeholder:"Si false" },
        { id:"estados", label:"Estados posibles (función, coma)", tipo:"text", default:"cargando, error, exito", placeholder:"cargando, error, exito" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"bandera";
        const arr=[];
        if(v.metodo==="&&"){
          arr.push(cmt(opt,"&& : muestra SOLO si se cumple (no tiene rama falsa)"));
          arr.push("return (");
          arr.push("  <div>");
          arr.push("    {"+st+" && <p>"+esc0(v.verdadero)+"</p>}");
          arr.push("  </div>");
          arr.push(");");
        } else if(v.metodo==="ternario"){
          arr.push(cmt(opt,"ternario : dos opciones"));
          arr.push("return (");
          arr.push("  <div>");
          arr.push("    {"+st+" ? <p>"+esc0(v.verdadero)+"</p> : <p>"+esc0(v.falso)+"</p>}");
          arr.push("  </div>");
          arr.push(");");
        } else {
          arr.push(cmt(opt,"función if/else : muchos estados posibles"));
          arr.push("function renderizarEstado("+st+"){");
          splitList(v.estados).forEach(e=>{
            arr.push("  if ("+st+" === \""+e+"\") return <p>"+pascal(e)+"...</p>;");
          });
          arr.push("  return null;");
          arr.push("}");
          arr.push("");
          arr.push("return <div>{renderizarEstado("+st+")}</div>;");
        }
        return [{ archivo:"(dentro del return del componente)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"botones",
      titulo:"Botones dinámicos (texto/color/disabled + lista con Eliminar)",
      campos:[
        { id:"estado", label:"Nombre del estado", tipo:"text", default:"activo", placeholder:"activo" },
        { id:"lista", label:"Nombre de la lista", tipo:"text", default:"estudiantes", placeholder:"estudiantes" },
        { id:"campo", label:"Campo a mostrar", tipo:"text", default:"nombre", placeholder:"nombre" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"activo"; const set=setterName(st);
        const arr=['"use client";','import { useState } from "react";',''];
        arr.push("export default function Dinamico(){");
        arr.push("  const ["+st+", "+set+"] = useState(false);");
        arr.push("  const ["+ (v.lista||"lista") +", set"+pascal(v.lista||"lista")+"] = useState([]);","");
        arr.push(cmt(opt,"texto y color según estado"));
        arr.push("  const eliminar = (id) => {");
        if(opt.tp1){
          arr.push("    const restantes = [];");
          arr.push("    "+(v.lista||"lista")+".forEach(item => { if (item.id !== id) restantes.push(item); });");
          arr.push("    set"+pascal(v.lista||"lista")+"(restantes);");
        } else {
          arr.push("    set"+pascal(v.lista||"lista")+"("+ (v.lista||"lista") +".filter(item => item.id !== id));");
        }
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <button");
        arr.push("        onClick={() => "+set+"(!"+st+")}");
        arr.push("        disabled={!"+st+"}");
        arr.push("        style={{ background: "+st+" ? \"green\" : \"gray\", color: \"white\" }}");
        arr.push("      >");
        arr.push("        {"+st+" ? \"ACTIVO\" : \"INACTIVO\"}");
        arr.push("      </button>");
        arr.push("");
        arr.push(cmt(opt,"lista con botón Eliminar por elemento (closure con arrow)"));
        if(opt.tp1){
          arr.push("      <ul>");
          arr.push("        {itemsJSX} {/* ver generador de métodos de array, Modo TP1 */}");
          arr.push("      </ul>");
        } else {
          arr.push("      <ul>");
          arr.push("        {("+ (v.lista||"lista") +").map(item => (");
          arr.push("          <li key={item.id}>");
          arr.push("            {item."+ (v.campo||"nombre") +"}");
          arr.push("            <button onClick={() => eliminar(item.id)}>Eliminar</button>");
          arr.push("          </li>");
          arr.push("        ))}");
          arr.push("      </ul>");
        }
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/components/Dinamico.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    }
  ]
},

/* ============ 4 · Fetch y métodos de array ============ */
{
  id:"fetch",
  nombre:"Fetch en NextJS y Métodos de Array",
  generadores:[
    {
      id:"backend",
      titulo:"Backend Express base",
      campos:[
        { id:"archivo", label:"Archivo principal", tipo:"select", default:"index.js", opciones:[{v:"index.js",l:"index.js (TP2/Integrador)"},{v:"app.js",l:"app.js (apunte de fetch)"}], hint:"⚠️ Los apuntes usan ambos; elegí uno." },
        { id:"puerto", label:"Puerto", tipo:"number", default:3001, placeholder:"3001" },
        { id:"recurso", label:"Nombre del recurso", tipo:"text", default:"estudiantes", placeholder:"estudiantes" },
        { id:"campos", label:"Campos (coma)", tipo:"text", default:"nombre, edad, especialidad", placeholder:"nombre, edad, especialidad" },
        { id:"get", label:"GET (traer todos)", tipo:"checkbox", default:true },
        { id:"post", label:"POST (crear)", tipo:"checkbox", default:true },
        { id:"put", label:"PUT (actualizar)", tipo:"checkbox", default:true },
        { id:"del", label:"DELETE (borrar)", tipo:"checkbox", default:true }
      ],
      salida:(v,opt)=>{
        const rec=normKey(v.recurso)||"datos";
        const campos=splitList(v.campos);
        const Rec=pascal(rec);
        const ejemploObj="{ id: 1, "+campos.map((c,i)=>c+": "+(i===0?"\"Ana\"":(c.toLowerCase().includes("edad")?"17":"\"Informática\""))).join(", ")+" }";
        const arr=[];
        arr.push('const express = require("express");');
        arr.push('const cors = require("cors");');
        arr.push("const app = express();");
        arr.push("const PORT = "+(v.puerto||3001)+";","");
        arr.push("app.use(cors());       // permite que el front llame");
        arr.push("app.use(express.json()); // para leer req.body","");
        arr.push("let "+rec+" = [");
        arr.push("  "+ejemploObj);
        arr.push("];","");
        if(v.get){
          arr.push("// GET: traer todos");
          arr.push('app.get("/api/'+rec+'", (req, res) => {');
          arr.push("  res.json("+rec+");");
          arr.push("});","");
        }
        if(v.post){
          arr.push("// POST: crear");
          arr.push('app.post("/api/'+rec+'", (req, res) => {');
          arr.push("  const nuevo = { id: Date.now(), ...req.body };");
          arr.push("  "+rec+".push(nuevo);");
          arr.push("  res.json(nuevo);");
          arr.push("});","");
        }
        if(v.put){
          arr.push("// PUT: actualizar");
          arr.push('app.put("/api/'+rec+'/:id", (req, res) => {');
          arr.push("  const { id } = req.params;");
          if(opt.tp1){
            arr.push("  for (let i = 0; i < "+rec+".length; i++) {");
            arr.push("    if (String("+rec+"[i].id) === id) "+rec+"[i] = { ..."+rec+"[i], ...req.body };");
            arr.push("  }");
            arr.push("  res.json({ ok: true });");
          } else {
            arr.push("  "+rec+" = "+rec+".map(e => (String(e.id) === id ? { ...e, ...req.body } : e));");
            arr.push("  res.json("+rec+".find(e => String(e.id) === id));");
          }
          arr.push("});","");
        }
        if(v.del){
          arr.push("// DELETE: borrar");
          arr.push('app.delete("/api/'+rec+'/:id", (req, res) => {');
          arr.push("  const { id } = req.params;");
          if(opt.tp1){
            arr.push("  const restantes = [];");
            arr.push("  "+rec+".forEach(e => { if (String(e.id) !== id) restantes.push(e); });");
            arr.push("  "+rec+" = restantes;");
          } else {
            arr.push("  "+rec+" = "+rec+".filter(e => String(e.id) !== id);");
          }
          arr.push("  res.json({ ok: true });");
          arr.push("});","");
        }
        arr.push("app.listen(PORT, () => {");
        arr.push("  console.log(`Servidor corriendo en http://localhost:${PORT}/`);");
        arr.push("});");
        return [{ archivo:"backend/"+v.archivo, lado:"BACK", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"get",
      titulo:"Fetch GET en useEffect",
      campos:[
        { id:"url", label:"URL", tipo:"text", default:"http://localhost:3001/api/estudiantes", placeholder:"http://localhost:PUERTO/api/recurso" },
        { id:"estado", label:"Nombre del estado", tipo:"text", default:"estudiantes", placeholder:"estudiantes" },
        { id:"loading", label:"loading", tipo:"checkbox", default:true },
        { id:"estilo", label:"Estilo", tipo:"select", default:"async", opciones:[{v:"then",l:".then()"},{v:"async",l:"función async interna"}], hint:"⚠️ useEffect NO puede ser async directo." },
        { id:"ruta", label:"Ruta de la página", tipo:"text", default:"estudiantes", placeholder:"estudiantes" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"datos"; const set=setterName(st);
        const arr=['"use client";','import { useState, useEffect } from "react";',''];
        arr.push("export default function "+(pascal(v.ruta)+"Page"||"Page")+"(){");
        arr.push("  const ["+st+", "+set+"] = useState([]);");
        if(v.loading) arr.push("  const [loading, setLoading] = useState(true);");
        arr.push("");
        arr.push(cmt(opt,"GET al montar la página"));
        arr.push("  useEffect(() => {");
        if(v.estilo==="then"){
          arr.push("    fetch("+q(opt,v.url)+")");
          arr.push("      .then(response => response.json())");
          arr.push("      .then(data => {");
          arr.push("        "+set+"(data);");
          if(v.loading) arr.push("        setLoading(false);");
          arr.push("      });");
        } else {
          arr.push("    const obtenerDatos = async () => {");
          arr.push("      try {");
          arr.push("        const response = await fetch("+q(opt,v.url)+");");
          arr.push("        const data = await response.json();");
          arr.push("        "+set+"(data);");
          if(v.loading) arr.push("        setLoading(false);");
          arr.push("      } catch (error) {");
          arr.push("        console.error(\"Error al obtener los datos:\", error);");
          arr.push("      }");
          arr.push("    };");
          arr.push("    obtenerDatos();");
        }
        arr.push("  }, []);","");
        arr.push("  return (");
        arr.push("    <div>");
        if(v.loading){
          arr.push("      {loading ? <p>Cargando...</p> : (");
          arr.push("        <ul>");
          pushLista(arr,st,opt,"          ");
          arr.push("        </ul>");
          arr.push("      )}");
        } else {
          arr.push("      <ul>");
          pushLista(arr,st,opt,"        ");
          arr.push("      </ul>");
        }
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/"+(v.ruta||"datos")+"/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"write",
      titulo:"POST / PUT / DELETE (enviar datos)",
      campos:[
        { id:"base", label:"URL base", tipo:"text", default:"http://localhost:3001/api", placeholder:"http://localhost:3001/api" },
        { id:"recurso", label:"Recurso", tipo:"text", default:"estudiantes", placeholder:"estudiantes" },
        { id:"metodo", label:"Método", tipo:"select", default:"POST", opciones:["POST","PUT","DELETE"] },
        { id:"campos", label:"Campos del objeto (coma)", tipo:"text", default:"nombre, edad, especialidad", placeholder:"nombre, edad, especialidad" },
        { id:"estado", label:"Nombre del estado", tipo:"text", default:"estudiantes", placeholder:"estudiantes" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"datos"; const set=setterName(st);
        const rec=normKey(v.recurso)||"recurso";
        const campos=splitList(v.campos);
        const arr=[];
        if(v.metodo==="POST"){
          arr.push(cmt(opt,"POST: crear y agregar al estado"));
          arr.push("const agregar = async () => {");
          arr.push("  const response = await fetch("+q(opt,(v.base||"")+"/"+rec)+", {");
          arr.push('    method: "POST",');
          arr.push('    headers: { "Content-Type": "application/json" },');
          arr.push("    body: JSON.stringify({ "+campos.join(", ")+" })");
          arr.push("  });");
          arr.push("  const data = await response.json();");
          if(opt.tp1){
            arr.push("  const copia = [];");
            arr.push("  "+st+".forEach(item => copia.push(item));");
            arr.push("  copia.push(data);");
            arr.push("  "+set+"(copia); // array nuevo, no mutar");
          } else {
            arr.push("  "+set+"([..."+st+", data]); // array nuevo, no mutar");
          }
          arr.push("};");
        } else if(v.metodo==="PUT"){
          arr.push(cmt(opt,"PUT: actualizar por id"));
          arr.push("const actualizar = async (id, cambios) => {");
          arr.push("  const response = await fetch("+q(opt,(v.base||"")+"/"+rec)+"/\" + id, {");
          arr.push('    method: "PUT",');
          arr.push('    headers: { "Content-Type": "application/json" },');
          arr.push("    body: JSON.stringify(cambios)");
          arr.push("  });");
          arr.push("  const data = await response.json();");
          if(opt.tp1){
            arr.push("  const copia = [];");
            arr.push("  "+st+".forEach(item => copia.push(String(item.id) === String(id) ? { ...item, ...cambios } : item));");
            arr.push("  "+set+"(copia);");
          } else {
            arr.push("  "+set+"("+st+".map(item => (String(item.id) === String(id) ? { ...item, ...cambios } : item)));");
          }
          arr.push("};");
        } else {
          arr.push(cmt(opt,"DELETE: borrar por id"));
          arr.push("const eliminar = async (id) => {");
          arr.push("  await fetch("+q(opt,(v.base||"")+"/"+rec)+"/\" + id, { method: \"DELETE\" });");
          if(opt.tp1){
            arr.push("  const copia = [];");
            arr.push("  "+st+".forEach(item => { if (String(item.id) !== String(id)) copia.push(item); });");
            arr.push("  "+set+"(copia);");
          } else {
            arr.push("  "+set+"("+st+".filter(item => String(item.id) !== String(id)));");
          }
          arr.push("};");
        }
        return [{ archivo:"(handler dentro del componente)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"arrays",
      titulo:"Métodos de array",
      campos:[
        { id:"metodo", label:"Método", tipo:"select", default:"map", opciones:["map","filter","find","forEach","some","every"] },
        { id:"array", label:"Nombre del array", tipo:"text", default:"notas", placeholder:"notas" },
        { id:"elem", label:"Variable del elemento", tipo:"text", default:"nota", placeholder:"nota" },
        { id:"campo", label:"Campo (si es array de objetos)", tipo:"text", default:"", placeholder:"ej: nota (opcional)" },
        { id:"operador", label:"Operador", tipo:"select", default:">=", opciones:["===","==",">=","<",">","includes"] },
        { id:"valor", label:"Valor", tipo:"text", default:"6", placeholder:"6" },
        { id:"jsx", label:"renderizar JSX con key", tipo:"checkbox", default:false }
      ],
      salida:(v,opt)=>{
        const a=normKey(v.array)||"arr";
        const e=normKey(v.elem)||"item";
        const ref=e+"."+(v.campo||"")||(e);
        const elemRef = v.campo? e+"."+v.campo : e;
        const arr=[];
        const modo=v.metodo;
        if(opt.tp1 && (modo==="map"||modo==="filter"||modo==="find")){
          arr.push(cmt(opt,"Modo TP1 activo: "+modo+" está PROHIBIDO → se reemplaza por for/forEach + push"));
          if(modo==="map"){
            if(v.jsx){
              arr.push("const itemsJSX = [];");
              arr.push(a+".forEach(("+e+", i) => {");
              arr.push("  itemsJSX.push(<li key={i}>{"+elemRef+"}</li>);");
              arr.push("});");
            } else {
              arr.push("const resultado = [];");
              arr.push("for (let i = 0; i < "+a+".length; i++) {");
              arr.push("  resultado.push("+a+"[i]);");
              arr.push("}");
            }
          } else if(modo==="filter"){
            arr.push("const filtrados = [];");
            arr.push("for (let i = 0; i < "+a+".length; i++) {");
            arr.push("  if ("+cmpExpr(elemRef,v.operador,v.valor,e)+") filtrados.push("+a+"[i]);");
            arr.push("}");
          } else {
            arr.push("let encontrado;");
            arr.push("for (let i = 0; i < "+a+".length; i++) {");
            arr.push("  if ("+cmpExpr(elemRef,v.operador,v.valor,e)+") { encontrado = "+a+"[i]; break; }");
            arr.push("}");
          }
        } else {
          if(modo==="map"){
            if(v.jsx){
              arr.push(cmt(opt,"map para renderizar: cada elemento con key única"));
              arr.push("{"+a+".map(("+e+", i) => (");
              arr.push("  <li key={"+e+".id ?? i}>{"+elemRef+"}</li>");
              arr.push("))}");
            } else {
              arr.push(a+".map(("+e+") => "+elemRef+" * 2);   // transforma → NUEVO array");
            }
          } else if(modo==="filter"){
            arr.push("const aprobadas = "+a+".filter(("+e+") => "+cmpExpr(elemRef,v.operador,v.valor,e)+");");
          } else if(modo==="find"){
            arr.push("const buscada = "+a+".find(("+e+") => "+cmpExpr(elemRef,v.operador,v.valor,e)+"); // undefined si no está");
          } else if(modo==="forEach"){
            arr.push(a+".forEach(("+e+") => console.log("+elemRef+")); // solo recorre, devuelve undefined");
          } else if(modo==="some"){
            arr.push("const hayAlguna = "+a+".some(("+e+") => "+cmpExpr(elemRef,v.operador,v.valor,e)+"); // true/false");
          } else {
            arr.push("const todasOk = "+a+".every(("+e+") => "+cmpExpr(elemRef,v.operador,v.valor,e)+"); // true/false");
          }
        }
        return [{ archivo:"(línea de código JS)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"crud",
      titulo:"Página CRUD completa",
      campos:[
        { id:"url", label:"URL", tipo:"text", default:"http://localhost:3001/api/estudiantes", placeholder:"http://localhost:3001/api/estudiantes" },
        { id:"recurso", label:"Recurso", tipo:"text", default:"estudiantes", placeholder:"estudiantes" },
        { id:"campos", label:"Campos del formulario (coma)", tipo:"text", default:"nombre, edad, especialidad", placeholder:"nombre, edad, especialidad" },
        { id:"ruta", label:"Ruta de la página", tipo:"text", default:"estudiantes", placeholder:"estudiantes" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.recurso)||"datos"; const set=setterName(st);
        const campos=splitList(v.campos);
        const objIni="{ "+campos.map(c=>c+": \"\"").join(", ")+" }";
        const arr=['"use client";','import { useState, useEffect } from "react";',''];
        arr.push("export default function "+(pascal(v.ruta)+"Page"||"Page")+"(){");
        arr.push("  const ["+st+", "+set+"] = useState([]);");
        arr.push("  const [loading, setLoading] = useState(true);");
        arr.push("  const [nuevo, setNuevo] = useState("+objIni+");","");
        arr.push(cmt(opt,"GET al montar"));
        arr.push("  useEffect(() => {");
        arr.push("    const obtener = async () => {");
        arr.push("      const res = await fetch("+q(opt,v.url)+");");
        arr.push("      const data = await res.json();");
        arr.push("      "+set+"(data);");
        arr.push("      setLoading(false);");
        arr.push("    };");
        arr.push("    obtener();");
        arr.push("  }, []);","");
        arr.push(cmt(opt,"POST con el formulario"));
        arr.push("  const manejarSubmit = async (event) => {");
        arr.push("    event.preventDefault();");
        arr.push("    const res = await fetch("+q(opt,v.url)+", {");
        arr.push('      method: "POST",');
        arr.push('      headers: { "Content-Type": "application/json" },');
        arr.push("      body: JSON.stringify(nuevo)");
        arr.push("    });");
        arr.push("    const data = await res.json();");
        if(opt.tp1){
          arr.push("    const copia = [];");
          arr.push("    "+st+".forEach(item => copia.push(item));");
          arr.push("    copia.push(data);");
          arr.push("    "+set+"(copia);");
        } else {
          arr.push("    "+set+"([..."+st+", data]);");
        }
        arr.push("    setNuevo("+objIni+");");
        arr.push("  };","");
        arr.push(cmt(opt,"DELETE por fila"));
        arr.push("  const eliminar = async (id) => {");
        arr.push("    await fetch("+q(opt,v.url)+"/\" + id, { method: \"DELETE\" });");
        if(opt.tp1){
          arr.push("    const copia = [];");
          arr.push("    "+st+".forEach(item => { if (String(item.id) !== String(id)) copia.push(item); });");
          arr.push("    "+set+"(copia);");
        } else {
          arr.push("    "+set+"("+st+".filter(item => String(item.id) !== String(id)));");
        }
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      {loading ? <p>Cargando...</p> : (");
        arr.push("        <ul>");
        if(opt.tp1){
          arr.push("          {itemsJSX} {/* armá itemsJSX con forEach + push (ver métodos de array, Modo TP1) */}");
        } else {
          arr.push("          {("+st+").map(item => (");
          arr.push("            <li key={item.id}>");
          arr.push("              "+campos.map(c=>"{item."+c+"}").join(" - "));
          arr.push("              <button onClick={() => eliminar(item.id)}>Eliminar</button>");
          arr.push("            </li>");
          arr.push("          ))}");
        }
        arr.push("        </ul>");
        arr.push("      )}");
        arr.push("      <form onSubmit={manejarSubmit}>");
        campos.forEach(c=>{
          arr.push("        <input name=\""+c+"\" value={nuevo."+c+"} placeholder=\""+pascal(c)+"\"");
          arr.push("          onChange={e => setNuevo({ ...nuevo, "+c+": e.target.value })} />");
        });
        arr.push("        <button type=\"submit\">Agregar</button>");
        arr.push("      </form>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/"+(v.ruta||"recurso")+"/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"mysql",
      titulo:"Conexión a base de datos (MySQL)",
      campos:[
        { id:"host", label:"host", tipo:"text", default:"localhost" },
        { id:"user", label:"user", tipo:"text", default:"root" },
        { id:"password", label:"password", tipo:"text", default:"tuClave" },
        { id:"database", label:"database", tipo:"text", default:"dai_pio_chat" },
        { id:"tabla", label:"tabla", tipo:"text", default:"mensajes" },
        { id:"columnas", label:"columnas (coma)", tipo:"text", default:"sala, usuario, texto" },
        { id:"modulo", label:"Nombre del módulo", tipo:"select", default:"mysql.js", opciones:["mysql.js","db.js"] }
      ],
      salida:(v,opt)=>{
        const cols=splitList(v.columnas);
        const m1=L(['const mysql = require("mysql2/promise");','',
          'const pool = mysql.createPool({',
          '  host: '+q(opt,v.host)+',',
          '  user: '+q(opt,v.user)+',',
          '  password: '+q(opt,v.password)+',',
          '  database: '+q(opt,v.database),
          '});','',
          'module.exports = pool;']);
        const selCols=cols.length?cols.join(", "):"*";
        const ph=cols.map(()=>"?").join(", ");
        const m2=L([
          'const pool = require("./modulos/'+v.modulo.replace(".js","")+'");','',
          '// GET: leer la tabla',
          'app.get("/api/'+(v.tabla||"datos")+'", async (req, res) => {',
          '  const [filas] = await pool.query("SELECT '+selCols+' FROM '+(v.tabla||"tabla")+'");',
          '  res.json(filas);',
          '});','',
          '// POST: insertar (los ? evitan inyección SQL)',
          'app.post("/api/'+(v.tabla||"datos")+'", async (req, res) => {',
          '  const { '+cols.join(", ")+' } = req.body;',
          '  const [resultado] = await pool.query(',
          '    "INSERT INTO '+(v.tabla||"tabla")+' ('+cols.join(", ")+') VALUES ('+ph+')",',
          '    ['+cols.join(", ")+']',
          '  );',
          '  res.json({ id: resultado.insertId, '+cols.join(", ")+', });',
          '});']);
        return [
          { archivo:"backend/modulos/"+v.modulo, lado:"BACK", codigo:m1 },
          { archivo:"backend/index.js (agregar endpoints)", lado:"BACK", codigo:m2 }
        ];
      }
    },
    {
      id:"usefetch",
      titulo:"Custom hook useFetch",
      campos:[
        { id:"url", label:"URL", tipo:"text", default:"http://localhost:3001/api/estudiantes", placeholder:"URL del endpoint" }
      ],
      salida:(v,opt)=>{
        const arr=['"use client";','import { useState, useEffect } from "react";',''];
        arr.push(cmt(opt,"Custom hook: devuelve { data, loading } (regla: siempre objeto)"));
        arr.push("export default function useFetch(url){");
        arr.push("  const [data, setData] = useState(null);");
        arr.push("  const [loading, setLoading] = useState(true);","");
        arr.push("  useEffect(() => {");
        arr.push("    const obtener = async () => {");
        arr.push("      const res = await fetch(url);");
        arr.push("      const json = await res.json();");
        arr.push("      setData(json);");
        arr.push("      setLoading(false);");
        arr.push("    };");
        arr.push("    obtener();");
        arr.push("  }, [url]);","");
        arr.push("  return { data, loading };");
        arr.push("}");
        arr.push("");
        arr.push(cmt(opt,"Uso en una página:"));
        arr.push("// const { data, loading } = useFetch("+q(opt,v.url)+");");
        return [{ archivo:"src/hooks/useFetch.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    }
  ]
},

/* ============ 5 · Router ============ */
{
  id:"router",
  nombre:"Router en NextJS",
  generadores:[
    {
      id:"userouter",
      titulo:"useRouter (navegación programática)",
      campos:[
        { id:"metodo", label:"Método", tipo:"select", default:"push", opciones:["push","replace","back","forward","refresh"],
          hint:"push guarda historial · replace no · back/forward navegan · refresh recarga" },
        { id:"ruta", label:"Ruta", tipo:"text", default:"/chat", placeholder:"/otra-pagina" },
        { id:"params", label:"Parámetros de consulta (clave=valor, uno por línea)", tipo:"textarea", default:"sala=pio\nusuario=ana", placeholder:"clave=valor" },
        { id:"dinamica", label:"ruta dinámica con ${userId}", tipo:"checkbox", default:false }
      ],
      salida:(v,opt)=>{
        const params=parseLines(v.params);
        let url=v.ruta||"/";
        if(v.dinamica){ url="/usuario/${userId}"; }
        const qs=params.map(p=>{ const i=p.indexOf("="); return i<0?p:p.slice(0,i)+"="+p.slice(i+1); });
        const full = qs.length? (url+(url.includes("?")?"&":"?")+qs.join("&")) : url;
        const target = (full.includes("${")||qs.length||v.dinamica)
          ? "`"+full+"`" : q(opt,full);
        const arr=[];
        arr.push('"use client";');
        arr.push('import { useRouter } from "next/navigation"; // ⚠️ NUNCA next/router','');
        arr.push("export default function Navegador(){");
        arr.push("  const router = useRouter();","");
        if(v.dinamica) arr.push("  const userId = 1; // id dinámico");
        arr.push(cmt(opt,v.metodo+": "+descMetodo(v.metodo)));
        if(v.metodo==="back"||v.metodo==="forward"||v.metodo==="refresh"){
          arr.push("  const ir = () => {");
          arr.push("    router."+v.metodo+"();");
        } else {
          arr.push("  const ir = () => {");
          arr.push("    router."+v.metodo+"("+target+");");
        }
        arr.push("  };","");
        arr.push("  return <button onClick={ir}>Ir</button>;");
        arr.push("}");
        return [{ archivo:"src/app/page.js (extracto)", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"searchparams",
      titulo:"useSearchParams (leer parámetros de URL)",
      campos:[
        { id:"params", label:"Parámetros a leer (coma)", tipo:"text", default:"sala, usuario", placeholder:"sala, usuario" },
        { id:"metodo", label:"Método", tipo:"select", default:".get", opciones:[".get",".has",".toString",".forEach"] }
      ],
      salida:(v,opt)=>{
        const ps=splitList(v.params);
        const arr=['"use client";','import { useSearchParams } from "next/navigation";',''];
        arr.push("export default function Pagina(){");
        arr.push("  const searchParams = useSearchParams();");
        if(v.metodo===".get"){
          ps.forEach(p=>arr.push("  const "+normKey(p)+" = searchParams.get("+q(opt,p)+");"));
          arr.push("");
          arr.push("  return (");
          arr.push("    <div>");
          ps.forEach(p=>arr.push('      <p>'+p+": {"+normKey(p)+' ?? "(sin valor)"}</p>'));
          arr.push("    </div>");
          arr.push("  );");
        } else if(v.metodo===".has"){
          ps.forEach(p=>arr.push("  const tiene"+pascal(p)+" = searchParams.has("+q(opt,p)+");"));
          arr.push("");
          arr.push("  return <p>¿Está "+(ps[0]||"el parámetro")+"?: {String(tiene"+pascal(ps[0]||"")+")}</p>;");
        } else if(v.metodo===".toString"){
          arr.push("  const queryString = searchParams.toString(); // \"sala=pio&usuario=ana\"");
          arr.push("");
          arr.push("  return <p>Query completo: {queryString}</p>;");
        } else {
          arr.push("  searchParams.forEach((valor, clave) => {");
          arr.push("    console.log(clave, \"=>\", valor);");
          arr.push("  });");
          arr.push("");
          arr.push("  return <p>Mirá la consola</p>;");
        }
        arr.push("}");
        arr.push("");
        arr.push(cmt(opt,"Si da error en build, envolvé el componente en <Suspense>"));
        return [{ archivo:"src/app/<ruta>/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"link",
      titulo:"Link (menú de navegación)",
      campos:[
        { id:"links", label:"Links (uno por línea: Texto|/ruta)", tipo:"textarea", default:"Inicio|/\nSocket|/socket\nChat|/chat", placeholder:"Texto|/ruta" }
      ],
      salida:(v,opt)=>{
        const links=parseLines(v.links).map(l=>l.split("|"));
        const arr=['import Link from "next/link";',''];
        arr.push("export default function Menu(){");
        arr.push("  return (");
        arr.push("    <nav>");
        links.forEach(l=>arr.push("      <Link href="+q(opt,(l[1]||"/").trim())+">"+(l[0]||"Link")+"</Link>"));
        arr.push("    </nav>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/components/Menu.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"formnav",
      titulo:"Formulario que valida y navega (home del TP2)",
      campos:[
        { id:"campos", label:"Campos (coma)", tipo:"text", default:"usuario, sala", placeholder:"usuario, sala" },
        { id:"destino", label:"Ruta destino", tipo:"text", default:"/chat", placeholder:"/chat" }
      ],
      salida:(v,opt)=>{
        const campos=splitList(v.campos);
        const objIni="{ "+campos.map(c=>c+": \"\"").join(", ")+" }";
        const qs=campos.map(c=>c+"=${"+c+"}").join("&");
        const arr=['"use client";','import { useState } from "react";','import { useRouter } from "next/navigation";',''];
        arr.push("export default function HomePage(){");
        arr.push("  const router = useRouter();");
        arr.push("  const [usuario, setUsuario] = useState(\"\");");
        arr.push("  const [sala, setSala] = useState(\"\");","");
        arr.push(cmt(opt,"seteo de cada campo con event.target.value"));
        campos.forEach(c=>{
          arr.push("  const set"+pascal(c)+"Value = (event) => {");
          arr.push("    "+setterName(c)+"(event.target.value);");
          arr.push("  };");
        });
        arr.push("");
        arr.push(cmt(opt,"solo navega si ningún campo está vacío"));
        arr.push("  const entrar = () => {");
        arr.push("    if (!"+campos.join(" || !")+") {");
        arr.push("      alert(\"Completá todos los campos\");");
        arr.push("      return;");
        arr.push("    }");
        arr.push("    router.push(`"+(v.destino||"/chat")+"?"+qs+"`);");
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        campos.forEach(c=>{
          arr.push("      <input type=\"text\" placeholder=\""+pascal(c)+"\" value={"+c+"} onChange={set"+pascal(c)+"Value} />");
        });
        arr.push("      <button onClick={entrar}>Entrar</button>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    }
  ]
},

/* ============ 6 · WebSockets ============ */
{
  id:"sockets",
  nombre:"WebSockets y uso del hook useSocket en React",
  generadores:[
    {
      id:"hook",
      titulo:"Hook useSocket (elegí la versión)",
      campos:[
        { id:"version", label:"Versión del hook", tipo:"select", default:"A",
          opciones:[{v:"A",l:"A · apunte v2.0 (export default)"},{v:"B",l:"B · archivo useSocket.js (export nombrado)"}],
          hint:"⚠️ Cambia el import y la llamada: ¡coherencia en todo el proyecto!" },
        { id:"serverUrl", label:"serverUrl", tipo:"text", default:"ws://localhost:4000", placeholder:"ws://IP-DEL-BACK:4000", hint:"ACÁ PONER LA IP DEL BACK" },
        { id:"options", label:"options", tipo:"text", default:"{}", placeholder:"{} o { withCredentials: false }" }
      ],
      salida:(v,opt)=>{
        const files=[];
        if(v.version==="A"){
          const arr=[
            'import { useState, useEffect, useRef } from "react";',
            'import { io } from "socket.io-client";',''];
          arr.push(cmt(opt,"Versión A (apunte v2.0) — con fix: = {} final para poder llamar useSocket({}) sin TypeError"));
          arr.push("export default function useSocket({ serverUrl = "+q(opt,v.serverUrl)+", options = "+(v.options||"{}")+" } = {}) {");
          arr.push("  const [isConnected, setIsConnected] = useState(false);");
          arr.push("  const socketRef = useRef(null);","");
          arr.push("  if (!socketRef.current) {");
          arr.push("    // Solo se crea una vez");
          arr.push("    socketRef.current = io(serverUrl, options);");
          arr.push("  }","");
          arr.push("  useEffect(() => {");
          arr.push("    const socket = socketRef.current;","");
          arr.push("    const onConnect = () => {");
          arr.push("      setIsConnected(true);");
          arr.push("      console.log(\"WebSocket conectado:\", socket.id);");
          arr.push("    };","");
          arr.push("    const onDisconnect = () => {");
          arr.push("      setIsConnected(false);");
          arr.push("      console.log(\"X WebSocket desconectado\");");
          arr.push("    };","");
          arr.push("    socket.on(\"connect\", onConnect);");
          arr.push("    socket.on(\"disconnect\", onDisconnect);","");
          arr.push("    return () => {");
          arr.push("      socket.off(\"connect\", onConnect);");
          arr.push("      socket.off(\"disconnect\", onDisconnect);");
          arr.push("    };");
          arr.push("  }, []);","");
          arr.push("  return { socket: socketRef.current, isConnected };");
          arr.push("}");
          files.push({ archivo:"src/hooks/useSocket.js", lado:"FRONT", codigo:L(withC(arr)) });
          files.push({ archivo:"cómo se importa/llama (Versión A)", lado:"FRONT", codigo:L([
            "// IMPORT default (sin llaves):",
            "import useSocket from \"@/hooks/useSocket\";",
            "",
            "// LLAMADA con objeto (obligatorio, aunque sea vacío):",
            "const { socket, isConnected } = useSocket({});",
            "// o con datos:",
            "const { socket, isConnected } = useSocket({ serverUrl: "+q(opt,v.serverUrl)+", options: "+(v.options||"{}")+" });",
            "",
            "// ⚠️ useSocket() SIN argumentos tira TypeError en esta versión."
          ])});
        } else {
          const arr=[
            "import { useState, useEffect } from 'react';",
            "import io from 'socket.io-client';",""];
          arr.push(cmt(opt,"Versión B (archivo useSocket.js) — export nombrado, dos parámetros"));
          arr.push("const useSocket = (options = "+(v.options||"{ withCredentials: false}")+", serverUrl = "+q(opt,v.serverUrl)+") => { //ACÁ PONER LA IP DEL BACK");
          arr.push("  const [socket, setSocket] = useState(null);");
          arr.push("  const [isConnected, setIsConnected] = useState(false);","");
          arr.push("  useEffect(() => {");
          arr.push("    // Crear una conexión con el backend usando Socket.IO");
          arr.push("    const socketIo = io(serverUrl, options);","");
          arr.push("    // Actualizar el estado de la conexión");
          arr.push("    socketIo.on('connect', () => {");
          arr.push("      setIsConnected(true);");
          arr.push("      console.log('WebSocket connectado.');");
          arr.push("    });","");
          arr.push("    socketIo.on('disconnect', () => {");
          arr.push("      setIsConnected(false);");
          arr.push("      console.log('WebSocket desconectado');");
          arr.push("    });","");
          arr.push("    // Guardar la instancia del socket en el estado");
          arr.push("    setSocket(socketIo);","");
          arr.push("    // Limpiar la conexión cuando el componente se desmonte");
          arr.push("    return () => {");
          arr.push("      socketIo.disconnect();");
          arr.push("    };");
          arr.push("  }, [serverUrl, JSON.stringify(options)]);","");
          arr.push("  return { socket, isConnected };");
          arr.push("};","");
          arr.push("export { useSocket };");
          files.push({ archivo:"src/hooks/useSocket.js", lado:"FRONT", codigo:L(withC(arr)) });
          files.push({ archivo:"cómo se importa/llama (Versión B)", lado:"FRONT", codigo:L([
            "// IMPORT nombrado (con llaves):",
            "import { useSocket } from \"@/hooks/useSocket\";",
            "",
            "// LLAMADA con DOS parámetros (options primero!):",
            "const { socket, isConnected } = useSocket("+q(opt,v.serverUrl)+");",
            "// (usa los defaults si no pasás nada: useSocket())",
            "",
            "// ⚠️ socket arranca en null: hacer if (!socket) return; antes de usarlo."
          ])});
        }
        return files;
      }
    },
    {
      id:"backconfig",
      titulo:"Backend — configuración (Express + sesiones + Socket.IO)",
      campos:[
        { id:"puerto", label:"Puerto", tipo:"number", default:4000, placeholder:"4000" },
        { id:"origenes", label:"Orígenes del front permitidos (coma)", tipo:"text", default:"http://localhost:3000, http://localhost:3001", placeholder:"http://localhost:3000, http://localhost:3001" },
        { id:"secret", label:"secret de sesión", tipo:"text", default:"supersarasa", placeholder:"clave secreta" }
      ],
      salida:(v,opt)=>{
        const orig=splitList(v.origenes).map(o=>q(opt,o));
        const arr=[];
        arr.push('const express = require("express");');
        arr.push("const app = express();");
        arr.push("const port = process.env.PORT || "+(v.puerto||4000)+"; // Puerto por el que estoy ejecutando la página Web");
        arr.push('const cors = require("cors");');
        arr.push('const session = require("express-session"); // Para el manejo de las variables de sesión','');
        arr.push("app.use(cors());","");
        arr.push("const server = app.listen(port, () => {");
        arr.push("  console.log(`Servidor NodeJS corriendo en http://localhost:${port}/`);");
        arr.push("});","");
        arr.push('const io = require("socket.io")(server, {');
        arr.push("  cors: {");
        arr.push("    // IMPORTANTE: REVISAR PUERTO DEL FRONTEND");
        arr.push("    origin: ["+orig.join(", ")+"], // Permitir los orígenes del front");
        arr.push('    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos');
        arr.push("    credentials: true, // Habilitar el envío de cookies");
        arr.push("  },");
        arr.push("});","");
        arr.push("const sessionMiddleware = session({");
        arr.push("  secret: "+q(opt,v.secret||"supersarasa")+", // Elegir tu propia key secreta");
        arr.push("  resave: false,");
        arr.push("  saveUninitialized: false,");
        arr.push("});","");
        arr.push("app.use(sessionMiddleware);","");
        arr.push("io.use((socket, next) => {");
        arr.push("  sessionMiddleware(socket.request, {}, next);");
        arr.push("});");
        return [{ archivo:"backend/index.js", lado:"BACK", codigo:L(arr) }];
      }
    },
    {
      id:"backeventos",
      titulo:"Backend — eventos del socket",
      campos:[
        { id:"joinRoom", label:'joinRoom (entrar/cambiar de sala)', tipo:"checkbox", default:true },
        { id:"pingAll", label:"pingAll (mensaje a todos)", tipo:"checkbox", default:true },
        { id:"sendMessage", label:"sendMessage (mensaje a la sala)", tipo:"checkbox", default:true },
        { id:"disconnect", label:"disconnect (al salir)", tipo:"checkbox", default:true },
        { id:"evEscucha", label:"Evento personalizado — nombre del evento que escucha", tipo:"text", default:"contador", placeholder:"contador" },
        { id:"evResponde", label:"Evento personalizado — nombre del evento de respuesta", tipo:"text", default:"contadorUpdate", placeholder:"contadorUpdate" }
      ],
      salida:(v,opt)=>{
        const arr=[];
        arr.push(cmt(opt,"A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET (pegar abajo de la config)"));
        arr.push('io.on("connection", (socket) => {');
        arr.push("  const req = socket.request;","");
        if(v.joinRoom){
          arr.push('  socket.on("joinRoom", (data) => {');
          arr.push('    console.log("io.on req.session.room:", req.session.room);');
          arr.push("    if (req.session.room != undefined && req.session.room.length > 0) {");
          arr.push("      socket.leave(req.session.room);");
          arr.push("    }");
          arr.push("    req.session.room = data.room;");
          arr.push("    socket.join(req.session.room);","");
          arr.push('    io.to(req.session.room).emit("chat-messages", {');
          arr.push("      user: req.session.user,");
          arr.push("      room: req.session.room,");
          arr.push("    });");
          arr.push("  });","");
        }
        if(v.pingAll){
          arr.push('  socket.on("pingAll", (data) => {');
          arr.push('    console.log("PING ALL: ", data);');
          arr.push('    io.emit("pingAll", { event: "Ping to all", message: data });');
          arr.push("  });","");
        }
        if(v.sendMessage){
          arr.push('  socket.on("sendMessage", (data) => {');
          arr.push('    io.to(req.session.room).emit("newMessage", {');
          arr.push("      room: req.session.room,");
          arr.push("      message: data,");
          arr.push("    });");
          arr.push("  });","");
        }
        if(v.evEscucha&&v.evEscucha.trim()){
          const esc=normKey(v.evEscucha)||"evento";
          const rsp=normKey(v.evResponde)||esc+"Response";
          arr.push(cmt(opt,"Evento personalizado: escucha "+esc+" → emite "+rsp+" a todos"));
          arr.push('  let contador = 0;');
          arr.push('  socket.on("'+esc+'", (data) => {');
          arr.push("    contador++;");
          arr.push('    console.log("'+esc+': ", data);');
          arr.push('    io.emit("'+rsp+'", { contador, mensaje: data });');
          arr.push("  });","");
        }
        if(v.disconnect){
          arr.push('  socket.on("disconnect", () => {');
          arr.push('    console.log("Disconnect");');
          arr.push("  });");
        }
        arr.push("});");
        return [{ archivo:"backend/index.js (eventos)", lado:"BACK", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"pagSocket",
      titulo:"Página /socket (prueba de conexión)",
      campos:[
        { id:"version", label:"Versión del hook", tipo:"select", default:"A", opciones:[{v:"A",l:"A · export default"},{v:"B",l:"B · export nombrado"}] },
        { id:"evento", label:"Evento a escuchar", tipo:"text", default:"pingAll", placeholder:"pingAll" }
      ],
      salida:(v,opt)=>{
        const imp = v.version==="A"
          ? 'import useSocket from "@/hooks/useSocket";'
          : 'import { useSocket } from "@/hooks/useSocket";';
        const call = v.version==="A"
          ? 'const { socket, isConnected } = useSocket({});'
          : 'const { socket, isConnected } = useSocket();';
        const arr=['"use client";', imp, 'import { useState, useEffect } from "react";',''];
        arr.push("export default function SocketPage(){");
        arr.push("  "+call);
        arr.push("  const [mensajes, setMensajes] = useState([]);","");
        arr.push(cmt(opt,"escuchar el evento SIEMPRE adentro de un useEffect dependiente de socket"));
        arr.push("  useEffect(() => {");
        if(v.version==="B") arr.push("    if (!socket) return; // ⚠️ Versión B: socket arranca null");
        arr.push('    socket.on("'+(v.evento||"pingAll")+'", (data) => {');
        if(opt.tp1){
          arr.push("      setMensajes(prev => { const copia = []; prev.forEach(m => copia.push(m)); copia.push(data); return copia; });");
        } else {
          arr.push("      setMensajes(prev => [...prev, data]);");
        }
        arr.push("    });","");
        arr.push("    return () => {");
        arr.push('      socket.off("'+(v.evento||"pingAll")+'");');
        arr.push("    };");
        arr.push("  }, [socket]);","");
        arr.push(cmt(opt,"botón pingAll: socket.emit con datos"));
        arr.push("  const enviarPing = () => {");
        arr.push('    socket.emit("'+(v.evento||"pingAll")+'", { mensaje: "Hola desde el cliente" });');
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <h1>Socket funcionando</h1>");
        arr.push("      <p>{isConnected ? \"🟢 Conectado al servidor\" : \"🔴 Desconectado\"}</p>");
        arr.push("      <button onClick={enviarPing}>Ping a todos</button>");
        arr.push("      <ul>");
        arr.push("        {mensajes.map((m, i) => (");
        arr.push("          <li key={i}>{JSON.stringify(m)}</li>");
        arr.push("        ))}");
        arr.push("      </ul>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/socket/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"pagChat",
      titulo:"Página /chat (joinRoom + sendMessage)",
      campos:[
        { id:"version", label:"Versión del hook", tipo:"select", default:"A", opciones:[{v:"A",l:"A · export default"},{v:"B",l:"B · export nombrado"}] },
        { id:"sala", label:"Parámetro de sala", tipo:"text", default:"sala", placeholder:"sala" },
        { id:"usuario", label:"Parámetro de usuario", tipo:"text", default:"usuario", placeholder:"usuario" }
      ],
      salida:(v,opt)=>{
        const imp = v.version==="A"
          ? 'import useSocket from "@/hooks/useSocket";'
          : 'import { useSocket } from "@/hooks/useSocket";';
        const call = v.version==="A"
          ? 'const { socket, isConnected } = useSocket({});'
          : 'const { socket, isConnected } = useSocket();';
        const arr=['"use client";', imp, 'import { useState, useEffect } from "react";', 'import { useSearchParams } from "next/navigation";',''];
        arr.push("export default function ChatPage(){");
        arr.push("  "+call);
        arr.push("  const searchParams = useSearchParams();");
        arr.push("  const "+(v.sala||"sala")+" = searchParams.get("+q(opt,v.sala||"sala")+");");
        arr.push("  const "+(v.usuario||"usuario")+" = searchParams.get("+q(opt,v.usuario||"usuario")+");");
        arr.push("  const [mensajes, setMensajes] = useState([]);");
        arr.push("  const [texto, setTexto] = useState(\"\");","");
        arr.push(cmt(opt,"unirme a la sala apenas tengo socket"));
        arr.push("  useEffect(() => {");
        if(v.version==="B") arr.push("    if (!socket) return; // ⚠️ Versión B: socket arranca null");
        arr.push("    socket.emit(\"joinRoom\", { room: "+(v.sala||"sala")+" });");
        arr.push("  }, [socket]);","");
        arr.push(cmtopt_guardar());
        function cmtopt_guardar(){ return cmt(opt,"escuchar newMessage y chat-messages, limpiar con socket.off"); }
        arr.push("  useEffect(() => {");
        if(v.version==="B") arr.push("    if (!socket) return;");
        arr.push("    const onNew = (data) => {");
        if(opt.tp1){
          arr.push("      setMensajes(prev => { const copia = []; prev.forEach(m => copia.push(m)); copia.push(data); return copia; });");
        } else {
          arr.push("      setMensajes(prev => [...prev, data]);");
        }
        arr.push("    };");
        arr.push("    const onJoin = (data) => console.log(\"entré a la sala:\", data);");
        arr.push("    socket.on(\"newMessage\", onNew);");
        arr.push("    socket.on(\"chat-messages\", onJoin);");
        arr.push("");
        arr.push("    return () => {");
        arr.push("      socket.off(\"newMessage\", onNew);");
        arr.push("      socket.off(\"chat-messages\", onJoin);");
        arr.push("    };");
        arr.push("  }, [socket]);","");
        arr.push("  const enviar = () => {");
        arr.push("    if (!texto) return;");
        arr.push("    socket.emit(\"sendMessage\", { texto, usuario: "+(v.usuario||"usuario")+" });");
        arr.push("    setTexto(\"\");");
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <h1>Sala: {"+(v.sala||"sala")+"}</h1>");
        arr.push("      <p>Usuario: {"+(v.usuario||"usuario")+"} · {isConnected ? \"🟢\" : \"🔴\"}</p>");
        arr.push("      <ul>");
        arr.push("        {mensajes.map((m, i) => (");
        arr.push("          <li key={i}>{JSON.stringify(m)}</li>");
        arr.push("        ))}");
        arr.push("      </ul>");
        arr.push("      <input type=\"text\" value={texto} onChange={e => setTexto(e.target.value)} placeholder=\"Mensaje...\" />");
        arr.push("      <button onClick={enviar}>Enviar</button>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/chat/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    },
    {
      id:"evFront",
      titulo:"Evento personalizado (front: emitir y escuchar)",
      campos:[
        { id:"emitir", label:"Evento a emitir", tipo:"text", default:"contador", placeholder:"contador" },
        { id:"escuchar", label:"Evento a escuchar", tipo:"text", default:"contadorUpdate", placeholder:"contadorUpdate" },
        { id:"estado", label:"Estado", tipo:"text", default:"contador", placeholder:"contador" }
      ],
      salida:(v,opt)=>{
        const st=normKey(v.estado)||"contador"; const set=setterName(st);
        const arr=['"use client";','import { useState, useEffect } from "react";', 'import useSocket from "@/hooks/useSocket"; // (ajustá según tu versión)',''];
        arr.push("export default function EventoPage(){");
        arr.push("  const { socket, isConnected } = useSocket({});");
        arr.push("  const ["+st+", "+set+"] = useState(0);","");
        arr.push("  useEffect(() => {");
        arr.push("    if (!socket) return;");
        arr.push('    socket.on("'+(v.escuchar||"respuesta")+'", (data) => {');
        arr.push("      "+set+"(data."+st+" ?? data);");
        arr.push("    });");
        arr.push("");
        arr.push("    return () => {");
        arr.push('      socket.off("'+(v.escuchar||"respuesta")+'");');
        arr.push("    };");
        arr.push("  }, [socket]);","");
        arr.push("  const enviar = () => {");
        arr.push('    socket.emit("'+(v.emitir||"evento")+'", { "+st+" });');
        arr.push("  };","");
        arr.push("  return (");
        arr.push("    <div>");
        arr.push("      <p>"+st+": {"+st+"}</p>");
        arr.push("      <button onClick={enviar}>Emitir "+(v.emitir||"evento")+"</button>");
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        return [{ archivo:"src/app/evento/page.js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    }
  ]
},

/* ============ 7 · Estilos ============ */
{
  id:"estilos",
  nombre:"Estilos: CSS Modules y clsx",
  generadores:[
    {
      id:"module",
      titulo:"Importar y usar un .module.css",
      campos:[
        { id:"componente", label:"Nombre del componente", tipo:"text", default:"NotaItem", placeholder:"NotaItem", validate:"pascal" },
        { id:"clases", label:"Clases (coma)", tipo:"text", default:"contenedor, nota", placeholder:"contenedor, nota" },
        { id:"donde", label:"Es", tipo:"select", default:"componente", opciones:[{v:"componente",l:"un componente (src/components/)"},{v:"pagina",l:"una página (src/app/<ruta>/)"}] },
        { id:"ruta", label:"Ruta (si es página)", tipo:"text", default:"notas", placeholder:"notas" }
      ],
      salida:(v,opt)=>{
        const N=pascal(v.componente)||"Componente";
        const clases=splitList(v.clases);
        const esPag = v.donde==="pagina";
        const cssFile = esPag ? "src/app/"+(v.ruta||"pagina")+"/page.module.css" : "src/components/"+N+".module.css";
        const jsFile  = esPag ? "src/app/"+(v.ruta||"pagina")+"/page.js" : "src/components/"+N+".js";
        const arr=[];
        arr.push('import styles from "./'+(esPag?"page":N)+'.module.css";');
        arr.push("");
        arr.push("export default function "+(esPag?pascal(v.ruta)+"Page":N)+"(){");
        arr.push("  return (");
        arr.push("    <div className={styles."+(clases[0]||"contenedor")+"}>");
        clases.slice(1).forEach(c=>{
          arr.push("      <span className={styles."+c+"}>{"+c+"}</span>");
        });
        arr.push("    </div>");
        arr.push("  );");
        arr.push("}");
        const css=L(clases.map(c=>"."+c+" {\n  /* TODO estilos de "+c+" */\n}"));
        return [
          { archivo:jsFile, lado:"FRONT", codigo:L(arr) },
          { archivo:cssFile, lado:"FRONT", codigo:css }
        ];
      }
    },
    {
      id:"clsx",
      titulo:"clsx — className condicional",
      campos:[
        { id:"componente", label:"Nombre del componente", tipo:"text", default:"Button", placeholder:"Button", validate:"pascal" },
        { id:"clases", label:"Clases (coma: base, condicionada)", tipo:"text", default:"boton, activo", placeholder:"boton, activo" },
        { id:"cond", label:"Condición (estado)", tipo:"text", default:"activo", placeholder:"activo" }
      ],
      salida:(v,opt)=>{
        const N=pascal(v.componente)||"Button";
        const cs=splitList(v.clases);
        const arr=[];
        arr.push('import clsx from "clsx"; // npm i clsx');
        arr.push('import styles from "./'+N+'.module.css";','');
        arr.push("export default function "+N+"({ "+(v.cond||"activo")+", children }){");
        arr.push("  return (");
        arr.push("    <button className={clsx("+cs.map((c,i)=>"styles."+c+(i===1?" && "+(v.cond||"activo"):"")).join(", ")+")}>");
        arr.push("      {children}");
        arr.push("    </button>");
        arr.push("  );");
        arr.push("}");
        arr.push("");
        arr.push(cmt(opt,"clsx arma \"boton activo\" solo si la condición es true; si no, solo \"boton\""));
        return [{ archivo:"src/components/"+N+".js", lado:"FRONT", codigo:L(withC(arr)) }];
      }
    }
  ]
}
];
