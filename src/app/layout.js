import { TOPICS } from '@/data/topics/index.js';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>Ayudante DAI - Generador de Boilerplate</title>
        <meta name="description" content="Generador de código boilerplate para TPs de Desarrollo de Aplicaciones Informáticas" />
      </head>
      <body>{children}</body>
    </html>
  );
}
