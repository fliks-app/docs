---
title: Testing and debugging
description: Unit tests with no core, a real end-to-end harness, database tests, verifying against core's own archive inspector, and the common install-time errors with their fixes.
---

## Unit tests need no database and no running core

Both real process plugins covered in [Examples](/plugins/examples) use Node's built-in test
runner, no Jest, no Vitest, no framework at all. In either repository, `npm test` runs:

```bash
tsx --test --test-concurrency=1 test/*.test.ts
```

Both also define `npm run typecheck` (`tsc --noEmit`), `npm run build` and `npm run package`.

`--test-concurrency=1` matters once any of your tests share one Postgres instance (see
[Database tests](#database-tests) below); pure logic tests (a queue's backoff ladder, a wire-format
parser, an SSRF address guard) don't need a database at all and run against local stubs.

## The end-to-end harness pattern

The single most reusable test in either real plugin: spawn your **actual built** `dist/plugin.js`
as a real child process, under the exact same Node flags and environment allowlist core's
supervisor uses, and play core's side of both sockets against it. This catches a wire-protocol
mistake in your own code that a unit test around your handler functions never would.

```ts
// A tiny request/response correlator standing in for core's own RPC channel.
class CoreSideChannel {
  private pending = new Map<number, (res: Res) => void>();
  private nextId = 1;
  constructor(private socket: net.Socket) {
    const reader = new FrameReader();
    socket.on('data', (chunk) => {
      for (const line of reader.push(chunk)) {
        const frame = parseFrame(line);
        if (!isReq(frame) /* i.e. it's a Res or Note from the plugin */) this.onFrame(frame);
      }
    });
  }
  call<T>(method: string, payload: unknown, timeoutMs = 10_000): Promise<T> { /* ... */ }
  sendNote(note: Note): void { this.socket.write(encodeFrame(note)); }
}

// The Node flags core's supervisor passes (backend/src/modules/plugins/supervisor/spawn-plan.ts).
const permFlag = resolvePermissionFlag(); // '--permission' or '--experimental-permission'
const args = [
  permFlag,
  `--allow-fs-read=${DIST}`,
  `--allow-fs-read=${DATA_DIR}`,
  `--allow-fs-write=${DATA_DIR}`,
  '--max-old-space-size=256',
  '--disable-proto=delete',
  path.join(DIST, 'plugin.js'),
];
const child = spawn(process.execPath, args, {
  cwd: DATA_DIR,
  env: {
    PATH: process.env.PATH ?? '/usr/bin:/bin',
    NODE_ENV: 'test', // core sets 'production'
    TZ: 'UTC',
    HOME: DATA_DIR,
    FLIKS_CORE_SOCK: coreSockPath,
    FLIKS_PLUGIN_SOCK: pluginSockPath,
    FLIKS_PLUGIN_TOKEN: token,
    FLIKS_PLUGIN_ID: 'acme.tool',
    FLIKS_API_VERSION: '1',
    FLIKS_DB_URL: dsn, // or '' if your manifest declares no schema
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
```

Drive the whole protocol against it: `hello` (assert the token is echoed back verbatim, and the
returned manifest's `id`/`kind` match), `health`, a couple of `event`/`config` notes, every `http`
route you declare, every `job` you declare, then `shutdown`, and finally assert the process exits 0
and that it actually dialled `FLIKS_CORE_SOCK`. Stand in canned replies for whichever host methods
your plugin calls (`config.get -> {}`, `acquisition.candidates -> {items: [], cursor: null}`, and so
on) so the harness never needs a real core behind it.

## Database tests

> [!WARNING]
> **A repository test that silently returns when the database isn't reachable reports a pass, not a
> skip.** Write your database tests to report a visible skip (`t.skip(...)`) rather than
> early-return on an unreachable connection; a pass with zero assertions run is how a real bug can sit unnoticed
> through several green CI runs.

Reproduce core's own database setup exactly, don't point tests at your real dev database:

```bash
docker run -d --name fliks-migtest -p 55432:5432 \
  -e POSTGRES_USER=fliks -e POSTGRES_PASSWORD=fliks -e POSTGRES_DB=fliks postgres:17
```

This is what the download plugin's tests target by default
(`postgresql://fliks:fliks@127.0.0.1:55432/fliks`, overridable with `FK_TEST_PG_DSN`), and what its
CI starts as a service container.

Your `coreRefs` tables don't exist in this throwaway database, so stand in minimal stubs for
whichever ones your manifest declares, matching only what a foreign key or an `id` lookup needs:

```bash
docker exec fliks-migtest psql -U fliks -d fliks -c \
  "CREATE TABLE IF NOT EXISTS public.\"media\" (id serial PRIMARY KEY, \"title\" text NOT NULL DEFAULT '');"
```

A useful round trip to test against that stub database: `migrateUp` (apply everything), `migrateUp`
again (nothing left to apply), `migrateDown` to zero (only your bookkeeping table remains), then
`migrateUp` once more. Also worth reproducing directly: create the role and schema the way core
does (`CREATE ROLE ... LOGIN`, `CREATE SCHEMA ... AUTHORIZATION`, `GRANT REFERENCES ("id") ON
public."media"`), then, as that role, confirm you can create a table with a foreign key into it, an
invalid id is rejected, a bare `SELECT` on the core table is denied, and `ON DELETE CASCADE`
actually cascades. That's the whole trust boundary described in
[Storage and database](/plugins/storage-and-database), worth testing directly rather than trusting.

## Verifying your archive against the real core inspector

Before ever touching a running server, run your packaged `.fkplugin` through **the actual function
core uses to accept or refuse an archive**, not a reimplementation of it. If you keep a Fliks
checkout beside your plugin:

```bash
FLIKS_REPO=../fliks npx tsx scripts/verify-with-core.ts   # or: npm run verify-with-core
```

A script like this imports `inspect()` straight from `backend/src/modules/plugins/archive/zip-inspector.ts`
(preferring a compiled build if one exists), runs it against your packaged bytes with
`{ allowUnsigned: true }`, and fails loudly if the result isn't `{ ok: true, kind: 'process' }` (or
`'data'`, for that tier). This catches every archive-format mistake, a stray file, a bad hash, a
missing logo, before you'd otherwise only discover it as a refused import in the admin UI.

## Running against a local dev Fliks instance

1. Turn on **Allow unsigned plugins** (**Settings > Plugins > ⋮ > Settings**) while you're
   developing.
2. Import your `.fkplugin` (**Settings > Plugins > ⋮ > Import a plugin**).
3. Watch the plugin's row. Its status badge reads **Active**, **Unavailable** (installed, but the
   process isn't in its `ready` state), **Failed** (registration failed) or **Disabled**. Click the
   badge for the detail: the `statusReason` of a failed registration and, once the crash circuit
   breaker has tripped, the last 4 KiB the process wrote to stderr. The raw process state
   (`starting`, `handshaking`, `ready`, `degraded`, `crashed`, `backoff`, `failed`, `stopped`) is
   the `processState` field of `GET /api/plugins`.
4. `GET /api/plugins/metrics` (or the **Metrics** panel under the plugin's row) once it's running: a
   climbing `hostCallFailureCount` or a non-zero `restartCount` both mean something's still wrong
   even though the row says `Active`.

Reinstalling the same plugin id replaces the running instance in place, no need to uninstall first,
and it keeps your existing settings and database schema.

## Reading your plugin's logs

Core captures your process's stdout and stderr line by line into its own log buffer, tagged
`plugin:<your-id>`. Read them in **Settings > System > Logs** (`/admin/system/logs`, or
`GET /api/system/logs?q=plugin:<your-id>`): the search matches the context column. The buffer keeps
the last 2000 core log lines overall, so it's a recent window, not an archive.

- A stdout line is logged at `log` level; a stderr line at `error` level, unless the line itself
  starts with `WARN` (after any `[bracketed]` prefixes), in which case it's logged as a warning.
- Output is capped at `PLUGIN_LOG_CAP_BYTES_PER_MINUTE` (64 KiB per minute, stdout and stderr
  together). Past the cap, the rest of that minute is dropped, with a single `output suppressed`
  warning. Rate-limit your own logging.
- Core writes its own lines under the same tag: every crash (`plugin crashed: <reason>`), an
  unhealthy `health` reply, a tripped circuit breaker, a foreign key that blocks core deletes.

## Common errors

The admin UI turns an install refusal into a translated message per family of codes. The raw code
(`PLUGIN_UNSIGNED` and so on) is the `code` field of the failed API response, visible in your
browser's developer tools; codes the UI doesn't know are shown verbatim.

| Symptom | Cause | Fix |
|---|---|---|
| `MODULE_NOT_FOUND` at spawn, plugin row shows `spawn-failed` | `plugin.js` isn't fully bundled: it `require`s a package that isn't inlined. | Bundle with esbuild (or any bundler) targeting Node; an archive carries no `node_modules`. |
| Plugin killed immediately, log shows `hello token mismatch` | `hello`'s reply doesn't echo `FLIKS_PLUGIN_TOKEN` back unmodified. | Read the env var once, return it verbatim as `token`. |
| `PLUGIN_UNSIGNED` on import | A `process` archive has no signature, and **Allow unsigned plugins** is off. | Turn the setting on for local dev, or sign the archive for real (see [Packaging and signing](/plugins/packaging-and-signing)). |
| `PLUGIN_BAD_MANIFEST` | Not valid JSON, a required base field is missing, or an unknown top-level key is present. | Check against [the manifest reference](/plugins/manifest); this code gives no finer reason. |
| `PLUGIN_TIER_VIOLATION` | A `data` manifest's archive carries `plugin.js`, or a `process` manifest's doesn't. | Match `kind` to what's actually in the archive. |
| `PLUGIN_HASH_MISMATCH` / `PLUGIN_FILE_SET_MISMATCH` | The manifest's `files` map doesn't match what's really in the archive. | Don't hand-write `files`; let your packaging step compute it from the built bytes. |
| `incompatible-api` | Your `pluginApi` isn't in core's `SUPPORTED_PLUGIN_API_VERSIONS`. | Bump to the current value (`1`) and re-check what changed against [SDK reference](/plugins/sdk-reference). |
| `incompatible-fliks` | Your `fliks` range doesn't cover the running core version. | Widen the range (with an upper bound) once you've actually checked compatibility; see [Publishing](/plugins/publishing#compatibility). |
| `PLUGIN_DB_PROVISION_FAILED` on import, or `db-provision-failed` as the status reason at start | A declared `coreRefs` table or its `id` column doesn't exist, or your role/schema creation failed for another reason. | Confirm the table name and check the core version you're running against actually has it. |
| Row stays **Unavailable**; `processState` cycles `crashed` / `backoff` (retries after 1, 2, 4, 8, 16, then 30 s), then settles on `failed` | Six crashes inside 10 minutes trips the circuit breaker. | Fix the underlying crash (the stderr tail is in the badge detail and the logs), then disable and re-enable the plugin, or call `POST /api/plugins/:id/restart`; it will not retry on its own once tripped. |
| `processState` shows `degraded`, then the process gets killed and respawned | `health` is timing out or replying `ok: false`: two misses in a row mark it `degraded`, four kill it. | Make sure your `health` handler answers within 3 seconds and doesn't block on anything that can hang (a slow upstream call, for instance). |
| A settings change doesn't seem to take effect | You're reading `FLIKS_CFG_*` env vars, which are a snapshot from spawn time. | Call `config.get` live at the point of use instead (the `config` note names the keys that changed), or restart the plugin after a settings change. |

For the full archive-guard refusal codes (`PLUGIN_BAD_ID`, `PLUGIN_TOO_LARGE`, and the rest), see
[the manifest reference](/plugins/manifest#full-validation-error-reference).
