/**
 * sidebar.js
 * Genera la lista de temas en el sidebar y maneja la navegación
 */

import { TOPICS } from './topics/index.js';

const ICONS = {
  hooks: '🪝',
  'componentes-basicos': '🧱',
  'componentes-compuestos': '🧩',
  'estilos-clsx': '🎨'
};

/**
 * Renderiza la lista de temas en el sidebar
 * @param {Function} onTopicSelect - Callback cuando se selecciona un tema
 */
export function renderSidebar(onTopicSelect) {
  const topicsList = document.getElementById('topics-list');
  
  if (!topicsList) {
    console.error('No se encontró el elemento #topics-list');
    return;
  }

  topicsList.innerHTML = '';

  TOPICS.forEach((topic, index) => {
    const li = document.createElement('li');
    
    const item = document.createElement('a');
    item.className = 'topic-item';
    item.href = '#';
    item.dataset.topicId = topic.id;
    
    const icono = ICONS[topic.id] || topic.icono || '📄';
    
    item.innerHTML = `
      <span class="icon">${icono}</span>
      <span class="label">${topic.nombre}</span>
    `;
    
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remover clase active de todos los items
      document.querySelectorAll('.topic-item').forEach(el => {
        el.classList.remove('active');
      });
      
      // Agregar clase active al item seleccionado
      item.classList.add('active');
      
      // Llamar al callback con el tema seleccionado
      onTopicSelect(topic);
    });
    
    li.appendChild(item);
    topicsList.appendChild(li);
    
    // Activar el primer tema por defecto
    if (index === 0) {
      item.classList.add('active');
    }
  });
}

/**
 * Activa visualmente un tema en el sidebar
 * @param {string} topicId - El ID del tema a activar
 */
export function setActiveTopic(topicId) {
  document.querySelectorAll('.topic-item').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.topicId === topicId) {
      el.classList.add('active');
    }
  });
}
