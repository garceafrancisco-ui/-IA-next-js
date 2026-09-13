// Tema: Estilos con clsx
// Basado en README-estilos-clsx.md

export const estilosClsxConfig = {
  id: "estilos-clsx",
  nombre: "Estilos con clsx",
  readmeFile: "README-estilos-clsx.md",
  campos: [
    {
      id: "nombreComponente",
      label: "Nombre del componente al que se aplica el estilo",
      tipo: "text",
      placeholder: "Button",
    },
    {
      id: "clasesFijas",
      label: "Clases fijas del .module.css (separadas por coma)",
      tipo: "text",
      placeholder: "button, base",
    },
    {
      id: "clasesCondicionales",
      label: "Clases condicionales (formato: clase:prop, separadas por |)",
      tipo: "text",
      placeholder: "incrementar:crece | decrementar:!crece | redondeado:redondo",
      ayuda: "Ej: 'incrementar:crece' significa que la clase 'incrementar' se aplica si la prop 'crece' es true",
    },
  ],
  generar: (valores) => {
    const lineas = [];

    const nombreComponente = valores.nombreComponente || "Button";
    const nombrePascal = nombreComponente.replace(/(^|-)([a-z])/g, (match, _, char) =>
      char.toUpperCase()
    );

    // Parsear clases fijas
    const clasesFijasRaw = valores.clasesFijas || "button";
    const clasesFijas = clasesFijasRaw
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);

    // Parsear clases condicionales (formato: clase:prop | clase2:prop2)
    const clasesCondicionalesMap = {};
    if (valores.clasesCondicionales) {
      const partes = valores.clasesCondicionales.split("|");
      partes.forEach((parte) => {
        const [clase, prop] = parte.split(":");
        if (clase && prop) {
          clasesCondicionalesMap[clase.trim()] = prop.trim();
        }
      });
    }

    // Ruta del archivo CSS
    lineas.push(`// Archivo: src/components/${nombrePascal}.module.css`);
    lineas.push("");
    lineas.push("/* Estilos base */");
    lineas.push(`.${clasesFijas[0] || "button"} {`);
    lineas.push("  border-radius: 10px;");
    lineas.push("  padding: 8px 16px;");
    lineas.push("  border: none;");
    lineas.push("  cursor: pointer;");
    lineas.push("}");
    lineas.push("");

    // Generar clases condicionales como ejemplo
    Object.keys(clasesCondicionalesMap).forEach((clase) => {
      const prop = clasesCondicionalesMap[clase];
      const esNegacion = prop.startsWith("!");
      const propNombre = esNegacion ? prop.slice(1) : prop;

      lineas.push(`/* Se aplica cuando ${propNombre} es ${esNegacion ? "false" : "true"} */`);

      if (clase === "incrementar") {
        lineas.push(`.${clase} {`);
        lineas.push("  background-color: green;");
        lineas.push("}");
      } else if (clase === "decrementar") {
        lineas.push(`.${clase} {`);
        lineas.push("  background-color: red;");
        lineas.push("}");
      } else if (clase === "redondeado") {
        lineas.push(`.${clase} {`);
        lineas.push("  border-radius: 50px;");
        lineas.push("}");
      } else {
        lineas.push(`.${clase} {`);
        lineas.push("  /* estilo personalizado */");
        lineas.push("}");
      }
      lineas.push("");
    });

    lineas.push("---");
    lineas.push("");

    // Ahora el código JSX del componente
    lineas.push(`// Archivo: src/components/${nombrePascal}.js`);
    lineas.push("");
    lineas.push('import styles from "./${nombrePascal}.module.css";');
    lineas.push('import clsx from "clsx";');
    lineas.push("");

    // Determinar qué props necesitamos para las condiciones
    const propsNecesarias = new Set();
    Object.values(clasesCondicionalesMap).forEach((prop) => {
      const propNombre = prop.startsWith("!") ? prop.slice(1) : prop;
      propsNecesarias.add(propNombre);
    });

    const propsParam = propsNecesarias.size > 0 ? `{ ${Array.from(propsNecesarias).join(", ")} }` : "";

    lineas.push(`export default function ${nombrePascal}(${propsParam}) {`);
    lineas.push("  return (");

    // Construir el className con clsx
    const clasesFijasString = clasesFijas.map((c) => `styles.${c}`).join(", ");

    const condicionesEntries = Object.entries(clasesCondicionalesMap);
    let condicionesString = "";
    if (condicionesEntries.length > 0) {
      const condicionesObj = condicionesEntries
        .map(([clase, prop]) => {
          return `    [styles.${clase}]: ${prop}`;
        })
        .join(",\n");
      condicionesString = `,\n{\n${condicionesObj}\n  }`;
    }

    lineas.push(`    <button`);
    lineas.push(`      className={clsx(`);
    lineas.push(`        ${clasesFijasString}${condicionesString}`);
    lineas.push("      )}");
    lineas.push("    >");
    lineas.push(`      ${nombrePascal}`);
    lineas.push("    </button>");
    lineas.push("  );");
    lineas.push("}");

    return lineas.join("\n");
  },
};

export default estilosClsxConfig;
