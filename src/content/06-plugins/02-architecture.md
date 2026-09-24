---
title: Architecture
description: The plugin lifecycle from install to running, process isolation, the core-to-plugin RPC, and how UI contributions reach the client.
---

## The lifecycle, end to end

| # | Step | What happens |
|---|---|---|
| 1 | Upload or catalog fetch | An admin uploads a `.fkplugin` archive, or picks a version from a configured catalog. Either way the bytes reach core as one ZIP buffer. |
| 2 | Inspect | Core runs the archive through a fixed set of guards (legal entry names, size caps, Ed25519 signature, manifest shape) and, if it passes, stages the bytes to disk. Nothing is written to the database yet. |
| 3 | Consent | The admin sees the plugin's identity, its trust level (official, unverified, unsigned) and everything it's asking to be able to do, and must explicitly acknowledge anything short of official trust. |
| 4 | Confirm | The staged archive is re-verified byte for byte, extracted, and (for a `process` plugin that asks for one) a Postgres role and schema are provisioned. A database row is written. |
| 5 | Register | Core validates every semantic rule a manifest must satisfy (`pluginApi`, the `fliks` range, routes, permissions, jobs, UI targets, i18n namespace) and, for a `process` plugin, spawns the child and waits for it to answer the handshake. |
| 6 | Running | A `data` plugin is simply registered: its declarations are live. A `process` plugin is now a supervised child, monitored for health and restarted on crash. |
| 7 | Disable | The process is stopped and every live registration (routes, UI contributions, jobs, webhooks) is dropped. The installed archive, its database role and schema, and its settings are untouched. |
| 8 | Enable | Re-registers from the stored archive; for a `process` plugin, spawns it again. |
| 9 | Upgrade | A newer version is inspected and confirmed like a fresh install, over the existing row. A plugin that was disabled stays disabled after an upgrade. |
| 10 | Uninstall | The registration is torn down, the installed archive is deleted, the plugin's Postgres role and schema are dropped, its per-plugin data directory is deleted, and every one of its settings is deleted. This is destructive and has no undo. |

> [!WARNING]
> Uninstalling a plugin removes its data directory and every setting, not only its database schema.
> If you want to keep those, export first (see [Storage and database](/plugins/storage-and-database#export-and-import)).

## Process isolation

A `process` plugin runs as its own OS-level child, spawned fresh on every start, boot, enable,
admin restart and install/upgrade alike, never reused across a crash respawn.

1. **Extract.** The plugin's code directory is re-extracted from the signed, stored archive on
   every start. Nothing written there survives the next start; if your plugin needs to remember
   something across restarts, it belongs in the plugin's data directory, not its code directory.
2. **Provision (once per version, reconciled on every start).** If the manifest asked for a schema,
   core creates (or confirms) a dedicated Postgres role and schema named `plugin_<id>` (dots in the
   id become underscores), grants it `REFERENCES`-only, column-level access to the exact core
   tables it declared needing, and rotates its password.
3. **Spawn.** Core builds a `node` command line with Node's permission model turned on
   (`--permission`, or `--experimental-permission` on older Node builds), an explicit
   `--allow-fs-read` for the code directory and the data directory, `--allow-fs-write` for the
   data directory only, `--max-old-space-size` set from the manifest's `memoryMb`, and
   `--disable-proto=delete`. On Linux the process is wrapped in `setpriv --no-new-privs --`. If
   core itself is running as root, the child is spawned under a dedicated uid in the range
   60000-64999 (one per installed plugin, allocated once and stored) and a shared group id, 65534;
   otherwise the child inherits core's own uid. No separate OS user account is created, this is
   plain `uid`/`gid` spawn options.
4. **Environment.** Core never passes its own environment through. The child gets exactly the
   variables listed in [Process plugins](/plugins/process-plugins#environment), nothing else.
5. **Handshake.** The child connects to two Unix sockets core listens on (the plugin always dials,
   never listens); core calls `hello` and expects the manifest and a token echoed back within 10
   seconds, or the child is killed and retried.
6. **Health.** Once past the handshake, core calls `health` every 15 seconds with a 3 second
   deadline. Two consecutive misses mark the plugin `degraded`; four force a
   SIGTERM-then-SIGKILL respawn.
7. **Crash and backoff.** Any crash (bad spawn, unexpected exit, handshake timeout, wrong token, a
   protocol violation, four missed health checks) restarts the child after a delay that climbs
   1s, 2s, 4s, 8s, 16s, then holds at 30s. 120 seconds of continuous health resets that ladder back
   to the start. Six crashes inside a rolling 10-minute window trip a circuit breaker: the
   supervisor gives up permanently until an admin re-enables the plugin (disable, then enable, or
   an upgrade).
8. **Stop.** An `shutdown` RPC call (3 second deadline), then a 2 second grace period, then SIGTERM,
   then 2 more seconds, then SIGKILL.

The full deadline and cap table lives in [Process plugins](/plugins/process-plugins#deadlines-and-limits).

## The RPC between core and a process plugin

Two Unix sockets, one per direction, both newline-delimited JSON, one object per line, capped at 4
MiB per line:

- **`Req { i, m, p? }`**, a call with a numeric id and a dotted method name, expects exactly one
  **`Res { i, r? } | { i, e: { c, m } }`** back with the same id.
- **`Note { m, p? }`** is fire-and-forget: no id, no reply, ever.

| Direction | Interface | Methods | Purpose |
|---|---|---|---|
| Core calls the plugin | `PluginApi` | 7: `hello`, `health`, `job`, `http`, `event`, `config`, `shutdown` | Lifecycle, cron ticks, proxied HTTP, domain event notes, settings-changed notes, graceful stop. |
| The plugin calls core | `PluginHostApi` | 15, grouped read / write-acquisition / ingest / events / config | Everything a plugin is allowed to know or do about your library and settings. |

Both interfaces, every payload shape, and the scope each host method requires are the exact source
of truth in [SDK reference](/plugins/sdk-reference); this page only covers the shape of the
transport.

## How a UI contribution reaches the client

1. A plugin's manifest declares `ui.contributions` (nav entries, menu rows) and `ui.configPages`
   (settings pages), described fully in [UI extensions](/plugins/ui-extensions). No Angular ships
   with a plugin; it only ships data.
2. At registration, core validates every UI-facing rule the manifest must satisfy: a route opening
   one of the plugin's own pages must point at a page the same manifest actually declares, the
   `i18n` root namespace can't collide with another plugin's, and so on.
3. The Fliks client calls `GET /api/plugins/ui` at app boot, and again after an install or an
   enable/disable toggle, and caches the result in a registry service. The response is one entry per currently active plugin: its contributions, its config
   pages, its translated strings, and (if it won the tie-break) its release-picker declaration.
   `process` plugins only appear in that response while their state is `ready`; a plugin that has
   gone unreachable simply isn't in the list, so a client never has to reason about a half-working
   plugin.
4. Per-viewer filtering happens on that same call: a `table` or `providers` page is only included
   if the requesting user's permissions would actually let them call the route it lists from, and
   any nav entry or menu row that only opens a withheld page is withheld with it.
5. The client renders each slot with its own existing component (there's no generic "plugin slot"
   widget): nav entries go into the sidebar/nav bar, settings pages get their own section in the
   admin sidebar named after the plugin, and menu rows join the card and detail-page action menus
   next to core's own entries, sorted by weight. See
   [UI extensions](/plugins/ui-extensions#how-each-slot-actually-renders) for the full mapping.
6. `when` predicates (`isAdmin`, `hasPermission:...`, `mediaType:movie`, and so on) are evaluated
   entirely client-side from state the client already has; an unrecognised predicate always
   evaluates to false, so an older client hides a row it doesn't understand rather than guessing.
   None of this is a trust boundary: every route a plugin's UI opens is still checked server-side.

## Updates

| Trigger | Cadence |
|---|---|
| Catalog refresh | Once a day at 03:00 server time, plus on demand from **Manage sources**. A source that has never been fetched, or whose cache is older than 6 hours, is also refreshed once at boot, without delaying startup. |
| Auto-update | Runs right after the daily catalog refresh, if the admin setting **Update plugins automatically** is on (it is, by default). For each installed plugin it takes the newest version any enabled source offers, and only installs it if that version is signed by the official catalog key (`official` trust). A plugin from a self-hosted source, or one that's `unverified`, never auto-updates; an admin installs it by hand instead. |
| Manual update | Identical to a fresh install: inspect, then confirm, of a version newer (or, with **Allow installing older versions** on, older) than what's installed. |

A plugin that was disabled before an upgrade stays disabled after it. Revocation (a catalog's
`denyList`) reaches an already-running plugin the moment its catalog refreshes, tearing its routes
down immediately rather than waiting for a restart; see
[Publishing](/plugins/publishing#revocation) for the full mechanics.

## Trust, at a glance

| Trust | What it means | What triggers it |
|---|---|---|
| **Official** | The archive's `plugin.json` is signed by a key core has compiled in. | The plugin came from the official catalog, or a source pinned to that same key. |
| **Unverified** | Signed, but not by a key core recognises. | Any other syntactically valid signature: a third-party catalog signing with its own key, for instance. |
| **Unsigned** | No signature at all. | Packaged locally with core's own dev packaging tool, or a source that ships archives unsigned. |

A `process` plugin needs the **Allow unsigned plugins** admin setting on to install at all if it's
unsigned; `unverified` installs without that setting, but always behind the explicit
acknowledgement in the consent step. See [Packaging and signing](/plugins/packaging-and-signing)
for what's actually signed and how, and [Publishing](/plugins/publishing) for how a catalog earns
`official` trust for what it lists.
