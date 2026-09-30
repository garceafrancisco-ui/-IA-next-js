import re, io

tpl = open('super-dai.template.html').read()
css = open('css-neon.css').read()
helpers = open('helpers.js').read()
mapa = open('datos-mapa.js').read()
teoria = open('datos-teoria.js').read()
gens = open('datos-generadores.js').read()

def guard(script_body):
    # R6: escapar cualquier </script> dentro del JS embebido
    return script_body.replace('</script>', '<\\/script>')

out = tpl.replace('/*__CSS__*/', css)
js = helpers + "\n" + mapa + "\n" + teoria + "\n" + gens
out = out.replace('/*__HELPERS__*/\n\n/*__MAPA__*/\n\n/*__TEORIA__*/\n\n/*__GENERADORES__*/', guard(js))
assert '/*__' not in out, "quedaron marcadores sin reemplazar"
open('/workspace/super-dai.html','w').write(out)
print("OK bytes:", len(out))
