/**
 * topics/hooks.js
 * Configuración del tema "Hooks" (useState y useEffect)
 * Basado en README-hooks.md
 */

export const hooksTopic = {
  id: 'hooks',
  nombre: 'Hooks (useState / useEffect)',
  icono: '🪝',
  readmeFile: 'readmes/README-hooks.md',
  
  // Campos del formulario para el Generador
  campos: [
    {
      id: 'hookType',
      label: 'Tipo de hook',
      tipo: 'select',
      opciones: [
        { valor: 'useState', etiqueta: 'useState - Manejo de estado' },
        { valor: 'useEffect', etiqueta: 'useEffect - Efectos secundarios' }
      ],
      defaultValue: 'useState'
    },
    // Campos para useState
    {
      id: 'variableName',
      label: 'Nombre de la variable de estado',
      tipo: 'text',
      placeholder: 'ej: cuenta, usuario, lista',
      mostrarCuando: { campo: 'hookType', valor: 'useState' }
    },
    {
      id: 'valorInicial',
      label: 'Valor inicial',
      tipo: 'text',
      placeholder: 'ej: 0, "", [], {}',
      mostrarCuando: { campo: 'hookType', valor: 'useState' }
    },
    {
      id: 'tipoDato',
      label: 'Tipo de dato',
      tipo: 'select',
      opciones: ['number', 'string', 'boolean', 'array', 'objeto'],
      mostrarCuando: { campo: 'hookType', valor: 'useState' }
    },
    // Campos para useEffect
    {
      id: 'dependencias',
      label: 'Variables en el array de dependencias (separadas por coma)',
      tipo: 'text',
      placeholder: 'ej: cuenta, usuario o dejar vacío',
      mostrarCuando: { campo: 'hookType', valor: 'useEffect' }
    },
    {
      id: 'needsCleanup',
      label: '¿Necesita función de cleanup?',
      tipo: 'checkbox',
      mostrarCuando: { campo: 'hookType', valor: 'useEffect' }
    },
    {
      id: 'descripcion',
      label: 'Descripción corta de lo que hace (para comentario)',
      tipo: 'text',
      placeholder: 'ej: Se ejecuta cuando cambia la cuenta',
      mostrarCuando: { campo: 'hookType', valor: 'useEffect' }
    }
  ],

  /**
   * Función generadora de código
   * @param {Object} valores - Los valores del formulario
   * @returns {string} - Código JSX generado siguiendo README-hooks.md
   */
  generar: (valores) => {
    const { hookType } = valores;

    if (hookType === 'useState') {
      return generarUseState(valores);
    } else {
      return generarUseEffect(valores);
    }
  }
};

/**
 * Genera código para useState siguiendo README-hooks.md
 */
function generarUseState(valores) {
  const { variableName, valorInicial, tipoDato } = valores;
  
  // Validaciones básicas
  if (!variableName || variableName.trim() === '') {
    return '// Error: Ingresa un nombre para la variable de estado';
  }

  // Convertir a PascalCase para el setter (ej: cuenta -> setCuenta)
  const primerLetraMayus = variableName.charAt(0).toUpperCase() + variableName.slice(1);
  const setterName = `set${primerLetraMayus}`;

  // Formatear valor inicial según tipo de dato
  let valorFormateado = valorInicial || '0';
  if (tipoDato === 'array') {
    valorFormateado = '[]';
  } else if (tipoDato === 'objeto') {
    valorFormateado = '{}';
  } else if (tipoDato === 'boolean') {
    valorFormateado = valorInicial === 'true' ? 'true' : 'false';
  } else if (tipoDato === 'number') {
    valorFormateado = valorInicial || '0';
  } else if (tipoDato === 'string') {
    valorFormateado = valorInicial ? `"${valorInicial}"` : '""';
  }

  // Código generado siguiendo exactamente la sintaxis de README-hooks.md
  return `"use client"
import { useState } from "react";

export default function MiComponente() {
  // Estado: ${tipoDato || 'valor'} que puede cambiar durante la vida del componente
  const [${variableName}, ${setterName}] = useState(${valorFormateado});

  return (
    <div>
      {/* Usar la variable: {${variableName}} */}
      {/* Actualizar con: ${setterName}(nuevoValor) */}
      <h2>Valor actual: {${variableName}}</h2>
    </div>
  );
}`;
}

/**
 * Genera código para useEffect siguiendo README-hooks.md
 */
function generarUseEffect(valores) {
  const { dependencias, needsCleanup, descripcion } = valores;

  // Parsear dependencias (separadas por coma)
  const depsArray = dependencias 
    ? dependencias.split(',').map(d => d.trim()).filter(d => d !== '')
    : [];
  
  const depsString = depsArray.length > 0 ? `[${depsArray.join(', ')}]` : '[]';

  // Comentario descriptivo
  const comentario = descripcion || 'Efecto secundario';

  // Construir el cuerpo del useEffect
  let efectoBody = `    console.log('${comentario}');`;

  if (needsCleanup) {
    efectoBody += `

    // Cleanup function - se ejecuta al desmontar el componente
    return () => {
      console.log('Limpiando efecto...');
      // Aquí va el código de limpieza (ej: clearInterval, cancelar suscripciones, etc.)
    };`;
  }

  // Determinar si necesitamos ambos hooks o solo useEffect
  const importStatement = depsArray.length > 0 
    ? `import { useState, useEffect } from 'react';`
    : `import { useEffect } from 'react';`;

  // Variable de ejemplo para el estado (si hay dependencias)
  let estadoEjemplo = '';
  if (depsArray.length > 0) {
    const primeraDep = depsArray[0];
    estadoEjemplo = `
  const [${primeraDep}, set${primeraDep.charAt(0).toUpperCase() + primeraDep.slice(1)}] = useState(0);`;
  }

  // Código generado siguiendo exactamente la sintaxis de README-hooks.md
  return `"use client"
${importStatement}

export default function MiComponente() {${estadoEjemplo}

  // ${comentario}
  useEffect(() => {
${efectoBody}
  }, ${depsString}); // ${depsArray.length === 0 ? 'Solo se ejecuta al montar' : 'Se ejecuta cuando cambian las dependencias'}

  return (
    <div>
      {/* El efecto se ejecuta según las dependencias */}
    </div>
  );
}`;
}
