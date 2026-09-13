// Tema: Componentes compuestos
// Basado en README-componentes-compuestos.md

export const componentesCompuestosConfig = {
  id: "componentes-compuestos",
  nombre: "Componentes compuestos",
  readmeFile: "README-componentes-compuestos.md",
  campos: [
    {
      id: "nombreComponente",
      label: "Nombre del componente compuesto (PascalCase automático)",
      tipo: "text",
      placeholder: "FormularioConBoton",
    },
    {
      id: "subComponentes",
      label: "Sub-componentes que lo forman (nombre, separados por coma)",
      tipo: "text",
      placeholder: "Title, Button, Input",
    },
    {
      id: "propsPadre",
      label: "Props que recibe el componente padre (separadas por coma)",
      tipo: "text",
      placeholder: "title, buttonText, onButtonClick",
    },
    {
      id: "reenvios",
      label: "Qué props se reenvían a cada hijo (ej: Button: onClick, text | Title: text)",
      tipo: "text",
      placeholder: "Button: onClick, text | Title: text",
    },
  ],
  generar: (valores) => {
    const lineas = [];

    // Convertir a PascalCase
    const nombreRaw = valores.nombreComponente || "MiComponente";
    const nombrePascal = nombreRaw.replace(/(^|-)([a-z])/g, (match, _, char) =>
      char.toUpperCase()
    );

    // Parsear sub-componentes
    const subComponentesRaw = valores.subComponentes || "Title, Button";
    const subComponentes = subComponentesRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    // Parsear props del padre
    const propsPadreRaw = valores.propsPadre || "title, buttonText, onButtonClick";
    const propsPadre = propsPadreRaw
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    // Parsear reenvíos de props (formato: "Button: onClick, text | Title: text")
    const reenviosMap = {};
    if (valores.reenvios) {
      const partes = valores.reenvios.split("|");
      partes.forEach((parte) => {
        const [compName, propsStr] = parte.split(":");
        if (compName && propsStr) {
          const comp = compName.trim();
          const props = propsStr
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p);
          reenviosMap[comp] = props;
        }
      });
    }

    // Ruta del archivo
    lineas.push(`// Archivo: src/components/${nombrePascal}.js`);
    lineas.push("");

    // Imports de los sub-componentes
    subComponentes.forEach((sub) => {
      // Asumimos que están en la misma carpeta o en components
      lineas.push(`import ${sub} from './${sub}';`);
    });
    lineas.push("");

    // Definición del componente
    let propsParam = "";
    if (propsPadre.length > 0) {
      propsParam = `{ ${propsPadre.join(", ")} }`;
    }

    lineas.push(`export default function ${nombrePascal}(${propsParam}) {`);
    lineas.push("  return (");
    lineas.push("    <div className=\"contenedor-compuesto\">");

    // Renderizar cada sub-componente con sus props reenviadas
    subComponentes.forEach((sub) => {
      const propsAReenviar = reenviosMap[sub] || [];
      const propsString = propsAReenviar
        .map((prop) => `${prop}={${prop}}`)
        .join(" ");

      if (propsString) {
        lineas.push(`      <${sub} ${propsString} />`);
      } else {
        lineas.push(`      <${sub} />`);
      }
    });

    lineas.push("    </div>");
    lineas.push("  );");
    lineas.push("}");

    return lineas.join("\n");
  },
};

export default componentesCompuestosConfig;
