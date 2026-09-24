#!/usr/bin/env node
// GitHub Pages fixups: a top-level .nojekyll (so files starting with "_" are
// served), a 404.html fallback (GH Pages serves this verbatim for any missing
// path; ours is the prerendered not-found page) and sitemap.xml.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BROWSER_DIR = path.join(ROOT, 'dist/docs/browser');
const SITE_URL = 'https://fliks-app.github.io/docs/';

if (!existsSync(BROWSER_DIR)) {
  console.error(`[postbuild] ${BROWSER_DIR} does not exist, did the build run?`);
  process.exit(1);
}

writeFileSync(path.join(BROWSER_DIR, '.nojekyll'), '');

const notFoundSource = path.join(BROWSER_DIR, '404/index.html');
if (existsSync(notFoundSource)) {
  copyFileSync(notFoundSource, path.join(BROWSER_DIR, '404.html'));
} else {
  console.warn('[postbuild] no prerendered 404/index.html found, skipping 404.html fallback');
}

// routes.txt lists every prerendered route (written by build-content.mjs from the same page list).
const routesPath = path.join(ROOT, 'src/generated/routes.txt');
const routes = readFileSync(routesPath, 'utf8').trim().split('\n').filter((r) => r !== '/404');
const urls = routes.map((r) => (r === '/' ? SITE_URL : `${SITE_URL}${r.slice(1)}/`));
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
  '\n</urlset>\n';
writeFileSync(path.join(BROWSER_DIR, 'sitemap.xml'), sitemap);

console.log(`[postbuild] wrote .nojekyll, 404.html and sitemap.xml (${urls.length} urls)`);
