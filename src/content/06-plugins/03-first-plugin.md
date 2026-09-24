---
title: Your first plugin
description: Build, package and install a minimal process plugin from zero, and see it appear in Settings > Plugins.
---

## Prerequisites

- **Node.js 24** (the plugin scaffold targets `node24` as its bundle target; an older Node can
  still build it, but test against 24 if you can).
- **npm**.
- A **running local Fliks instance** you can reach and log into as an admin. See
  [Dev environment](/development/dev-environment) if you don't have one yet, or
  [Docker](/install/docker) for a packaged one.
- No bundler expertise needed. The scaffold uses [esbuild](https://esbuild.github.io/) and the
  commands below are copy-paste.

> [!IMPORTANT]
> A `process` plugin ships as **one bundled JavaScript file**. There is no `node_modules` inside a
> plugin archive, so anything your plugin `require`s at runtime has to be bundled in. Skipping this
> is the single most common way a first plugin fails, with `MODULE_NOT_FOUND` at spawn.

## Step 1: get the scaffold

The scaffold lives in the core Fliks repository at `examples/plugin-scaffold/`. Copy that directory
out to wherever you keep your own plugin, then rename its manifest's `id` before you do anything
else, `example.scaffold` is a placeholder.

The scaffold has five files. Here they are in full, so you can create them by hand if you'd rather
not clone the whole core repo just for this.

`package.json`:

```json
{
  "name": "fliks-plugin-scaffold",
  "version": "0.1.0",
  "private": true,
  "license": "MIT",
  "scripts": {
    "build": "esbuild src/plugin.ts --bundle --platform=node --target=node24 --outfile=dist/plugin.js",
    "package": "npm run build && cp plugin.json logo.svg dist/ && node ../../backend/node_modules/.bin/ts-node ../../backend/scripts/package-plugin.ts dist -o scaffold.fkplugin",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fliks/plugin-contract": "file:../../backend/src/common/plugin-contract"
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
[the manifest reference](/plugins/manifest); this is the minimum a working `process` manifest needs:

```json
{
  "id": "example.scaffold",
  "pluginApi": 1,
  "name": "Scaffold",
  "version": "0.1.0",
  "fliks": ">=3.0.0 <4.0.0",
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

`logo.svg` can be any valid SVG under 64 KiB with an `<svg>` root element and no `<script>` tag or
event-handler attribute; core sniffs the bytes and refuses anything else.

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

`@fliks/plugin-contract` is types and protocol constants only, erased at build time, never shipped
inside your bundle. Two ways to get it:

**From a core release** (works without a local Fliks checkout):

```bash
npm i -D https://github.com/fliks-app/fliks/releases/download/v3.0.0/fliks-plugin-contract-3.0.0.tgz
```

**A path mapping**, if you keep a Fliks checkout next to your plugin (this is what the scaffold's
own `package.json` above does, via `file:../../backend/src/common/plugin-contract`):

```json
{ "compilerOptions": { "paths": {
  "@fliks/plugin-contract": ["../fliks/backend/src/common/plugin-contract/index.ts"],
  "@fliks/plugin-contract/*": ["../fliks/backend/src/common/plugin-contract/*.ts"]
} } }
```

## Step 3: build and package

```bash
npm install
npm run typecheck        # tsc --noEmit
npm run package           # bundle -> dist/, then core's packaging tool -> scaffold.fkplugin
```

Expected output from `npm run package`, roughly:

```text
> esbuild src/plugin.ts --bundle --platform=node --target=node24 --outfile=dist/plugin.js
  dist/plugin.js  4.1kb

wrote /path/to/scaffold.fkplugin (1942 bytes) for example.scaffold@0.1.0
unsigned: installable only on a core whose "allow unsigned plugins" plugin setting is on
```

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
**Imported manually**, since it's unsigned), a one-line explanation of what a `process` plugin can
do, and a capability list built from your manifest (here: one settings scope, one route). Because
it isn't officially trusted, the **Install** button stays disabled until you tick the
acknowledgement checkbox. Tick it, click **Install**.

## Step 6: see it running

Back in the plugin list you should see one new row:

| Plugin | Version | Tier | Trust | Status |
|---|---|---|---|---|
| Scaffold | 0.1.0 | process | Imported manually | Active |

If it instead shows **Failed**, click the status badge: it shows the reason and the last lines the
plugin wrote to its own log. See [Testing and debugging](/plugins/testing-and-debugging#common-errors)
for what the common ones mean.

Expand the row's metrics panel (`process` plugins only) to see `hostCallCount`, `restartCount` and
resident memory, all zero or near-zero for a plugin that's just started and done nothing yet.

## Step 7: change something and reinstall

Add a setting your plugin reads. Change the manifest's `ui.configPages` to declare one field:

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
}
```

(`i18n.en` needs the new `scaffold.greeting` key too.) Read it back with `config.get` from the
`job` handler, or from `http`, exactly like the existing code already does for the whole settings
bag. Rebuild and repackage:

```bash
npm run package
```

Import the new `scaffold.fkplugin` the same way as before. **Reinstalling the same id replaces the
running plugin**, there is no need to uninstall first; the existing settings and (if it had one)
database schema are kept.

You should now see **Scaffold** as its own section in the admin settings sidebar, with your one
text field in it.

## What to read next

- [The manifest reference](/plugins/manifest) for every field you just used and the ones you
  didn't.
- [Process plugins](/plugins/process-plugins) for the full runtime contract: config, logging, jobs,
  crashes.
- [Testing and debugging](/plugins/testing-and-debugging) before you build anything you'd want to
  keep working.
