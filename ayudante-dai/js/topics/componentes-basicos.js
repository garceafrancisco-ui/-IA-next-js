/**
 * topics/componentes-basicos.js
 * Configuración del tema "Componentes básicos"
 * Basado en README-componentes-basicos.md
 */

export const componentesBasicosTopic = {
  id: 'componentes-basicos',
  nombre: 'Componentes básicos',
  icono: '🧱',
  readmeFile: 'readmes/README-componentes-basicos.md',
  
  campos: [
    {
      id: 'nombreComponente',
      label: 'Nombre del componente (PascalCase)',
      tipo: 'text',
      placeholder: 'ej: Button, Title, UserProfile'
    },
    {
      id: 'ubicacion',
      label: 'Ubicación',
      tipo: 'select',
      opciones: [
        { valor: 'components', etiqueta: 'src/components (Componente reutilizable)' },
        { valor: 'app', etiqueta: 'src/app (Página/ruta)' }
      ],
      defaultValue: 'components'
    },
    {
      id: 'needsUseClient',
      label: '¿Necesita "use client"? (tiene eventos o hooks)',
      tipo: 'checkbox'
    },
    {
      id: 'tieneChildren',
      label: '¿Usa la prop children?',
      tipo: 'checkbox'
    },
    {
      id: 'propsLista',
      label: 'Props (una por línea, formato: nombre o nombre:tipo)',
      tipo: 'textarea',
      placeholder: 'ej:\nonClick\nchildren\ntitle:string\nisActive:boolean'
    }
  ],

  generar: (valores) => {
    const { 
      nombreComponente, 
      ubicacion, 
      needsUseClient, 
      tieneChildren, 
      propsLista 
    } = valores;

    // Validar nombre
    if (!nombreComponente || nombreComponente.trim() === '') {
      return '// Error: Ingresa un nombre para el componente';
    }

    // Forzar PascalCase
    const nombrePascal = toPascalCase(nombreComponente);

    // Parsear props
    const props = parsearProps(propsLista, tieneChildren);

    // Determinar ruta según ubicación
    const ruta = ubicacion === 'app' 
      ? `src/app/${nombreComponente.toLowerCase()}/page.js`
      : `src/components/${nombrePascal}.js`;

    // Generar código
    return generarCodigoComponente(nombrePascal, ubicacion, needsUseClient, props, ruta);
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
 * Parsea la lista de props del textarea
 */
function parsearProps(texto, incluirChildren) {
  if (!texto || texto.trim() === '') {
    return incluirChildren ? ['children'] : [];
  }

  const lineas = texto.split('\n').filter(l => l.trim() !== '');
  const props = lineas.map(linea => {
    const partes = linea.split(':').map(p => p.trim());
    if (partes.length === 2) {
      return { nombre: partes[0], tipo: partes[1] };
    }
    return { nombre: partes[0], tipo: null };
  });

  if (incluirChildren && !props.find(p => p.nombre === 'children')) {
    props.push({ nombre: 'children', tipo: null });
  }

  return props;
}

/**
 * Genera el código del componente siguiendo README-componentes-basicos.md
 */
function generarCodigoComponente(nombre, ubicacion, needsUseClient, props, ruta) {
  const hasProps = props.length > 0;
  
  // Desestructuración de props
  const propsDesestructuradas = hasProps 
    ? `{ ${props.map(p => p.nombre).join(', ')} }`
    : '';

  // Comentario sobre children si está presente
  const childrenComment = props.find(p => p.nombre === 'children')
    ? '\n  // children: contenido entre las etiquetas del componente'
    : '';

  // Código base del componente
  let codigo = '';

  if (needsUseClient) {
    codigo += `"use client"\n`;
  }

  if (hasProps) {
    codigo += `import { useState } from 'react';\n\n`;
  }

  codigo += `export default function ${nombre}(${propsDesestructuradas}) {${childrenComment}
  return (
    <div>
      {/* Contenido del componente ${nombre} */}
      <h1>${nombre}</h1>`;

  if (props.find(p => p.nombre === 'children')) {
    codigo += `
      {children}`;
  }

  codigo += `
    </div>
  );
}`;

  // Agregar comentarios explicativos
  const comentarioFinal = `

// ============================================
// Instrucciones de uso:
// ============================================
// Archivo: ${ruta}
//
// Para usar este componente en otra página:
// import ${nombre} from '${ubicacion === 'components' ? '@/components/' : '../'}${nombre}';
//
// <${nombre}${hasProps ? ' prop1={valor}' : ''} />
// ============================================
`;

  return codigo + comentarioFinal;
}
