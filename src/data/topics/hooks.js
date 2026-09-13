// Tema: Hooks (useState / useEffect)
// Basado en README-hooks.md

export const hooksConfig = {
  id: "hooks",
  nombre: "Hooks (useState / useEffect)",
  readmeFile: "README-hooks.md",
  campos: [
    {
      id: "hookTipo",
      label: "¿Qué hook querés generar?",
      tipo: "select",
      opciones: ["useState", "useEffect", "ambos"],
      valorPorDefecto: "useState",
    },
    // Campos para useState
    {
      id: "nombreVariable",
      label: "Nombre de la variable de estado",
      tipo: "text",
      placeholder: "cuenta",
      mostrarCuando: { hookTipo: ["useState", "ambos"] },
    },
    {
      id: "valorInicial",
      label: "Valor inicial",
      tipo: "text",
      placeholder: "0",
      mostrarCuando: { hookTipo: ["useState", "ambos"] },
    },
    {
      id: "tipoDato",
      label: "Tipo de dato",
      tipo: "select",
      opciones: ["number", "string", "boolean", "array", "objeto"],
      valorPorDefecto: "number",
      mostrarCuando: { hookTipo: ["useState", "ambos"] },
    },
    // Campos para useEffect
    {
      id: "dependencias",
      label: "Variables del array de dependencias (separadas por coma, o vacío)",
      tipo: "text",
      placeholder: "cuenta, usuario",
      mostrarCuando: { hookTipo: ["useEffect", "ambos"] },
    },
    {
      id: "tieneCleanup",
      label: "¿Necesita función de cleanup?",
      tipo: "checkbox",
      valorPorDefecto: false,
      mostrarCuando: { hookTipo: ["useEffect", "ambos"] },
    },
    {
      id: "descripcionEfecto",
      label: "Descripción corta de qué hace el efecto (para comentario)",
      tipo: "text",
      placeholder: "Se ejecuta cuando cambia la cuenta",
      mostrarCuando: { hookTipo: ["useEffect", "ambos"] },
    },
  ],
  generar: (valores) => {
    const lineas = [];
    const imports = new Set();

    // Determinar qué imports necesitamos
    if (valores.hookTipo === "useState" || valores.hookTipo === "ambos") {
      imports.add("useState");
    }
    if (valores.hookTipo === "useEffect" || valores.hookTipo === "ambos") {
      imports.add("useEffect");
    }

    // Línea de import
    const importsArray = Array.from(imports);
    lineas.push(`import { ${importsArray.join(", ")} } from 'react';`);
    lineas.push("");

    // Directiva use client (según README-hooks.md, se usa en componentes con hooks)
    lineas.push('"use client"');
    lineas.push("");

    // Generar useState si corresponde
    if (valores.hookTipo === "useState" || valores.hookTipo === "ambos") {
      const nombreVar = valores.nombreVariable || "estado";
      const setterName = `set${nombreVar.charAt(0).toUpperCase() + nombreVar.slice(1)}`;
      let valorInicial = valores.valorInicial || "0";

      // Ajustar valor inicial según tipo de dato
      if (valores.tipoDato === "array") {
        valorInicial = "[]";
      } else if (valores.tipoDato === "objeto") {
        valorInicial = "{}";
      } else if (valores.tipoDato === "boolean") {
        valorInicial = "false";
      } else if (valores.tipoDato === "string") {
        valorInicial = '""';
      }

      lineas.push(`const [${nombreVar}, ${setterName}] = useState(${valorInicial});`);
    }

    // Generar useEffect si corresponde
    if (valores.hookTipo === "useEffect" || valores.hookTipo === "ambos") {
      lineas.push("");

      // Parsear dependencias
      const depsArray = valores.dependencias
        ? valores.dependencias.split(",").map((d) => d.trim()).filter((d) => d)
        : [];
      const depsString = depsArray.length > 0 ? `[${depsArray.join(", ")}]` : "[]";

      lineas.push("useEffect(() => {");

      // Comentario descriptivo
      if (valores.descripcionEfecto) {
        lineas.push(`  // ${valores.descripcionEfecto}`);
      }

      lineas.push("  // Código que se ejecuta cuando cambian las dependencias");
      lineas.push("  console.log('El efecto se ejecutó');");

      // Cleanup function si corresponde
      if (valores.tieneCleanup) {
        lineas.push("");
        lineas.push("  // Cleanup function - se ejecuta al desmontar");
        lineas.push("  return () => {");
        lineas.push("    console.log('Cleanup ejecutado');");
        lineas.push("  };");
      }

      lineas.push(`}, ${depsString});`);
    }

    return lineas.join("\n");
  },
};

export default hooksConfig;
