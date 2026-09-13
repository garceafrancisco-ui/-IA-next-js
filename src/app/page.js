import { TOPICS } from '@/data/topics/index.js';
import AyudanteApp from '@/components/AyudanteApp.js';

// Server Component: lee los READMEs en build-time y se los pasa como props al cliente
async function leerReadme(nombreArchivo) {
  const fs = await import('fs');
  const path = await import('path');
  const readmePath = path.join(process.cwd(), 'public', 'readmes', nombreArchivo);
  return fs.readFileSync(readmePath, 'utf-8');
}

export default async function Page() {
  // Leer todos los READMEs en build-time
  const topicsConContenido = await Promise.all(
    TOPICS.map(async (topic) => {
      const contenido = await leerReadme(topic.readmeFile);
      return { ...topic, readmeContenido: contenido };
    })
  );

  return <AyudanteApp topics={topicsConContenido} />;
}
