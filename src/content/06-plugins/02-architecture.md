---
title: Architecture
description: The plugin lifecycle from install to running, the wasm sandbox, the core-to-plugin interface, and how UI contributions reach the client.
---

## The lifecycle, end to end

| # | Step | What happens |
|---|---|---|
| 1 | Upload or catalog fetch | An admin uploads a `.fkplugin` archive, or picks a version from a configured catalog. Either way the bytes reach core as one ZIP buffer. |
| 2 | Inspect | Core runs the archive through a fixed set of guards (legal entry names, size caps, Ed25519 signature, manifest shape) and, if it passes, stages the bytes on disk. At most 5 staged archives exist at once and an hourly sweep removes any older than an hour. Nothing is written to the database yet. |
| 3 | Consent | The admin sees the plugin's identity, its trust level (official, unverified, unsigned) and everything it's asking to be able to do, and must explicitly acknowledge anything short of official trust. |
| 4 | Confirm | The staged archive is re-inspected byte for byte, and for a `process` plugin that asks for a schema a Postgres role and schema are provisioned. The archive and its manifest are stored in the database. |
| 5 | Register | Core validates every semantic rule a manifest must satisfy (`pluginApi`, the `fliks` range, routes, permissions, jobs, UI targets, i18n namespace) and, for a `process` plugin, compiles the component, runs the `hello` handshake and starts it. |
| 6 | Running | A `data` plugin is simply registered: its declarations are live. A `process` plugin is `ready` once its `start` call returns, and is monitored from then on. |
| 7 | Disable | The plugin's instances are stopped and every live registration (routes, UI contributions, jobs, webhooks) is dropped. The stored archive, its database role and schema, its data directory, its settings and its pending scheduled calls stay. |
| 8 | Enable | Registers again from the stored archive; for a `process` plugin, starts it again. |
| 9 | Upgrade | A newer version is inspected and confirmed like a fresh install, over the existing row. A plugin that was disabled stays disabled after an upgrade. A version lower than the installed one is allowed and logged. |
| 10 | Uninstall | The registration is torn down and the plugin's `plugin.<id>.*` settings, pending scheduled calls and granted scopes are deleted. Its Postgres schema and data directory are kept unless the admin also ticks **Also delete this plugin's data**; a reinstall finds them again. |

> [!WARNING]
> Uninstalling deletes the plugin's settings. Export first if you want them back (see
> [Storage and database](/plugins/storage-and-database#export-and-import)).

Every operation that changes one plugin (install, upgrade, enable, disable, restart, uninstall,
import, auto-update) takes that plugin's lock, so two racing operations on the same id are
serialised. A restore of a server backup refuses them with `PLUGIN_BUSY` until it ends.

## The sandbox

A `process` plugin is a WebAssembly component. Core compiles it with wasmtime and runs it in the
server's own process; there is no child process, no socket and no uid involved. The component only
has what the host links in:

- **Compilation.** The archive stored in the database is hashed at every load and the component is
  compiled from those bytes. Compiling is slow for a large component, so it runs in a short-lived
  child of the server and the result is cached under the runtime directory
  (`FLIKS_RUNTIME_DIR`, by default `plugins/` under the data directory), authenticated against a
  hash recorded in the database. A boot normally loads the cache and never compiles.
- **Network.** No sockets. Outbound HTTP goes through `wasi:http`, and core vets every request: `http`
  and `https` only, the name resolved once and every returned address checked, no redirect followed
  on the plugin's behalf, at most 32 requests per plugin in flight. Private ranges are refused
  unless the manifest declares `network: { "internal": true }` and an admin consented at install;
  reserved, multicast and link-local (cloud metadata) ranges stay refused either way.
- **Filesystem.** One directory, `/data`, private to the plugin and kept across restarts and
  upgrades. Nothing else is visible.
- **Environment.** Empty: no variables, no arguments.
- **Database.** Its own role and schema, through the `db` interface only.
- **Memory and time.** `memoryMb` caps each instance's linear memory, all live instances of one
  plugin together may hold at most twice that, and every call has a wall-clock deadline. A trapped,
  out-of-memory or overdue instance is dropped; core and the other plugins are unaffected.
- **Host functions.** A fixed set of calls, each bound to the calling plugin's id and checked
  against the `scopes` it declared.

The full deadline and limit table is in [Process plugins](/plugins/process-plugins#deadlines-and-limits).

## Instances and supervision

A WebAssembly instance runs one call at a time, so core keeps several per plugin, grouped in lanes
so that a slow job never delays a health check:

| Lane | Instances | Calls |
|---|---|---|
| `core` | exactly 1 | `hello`, `start`, `health`, `config-changed`, `shutdown` |
| `event` | 1, created at the first event | `event`, in arrival order |
| `http` | 0 to 4 | proxied routes and pre-roll |
| one per declared job | 1 each, created at its first run | `job` |
| `scheduled` | 0 to 2 | `scheduled` |

Idle `http`, `job` and `scheduled` instances are dropped after 10 minutes and recreated on demand.
No state that matters lives in an instance: it lives in the plugin's schema, its `/data`, or a
scheduled call.

1. **Handshake.** `hello(core-version, config)` must answer within 10 seconds with the plugin's
   `id`, `version` and `pluginApi`. Core compares all three for exact equality with the signed
   manifest. A mismatch is deterministic, so nothing retries: the plugin is `failed` with reason
   `manifest-mismatch`.
2. **Start.** `start` runs once after `hello`, whenever the plugin has no other live instance. It
   runs the plugin's migrations and re-arms its own background work. The plugin is `ready` once
   `start` returns; core waits up to 15 seconds for that when installing, enabling or booting, and
   reports `spawn-failed` (`still starting`) if it isn't, while the plugin keeps starting. A `start`
   may take up to 15 minutes. If core's own database was unreachable during `start`, the plugin is
   `degraded` and `start` is retried until it succeeds, with no crash counted.
3. **Health.** The `core` instance gets `health` every 15 seconds with a 10 second deadline. A reply
   of `ok: false` or a timeout is a miss. Two consecutive misses mark the plugin `degraded` (its
   routes answer 503 and it leaves the UI); four drop the instance and count a crash. A good reply
   recovers it. A health call that traps is a crash at once.
4. **Crash and backoff.** A crash drops only that instance. Its lane creates a new one after a delay
   that climbs 1s, 2s, 4s, 8s, 16s, then holds at 30s; 120 seconds of continuous `ready` resets the
   ladder. Six crashes inside a rolling 10-minute window trip a circuit breaker: every instance is
   dropped, the plugin is `failed`, and it stays that way until an admin restarts or re-enables it.
5. **Stop.** `shutdown` is called on the `core` instance with a 3 second deadline, then every
   instance is dropped. WebAssembly has no signal to send, and pending events are discarded.

A guest `Err` result from `http`, `job` or `scheduled` is not a crash. A trap, an out-of-memory
trap and a missed deadline are.

## The interface between core and a plugin

The contract is a WebAssembly interface (WIT) package, `fliks:plugin@2.0.0`, shipped in the
`fliks-plugin-sdk` crate. The SDK generates the bindings, so a plugin never writes wire code.

| Direction | Interface | Contents |
|---|---|---|
| Core calls the plugin | `guest` | 9 exports: `hello`, `health`, `start`, `http`, `event`, `config-changed`, `job`, `scheduled`, `shutdown`. |
| The plugin calls core | `host` | The scope-checked functions: media and acquisition reads, release scoring, library ingest, event publication, counts, progress, settings, scheduled calls, `deadline-remaining-ms`. |
| The plugin calls core | `db` | `query`, `execute`, `migrate` on the plugin's own schema. |
| The plugin calls core | `log` | One line at a level, tagged `plugin:<id>` in core's log. |
| The plugin calls core | `wasi:http` | Outbound requests, vetted as described above. |

Within one `pluginApi` value the package only grows: a new optional field or function raises its
minor version and core links both. A change to an existing shape or meaning is a new `pluginApi`.
Every signature is in [SDK reference](/plugins/sdk-reference).

## How a UI contribution reaches the client

1. A plugin's manifest declares `ui.contributions` (nav entries, menu rows) and `ui.configPages`
   (settings pages), described fully in [UI extensions](/plugins/ui-extensions). No Angular ships
   with a plugin; it only ships data.
2. At registration, core validates every UI-facing rule the manifest must satisfy: a route opening
   one of the plugin's own pages must point at a page the same manifest actually declares, the
   `i18n` root namespace can't collide with another plugin's, and so on.
3. The Fliks client calls `GET /api/plugins/ui` at app boot, and again after an install or an
   enable/disable toggle, and caches the result in a registry service. The response is one entry per
   currently active plugin: its contributions, its config pages, its translated strings, and (if it
   won the tie-break) its release-picker declaration. A `process` plugin only appears in that
   response while it is `ready`; a plugin that has become unavailable simply isn't in the list, so
   a client never has to reason about a half-working plugin.
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
| Auto-update | Runs right after the daily catalog refresh, if the admin setting **Update plugins automatically** is on (it is, by default). For each installed plugin it takes the newest version any enabled source offers and installs it only if that version is signed by the official release key (`official` trust). It skips a version that asks for `network.internal` the plugin was not granted, and holds one that asks for new scopes (shown as a held update on the plugin list until an admin installs it by hand). If the new version does not come up `active`, the previous archive is installed again and the version is held as failed. |
| Manual update | Identical to a fresh install: inspect, then confirm, of a version newer (or, with **Allow installing older versions** on, older) than what's installed. |

An upgrade over an installed plugin that was signed by a key must carry the same key
(`PLUGIN_SIGNER_CHANGED`, 409); uninstall with the data deleted first to switch signer.

Revocation (a catalog's `denyList`) reaches an already-running plugin the moment its catalog
refreshes, stopping it immediately rather than waiting for a restart; see
[Publishing](/plugins/publishing#revocation) for the full mechanics.

## Trust, at a glance

| Trust | What it means | What triggers it |
|---|---|---|
| **Official** | The archive's `plugin.json` is signed by a key core has compiled in (`release-2026`). | The plugin was packaged and signed by the Fliks catalog. |
| **Unverified** | Signed, but not by a key core recognises. | Any other syntactically valid signature: a plugin signed with its author's own key, for instance. |
| **Unsigned** | No signature at all. | Packaged locally with `cargo xtask package` and no `--key`, or a source that ships archives unsigned. |

A `process` plugin that is not `official` is refused with `PLUGIN_UNSIGNED` unless the admin turned
on **Allow unsigned plugins** (`plugins.allow_unsigned`), which exists for local development. That
covers `unverified` as well as `unsigned`: core has no registry of third-party signing keys. A
`data` plugin installs with any trust level, behind the explicit acknowledgement in the consent
step. Pinning a key on a source verifies that source's catalog document only; it never makes the
archives it lists `official`. See [Packaging and signing](/plugins/packaging-and-signing) for what
is signed and how, and [Publishing](/plugins/publishing) for how a catalog earns `official` trust
for what it lists.
