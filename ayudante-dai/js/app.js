/**
 * app.js
 * Punto de entrada de la aplicación
 * Orquesta todo: estado, navegación entre temas y modos (Teoría/Generador)
 * 
 * IMPORTANTE: Esta app necesita correr con un servidor local (no abrir el archivo directo con file://)
 * por el tema de CORS + fetch de archivos locales.
 * 
 * Opciones para correrla:
 * 1. Extensión "Live Server" de VSCode
 * 2. Ejecutar `npx serve` en la terminal desde la carpeta del proyecto
 * 3. Cualquier otro servidor HTTP estático
 */

import { TOPICS, getTopicById, getDefaultTopic } from './topics/index.js';
import { renderSidebar, setActiveTopic } from './sidebar.js';
import { renderTeoria } from './teoria.js';
import { renderGenerador } from './generador.js';

// Estado de la aplicación (variables simples, sin frameworks)
let estado = {
  topicActivo: null,
  modoActivo: 'teoria' // 'teoria' o 'generador'
};

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Ayudante DAI - Iniciando...');
  
  // Renderizar sidebar
  renderSidebar(seleccionarTema);
  
  // Seleccionar el primer tema por defecto
  const defaultTopic = getDefaultTopic();
  if (defaultTopic) {
    seleccionarTema(defaultTopic);
  }
  
  // Configurar switch de modos (Teoría/Generador)
  configurarSwitchModos();
});

/**
 * Callback cuando se selecciona un tema desde el sidebar
 */
function seleccionarTema(topic) {
  console.log('Tema seleccionado:', topic.nombre);
  
  estado.topicActivo = topic;
  
  // Actualizar título del header
  const tituloHeader = document.getElementById('current-topic-title');
  if (tituloHeader) {
    tituloHeader.textContent = topic.nombre;
  }
  
  // Renderizar el modo activo para el nuevo tema
  renderModoActivo();
}

/**
 * Configura los botones del switch Teoría/Generador
 */
function configurarSwitchModos() {
  const modeBtns = document.querySelectorAll('.mode-btn');
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nuevoModo = btn.dataset.mode;
      
      if (nuevoModo !== estado.modoActivo) {
        estado.modoActivo = nuevoModo;
        
        // Actualizar clase active en los botones
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Renderizar el nuevo modo
        renderModoActivo();
      }
    });
  });
}

/**
 * Renderiza el modo activo (Teoría o Generador) para el tema actual
 */
async function renderModoActivo() {
  if (!estado.topicActivo) {
    return;
  }
  
  const contentArea = document.getElementById('content-area');
  if (!contentArea) {
    return;
  }
  
  // Limpiar área de contenido
  contentArea.innerHTML = '';
  
  if (estado.modoActivo === 'teoria') {
    await renderTeoria(estado.topicActivo);
  } else if (estado.modoActivo === 'generador') {
    renderGenerador(estado.topicActivo);
  }
}
