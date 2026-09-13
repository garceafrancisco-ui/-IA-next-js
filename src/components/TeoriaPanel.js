import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock.js';
import styles from './TeoriaPanel.module.css';

/**
 * Panel de Teoría: renderiza el markdown del README activo
 * Usa react-markdown para parsear y un CodeBlock custom para los bloques de código
 */
export default function TeoriaPanel({ readmeContenido, temaNombre }) {
  // Componentes custom para react-markdown
  const components = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const lenguaje = match ? match[1] : '';
      const codigo = String(children).replace(/\n$/, '');

      if (!inline && !match) {
        // Es un bloque de código sin lenguaje especificado
        return <CodeBlock codigo={codigo} lenguaje={lenguaje} />;
      }

      if (!inline && match) {
        // Es un bloque de código con lenguaje
        return <CodeBlock codigo={codigo} lenguaje={lenguaje} />;
      }

      // Es código inline
      return <code className={className} {...props}>{children}</code>;
    },
  };

  return (
    <div className={styles.container}>
      <article className={styles.markdown}>
        <ReactMarkdown components={components}>
          {readmeContenido}
        </ReactMarkdown>
      </article>
    </div>
  );
}
