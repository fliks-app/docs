#!/usr/bin/env node
// Reads src/content, renders markdown to HTML (marked + highlight.js), and writes
// src/generated/: manifest.ts, pages/*.page.ts, routes.generated.ts, routes.txt,
// search-index.ts. Fails loudly on anything the writers' contract forbids.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Marked, Renderer } from 'marked';
import hljs from 'highlight.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const GENERATED_DIR = path.join(ROOT, 'src/generated');
const EDIT_BASE = 'https://github.com/fliks-app/docs/edit/main/src/content';
const DEV_SECTION_SLUGS = new Set(['plugins', 'development']);

/** @type {string[]} */
const errors = [];
function fail(message) {
  errors.push(message);
}

// ---------- tiny helpers (no deps) ----------

function isExternalHref(href) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function tokensToPlainText(tokens) {
  return (tokens ?? [])
    .map((t) => (t.tokens ? tokensToPlainText(t.tokens) : (t.text ?? t.raw ?? '')))
    .join('');
}

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Minimal frontmatter parser: `key: value` flat string pairs only. */
function parseFrontmatter(raw) {
  const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: raw.replace(/^\uFEFF/, '').slice(match[0].length) };
}

function highlightCode(code, requestedLang) {
  const lang = (requestedLang || '').toLowerCase().trim();
  if (lang && lang !== 'text' && lang !== 'plaintext' && hljs.getLanguage(lang)) {
    return { html: hljs.highlight(code, { language: lang }).value, lang };
  }
  if (!lang || lang === 'text' || lang === 'plaintext') {
    return { html: escapeHtml(code), lang: 'plaintext' };
  }
  console.warn(`[build-content] unknown code language "${lang}", falling back to plain text`);
  return { html: escapeHtml(code), lang: 'plaintext' };
}

const CALLOUTS = {
  SUMMARY: { label: 'In short', variant: 'summary' },
  NOTE: { label: 'Note', variant: 'info' },
  TIP: { label: 'Tip', variant: 'success' },
  IMPORTANT: { label: 'Important', variant: 'important' },
  WARNING: { label: 'Warning', variant: 'warning' },
  CAUTION: { label: 'Caution', variant: 'error' },
};

// ---------- per-page render state (reset before each page) ----------

let currentFile = '';
let currentUrl = '';
let headings = [];
let slugCounts = new Map();
let pageLinks = [];
let pageImages = [];

// Plain object, not a class: marked merges `renderer` via Object.assign onto its
// default Renderer instance, which only picks up own enumerable properties -
// prototype methods from a subclass would be silently ignored.
const docsRenderer = {
  heading({ tokens, depth }) {
    const html = this.parser.parseInline(tokens);
    const text = decodeEntities(tokensToPlainText(tokens));
    const base = slugify(text) || 'section';
    let id = base;
    for (let n = 1; slugCounts.has(id); n++) id = `${base}-${n}`;
    slugCounts.set(id, true);
    if (depth === 2 || depth === 3) {
      headings.push({ id, text, level: depth });
    }
    return `<h${depth} id="${id}">${html}<a class="heading-anchor" href="${currentUrl}#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
  },

  code({ text, lang }) {
    const code = text.replace(/\n$/, '');
    const infoLang = (lang || '').split(/\s+/)[0] || '';
    const { html, lang: usedLang } = highlightCode(code, infoLang);
    const label = infoLang || 'text';
    return (
      `<div class="code-block" data-lang="${escapeHtml(label)}">` +
      `<div class="code-block-header"><span class="code-lang">${escapeHtml(label)}</span>` +
      `<button type="button" class="copy-btn"><span class="copy-btn-label" aria-live="polite">Copy</span></button></div>` +
      `<pre><code class="hljs language-${escapeHtml(usedLang)}">${html}</code></pre></div>\n`
    );
  },

  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    if (isExternalHref(href)) {
      return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    if (href.startsWith('/') || href.startsWith('#')) {
      pageLinks.push({ href, file: currentFile });
      // Same-page anchors carry the page path: a bare "#x" would resolve against <base href>.
      const target = href.startsWith('#') ? currentUrl + href : href;
      return `<a href="${escapeHtml(target)}"${titleAttr}>${text}</a>`;
    }
    fail(
      `${currentFile}: internal link "${href}" must be root-absolute (e.g. /install/docker) or a same-page anchor (#heading)`,
    );
    return text;
  },

  image({ href, title, text }) {
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    if (!isExternalHref(href)) {
      pageImages.push({ href, file: currentFile });
    }
    return `<img src="${escapeHtml(href)}" alt="${text}"${titleAttr} loading="lazy">`;
  },

  blockquote(token) {
    const raw = token.text ?? '';
    const m = raw.match(/^\[!(SUMMARY|NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n+/i);
    if (m) {
      const type = m[1].toUpperCase();
      const body = raw.slice(m[0].length);
      const meta = CALLOUTS[type];
      const bodyHtml = marked.parse(body);
      return (
        `<div class="doc-callout doc-callout-${meta.variant}" role="note">` +
        `<span class="doc-callout-label">${meta.label}</span>` +
        `<div class="doc-callout-body">${bodyHtml}</div></div>\n`
      );
    }
    const body = this.parser.parse(token.tokens);
    return `<blockquote>\n${body}</blockquote>\n`;
  },

  table(token) {
    return `<div class="table-wrap">${Renderer.prototype.table.call(this, token)}</div>\n`;
  },
};

// Lucide chevron-left / chevron-right, inlined: page HTML is static, Angular components can't render in it.
function lucide(path) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
}

// `:::steps` ... `:::` holds one `![caption](/img/x.webp)` per line, rendered as a numbered slider.
const stepsExtension = {
  name: 'steps',
  level: 'block',
  start: (src) => src.match(/^:::steps/m)?.index,
  tokenizer(src) {
    const m = src.match(/^:::steps[^\n]*\n([\s\S]*?)\n:::[ \t]*(?:\n+|$)/);
    if (!m) return undefined;
    const slides = [...m[1].matchAll(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/gm)].map(([, caption, href]) => ({ caption, href }));
    if (slides.length < 2 || slides.length !== m[1].trim().split(/\n+/).length) {
      fail(`${currentFile}: a :::steps block needs two or more lines, each a single ![caption](/img/...) image`);
    }
    return { type: 'steps', raw: m[0], slides };
  },
  renderer({ slides }) {
    const items = slides
      .map(({ caption, href }, i) => {
        if (!isExternalHref(href)) pageImages.push({ href, file: currentFile });
        const text = marked.parseInline(caption);
        return (
          `<figure class="doc-step"><img src="${escapeHtml(href)}" alt="${escapeHtml(caption)}" loading="lazy">` +
          `<figcaption><span class="doc-step-num">${i + 1}</span><span>${text}</span></figcaption></figure>`
        );
      })
      .join('');
    return (
      `<div class="doc-steps" data-count="${slides.length}"><div class="doc-steps-track" tabindex="0">${items}</div>` +
      `<div class="doc-steps-nav"><button type="button" class="doc-steps-prev" aria-label="Previous step" disabled>${lucide('m15 18-6-6 6-6')}</button>` +
      `<span class="doc-steps-pos" aria-live="polite">1 / ${slides.length}</span>` +
      `<button type="button" class="doc-steps-next" aria-label="Next step">${lucide('m9 18 6-6-6-6')}</button></div></div>\n`
    );
  },
};

// `:::details Title` ... `:::` folds reference material (field tables, edge cases) under a
// clickable title. Its body is regular markdown, but can't hold another ::: block.
const detailsExtension = {
  name: 'details',
  level: 'block',
  start: (src) => src.match(/^:::details/m)?.index,
  tokenizer(src) {
    const m = src.match(/^:::details[ \t]+([^\n]+)\n([\s\S]*?)\n:::[ \t]*(?:\n+|$)/);
    if (!m) return undefined;
    if (/^:::/m.test(m[2])) fail(`${currentFile}: a :::details block can't contain another ::: block`);
    return { type: 'details', raw: m[0], summary: m[1].trim(), body: m[2] };
  },
  renderer({ summary, body }) {
    return (
      `<details class="doc-details"><summary>${marked.parseInline(summary)}</summary>` +
      `<div class="doc-details-body">${marked.parse(body)}</div></details>\n`
    );
  },
};

const marked = new Marked({ gfm: true, breaks: false });
marked.use({ renderer: docsRenderer, extensions: [stepsExtension, detailsExtension] });

// ---------- read content tree ----------

function readSections() {
  if (!existsSync(CONTENT_DIR)) return [];
  const entries = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => {
      if (!/^\d+-.+$/.test(name)) {
        console.warn(`[build-content] ignoring src/content/${name} (expected "NN-slug")`);
        return false;
      }
      return true;
    })
    .sort();

  const sections = [];
  for (const dirName of entries) {
    const [, orderStr, slug] = dirName.match(/^(\d+)-(.+)$/);
    const dirPath = path.join(CONTENT_DIR, dirName);
    const metaPath = path.join(dirPath, '_meta.json');
    if (!existsSync(metaPath)) {
      fail(`src/content/${dirName}/_meta.json is missing (needs {"title": "..."})`);
      continue;
    }
    let meta;
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    } catch (e) {
      fail(`src/content/${dirName}/_meta.json is not valid JSON (${e.message})`);
      continue;
    }
    if (!meta.title || typeof meta.title !== 'string') {
      fail(`src/content/${dirName}/_meta.json is missing a "title" string`);
      continue;
    }

    const pageFiles = readdirSync(dirPath)
      .filter((f) => /^\d+-.+\.md$/.test(f))
      .sort();

    const pages = [];
    for (const fileName of pageFiles) {
      const [, pOrderStr, pSlug] = fileName.match(/^(\d+)-(.+)\.md$/);
      const relPath = `${dirName}/${fileName}`;
      currentFile = relPath;
      currentUrl = `/${slug}/${pSlug}`;
      headings = [];
      slugCounts = new Map();
      pageLinks = [];
      pageImages = [];

      const raw = readFileSync(path.join(dirPath, fileName), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        fail(`src/content/${relPath}: missing frontmatter "title"`);
        continue;
      }

      const html = marked.parse(body);

      pages.push({
        order: Number(pOrderStr),
        slug: pSlug,
        title: data.title.trim(),
        description: (data.description ?? '').trim(),
        subgroup: (data.group ?? '').trim(),
        headings,
        html,
        links: pageLinks,
        images: pageImages,
        sourcePath: relPath,
      });
    }
    if (pages.length === 0) {
      console.warn(`[build-content] src/content/${dirName} has no pages yet, skipping section`);
      continue;
    }
    pages.sort((a, b) => a.order - b.order);

    sections.push({
      order: Number(orderStr),
      slug,
      title: meta.title,
      group: DEV_SECTION_SLUGS.has(slug) ? 'dev' : 'user',
      pages,
      // `"links": [{"title", "url"}]` in _meta.json lists a page of another section here too.
      links: Array.isArray(meta.links) ? meta.links : [],
      metaFile: `src/content/${dirName}/_meta.json`,
    });
  }
  sections.sort((a, b) => a.order - b.order);
  return sections;
}

const sections = readSections();

// ---------- build URL-addressable page list + prev/next per group ----------

const pageByUrl = new Map();
for (const section of sections) {
  for (const page of section.pages) {
    page.url = `/${section.slug}/${page.slug}`;
    if (pageByUrl.has(page.url)) {
      fail(`duplicate page URL "${page.url}" (${page.sourcePath} and ${pageByUrl.get(page.url).sourcePath})`);
      continue;
    }
    pageByUrl.set(page.url, page);
  }
}

for (const group of ['user', 'dev']) {
  const flat = sections.filter((s) => s.group === group).flatMap((s) => s.pages);
  flat.forEach((page, i) => {
    page.prev = i > 0 ? { url: flat[i - 1].url, title: flat[i - 1].title } : null;
    page.next = i < flat.length - 1 ? { url: flat[i + 1].url, title: flat[i + 1].title } : null;
  });
}

// ---------- validate internal links + images now that every URL/anchor is known ----------

for (const section of sections) {
  for (const link of section.links) {
    if (!link?.title || !pageByUrl.has(link?.url)) {
      fail(`${section.metaFile}: "links" entries need a title and the url of an existing page`);
    }
  }
}

for (const section of sections) {
  for (const page of section.pages) {
    for (const { href, file } of page.links) {
      const [rawPath, hash] = href.split('#');
      if (href.startsWith('#')) {
        if (!page.headings.some((h) => h.id === hash) && hash !== undefined) {
          fail(`${file}: link "${href}" targets a heading that doesn't exist on this page`);
        }
        continue;
      }
      if (rawPath === '/') continue;
      const target = pageByUrl.get(rawPath);
      if (!target) {
        fail(`${file}: link "${href}" points to a page that doesn't exist ("${rawPath}")`);
        continue;
      }
      if (hash !== undefined && !target.headings.some((h) => h.id === hash)) {
        fail(`${file}: link "${href}" targets a heading that doesn't exist on "${rawPath}"`);
      }
    }
    for (const { href, file } of page.images) {
      const filePath = path.join(PUBLIC_DIR, href.replace(/^\//, ''));
      if (!existsSync(filePath)) {
        fail(`${file}: image "${href}" has no matching file at public${href}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`\n[build-content] ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}

// ---------- emit generated files ----------

rmSync(GENERATED_DIR, { recursive: true, force: true });
mkdirSync(path.join(GENERATED_DIR, 'pages'), { recursive: true });

const firstSectionPageUrl = sections[0]?.pages[0]?.url ?? null;
const firstPluginsPageUrl =
  sections.find((s) => s.slug === 'plugins')?.pages[0]?.url ??
  sections.find((s) => s.group === 'dev')?.pages[0]?.url ??
  null;

const manifestSections = sections.map((s) => ({
  slug: s.slug,
  title: s.title,
  group: s.group,
  links: s.links,
  pages: s.pages.map((p) => ({
    url: p.url,
    title: p.title,
    description: p.description,
    subgroup: p.subgroup,
    headings: p.headings,
    prev: p.prev,
    next: p.next,
    editUrl: `${EDIT_BASE}/${p.sourcePath}`,
    section: s.slug,
    sectionTitle: s.title,
  })),
}));

writeFileSync(
  path.join(GENERATED_DIR, 'manifest.ts'),
  `// Auto-generated by scripts/build-content.mjs. Do not edit.
export interface DocHeading { id: string; text: string; level: 2 | 3; }
export interface DocPageMeta {
  url: string;
  title: string;
  description: string;
  /** Frontmatter \`group\`: pages sharing one are listed under that label in the sidebar. */
  subgroup: string;
  headings: DocHeading[];
  prev: { url: string; title: string } | null;
  next: { url: string; title: string } | null;
  editUrl: string;
  section: string;
  sectionTitle: string;
}
export interface DocSection {
  slug: string;
  title: string;
  group: 'user' | 'dev';
  links: { title: string; url: string }[];
  pages: DocPageMeta[];
}
export const SECTIONS: DocSection[] = ${JSON.stringify(manifestSections)};
export const PAGES_BY_URL: Record<string, DocPageMeta> = Object.fromEntries(
  SECTIONS.flatMap((s) => s.pages.map((p) => [p.url, p])),
);
export const FIRST_SECTION_PAGE_URL: string | null = ${JSON.stringify(firstSectionPageUrl)};
export const FIRST_PLUGINS_PAGE_URL: string | null = ${JSON.stringify(firstPluginsPageUrl)};
`,
);

const routeLines = ['/'];
const routeEntries = [];
for (const section of sections) {
  for (const page of section.pages) {
    routeLines.push(page.url);
    const key = `${section.slug}--${page.slug}`;
    writeFileSync(
      path.join(GENERATED_DIR, 'pages', `${key}.page.ts`),
      `// Auto-generated by scripts/build-content.mjs. Do not edit.\nexport const PAGE_HTML: string = ${JSON.stringify(page.html)};\n`,
    );
    routeEntries.push({ path: page.url.slice(1), pageUrl: page.url, title: page.title, key });
  }
}
routeLines.push('/404');

writeFileSync(path.join(GENERATED_DIR, 'routes.txt'), routeLines.join('\n') + '\n');

writeFileSync(
  path.join(GENERATED_DIR, 'routes.generated.ts'),
  `// Auto-generated by scripts/build-content.mjs. Do not edit.
import { Routes } from '@angular/router';
import { DocPage } from '../app/pages/doc-page/doc-page';

export const DOC_ROUTES: Routes = [
${routeEntries
  .map(
    (r) =>
      `  { path: ${JSON.stringify(r.path)}, component: DocPage, data: { pageUrl: ${JSON.stringify(
        r.pageUrl,
      )} }, title: ${JSON.stringify(`${r.title} | Fliks docs`)}, resolve: { html: () => import('./pages/${r.key}.page').then((m) => m.PAGE_HTML) } },`,
  )
  .join('\n')}
];
`,
);

// ---------- search index: one entry per page intro + per heading section ----------

function stripTags(html) {
  return html
    .replace(/<div class="code-block-header">.*?<\/div>/gs, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const searchEntries = [];
for (const section of sections) {
  for (const page of section.pages) {
    const chunks = page.html.split(/(?=<h[23] id=")/);
    for (const chunk of chunks) {
      const headingMatch = chunk.match(/^<h([23]) id="([^"]+)">/);
      const id = headingMatch?.[2];
      const heading = page.headings.find((h) => h.id === id);
      // Drop the heading itself: its text is already the entry's title, and stripping tags
      // would otherwise leave the anchor-permalink's "#" glyph at the start of the body.
      const body = headingMatch ? chunk.replace(/^<h[23][^>]*>.*?<\/h[23]>\s*/s, '') : chunk;
      searchEntries.push({
        url: heading ? `${page.url}#${heading.id}` : page.url,
        title: heading ? heading.text : page.title,
        section: heading ? `${section.title} / ${page.title}` : section.title,
        text: decodeEntities(stripTags(body)).replace(/\s+/g, ' ').trim(),
      });
    }
  }
}

writeFileSync(
  path.join(GENERATED_DIR, 'search-index.ts'),
  `// Auto-generated by scripts/build-content.mjs. Do not edit.
export interface SearchEntry { url: string; title: string; section: string; text: string; }
export const SEARCH_INDEX: SearchEntry[] = ${JSON.stringify(searchEntries, null, 2)};
`,
);

console.log(
  `[build-content] ${sections.length} section(s), ${routeEntries.length} page(s), ${searchEntries.length} search entries`,
);
