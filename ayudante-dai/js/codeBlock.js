/**
 * codeBlock.js
 * Helper para crear bloques de código con botón "Copiar"
 * Se usa tanto en teoria.js como en generador.js
 */

/**
 * Crea un bloque de código con botón de copiar
 * @param {string} code - El código a mostrar
 * @param {string} language - Lenguaje para sintaxis (ej: 'jsx', 'javascript', 'css')
 * @returns {HTMLElement} - El wrapper del bloque de código
 */
export function createCodeBlock(code, language = 'javascript') {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block-wrapper';

  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');
  codeEl.textContent = code;

  if (language) {
    codeEl.className = `language-${language}`;
  }

  pre.appendChild(codeEl);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'Copiar';

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.textContent = '¡Copiado!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
        copyBtn.classList.remove('copied');
      }, 1500);
    } catch (err) {
      console.error('Error al copiar:', err);
      copyBtn.textContent = 'Error';
      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
      }, 1500);
    }
  });

  wrapper.appendChild(pre);
  wrapper.appendChild(copyBtn);

  return wrapper;
}
