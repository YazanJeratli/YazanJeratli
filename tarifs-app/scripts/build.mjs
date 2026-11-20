// Construit l’appli en un seul fichier HTML (JS, CSS et logo intégrés).
//   ../tarifs/index.html : la page autonome, installable sur l’écran d’accueil (GitHub Pages)
//   dist/artifact.html   : la même page sans <head>, pour l’artifact claude.ai
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const res = await build({
  entryPoints: [resolve(racine, 'src/main.jsx')],
  bundle: true,
  minify: true,
  write: false,
  format: 'iife',
  target: ['es2020', 'safari15'],
  jsx: 'automatic',
  loader: { '.jpg': 'dataurl', '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
  outdir: resolve(racine, 'dist'),
  logLevel: 'warning'
});

const sortie = ext => res.outputFiles.find(f => f.path.endsWith(ext))?.text ?? '';
const js = sortie('.js').replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const css = sortie('.css').replace(/<\/style/gi, '<\\/style');

const tete = `<title>Tarifs YAZ Coaching</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;600;700;800&display=swap">
<style>${css}</style>`;

const corps = `<div id="root"></div>
<noscript><p style="padding:16px;color:#faf9f7">Active JavaScript pour voir les tarifs.</p></noscript>
<!-- Effets : composants React Bits (reactbits.dev), MIT + Commons Clause, (c) 2026 David Haz -->
<script>${js}</script>`;

const artifact = `${tete.replace('</title>', '</title>\n<meta name="claude:viewport-fit-sides" content="cover">')}
${corps}
`;

const autonome = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Tarifs YAZ">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-180.png">
${tete}
</head>
<body>
${corps}
</body>
</html>
`;

mkdirSync(resolve(racine, 'dist'), { recursive: true });
writeFileSync(resolve(racine, 'dist/artifact.html'), artifact);
writeFileSync(resolve(racine, '../tarifs/index.html'), autonome);
console.log(`JS ${(js.length / 1024).toFixed(0)} Ko · CSS ${(css.length / 1024).toFixed(0)} Ko · page ${(autonome.length / 1024).toFixed(0)} Ko`);
