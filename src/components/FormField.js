"use client";

import styles from './FormField.module.css';

/**
 * Input reutilizable para el formulario del Generador
 * Soporta: text, select, checkbox
 */
export default function FormField({ campo, valor, onChange }) {
  const renderInput = () => {
    switch (campo.tipo) {
      case 'select':
        return (
          <select
            className={styles.input}
            value={valor || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {campo.opciones.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={valor || false}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              {campo.ayuda || 'Marcar esta opción'}
            </span>
          </label>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            className={styles.input}
            value={valor || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={campo.placeholder}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={campo.id}>
        {campo.label}
      </label>
      {renderInput()}
    </div>
  );
}
