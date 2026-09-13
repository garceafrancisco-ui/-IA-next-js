/**
 * topics/index.js
 * Registro centralizado de todos los temas disponibles
 * Para agregar un nuevo tema: crear el archivo del tema e importarlo acá
 */

import { hooksTopic } from './hooks.js';
import { componentesBasicosTopic } from './componentes-basicos.js';
import { componentesCompuestosTopic } from './componentes-compuestos.js';
import { estilosClsxTopic } from './estilos-clsx.js';

export const TOPICS = [
  hooksTopic,
  componentesBasicosTopic,
  componentesCompuestosTopic,
  estilosClsxTopic,
];

/**
 * Obtiene un tema por su ID
 * @param {string} id - El ID del tema
 * @returns {Object|undefined} - La configuración del tema o undefined si no existe
 */
export function getTopicById(id) {
  return TOPICS.find(topic => topic.id === id);
}

/**
 * Obtiene el primer tema (para usar como default)
 * @returns {Object} - El primer tema disponible
 */
export function getDefaultTopic() {
  return TOPICS[0];
}
