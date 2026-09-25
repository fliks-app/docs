# Fliks docs

Source for [docs.fliks.media](https://docs.fliks.media/): an Angular 22 app that
turns `src/content/**/*.md` into a static, prerendered documentation site (Tailwind CSS 4 +
daisyUI 5). Deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## Writing a page

Sections are folders under `src/content/`, named `NN-slug` (the number only controls order and is
stripped from the URL):

```
src/content/
  02-install/
    _meta.json          {"title": "Installation"}
    01-docker.md         -> /install/docker
    02-from-source.md    -> /install/from-source
```

Each page needs YAML frontmatter with a `title` (required) and a one-sentence `description`:

```markdown
---
title: Installing with Docker
description: Run Fliks with Docker Compose.
---

## First heading

Body starts at h2 - the page's h1 is rendered from `title`.
```

Supported in the body:

- GitHub-flavoured markdown: tables, fenced code blocks (`bash`, `yaml`, `json`, `ts`, `js`, `html`,
  `css`, `ini`, `dockerfile`, `nginx`, `diff`, `text`, ...), task lists.
- Callouts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
- Internal links, root-absolute: `[Docker](/install/docker)` or
  `[Volumes](/install/docker#volumes)`. External links (`https://...`) open in a new tab
  automatically.
- Images: `![alt](/img/my-screenshot.webp)`, referencing a file at `public/img/my-screenshot.webp`.

Every `##`/`###` heading gets an anchor id derived from its text: lowercased, trimmed, every
character that isn't a letter, digit, space, `-` or `_` dropped, remaining spaces turned into `-`,
repeated `-` collapsed, and a leading/trailing `-` stripped (an empty result falls back to
`section`). A second heading on the same page that slugifies to the same id gets `-1`, `-2`, ...
appended, in order. Link to a heading with that id (`[Volumes](/install/docker#volumes)`); if you
rename a heading, its id changes too, so update every link that points at the old one.

The build fails with a file-and-line message if a page is missing its `title`, a `_meta.json` is
missing or malformed, an internal link points at a page or heading that doesn't exist, or an image
has no matching file. Fix the listed pages and rebuild.

The sidebar groups section folders named `plugins` or `development` under "Developers"; every other
section is grouped under "Documentation". The navbar's "User guide" link goes to the first page of
the first section, and "Developers" goes to the first page of the `plugins` section (falling back
to the first "Developers" section if there is no `plugins` folder yet).

## Running it

```bash
npm ci
npm start      # dev server at http://localhost:4200
npm run build  # production build in dist/docs/browser
```

`npm start` and `npm run build` both first run `scripts/build-content.mjs`, which reads
`src/content`, renders markdown to HTML (marked + highlight.js, both build-time only) and writes
`src/generated/` (gitignored): a manifest, one lazy-loaded module per page, a search index, and the
route list used for prerendering. `npm run build` also runs `scripts/postbuild.mjs` afterwards,
which adds `.nojekyll` and a `404.html` fallback to the build output.

Every route is prerendered at build time (`prerender.routesFile` in `angular.json`, generated from
the same content), so `dist/docs/browser` is fully static - no Node server is required at runtime.
