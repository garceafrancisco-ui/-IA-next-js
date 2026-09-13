// Tema: Componentes básicos
// Basado en README-componentes-basicos.md

export const componentesBasicosConfig = {
  id: "componentes-basicos",
  nombre: "Componentes básicos",
  readmeFile: "README-componentes-basicos.md",
  campos: [
    {
      id: "nombreComponente",
      label: "Nombre del componente (PascalCase automático)",
      tipo: "text",
      placeholder: "MiComponente",
    },
    {
      id: "ubicacion",
      label: "¿Dónde va el componente?",
      tipo: "select",
      opciones: ["src/components (reutilizable)", "src/app (página)"],
      valorPorDefecto: "src/components (reutilizable)",
    },
    {
      id: "necesitaUseClient",
      label: "¿Necesita 'use client'?",
      tipo: "checkbox",
      valorPorDefecto: false,
      ayuda: "Marcar si tiene eventos (onClick, onChange) o usa hooks",
    },
    {
      id: "tieneProps",
      label: "¿Tiene props?",
      tipo: "checkbox",
      valorPorDefecto: false,
    },
    {
      id: "listaProps",
      label: "Lista de props (nombre, separadas por coma)",
      tipo: "text",
      placeholder: "onClick, title, children",
      mostrarCuando: { tieneProps: true },
    },
    {
      id: "usaChildren",
      label: "¿Usa la prop especial children?",
      tipo: "checkbox",
      valorPorDefecto: false,
      mostrarCuando: { tieneProps: true },
    },
  ],
  generar: (valores) => {
    const lineas = [];

    // Convertir a PascalCase
    const nombreRaw = valores.nombreComponente || "MiComponente";
    const nombrePascal = nombreRaw.replace(/(^|-)([a-z])/g, (match, _, char) =>
      char.toUpperCase()
    );

    // Determinar ruta del archivo
    const esPagina = valores.ubicacion?.includes("src/app");
    const rutaArchivo = esPagina
      ? `src/app/${nombrePascal.toLowerCase()}/page.js`
      : `src/components/${nombrePascal}.js`;

    // Comentario con la ruta
    lineas.push(`// Archivo: ${rutaArchivo}`);
    lineas.push("");

    // use client si corresponde
    if (valores.necesitaUseClient) {
      lineas.push('"use client"');
      lineas.push("");
    }

    // Import de React si tiene hooks (detectamos por use client + props como onClick)
    if (valores.necesitaUseClient && valores.listaProps?.includes("useState")) {
      lineas.push("import { useState } from 'react';");
      lineas.push("");
    }

    // Definición del componente
    let propsParam = "";
    if (valores.tieneProps && valores.listaProps) {
      const propsArray = valores.listaProps.split(",").map((p) => p.trim()).filter((p) => p);
      if (propsArray.length > 0) {
        propsParam = `{ ${propsArray.join(", ")} }`;
      }
    }

    lineas.push(`export default function ${nombrePascal}(${propsParam}) {`);
    lineas.push("  return (");
    lineas.push("    <div>");

    // Si usa children
    if (valores.usaChildren) {
      lineas.push("      {children}");
    } else {
      lineas.push(`      <h1>${nombrePascal}</h1>`);
      lineas.push("      <p>Componente básico creado según README-componentes-basicos.md</p>");
    }

    // Ejemplo de uso de props si tiene
    if (valores.tieneProps && valores.listaProps) {
      const propsArray = valores.listaProps.split(",").map((p) => p.trim()).filter((p) => p);
      propsArray.forEach((prop) => {
        if (prop !== "children") {
          if (prop.includes("onClick") || prop.includes("on")) {
            lineas.push(`      <button onClick={${prop}}>${prop}</button>`);
          } else {
            lineas.push(`      <p>{${prop}}</p>`);
          }
        }
      });
    }

    lineas.push("    </div>");
    lineas.push("  );");
    lineas.push("}");

    return lineas.join("\n");
  },
};

export default componentesBasicosConfig;
