import styles from './Sidebar.module.css';

/**
 * Sidebar con la lista de temas
 * Cada ítem muestra el nombre del tema, y el activo tiene highlight
 */
export default function Sidebar({ topics, temaActivoId, onSeleccionarTema }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>📚</span>
        Ayudante DAI
      </div>
      <nav className={styles.nav}>
        {topics.map((topic) => {
          const isActive = topic.id === temaActivoId;
          return (
            <button
              key={topic.id}
              className={`${styles.topicItem} ${isActive ? styles.active : ''}`}
              onClick={() => onSeleccionarTema(topic.id)}
            >
              <span className={styles.icon}>
                {topic.id === 'hooks' && '🪝'}
                {topic.id === 'componentes-basicos' && '🧩'}
                {topic.id === 'componentes-compuestos' && '🏗️'}
                {topic.id === 'estilos-clsx' && '🎨'}
              </span>
              <span className={styles.nombre}>{topic.nombre}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
