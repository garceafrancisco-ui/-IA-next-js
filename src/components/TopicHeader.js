import styles from './TopicHeader.module.css';

/**
 * Header con el nombre del tema activo y switch Teoría/Generador
 */
export default function TopicHeader({ temaNombre, modoActivo, onCambiarModo }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>{temaNombre}</h1>
      <div className={styles.switch}>
        <button
          className={`${styles.switchOption} ${modoActivo === 'teoria' ? styles.active : ''}`}
          onClick={() => onCambiarModo('teoria')}
        >
          Teoría
        </button>
        <button
          className={`${styles.switchOption} ${modoActivo === 'generador' ? styles.active : ''}`}
          onClick={() => onCambiarModo('generador')}
        >
          Generador
        </button>
      </div>
    </header>
  );
}
