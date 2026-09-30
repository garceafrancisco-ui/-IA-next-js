
// =====================================================================
// ---------- MAPA DE CARPETAS (datos del "🗺️ Mapa de carpetas") --------
// =====================================================================
const MAPA_CARPETAS = {
  intro:"Árbol exacto del proyecto real del TP2 (Pio Socket). Cada archivo es clickeable: hace clic para ver qué va adentro. 🟣 magenta = BACK · 🔵 cyan = FRONT.",
  tree:[
    { line:"PROYECTO/", side:"plain" },
    { line:"├── backend/                      ← 🟣 BACK  (Node + Express + Socket.IO, puerto 4000)", side:"back", path:"backend/", info:"Carpeta del servidor Node.js. Se inicia con npm init -y y vive aparte del front. Puerto 4000 para sockets (TP2/Integrador) o 3001 para fetch puro." },
    { line:"│   ├── .gitignore                  (excluir node_modules y *.env)", side:"back", path:"backend/.gitignore", info:"Debe excluir node_modules/ y los archivos *.env (secretos)." },
    { line:"│   ├── index.js                    servidor, CORS, sesiones, eventos de socket", side:"back", path:"backend/index.js", info:"El servidor entero: express(), cors(), express-session(), server en el puerto, io(server, {cors}) y io.on(\"connection\") con joinRoom / pingAll / sendMessage / disconnect. ⚠️ En el apunte de fetch se llama app.js; es lo mismo, elegí uno." },
    { line:"│   ├── package.json", side:"back", path:"backend/package.json", info:"Dependencias del back: express, cors, socket.io, express-session, mysql2 (TP Integrador)." },
    { line:"│   ├── package-lock.json", side:"back", path:"backend/package-lock.json", info:"Lock automático de npm. No lo tocás." },
    { line:"│   ├── README.md", side:"back", path:"backend/README.md", info:"Instrucciones para correr el back." },
    { line:"│   └── modulos/", side:"back" },
    { line:"│       └── mysql.js                (solo TP Integrador: conexión a MySQL)", side:"back", path:"backend/modulos/mysql.js", info:"Crea el pool de mysql2/promise (host, user, password, database) y lo exporta con module.exports = pool. Lo importan los endpoints." },
    { line:"├── frontend/                     ← 🔵 FRONT (Next.js App Router, puerto 3000 / 3001)", side:"front", path:"frontend/", info:"Proyecto Next.js creado con npx create-next-app@latest. Dev normal en 3000; con dev:a/dev:b se levantan dos instancias (3000 y 3001)." },
    { line:"│   ├── .gitignore                  (excluir node_modules, .next y .next*)", side:"front", path:"frontend/.gitignore", info:"Ojo: con múltiples instancias hay que reemplazar .next/ por .next* para ignorar también .next-a y .next-b." },
    { line:"│   ├── eslint.config.mjs", side:"front", path:"frontend/eslint.config.mjs", info:"Config de ESLint que trae create-next-app." },
    { line:"│   ├── jsconfig.json", side:"front", path:"frontend/jsconfig.json", info:"Define el alias @/* → src/* (por eso importás @/components/Button)." },
    { line:"│   ├── next.config.mjs", side:"front", path:"frontend/next.config.mjs", info:"Config de Next. Para múltiples instancias agregar: distDir: process.env.NEXT_DIST_DIR || \".next\"." },
    { line:"│   ├── package.json", side:"front", path:"frontend/package.json", info:"Acá van los scripts dev:a / dev:b (cross-env) y las deps socket.io-client, clsx, reactjs-popup." },
    { line:"│   ├── package-lock.json", side:"front" },
    { line:"│   ├── README.md", side:"front" },
    { line:"│   ├── public/                     imágenes y archivos estáticos", side:"front", path:"frontend/public/", info:"Imágenes/fuentes servidas desde la raíz: /logo.png se usa como <img src=\"/logo.png\">." },
    { line:"│   └── src/", side:"front" },
    { line:"│       ├── app/                    ← cada CARPETA = una RUTA", side:"front", path:"src/app/", info:"App Router: la carpeta define la URL. src/app/page.js = \"/\", src/app/chat/page.js = \"/chat\". Cada page.js export default un componente." },
    { line:"│       │   ├── favicon.ico", side:"front" },
    { line:"│       │   ├── globals.css", side:"front", path:"src/app/globals.css", info:"CSS global: se importa en layout.js y aplica a todo el sitio." },
    { line:"│       │   ├── layout.js           layout raíz (recibe children)", side:"front", path:"src/app/layout.js", info:"Envuelve TODAS las páginas. Recibe { children } y renderiza <html><body>{children}</body></html>. Es Server Component por defecto (no lleva hooks)." },
    { line:"│       │   ├── page.js             ruta \"/\"", side:"front", path:"src/app/page.js", info:"La home. Acá se arma el formulario con los links (usuario + sala → router.push(\"/chat?...\"))." },
    { line:"│       │   ├── page.module.css", side:"front", path:"src/app/page.module.css", info:"Estilos de la home (en TP1 el docente provee Home.module.css y va ACÁ con ese nombre)." },
    { line:"│       │   ├── socket/", side:"front" },
    { line:"│       │   │   └── page.js         ruta \"/socket\"", side:"front", path:"src/app/socket/page.js", info:"Página de prueba del WebSocket: muestra isConnected con ternario, botón pingAll con socket.emit y escucha con socket.on dentro de useEffect([socket]). Lleva \"use client\"." },
    { line:"│       │   └── chat/", side:"front" },
    { line:"│       │       └── page.js         ruta \"/chat\"", side:"front", path:"src/app/chat/page.js", info:"Chat: lee sala y usuario con useSearchParams, hace socket.emit(\"joinRoom\", { room }), input+botón sendMessage, escucha newMessage y chat-messages, cleanup con socket.off." },
    { line:"│       ├── components/             Button.js, Title.js, Form.js, etc. (+ sus .module.css)", side:"front", path:"src/components/", info:"Componentes reutilizables en PascalCase. Import con @/components/Nombre. ⚠️ El apunte de compuestos usa src/app/components/: fijate qué convención pide tu consigna." },
    { line:"│       └── hooks/", side:"front" },
    { line:"│           └── useSocket.js", side:"front", path:"src/hooks/useSocket.js", info:"El hook de la conexión Socket.IO. ⚠️ EXISTEN DOS VERSIONES (A: export default con objeto / B: export nombrado con dos parámetros). Ver tema WebSockets." },
    { line:"└── docs/                         (solo TP Integrador)", side:"plain", path:"docs/", info:"Documentación del TP Integrador." },
    { line:"    ├── script.sql                  creación de tablas + inserts de ejemplo", side:"plain", path:"docs/script.sql", info:"CREATE TABLE + INSERTs para levantar la base de prueba." },
    { line:"    └── DER.(drawio/png/pdf)", side:"plain", path:"docs/DER", info:"Diagrama Entidad-Relación de la base." }
  ],
  reglas:[
    ["¿Es una **página**?", "`src/app/<ruta>/page.js` (carpeta con el nombre de la ruta)"],
    ["¿Es un **layout**?", "`src/app/<ruta>/layout.js`"],
    ["¿Es un **componente reutilizable**?", "`src/components/NombreComponente.js` (PascalCase)"],
    ["¿Es un **hook propio**?", "`src/hooks/useAlgo.js`"],
    ["¿Son **estilos de un componente**?", "`src/components/Nombre.module.css`; de una página → `src/app/<ruta>/page.module.css`"],
    ["¿Es el **servidor**?", "`backend/index.js` (o `app.js`, ver ⚠️ nombre del archivo principal)"]
  ],
  backFront:[
    ["Componentes básicos / compuestos","—","`src/components/*.js`, `src/app/<ruta>/page.js`"],
    ["Hooks (useState, useEffect), Event, Conditional Rendering","—","Todo en el front, con `\"use client\"`"],
    ["Fetch y métodos HTTP","`backend/index.js` (o `app.js`): endpoints `GET/POST/PUT/DELETE`, `cors()`, `express.json()`","`fetch(...)` dentro de `useEffect` / handlers en la página o componente"],
    ["Router","—","`useRouter`, `useSearchParams`, `<Link>` (de `next/navigation` y `next/link`)"],
    ["WebSockets","`socket.io` en el servidor: `io.on(\"connection\")`, `joinRoom`, `pingAll`, `sendMessage`, `disconnect`; sesiones; CORS","`src/hooks/useSocket.js` + `socket.emit` / `socket.on` en las páginas"],
    ["Base de datos (MySQL)","`backend/modulos/mysql.js` (o `db.js`) + endpoints que consultan","El front **nunca** habla con la base: siempre `fetch` a la API"]
  ],
  flujos:[
    { t:"h3", x:"HTTP (fetch)" },
    { parts:[ {t:"Frontend Next.js (:3000)", lado:"FRONT"}, {arrow:"→ fetch() →"}, {t:"Backend Express (:3001 o :4000)", lado:"BACK"}, {arrow:"→ SQL →"}, {t:"Base de datos (MySQL)", lado:"BACK"} ] },
    { t:"p", x:"HTTP abre y cierra la conexión por cada dato enviado/recibido: solo el cliente pide, el servidor nunca inicia comunicación ni notifica cambios por sí mismo." },
    { t:"h3", x:"WebSocket (Socket.IO)" },
    { parts:[ {t:"Cliente (front)", lado:"FRONT"}, {arrow:"⇄ handshake ⇄"}, {t:"Servidor (back)", lado:"BACK"} ] },
    { t:"p", x:"Un solo canal abierto permanente: bidireccional (ambos lados mandan cuando quieren), tiempo real y broadcast (io.emit a todos / io.to(sala).emit a la room)." }
  ],
  notaPuertos:"⚠️ Puertos: fetch/Express de los apuntes usa back 3001 y front 3000. Sockets/TP2/Integrador usa back 4000 y front 3000 + 3001 (dos instancias). Si usás el back de fetch en 3001 Y además la segunda instancia del front en 3001, pelean por el puerto: mové alguno (los puertos son inputs en los generadores).",
  estilosTP1:[
    ["`NotaInput.module.css`","`src/components/NotaInput.module.css`"],
    ["`NotaItem.module.css`","`src/components/NotaItem.module.css`"],
    ["`ListaNotas.module.css`","`src/components/ListaNotas.module.css`"],
    ["`Home.module.css`","`src/app/page.module.css`"],
    ["`Notas.module.css`","`src/app/notas/page.module.css`"]
  ]
};
