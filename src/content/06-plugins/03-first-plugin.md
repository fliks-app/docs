---
title: Your first plugin
description: Build, package and install a minimal process plugin from zero, and see it appear in Settings > Plugins.
---

## Prerequisites

A few words used on this page:

- **Core** is the Fliks server itself, as opposed to a plugin.
- A **`process` plugin** is a plugin that ships JavaScript code, which core starts as a separate
  child process (the other tier, `data`, ships no code; see [Overview](/plugins/overview)).
- The **manifest** is `plugin.json`, the file that declares what the plugin is and what it may do.
- The **archive** is the `.fkplugin` file you install: a ZIP holding the manifest, the code and a
  logo.

What you need installed:

- **Node.js 24** and the **npm** that comes with it. Core runs plugins on Node 24 and the scaffold
  bundles for `node24`. Check with `node --version`.
- **git**, to clone the core repository. The scaffold and the packaging tool both live there.
- A **POSIX shell** (bash or zsh). The commands and the scaffold's `package` script use `cp`; on
  Windows, run them from Git Bash or WSL.
- A code editor with TypeScript support (VS Code works out of the box). You don't need to install
  TypeScript or a bundler globally: the scaffold brings `typescript` and
  [esbuild](https://esbuild.github.io/) as local dependencies.
- A **running Fliks 4.x instance** you can log into as an admin. See
  [Dev environment](/development/dev-environment) if you don't have one yet, or
  [Docker](/install/docker) for a packaged one.

> [!IMPORTANT]
> A `process` plugin ships as **one bundled JavaScript file**. There is no `node_modules` inside a
> plugin archive, so anything your plugin `require`s at runtime has to be bundled in. Skipping this
> is the single most common way a first plugin fails, with `MODULE_NOT_FOUND` at spawn.

## Step 1: get the scaffold

The scaffold lives in the core repository at `examples/plugin-scaffold/`. Its scripts reach into
the core checkout for two things: the contract types and the packaging tool. So keep the core
checkout **next to** your plugin, in the same parent folder:

```text
fliks-work/
  fliks/        the core repository
  my-plugin/    your copy of the scaffold
```

Run these once:

```bash
mkdir fliks-work && cd fliks-work
git clone https://github.com/fliks-app/fliks.git
cd fliks/backend && npm ci --ignore-scripts && cd ../..
cp -r fliks/examples/plugin-scaffold my-plugin
cd my-plugin
```

`npm ci` in `fliks/backend` installs what the packaging tool needs to run (`ts-node` and a few
libraries). `--ignore-scripts` skips building native modules the packaging tool never loads. If you
already set up the [dev environment](/development/dev-environment) in that checkout, skip that
line.

Then make two edits in `my-plugin`:

1. **`package.json`**: the scaffold's paths assume it still sits at `examples/plugin-scaffold/`
   inside the core repository. Replace every `../../backend` with `../fliks/backend` (three
   places). The result is shown below.
2. **`plugin.json`**: set `fliks` to `">=4.0.0 <5.0.0"`. The scaffold ships `">=3.0.0 <4.0.0"`,
   which a 4.x core refuses (the plugin row shows **Failed** with `incompatible-fliks`).

Keep the id `example.scaffold` while you follow this page, since Step 7 uses it in a path. Before you
share a plugin, give it an id of your own (see [the manifest reference](/plugins/manifest#base-fields-both-tiers)).

Here are the files after those edits.

`package.json`:

```json
{
  "name": "fliks-plugin-scaffold",
  "version": "0.1.0",
  "private": true,
  "license": "MIT",
  "scripts": {
    "build": "esbuild src/plugin.ts --bundle --platform=node --target=node24 --outfile=dist/plugin.js",
    "package": "npm run build && cp plugin.json logo.svg dist/ && node ../fliks/backend/node_modules/.bin/ts-node ../fliks/backend/scripts/package-plugin.ts dist -o scaffold.fkplugin",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fliks/plugin-contract": "file:../fliks/backend/src/common/plugin-contract"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "typescript": "^5.6.0",
    "esbuild": "^0.25.0"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node10",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

`plugin.json`, the manifest. Every field here is explained in full in
[the manifest reference](/plugins/manifest); this is the minimum a working `process` manifest needs.
Leave `files` empty: the packaging tool fills in the file hashes.

```json
{
  "id": "example.scaffold",
  "pluginApi": 1,
  "name": "Scaffold",
  "version": "0.1.0",
  "fliks": ">=4.0.0 <5.0.0",
  "author": "you",
  "description": "Starting point for a Fliks process plugin",
  "license": "MIT",
  "logo": "logo.svg",
  "kind": "process",
  "runtime": "node",
  "memoryMb": 128,
  "files": {},
  "database": { "schema": false, "coreRefs": [] },
  "routes": [{ "method": "GET", "path": "/ping", "policy": "read:Settings" }],
  "scopes": ["config:rw"],
  "ingestRoots": [],
  "ui": {
    "configPages": [
      { "kind": "form", "id": "main", "labelKey": "scaffold.settings", "fields": [] }
    ]
  },
  "i18n": { "en": { "scaffold.settings": "Scaffold" } }
}
```

`logo.svg` can be any SVG under 64 KiB with an `<svg>` root element and no `<script>` tag,
event-handler attribute or `javascript:` URI; core sniffs the bytes and refuses anything else. A
`logo.png` works too, if `logo` names it.

`src/plugin.ts`, the entry point. This implements all 7 methods core calls on a running plugin
(`hello`, `health`, `job`, `http`, `event`, `config`, `shutdown`), dials both sockets core listens
on, and answers one route:

```ts
import { connect, type Socket } from 'net';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PluginApi, PluginManifest } from '@fliks/plugin-contract';
// Runtime values come from the leaf, not the barrel: the barrel re-exports the one helper that
// needs semver, and a bundler cannot drop a CJS dependency it has already been asked to evaluate.
import { MAX_FRAME_BYTES, type Req, type Res } from '@fliks/plugin-contract/protocol';

const env = process.env;
const manifest = JSON.parse(readFileSync(join(__dirname, 'plugin.json'), 'utf8')) as PluginManifest;

/** Newline-delimited JSON, one object per line. Core listens on both sockets; this dials them. */
function dial(path: string, onFrame: (sock: Socket, frame: Req) => void): Socket {
  const sock = connect(path);
  let buffered = '';
  sock.on('data', (chunk) => {
    buffered += chunk.toString('utf8');
    let cut: number;
    while ((cut = buffered.indexOf('\n')) !== -1) {
      const line = buffered.slice(0, cut);
      buffered = buffered.slice(cut + 1);
      if (line.length === 0) continue;
      try {
        onFrame(sock, JSON.parse(line) as Req);
      } catch {
        // A frame core sent that this plugin cannot parse: skip it, stay up for the next one.
      }
    }
  });
  sock.on('error', (err) => process.stderr.write(`socket ${path}: ${err.message}\n`));
  return sock;
}

function reply(sock: Socket, res: Res): void {
  const line = `${JSON.stringify(res)}\n`;
  // Core SIGKILLs on an oversize frame, so refuse to be the one that sends it.
  if (Buffer.byteLength(line) > MAX_FRAME_BYTES) {
    reply(sock, { i: res.i, e: { c: 'RESPONSE_TOO_LARGE', m: 'reply exceeded the frame limit' } });
    return;
  }
  sock.write(line);
}

/** The uplink. Requests core's host methods; ids must be unique per connection. */
const core = dial(env.FLIKS_CORE_SOCK!, (_sock, frame) => {
  const settle = pending.get((frame as unknown as Res).i);
  if (!settle) return;
  pending.delete((frame as unknown as Res).i);
  settle(frame as unknown as Res);
});

const pending = new Map<number, (res: Res) => void>();
let nextId = 1;

export function callHost<T>(method: string, params?: unknown): Promise<T> {
  const i = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(i, (res) => (res.e ? reject(new Error(`${res.e.c}: ${res.e.m}`)) : resolve(res.r as T)));
    core.write(`${JSON.stringify({ i, m: method, p: params } satisfies Req)}\n`);
  });
}

/**
 * The 7 methods core calls. `event` and `config` are notes; replying to one is a protocol
 * violation. Everything else must answer, and within the deadline core publishes for it.
 */
const api: PluginApi = {
  hello: async () => ({ manifest, token: env.FLIKS_PLUGIN_TOKEN ?? '' }),

  health: async () => ({ ok: true }),

  job: async ({ name }) => {
    // stderr is this plugin's log: core tags each line with the plugin id and buffers it.
    const config = await callHost<Record<string, string>>('config.get', {});
    process.stderr.write(`job ${name} ran with ${Object.keys(config).length} setting(s)\n`);
    return { ok: true };
  },

  http: async ({ method, path }) => ({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: { hello: `${method} ${path}` },
  }),

  event: () => {},

  config: () => {},

  shutdown: async () => {
    setTimeout(() => process.exit(0), 10);
    return { ok: true };
  },
};

dial(env.FLIKS_PLUGIN_SOCK!, (sock, req) => {
  const handler = api[req.m as keyof PluginApi] as ((p: unknown) => unknown) | undefined;
  if (!handler) {
    reply(sock, { i: req.i, e: { c: 'UNKNOWN_METHOD', m: req.m } });
    return;
  }
  // A note carries no `i`; core sends no reply for it and accepts none.
  if (req.i === undefined) {
    handler(req.p);
    return;
  }
  Promise.resolve(handler(req.p)).then(
    (r) => reply(sock, { i: req.i, r }),
    (err: Error) => reply(sock, { i: req.i, e: { c: 'PLUGIN_ERROR', m: err.message } }),
  );
});
```

That's the whole plugin: about 100 lines, and it starts, answers every method core calls, serves
one route, and reads its own settings.

## Step 2: get the contract types

`@fliks/plugin-contract` holds the TypeScript types and protocol constants of the plugin API. Types
are erased at build time and the few constants get bundled into `plugin.js`, so nothing from it is
installed alongside your plugin.

With the layout from Step 1 you already have it: the `file:../fliks/backend/src/common/plugin-contract`
dependency links it from your core checkout, and `npm install` in the next step sets up that link.
Nothing to do here.

If you later move your plugin away from a core checkout, install the copy attached to each core
release instead, picking the release that matches the core you target, plus `semver`, which the
contract's type-check needs:

```bash
npm i -D https://github.com/fliks-app/fliks/releases/download/v4.1.1/fliks-plugin-contract-4.1.1.tgz semver @types/semver
```

Remove the `file:` entry from `dependencies` when you do. The `package` script still runs core's
packaging tool from a checkout; [Packaging and signing](/plugins/packaging-and-signing) covers
what an archive must contain if you build it yourself.

## Step 3: build and package

From `my-plugin`:

```bash
npm install
npm run typecheck        # tsc --noEmit: type errors, no output files
npm run package          # bundle -> dist/, then core's packaging tool -> scaffold.fkplugin
```

Expected output from `npm run package`, roughly:

```text
> esbuild src/plugin.ts --bundle --platform=node --target=node24 --outfile=dist/plugin.js

  dist/plugin.js  5.1kb

Done in 11ms
wrote /path/to/fliks-work/my-plugin/scaffold.fkplugin (6628 bytes) for example.scaffold@0.1.0
unsigned: installable only on a core whose "allow unsigned plugins" plugin setting is on
```

The `wrote ...` line is the one that matters: `scaffold.fkplugin` now sits in `my-plugin`. If the
command stops with `package-plugin: ...` instead, the message names the field or file it refused.
A `Cannot find module` error for `ts-node` means `npm ci` has not run in `fliks/backend`.

That packaging tool (`backend/scripts/package-plugin.ts` in the core repo) always produces an
**unsigned** archive: it recomputes every file hash itself and refuses early on anything the
install step would refuse later (a missing `plugin.js`, a bad id, an oversized entry), but signing
for real distribution is a separate, later step it does not perform. See
[Packaging and signing](/plugins/packaging-and-signing) for that step.

## Step 4: allow unsigned plugins (once)

Log into your Fliks instance as an admin, open **Settings > Plugins**, then the **⋮** menu next to
**Search for a plugin**, then **Settings**, and turn on **Allow unsigned plugins**. This exists for
local development; leave it off otherwise.

## Step 5: install it

Back on **Settings > Plugins**, open the **⋮** menu again and choose **Import a plugin**. Pick the
`scaffold.fkplugin` file you just built.

This opens the consent sheet: **Install Scaffold?**, its id and version, a trust badge (it will say
**Imported manually**, since it's unsigned), a short explanation of what a `process` plugin can do,
and a capability list built from your manifest. Here it lists two lines: **Add a "main" settings
page** (from `ui.configPages`) and **Access: config:rw** (from `scopes`). Routes are not listed.
Because the archive is unsigned, the **Install** button stays disabled until you tick the
acknowledgement checkbox. Tick it, click **Install**.

## Step 6: see it running

Back in the plugin list you should see one new row:

| Plugin | Version | Tier | Trust | Status | Enabled |
|---|---|---|---|---|---|
| Scaffold (`example.scaffold`) | 0.1.0 | Process | Imported manually | Active | on |

If it instead shows **Failed**, click the status badge: it shows the reason and the last lines the
plugin wrote to its own log (its stderr). `incompatible-fliks` means the `fliks` range in
`plugin.json` doesn't include your core version (see Step 1). See
[Testing and debugging](/plugins/testing-and-debugging#common-errors) for the other common ones.

Expand the **Metrics** row under it (`process` plugins only) to see **Host calls**, **Restarts**
and **Memory (RSS)**, all zero or near-zero for a plugin that's just started and done nothing yet.

Now call the plugin's one route. Core serves a plugin's routes under `/api/plugins/<id>/`, so in
the same browser where you are logged in, open:

```text
http://<your-fliks-host>/api/plugins/example.scaffold/ping
```

You should get `{"hello":"GET /ping"}`: core checked the route's `read:Settings` policy against your
account, forwarded the request to the plugin's `http` handler, and returned its answer. A `503`
means the process isn't running; check the status badge.

## Step 7: change something and reinstall

Add a setting, show it in the admin sidebar, and read it from the route.

In `plugin.json`, replace the `ui` and `i18n` blocks with these. The field goes on the existing
`main` page; the contribution adds a sidebar entry that opens it; `i18n.en` labels the new field:

```json
"ui": {
  "configPages": [
    {
      "kind": "form",
      "id": "main",
      "labelKey": "scaffold.settings",
      "fields": [
        { "key": "greeting", "type": "text", "labelKey": "scaffold.greeting", "default": "hello" }
      ]
    }
  ],
  "contributions": [
    {
      "id": "scaffold.settings.page",
      "slot": "settings.page",
      "weight": 100,
      "labelKey": "scaffold.settings",
      "action": { "kind": "route", "path": "/admin/settings/plugins/example.scaffold/main" }
    }
  ]
},
"i18n": { "en": { "scaffold.settings": "Scaffold", "scaffold.greeting": "Greeting" } }
```

The path `/admin/settings/plugins/<id>/<page id>` is where core renders a plugin's config page; it
must name this plugin's own id and a page it declares, or the plugin fails with
`invalid-ui-contribution`.

In `src/plugin.ts`, replace the `http` handler so it reads the setting. `config.get` returns the
plugin's own settings without their `plugin.<id>.` prefix, and only the ones an admin has saved, so
keep a fallback for the `default`:

```ts
  http: async ({ method, path }) => {
    const { greeting = 'hello' } = await callHost<Record<string, string>>('config.get', { keys: ['greeting'] });
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { [greeting]: `${method} ${path}` },
    };
  },
```

Rebuild and repackage:

```bash
npm run typecheck
npm run package
```

Import the new `scaffold.fkplugin` the same way as before. The consent sheet now also lists **Add a
"settings.page" interface element**. **Reinstalling the same id replaces the running plugin**, there
is no need to uninstall first; the existing settings and (if it had one) database schema are kept.
Uninstalling, on the other hand, deletes them.

You should now see **Scaffold** as its own section in the admin settings sidebar. Open it, type
`bonjour` in **Greeting**, save, and reload the `/ping` URL from Step 6: it answers
`{"bonjour":"GET /ping"}`.

## What to read next

- [The manifest reference](/plugins/manifest) for every field you just used and the ones you
  didn't.
- [Process plugins](/plugins/process-plugins) for the full runtime contract: config, logging, jobs,
  crashes.
- [Testing and debugging](/plugins/testing-and-debugging) before you build anything you'd want to
  keep working.
