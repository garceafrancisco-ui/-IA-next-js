"use client";

import { useState } from 'react';
import styles from './CodeBlock.module.css';

/**
 * Bloque de código reutilizable con botón "Copiar"
 * Se usa tanto en Teoría como en el resultado del Generador
 */
export default function CodeBlock({ codigo, lenguaje = '' }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.lenguaje}>{lenguaje || 'code'}</span>
        <button
          className={`${styles.botonCopiar} ${copiado ? styles.copiado : ''}`}
          onClick={handleCopiar}
        >
          {copiado ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre className={styles.pre}>
        <code>{codigo}</code>
      </pre>
    </div>
  );
}
