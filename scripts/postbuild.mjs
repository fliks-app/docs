#!/usr/bin/env node
// GitHub Pages fixups: a top-level .nojekyll (so files starting with "_" are
// served) and a 404.html fallback (GH Pages serves this verbatim for any
// missing path; ours is the prerendered not-found page).
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BROWSER_DIR = path.join(ROOT, 'dist/docs/browser');

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

console.log('[postbuild] wrote .nojekyll and 404.html');
