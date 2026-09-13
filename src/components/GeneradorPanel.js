"use client";

import { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock.js';
import FormField from './FormField.js';
import styles from './GeneradorPanel.module.css';

/**
 * Panel del Generador: renderiza el formulario según la config del tema activo
 * y muestra el código generado en tiempo real
 */
export default function GeneradorPanel({ topicConfig }) {
  // Estado para los valores del formulario
  const [valores, setValores] = useState({});

  // Estado para el código generado
  const [codigoGenerado, setCodigoGenerado] = useState('');

  // Inicializar valores por defecto cuando cambia el tema
  useEffect(() => {
    if (topicConfig?.campos) {
      const valoresIniciales = {};
      topicConfig.campos.forEach((campo) => {
        if (campo.valorPorDefecto !== undefined) {
          valoresIniciales[campo.id] = campo.valorPorDefecto;
        } else if (campo.tipo === 'checkbox') {
          valoresIniciales[campo.id] = false;
        } else {
          valoresIniciales[campo.id] = '';
        }
      });
      setValores(valoresIniciales);
    }
  }, [topicConfig]);

  // Generar código cuando cambian los valores
  useEffect(() => {
    if (topicConfig?.generar && Object.keys(valores).length > 0) {
      const codigo = topicConfig.generar(valores);
      setCodigoGenerado(codigo);
    }
  }, [valores, topicConfig]);

  // Manejar cambios en los inputs
  const handleChange = (campoId, valor) => {
    setValores((prev) => ({
      ...prev,
      [campoId]: valor,
    }));
  };

  // Verificar si un campo debe mostrarse según la condición mostrarCuando
  const debeMostrarCampo = (campo) => {
    if (!campo.mostrarCuando) return true;

    const condicion = campo.mostrarCuando;
    const claveCondicion = Object.keys(condicion)[0];
    const valoresPermitidos = condicion[claveCondicion];

    // El campo se muestra si el valor actual está en los valores permitidos
    return valoresPermitidos.includes(valores[claveCondicion]);
  };

  if (!topicConfig) {
    return <div className={styles.error}>No hay configuración de tema disponible</div>;
  }

  return (
    <div className={styles.container}>
      {/* Columna izquierda: Formulario */}
      <div className={styles.columnaForm}>
        <h2 className={styles.subtitulo}>Completá los datos</h2>
        <form className={styles.form}>
          {topicConfig.campos
            .filter((campo) => debeMostrarCampo(campo))
            .map((campo) => (
              <FormField
                key={campo.id}
                campo={campo}
                valor={valores[campo.id]}
                onChange={(valor) => handleChange(campo.id, valor)}
              />
            ))}
        </form>
      </div>

      {/* Columna derecha: Resultado */}
      <div className={styles.columnaResultado}>
        <h2 className={styles.subtitulo}>Código generado</h2>
        <CodeBlock codigo={codigoGenerado} lenguaje="jsx" />
        <p className={styles.ayuda}>
          Copiá este código y pegalo en tu proyecto del TP.
        </p>
      </div>
    </div>
  );
}
