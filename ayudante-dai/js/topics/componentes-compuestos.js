/**
 * topics/componentes-compuestos.js
 * Configuración del tema "Componentes compuestos"
 * Basado en README-componentes-compuestos.md
 */

export const componentesCompuestosTopic = {
  id: 'componentes-compuestos',
  nombre: 'Componentes compuestos',
  icono: '🧩',
  readmeFile: 'readmes/README-componentes-compuestos.md',
  
  campos: [
    {
      id: 'nombreComponente',
      label: 'Nombre del componente compuesto (PascalCase)',
      tipo: 'text',
      placeholder: 'ej: Form, Card, UserProfile'
    },
    {
      id: 'subComponentes',
      label: 'Sub-componentes que lo forman (uno por línea)',
      tipo: 'textarea',
      placeholder: 'ej:\nButton\nTitle\nInput'
    },
    {
      id: 'propsReenvio',
      label: 'Props que se reenvían a los hijos (formato: propDestino:propOrigen)',
      tipo: 'textarea',
      placeholder: 'ej:\nonClick:onButtonClick\ntext:title\nchildren:children'
    }
  ],

  generar: (valores) => {
    const { nombreComponente, subComponentes, propsReenvio } = valores;

    // Validar nombre
    if (!nombreComponente || nombreComponente.trim() === '') {
      return '// Error: Ingresa un nombre para el componente compuesto';
    }

    // Forzar PascalCase
    const nombrePascal = toPascalCase(nombreComponente);

    // Parsear sub-componentes
    const subComponentesLista = parsearSubComponentes(subComponentes);

    // Parsear props de reenvío
    const propsMap = parsearPropsReenvio(propsReenvio);

    return generarCodigoCompuesto(nombrePascal, subComponentesLista, propsMap);
  }
};

/**
 * Convierte cualquier string a PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^./, char => char.toUpperCase());
}

/**
 * Parsea la lista de sub-componentes
 */
function parsearSubComponentes(texto) {
  if (!texto || texto.trim() === '') {
    return [];
  }

  return texto
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(linea => {
      const nombre = linea.trim();
      return {
        nombre,
        nombrePascal: toPascalCase(nombre),
        variable: nombre.charAt(0).toLowerCase() + nombre.slice(1)
      };
    });
}

/**
 * Parsea las props de reenvío
 */
function parsearPropsReenvio(texto) {
  if (!texto || texto.trim() === '') {
    return [];
  }

  return texto
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(linea => {
      const partes = linea.split(':').map(p => p.trim());
      if (partes.length === 2) {
        return { destino: partes[0], origen: partes[1] };
      }
      return { destino: partes[0], origen: partes[0] };
    });
}

/**
 * Genera el código del componente compuesto siguiendo README-componentes-compuestos.md
 */
function generarCodigoCompuesto(nombre, subComponentes, propsReenvio) {
  if (subComponentes.length === 0) {
    return `// Error: Agrega al menos un sub-componente`;
  }

  // Generar imports
  const imports = subComponentes
    .map(sub => `import ${sub.nombrePascal} from "./${sub.nombrePascal}";`)
    .join('\n');

  // Generar props del componente padre
  const todasProps = [...new Set(propsReenvio.map(p => p.origen))];
  const propsDesestructuradas = todasProps.length > 0 
    ? `{ ${todasProps.join(', ')} }` 
    : '';

  // Generar JSX de los sub-componentes
  const subComponentesJSX = subComponentes.map(sub => {
    const propsParaEste = propsReenvio.filter(p => p.destino.toLowerCase().includes(sub.nombre.toLowerCase()) || p.origen.toLowerCase().includes(sub.nombre.toLowerCase()));
    
    if (propsParaEste.length === 0) {
      return `      <${sub.nombrePascal} />`;
    }

    const propsString = propsParaEste
      .map(p => `${p.destino}={${p.origen}}`)
      .join(' ');
    
    return `      <${sub.nombrePascal} ${propsString} />`;
  }).join('\n');

  const codigo = `${imports}

export default function ${nombre}(${propsDesestructuradas}) {
  return (
    <div className="${nombre.toLowerCase()}-container">
      {/* Componente compuesto: ${nombre} */}
      {/* Combina múltiples sub-componentes */}
${subComponentesJSX}
    </div>
  );
}`;

  const comentarioFinal = `

// ============================================
// Instrucciones de uso:
// ============================================
// Archivo: src/components/${nombre}.js
//
// Este componente compuesto combina:
${subComponentes.map(s => `// - ${s.nombrePascal}`).join('\n')}
//
// Para usarlo en una página:
// import ${nombre} from '@/components/${nombre}';
//
// <${nombre} ${todasProps.map(p => `${p}={valor}`).join(' ')} />
// ============================================
`;

  return codigo + comentarioFinal;
}
