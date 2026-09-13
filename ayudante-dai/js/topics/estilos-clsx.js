/**
 * topics/estilos-clsx.js
 * Configuración del tema "Estilos con clsx"
 * Basado en README-estilos-clsx.md
 */

export const estilosClsxTopic = {
  id: 'estilos-clsx',
  nombre: 'Estilos con clsx',
  icono: '🎨',
  readmeFile: 'readmes/README-estilos-clsx.md',
  
  campos: [
    {
      id: 'nombreComponente',
      label: 'Nombre del componente al que se aplica el estilo',
      tipo: 'text',
      placeholder: 'ej: Button, Card, Page'
    },
    {
      id: 'clasesFijas',
      label: 'Clases fijas del .module.css (una por línea)',
      tipo: 'textarea',
      placeholder: 'ej:\nbutton\ncontainer\ntitle'
    },
    {
      id: 'clasesCondicionales',
      label: 'Clases condicionales (formato: nombreClase:propOEstado)',
      tipo: 'textarea',
      placeholder: 'ej:\nincrementar:crece\ndecrementar:!crece\nredondeado:redondo\nactivo:isActive'
    }
  ],

  generar: (valores) => {
    const { nombreComponente, clasesFijas, clasesCondicionales } = valores;

    // Validar nombre
    if (!nombreComponente || nombreComponente.trim() === '') {
      return '// Error: Ingresa un nombre para el componente';
    }

    // Parsear clases fijas
    const clasesFijasLista = parsearClasesFijas(clasesFijas);

    // Parsear clases condicionales
    const clasesCondicionalesLista = parsearClasesCondicionales(clasesCondicionales);

    return generarCodigoEstilos(nombreComponente, clasesFijasLista, clasesCondicionalesLista);
  }
};

/**
 * Parsea las clases fijas
 */
function parsearClasesFijas(texto) {
  if (!texto || texto.trim() === '') {
    return [];
  }

  return texto
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(linea => linea.trim());
}

/**
 * Parsea las clases condicionales
 */
function parsearClasesCondicionales(texto) {
  if (!texto || texto.trim() === '') {
    return [];
  }

  return texto
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(linea => {
      const partes = linea.split(':').map(p => p.trim());
      if (partes.length === 2) {
        const condicion = partes[1].startsWith('!') 
          ? { tipo: 'negacion', valor: partes[1].slice(1) }
          : { tipo: 'directo', valor: partes[1] };
        return { clase: partes[0], condicion };
      }
      return { clase: partes[0], condicion: { tipo: 'directo', valor: 'true' } };
    });
}

/**
 * Genera el código de estilos siguiendo README-estilos-clsx.md
 */
function generarCodigoEstilos(nombre, clasesFijas, clasesCondicionales) {
  const nombrePascal = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  const nombreLower = nombre.toLowerCase();

  // Generar archivo .module.css
  let cssContent = `/* ${nombrePascal}.module.css */\n\n`;

  if (clasesFijas.length > 0) {
    clasesFijas.forEach(clase => {
      cssContent += `.${clase} {
  /* Estilos para .${clase} */
}

`;
    });
  }

  if (clasesCondicionales.length > 0) {
    clasesCondicionales.forEach(cc => {
      cssContent += `.${cc.clase} {
  /* Clase condicional - se activa según la prop/estado */
}

`;
    });
  }

  // Generar componente JSX
  let jsxContent = `"use client"
import clsx from "clsx";
import styles from "./${nombrePascal}.module.css";

export default function ${nombrePascal}(props) {`;

  // Extraer todas las props necesarias de las condiciones
  const propsNecesarias = [...new Set(clasesCondicionales.map(cc => cc.condicion.valor))];
  
  if (propsNecesarias.length > 0) {
    jsxContent += `
  const { ${propsNecesarias.join(', ')} } = props;`;
  }

  // Construir className con clsx
  let classNameParts = [];
  
  // Clases fijas
  clasesFijas.forEach(clase => {
    classNameParts.push(`styles.${clase}`);
  });

  // Clases condicionales
  clasesCondicionales.forEach(cc => {
    if (cc.condicion.tipo === 'negacion') {
      classNameParts.push(`[styles.${cc.clase}]: !${cc.condicion.valor}`);
    } else {
      classNameParts.push(`[styles.${cc.clase}]: ${cc.condicion.valor}`);
    }
  });

  const classNameString = classNameParts.length > 0 
    ? `clsx(${classNameParts.join(', ')})`
    : `styles.${nombreLower}`;

  jsxContent += `

  return (
    <div className={${classNameString}}>
      {/* Contenido del componente ${nombrePascal} */}
      {/* Las clases se activan/desactivan según las props */}
    </div>
  );
}`;

  // Instrucciones de instalación
  const instrucciones = `

// ============================================
// INSTALACIÓN:
// ============================================
// Ejecutar en la terminal:
// npm i clsx
//
// ============================================
// ARCHIVOS GENERADOS:
// ============================================
// 1. ${nombrePascal}.module.css (copiar y pegar en ese archivo)
// 2. ${nombrePascal}.js (este código)
//
// ============================================
// CSS (${nombrePascal}.module.css):
// ============================================
${cssContent}
// ============================================
`;

  return jsxContent + instrucciones;
}
