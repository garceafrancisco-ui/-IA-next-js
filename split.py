import io, sys

src = open('/workspace/super-dai.html', encoding='utf-8').read()
lines = src.split('\n')  # 0-based; file line N = lines[N-1]

def seg(a, b):  # inclusive file line numbers
    return '\n'.join(lines[a-1:b])

CSS      = seg(7,163)     # <style> ... </style>
HEAD_A   = seg(1,6)       # doctype/head/meta/title
HELPERS  = seg(202,258)   # helpers L,q,cmt... (sin encabezado de comentario)
MAPA     = seg(260,337)   # MAPA_CARPETAS
TEORIA   = seg(339,1285)  # comentario zona + const TEORIA = [ ... } ];
GENS_HDR = seg(1288,1293) # comentario zona generadores
GENS     = 'const GENERADORES = [' + '\n' + seg(1294, len(lines)) # placeholder, reemplazado abajo

# hallar fin de GENERADORES: la linea que es exactamente "}];" antes del motor
motor_start = None
for i,l in enumerate(lines):
    if l.startswith('   ============================  MOTOR'):
        motor_start = i+1  # 1-based of that comment continuation line
        break
assert motor_start, 'no motor'
# buscar el cierre "};" de GENERADORES antes del motor
gen_end = None
for i in range(motor_start-1, 0, -1):
    if lines[i-1].strip() == '}];':
        gen_end = i-1  # 0-based index of that line? careful
        break
# simpler: find last occurrence of "\n}];\n" before motor block
idx_motor = src.index('/* =====')  # no
# Instead locate the motor by its known text:
mpos = src.index('============================  MOTOR (no tocar)  =====================')
gclose_pos = src.rindex('\n}];\n', 0, mpos)
GENS_BODY = src[src.index('const GENERADORES = [')+len('const GENERADORES = ['):gclose_pos]
MOTOR_START_LINE = src[:mpos].rindex('<script>')  # not needed

# MOTOR: from "var state =" to just before "</script>"
mp = src.index('var state = {')
sp = src.index('</script>', mp)
MOTOR = src[mp:sp]

TOPBAR_T = '''  <div class="topbar">
    <div class="main-tabs" role="tablist">
      <a class="mtab active" href="teoria.html">📘 TEORÍA</a>
      <a class="mtab" href="generador.html">⚡ GENERADOR</a>
    </div>
    <span class="legend"><span class="badge back">🟣 BACK</span><span class="badge front">🔵 FRONT</span></span>
    <div class="searchbox">
      <input id="buscador" type="text" placeholder="🔍 Buscar temas y contenido… (tocá / para enfocar)" autocomplete="off">
    </div>
  </div>'''

TOPBAR_G = TOPBAR_T.replace('<a class="mtab active" href="teoria.html">📘 TEORÍA</a>\n      <a class="mtab" href="generador.html">⚡ GENERADOR</a>',
               '<a class="mtab" href="teoria.html">📘 TEORÍA</a>\n      <a class="mtab active" href="generador.html">⚡ GENERADOR</a>')

OPTGROUP = '''    <div class="optgroup">
      <label title="Comentarios en el código generado"><input type="checkbox" id="optComentarios" checked> ☑ Comentarios</label>
      <label title="Comillas del código generado"><input type="checkbox" id="optDobles" checked> Comillas "dobles"</label>
      <label title="TP1: prohibido map/filter/find → usa for/forEach + push"><input type="checkbox" id="optTp1"> Modo TP1 (sin map/filter/find)</label>
    </div>'''

ARRANQUE_T = '''loadState();
if(state.sec!=="teoria"){ state.sec="teoria"; state.tema="mapa"; }
renderAll();
'''

ARRANQUE_G = '''loadState();
document.getElementById("optComentarios").checked=opts.comentarios;
document.getElementById("optDobles").checked=opts.doubles;
document.getElementById("optTp1").checked=opts.tp1;
if(state.sec!=="gen"){ state.sec="gen"; }
renderAll();
'''

# ARRANQUE_G debe incluir todo el bloque de listeners del final del MOTOR menos las dos líneas tabTeoria/tabGen
# El MOTOR contiene esas dos addEventListener; las quitamos:
TABS_LISTENERS = '''document.getElementById("tabTeoria").addEventListener("click",function(){ state.sec="teoria"; state.tema="mapa"; saveState(); renderAll(); });
document.getElementById("tabGen").addEventListener("click",function(){ state.sec="gen"; state.tema=GENERADORES[0].id; saveState(); renderAll(); });
'''
assert TABS_LISTENERS in MOTOR
MOTOR_CLEAN = MOTOR.replace(TABS_LISTENERS, '')
# quitar el arranque original (desde loadState(); hasta el final del MOTOR)
lp = MOTOR_CLEAN.index('loadState();')
MOTOR_BODY = MOTOR_CLEAN[:lp]

def build(title, subtitle, topbar, extra_opts, data_js, arr_js):
    html = []
    html.append('''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>''' + title + '''</title>
''')
    html.append(CSS)
    html.append('''</head>
<body>
<div class="wrap">
  <h1 class="app-title flicker">⚡ SÚPER ARCHIVO DAI</h1>
  <p class="app-sub">''' + subtitle + ''' — funciona 100% offline (doble clic). Atajo: <b>/</b> busca.</p>

''')
    html.append(topbar)
    if extra_opts:
        # insertar optgroup dentro del topbar (antes del cierre)
        h = '\n'.join(html)
        h = h.replace('  </div>\n\n  <select', extra_opts + '\n  </div>\n\n  <select')
        html = [h]
    html.append('''
  <select id="mobileNav" class="mobilenav" aria-label="Elegir tema"></select>

  <div class="layout">
    <nav id="sidebar" class="sidebar" aria-label="Temas"></nav>
    <main id="content"></main>
  </div>
</div>
<div id="toast" class="toast" role="status" aria-live="polite"></div>

<script>
"use strict";
/* =====================================================================
   SÚPER ARCHIVO DAI — ''' + title + ''' — un solo HTML, sin CDN, sin servidor.
   Motor genérico abajo; los DATOS están en las constantes marcadas.
   ===================================================================== */

''')
    html.append(HELPERS)
    html.append('\n\n')
    html.append(data_js)
    html.append('''

/* =====================================================================
   ============================  MOTOR (no tocar)  =====================
   ===================================================================== */
''')
    html.append(MOTOR_BODY)
    html.append(arr_js)
    html.append('</script>\n</body>\n</html>\n')
    return ''.join(html)

# ---- teoria.html ----
data_t = MAPA + '\n\n' + TEORIA
open('/workspace/teoria.html','w',encoding='utf-8').write(
  build('📘 DAI — Teoría (offline)',
        '5ta Informática · Instituto Pío IX · Sección TEORÍA',
        TOPBAR_T, '', data_t, ARRANQUE_T))

# ---- generador.html ----
data_g = GENS_HDR + '\n' + 'const GENERADORES = [' + GENS_BODY + '\n}];'
open('/workspace/generador.html','w',encoding='utf-8').write(
  build('⚡ DAI — Generador de código (offline)',
        '5ta Informática · Instituto Pío IX · Sección GENERADOR DE CÓDIGO',
        TOPBAR_G, OPTGROUP, data_g, ARRANQUE_G))

print('OK')
