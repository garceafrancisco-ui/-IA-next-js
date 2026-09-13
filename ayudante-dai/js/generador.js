/**
 * generador.js
 * Arma el formulario dinámico según la config del tema activo y ejecuta su función generar()
 */

import { createCodeBlock } from './codeBlock.js';

/**
 * Renderiza el formulario del generador para un tema
 * @param {Object} topic - La configuración del tema activo
 * @returns {HTMLElement} - El contenedor del formulario
 */
export function renderGenerador(topic) {
  const contentArea = document.getElementById('content-area');
  
  if (!contentArea) {
    console.error('No se encontró el elemento #content-area');
    return;
  }

  if (!topic || !topic.campos || topic.campos.length === 0) {
    contentArea.innerHTML = '<p class="text-danger">Error: No hay campos configurados para este tema</p>';
    return;
  }

  // Crear contenedor principal
  const wrapper = document.createElement('div');
  wrapper.className = 'generator-wrapper';

  // Crear formulario
  const form = document.createElement('form');
  form.className = 'generator-form';
  form.dataset.topicId = topic.id;

  // Generar campos
  topic.campos.forEach(campo => {
    const formGroup = crearCampo(campo);
    form.appendChild(formGroup);
  });

  // Botón de generar
  const generateBtn = document.createElement('button');
  generateBtn.type = 'button';
  generateBtn.className = 'generate-btn';
  generateBtn.textContent = 'Generar código';
  
  generateBtn.addEventListener('click', () => {
    const valores = recolectarValores(topic.campos);
    const codigo = topic.generar(valores);
    mostrarCodigoGenerado(codigo, wrapper);
  });

  form.appendChild(generateBtn);
  wrapper.appendChild(form);

  // Sección para mostrar el código generado (inicialmente oculta)
  const generatedSection = document.createElement('div');
  generatedSection.className = 'generated-code-section hidden';
  generatedSection.id = 'generated-code-section';
  wrapper.appendChild(generatedSection);

  // Limpiar y renderizar
  contentArea.innerHTML = '';
  contentArea.appendChild(wrapper);

  // Agregar listeners para campos condicionales
  agregarListenersCondicionales(topic.campos);
}

/**
 * Crea un campo del formulario según su tipo
 */
function crearCampo(campo) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.dataset.campoId = campo.id;

  if (campo.mostrarCuando) {
    group.classList.add('conditional-field');
    group.dataset.mostrarCuandoCampo = campo.mostrarCuando.campo;
    group.dataset.mostrarCuandoValor = campo.mostrarCuando.valor;
  }

  const label = document.createElement('label');
  label.htmlFor = campo.id;
  label.textContent = campo.label;
  group.appendChild(label);

  let input;

  if (campo.tipo === 'select') {
    input = document.createElement('select');
    input.id = campo.id;
    input.name = campo.id;
    
    if (campo.defaultValue) {
      input.value = campo.defaultValue;
    }

    campo.opciones.forEach(opcion => {
      const option = document.createElement('option');
      option.value = typeof opcion === 'string' ? opcion : opcion.valor;
      option.textContent = typeof opcion === 'string' ? opcion : opcion.etiqueta;
      input.appendChild(option);
    });

  } else if (campo.tipo === 'checkbox') {
    group.classList.add('checkbox-group');
    input = document.createElement('input');
    input.type = 'checkbox';
    input.id = campo.id;
    input.name = campo.id;
    
    if (campo.defaultValue) {
      input.checked = campo.defaultValue;
    }

  } else if (campo.tipo === 'textarea') {
    input = document.createElement('textarea');
    input.id = campo.id;
    input.name = campo.id;
    input.placeholder = campo.placeholder || '';
    input.rows = 4;

  } else {
    // text, number, etc.
    input = document.createElement('input');
    input.type = campo.tipo || 'text';
    input.id = campo.id;
    input.name = campo.id;
    input.placeholder = campo.placeholder || '';
    
    if (campo.defaultValue) {
      input.value = campo.defaultValue;
    }
  }

  group.appendChild(input);
  return group;
}

/**
 * Recolecta los valores de todos los campos del formulario
 */
function recolectarValores(campos) {
  const valores = {};

  campos.forEach(campo => {
    const element = document.getElementById(campo.id);
    
    if (!element) {
      // Campo condicional no visible, usar valor por defecto o null
      valores[campo.id] = campo.defaultValue || null;
      return;
    }

    if (campo.tipo === 'checkbox') {
      valores[campo.id] = element.checked;
    } else {
      valores[campo.id] = element.value;
    }
  });

  return valores;
}

/**
 * Muestra el código generado con botón de copiar
 */
function mostrarCodigoGenerado(codigo, wrapper) {
  let section = wrapper.querySelector('#generated-code-section');
  
  if (!section) {
    section = document.createElement('div');
    section.className = 'generated-code-section';
    section.id = 'generated-code-section';
    wrapper.appendChild(section);
  }

  section.classList.remove('hidden');
  section.innerHTML = '<h3>Código generado:</h3>';

  const codeBlock = createCodeBlock(codigo, 'jsx');
  section.appendChild(codeBlock);

  // Scroll suave hacia el código generado
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * Agrega listeners para mostrar/ocultar campos condicionales
 */
function agregarListenersCondicionales(campos) {
  const conditionalFields = document.querySelectorAll('.conditional-field');
  
  conditionalFields.forEach(field => {
    const triggerFieldId = field.dataset.mostrarCuandoCampo;
    const triggerValue = field.dataset.mostrarCuandoValor;
    
    const triggerElement = document.getElementById(triggerFieldId);
    
    if (triggerElement) {
      const updateVisibility = () => {
        const currentValue = triggerElement.type === 'checkbox' 
          ? triggerElement.checked 
          : triggerElement.value;
        
        if (currentValue === triggerValue) {
          field.classList.remove('hidden');
        } else {
          field.classList.add('hidden');
        }
      };

      triggerElement.addEventListener('change', updateVisibility);
      triggerElement.addEventListener('input', updateVisibility);
      
      // Ejecutar una vez al inicio
      updateVisibility();
    }
  });
}
