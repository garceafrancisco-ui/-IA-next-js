"use client";

import { useState } from 'react';
import Sidebar from './Sidebar.js';
import TopicHeader from './TopicHeader.js';
import TeoriaPanel from './TeoriaPanel.js';
import GeneradorPanel from './GeneradorPanel.js';

/**
 * Componente principal de la app (Client Component)
 * Maneja el estado global: tema activo y modo activo (Teoría/Generador)
 */
export default function AyudanteApp({ topics }) {
  const [temaActivoId, setTemaActivoId] = useState(topics[0]?.id || null);
  const [modoActivo, setModoActivo] = useState('teoria'); // 'teoria' | 'generador'

  const temaActivo = topics.find((t) => t.id === temaActivoId) || topics[0];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar fija a la izquierda */}
      <Sidebar
        topics={topics}
        temaActivoId={temaActivoId}
        onSeleccionarTema={(id) => {
          setTemaActivoId(id);
          setModoActivo('teoria'); // Resetear a teoría al cambiar de tema
        }}
      />

      {/* Área principal */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header con nombre del tema y switch Teoría/Generador */}
        <TopicHeader
          temaNombre={temaActivo?.nombre}
          modoActivo={modoActivo}
          onCambiarModo={setModoActivo}
        />

        {/* Panel de contenido según el modo */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}
        >
          {modoActivo === 'teoria' ? (
            <TeoriaPanel
              readmeContenido={temaActivo?.readmeContenido || ''}
              temaNombre={temaActivo?.nombre}
            />
          ) : (
            <GeneradorPanel
              topicConfig={temaActivo}
            />
          )}
        </div>
      </main>
    </div>
  );
}
