---
title: Process plugins
description: The process-tier runtime contract in full, entry point, lifecycle hooks, config, logging, crashes and the deadlines core enforces.
---

## The entry point

A `process` plugin ships **one bundled `plugin.js`**. There is no `node_modules` in the archive, so
any `require`/`import` your bundle doesn't already contain fails at spawn with `MODULE_NOT_FOUND`,
which shows up on the plugin row as `spawn-failed`. Bundle with esbuild (as the scaffold does), or
any other bundler, targeting `node`, CommonJS or an ESM build Node can load directly.

Both sockets are **dialled by the plugin**, never listened on; core listens on both, and the plugin
connects to each once at startup. See [Architecture](/plugins/architecture#the-rpc-between-core-and-a-process-plugin)
for the wire format itself.

## The 7 lifecycle hooks

| Method | Called | Must answer within | Behaviour |
|---|---|---|---|
| `hello` | Once, right after connecting | 10 s | Return `{ manifest, token }`. `manifest` should be read fresh from disk (`plugin.json` next to your bundle), not a copy baked into the bundle, since it's what core actually enforces against. `token` is `FLIKS_PLUGIN_TOKEN` echoed back unmodified; getting this wrong is treated as an impostor on the socket and the process is killed immediately, with no message naming why beyond `hello token mismatch` in core's own log. |
| `health` | Every 15 s, no payload | 3 s | Reply `{ ok: boolean, detail?: string }`. `ok: false` counts exactly like a missed or timed-out call. `detail` is logged against this plugin's own log stream, name what's wrong there if you can. |
| `job` | On a cron tick, or an admin's manual trigger, for a job this manifest declared | 60 min | `{ name, jobId, args? } => { ok: true }`. There is no `else`: a rejection is only logged, never retried automatically. |
| `http` | Once per proxied request to a declared route | 180 s | `{ method, path, query, body, principal } => { status, headers, body }`. `principal` is `{ kind: 'delegated', userId }`, the signed-in user the request is made for. The contract also defines `{ kind: 'system' }`, but core sends `delegated` on every call today, proxied routes and the player's pre-roll call alike. |
| `event` | A **note**, no reply | n/a | `{ name, payload }`, one of core's domain event names. Every running `process` plugin gets every domain event; there is no per-plugin filtering, so ignore what you don't care about. |
| `config` | A **note**, no reply | n/a | `{ changed: string[] }`, the unprefixed keys of your own `plugin.<id>.*` settings that just changed. It names what changed, never the new value, call `config.get` for that. |
| `shutdown` | Once, before core sends SIGTERM | 3 s, then 2 s grace before SIGKILL | Reply `{ ok: true }` and exit soon after (`setTimeout(() => process.exit(0), 10)` is the pattern both real plugins use, so the reply flushes before the process disappears). |

`event` and `config` are **notes**: they carry no `i`, and replying to one is itself a protocol
violation.

## Calling core: the host API

The 15 methods you can call on core (`media.acquisitionContext`, `library.ingest`,
`config.get`/`config.set`, and so on) are fully documented, with their exact TypeScript signatures,
in [SDK reference](/plugins/sdk-reference). Every call needs the right `scopes[]` declared in your
manifest first, see [the manifest reference](/plugins/manifest#scopes).

## Config and settings

Two ways to read your own `plugin.<id>.*` admin settings, and they behave differently:

1. **`config.get({ keys? })`**, a live host call. Always returns the current value. This is the
   pattern to prefer: `fliks.download` never touches the environment variables below, it just calls
   `config.get` at the point of use, every search, every job tick, so a setting an admin just
   changed is honoured on the very next thing that reads it.
2. **`FLIKS_CFG_*` environment variables**, set once at spawn from whatever the settings were at
   that moment. Each `plugin.<id>.<key>` setting is re-keyed: drop the `plugin.<id>.` prefix,
   upper-case what's left, replace every character outside `[A-Z0-9_]` with `_`, and prepend
   `FLIKS_CFG_`. Example: `plugin.acme.tool.api-key` becomes `FLIKS_CFG_API_KEY`. These never
   change for the life of the process: a later `config` note only tells you *that* something
   changed, it doesn't refresh the variable. If you read settings this way, either restart on a
   `config` note yourself or accept that a change only takes effect on the plugin's next natural
   restart.

Both patterns are real, shipping code (the first in `fliks.download`, the second in the retrying
webhook-delivery plugin covered in [Examples](/plugins/examples)); pick the live call unless you
have a reason not to.

## Logging

Write to **stderr** (and stdout, for anything that isn't an error). Core tags each line with your
plugin id and buffers it, so a stack trace at startup shows up on the plugin's row in the admin UI
without anyone touching container logs. Output is capped at 64 KiB per minute; past that, lines are
dropped for the rest of that minute with one warning.

Two habits worth copying from the real plugins:

- **One line per call, no multi-line output.** Core line-buffers your output into its log viewer.
- **Redact anything that looks like a credential.** A Postgres connection string's password rotates
  on every spawn, but a driver error can still echo it verbatim; a small regex over `://user:pass@`
  before you write anything is cheap insurance:

```ts
function redact(msg: string): string {
  return msg.replace(/:\/\/[^\s/@]+:[^\s/@]+@/g, '://***:***@');
}
```

## Crashes, backoff and the circuit breaker

The full state machine and its thresholds are in
[Architecture](/plugins/architecture#process-isolation). One thing worth restating here because
it changes how you should read a stuck plugin: **six crashes inside a rolling 10-minute window trip
a permanent circuit breaker**. The supervisor stops retrying entirely, the plugin's row shows
`Failed`, and it stays that way until an admin disables and re-enables it, installs an upgrade, or
calls `POST /api/plugins/<id>/restart`.
If your plugin is crash-looping during development, fix the crash rather than waiting it out, past
that sixth crash nothing will restart it for you.

## Environment

Core **never** passes its own environment through (`...process.env` is never spread into the
child). Everything a `process` plugin gets is exactly this, set once at spawn:

| Variable | What it holds |
|---|---|
| `FLIKS_PLUGIN_TOKEN` | Random per spawn. Echo it back, unmodified, as `hello`'s `token`. |
| `FLIKS_CORE_SOCK` | The socket to dial for your own host-API calls. |
| `FLIKS_PLUGIN_SOCK` | The socket to dial to receive core's calls. |
| `FLIKS_DB_URL` | Your own Postgres connection string, rotated on every spawn; empty string if your manifest declared no schema. |
| `FLIKS_PLUGIN_ID` | Your manifest's `id`, verbatim. |
| `FLIKS_API_VERSION` | Your manifest's own `pluginApi`, stringified. Compared for exact equality, never a range: core answers each plugin in the revision that plugin declared, not core's newest. |
| `FLIKS_CFG_*` | Every one of your own settings, re-keyed as described above. |
| `HOME` | Your per-plugin data directory. Also your child process's cwd. |
| `PATH`, `NODE_ENV`, `TZ` | Fixed values (`PATH=/usr/local/bin:/usr/bin:/bin`, `NODE_ENV=production`, and the host's timezone or `UTC`). |

## Filesystem

Two directories, and only two:

- **Code directory** (`--allow-fs-read` only): re-extracted from your signed, stored archive on
  **every** ordinary start, boot, enable, an admin's manual restart, install and upgrade alike, not
  only a crash respawn. Nothing you write there survives the next start.
- **Data directory** (`--allow-fs-write`, and also readable, and also your `HOME`/cwd): keyed by
  your plugin id alone, outside the code tree. This is the only place worth writing anything that
  needs to survive a restart, an upgrade, or a disable/re-enable cycle. **Uninstalling deletes it.**
  Disabling does not.

## Deadlines and limits

| What | Value | On breach |
|---|---|---|
| `hello` reply | 10 s | Child killed, restarted with backoff. |
| `health` reply | 3 s, asked every 15 s | 2 consecutive misses degrade the plugin; 4 force a SIGTERM-then-SIGKILL recycle. |
| One host call | 8 s, except `library.ingest` at 30 min | The call rejects; the plugin itself keeps running. |
| One proxied `http` route | 180 s | Caller gets a `504`; a browser behind a reverse proxy times out long before this anyway. |
| One `job` call | 60 min | Sized for a full library sweep, not an interactive request. |
| `shutdown` reply | 3 s, then 2 s grace | Killed if it doesn't exit in time. |
| One RPC frame, either direction | 4 MiB | Refused at the sender; an oversize frame from the plugin's side is a protocol violation and it is SIGKILLed. |
| stdout + stderr | 64 KiB/minute | Output dropped for the rest of that minute, once with a warning. |
| Heap (`memoryMb`) | 256 MB default | Caps V8's old space only; nothing here caps the process's total resident memory. |

## Metrics

`GET /api/plugins/metrics` (needs the `read:Settings` permission) reports, per installed plugin, `{ pluginId, kind, metrics }`,
with `metrics: null` for a `data` plugin (it has no supervisor) and for a `process` plugin that
isn't currently running, never a row of zeros that reads like a healthy process. For a running
`process` plugin:

| Field | Meaning |
|---|---|
| `hostCallCount` / `hostCallFailureCount` | Every inbound call across your 15 host methods, counted once through the one funnel all of them share. |
| `hostCallP95Ms` | p95 duration over your most recent 256 host calls. `null` before the first call. |
| `restartCount` | Crash-triggered respawns since this supervisor last started. |
| `eventDropCount` | Notes core couldn't deliver because the outbound buffer to your plugin was full, or because a note was itself larger than the frame limit. |
| `residentSetSizeBytes` | The child's resident memory, read on demand, not polled in the background. `null` off Linux or if the child isn't up. |
