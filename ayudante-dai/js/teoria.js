/**
 * teoria.js
 * Fetch del README activo y render con marked.parse()
 */

import { createCodeBlock } from './codeBlock.js';

/**
 * Renderiza la teoría (README) de un tema
 * @param {Object} topic - La configuración del tema activo
 * @returns {Promise<void>}
 */
export async function renderTeoria(topic) {
  const contentArea = document.getElementById('content-area');
  
  if (!contentArea) {
    console.error('No se encontró el elemento #content-area');
    return;
  }

  if (!topic || !topic.readmeFile) {
    contentArea.innerHTML = '<p class="text-danger">Error: No hay README disponible para este tema</p>';
    return;
  }

  // Mostrar estado de carga
  contentArea.innerHTML = '<p>Cargando teoría...</p>';

  try {
    // Fetch del archivo README
    const response = await fetch(topic.readmeFile);
    
    if (!response.ok) {
      throw new Error(`Error al cargar ${topic.readmeFile}: ${response.status}`);
    }

    const markdownText = await response.text();

    // Parsear markdown a HTML usando marked
    const htmlContent = marked.parse(markdownText);

    // Crear contenedor para el contenido
    const wrapper = document.createElement('div');
    wrapper.className = 'markdown-content';
    wrapper.innerHTML = htmlContent;

    // Procesar todos los bloques de código para agregar botón "Copiar"
    procesarCodeBlocks(wrapper);

    // Limpiar y renderizar
    contentArea.innerHTML = '';
    contentArea.appendChild(wrapper);

  } catch (error) {
    console.error('Error al cargar el README:', error);
    contentArea.innerHTML = `
      <div class="text-danger">
        <h3>Error al cargar la teoría</h3>
        <p>No se pudo cargar el archivo: ${topic.readmeFile}</p>
        <p><strong>Importante:</strong> Esta app necesita correr con un servidor local (no abrir el archivo directo con file://) por el tema de CORS + fetch.</p>
        <p>Usá la extensión "Live Server" de VSCode o ejecutá <code>npx serve</code> en la terminal.</p>
      </div>
    `;
  }
}

/**
 * Procesa los bloques de código del markdown y les agrega el botón "Copiar"
 * @param {HTMLElement} container - El contenedor con el HTML renderizado
 */
function procesarCodeBlocks(container) {
  const preElements = container.querySelectorAll('pre');

  preElements.forEach(pre => {
    // Extraer el código del bloque
    const codeElement = pre.querySelector('code');
    const code = codeElement ? codeElement.textContent : pre.textContent;

    // Determinar el lenguaje (marked lo pone en la clase)
    let language = 'javascript';
    if (codeElement && codeElement.className) {
      const match = codeElement.className.match(/language-(\w+)/);
      if (match) {
        language = match[1];
      }
    }

    // Reemplazar el pre con nuestro code block personalizado
    const codeBlock = createCodeBlock(code, language);
    pre.parentNode.replaceChild(codeBlock, pre);
  });
}
