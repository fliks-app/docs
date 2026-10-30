---
title: Examples
description: Two real process plugins walked through in detail, a full reference plugin and a second, smaller one with a different shape.
---

## Two plugins, two shapes

| | `fliks.download` | `fliks.notify` |
|---|---|---|
| Tier | `process` | `process` |
| Language | Rust, `wasm32-wasip2` | Rust, `wasm32-wasip2` |
| Own database schema | Yes | Yes |
| Retries on delivery failure | n/a (no outbound deliveries of its own) | Yes, bounded backoff through scheduled calls |
| Repository | [`fliks-app/fk-plugin-download`](https://github.com/fliks-app/fk-plugin-download) | [`fliks-app/fk-plugin-notify`](https://github.com/fliks-app/fk-plugin-notify) |
| Publish status | Published, `official` | Published, `official` |

Both repositories have the layout described in [Your first plugin](/plugins/first-plugin): the
plugin crate, a thin `xtask`, `plugin.template.json`, `migrations/` and `tests/`, with a CI workflow
that tests, packages and releases on a `v<version>` tag.

## `fliks.download`: the full reference process plugin

Indexer search (Torznab), download-client management (qBittorrent and Transmission), and the
acquisition grab pipeline, in full production use. This is the plugin to read end to end if you're
building anything non-trivial.

**Flow**, roughly: a cron `job` or an `event` (a user's manual grab request, `media.acquisition.requested`)
reaches the dispatcher, which hands off to the grab pipeline. That pipeline asks core for candidates
(`acquisition_candidates`) or context for one title (`media_acquisition_context`), searches every
configured indexer over Torznab, concurrently inside one `rt::block_on`, hands the results to core
to score (`releases_score`, using core's own quality/language/custom-format logic, the plugin only
supplies what only it can know: per-indexer minimum seeders, its own blocklist flag), sends the
winning release to a download client driver, and records it. A separate poller watches the download
client, and on completion calls `library_ingest` to copy the finished file into the library,
`progress_set` to report live download progress, and `events_publish` to announce the grab and the
import.

**Manifest.** `scopes` are `media:read`, `acquisition:candidates`, `releases:score`, `ingest:write`,
`events:emit` and `config:rw`. It declares `ingestRoots: ["/downloads"]` and
`network: { "internal": true }`, because a download client and a Torznab aggregator usually live on
the LAN. It has 39 routes behind six permissions (`releases`, `indexers`, `download-clients`,
`queue`, `queue-control`, `blocklist`), with `mediaAccessible:id` object guards on the release
routes, and five cron jobs: `SearchMissing`, `RssSync`, `ImportCompleted`, `CleanStalled` and
`CleanSeeded`.

**What it uses of the host functions:** `media_acquisition_context`, `acquisition_candidates`,
`releases_match`, `releases_score`, `media_resolve`, `library_ingest`, `progress_set`,
`events_publish`, `notifications_dispatch_grab_started`, `events_emit_own`, `config_get`,
`deadline_remaining_ms`, and `scheduled::schedule` for per-title search resumption and capability
probes. It never calls the others, a reminder that declaring a scope only grants the *ability* to
call something, not an obligation to.

**Config pattern:** always a live `config_get`, so a setting an admin just changed (a search budget,
a stall-detection threshold) is honoured on the very next thing that reads it.

**Budgets:** every export sets a guest budget on entry from `rt::budgets` and `Budget::host()`, and
every outbound request in `src/net.rs` ends by its own timeout or that budget, whichever comes
first. The blocking `send` is never called inside `block_on`, which does not nest.

**Database:** owns its schema (indexers, download clients, download history, a blocklist), with
`coreRefs` into `media`, `seasons`, `episodes` and `users`, and runs its migrations in `start`. No
state lives in an instance: its request throttle (a serial chain, minimum intervals, cooldowns) is
rows in its own schema, claimed with `SELECT ... FOR UPDATE` so concurrent instances serialise. The
`ImportCompleted` job keeps an import lease in the schema, and `start` sweeps leases that outlived
their holder.

**Secrets:** every indexer's API key and every download client's password is a `secret: true`
field, masked in every read response and only overwritten when the incoming value is non-empty,
exactly the pattern in
[UI extensions](/plugins/ui-extensions#form-the-default-and-the-only-kind-that-works-with-the-process-stopped).
The manifest also lists those stored values in `database.secrets`, so an export leaves them out.

**Tests:** native tests replay golden vectors, and `tests/harness.rs` installs the built component
into the real host on a scratch database, against stub Torznab, qBittorrent and Transmission
servers.

Full source: [github.com/fliks-app/fk-plugin-download](https://github.com/fliks-app/fk-plugin-download).

## `fliks.notify`: a second process plugin, a different shape

Where `fliks.download` calls host functions across almost every group, `fliks.notify` does one
narrow thing well: forward Fliks's own domain events to an admin-configured HTTPS endpoint, with
retries. It is a smaller, more approachable second reference, and it shows the two parts of the
contract `fliks.download` leans on less visibly:

- **A durable retry queue built on scheduled calls.** Each event it receives becomes a row in its
  own `deliveries` table and one `scheduled::schedule` call, keyed by a per-delivery id (never the
  event name, so replacement can't drop a delivery), with delay 0. The `scheduled` handler posts the
  event and, on a failure, schedules itself again on a ladder of 1, 5, 15, 30 and 60 seconds, six
  attempts in all. The queue is capped at 200: past that, the oldest live deliveries are dropped
  and counted. Nothing lives in memory, so queued deliveries survive a restart or an upgrade. Core
  delivers a scheduled call at least once, so after a crash a delivery may be sent twice; the body
  carries a stable `id` so a receiver can deduplicate.
- **A guard that is re-run on every attempt.** The target must be `https://`. Core's outbound guard
  refuses private, loopback and link-local addresses every time the plugin connects, not once at
  configuration time, so a hostname that was public when saved and is repointed later is still
  refused. The SDK reports the refusal as `Error::Denied` and the plugin records it as a final
  outcome without retrying; a plugin that doesn't declare `network.internal` never reaches the LAN.
- **Live config.** The target URL is a `secret: true` field. The plugin reads it with `config_get`
  on every delivery, so changing the target takes effect on the next attempt, queued deliveries
  included.
- **A small admin surface.** One form settings page, and two routes behind their own permissions:
  `GET /delivery-log` and `POST /test-delivery`, declared as `read:plugin:fliks.notify:delivery-log`
  and `create:plugin:fliks.notify:test-delivery`. Its manifest declares `scopes: ["config:rw"]`,
  `database: { "schema": true, "coreRefs": [] }` and `memoryMb: 64`.
- **Testable logic.** Everything it touches sits behind one `Env` trait, so the retry ladder, the
  conditional writes and the capacity drop run in native unit tests against an in-memory fake, and
  `tests/harness.rs` covers the SQL and the scheduled retries under the real host.

Source: [github.com/fliks-app/fk-plugin-notify](https://github.com/fliks-app/fk-plugin-notify).

## Reading order

If you're building your first `process` plugin, start with `fliks.notify`: it's small enough to
read start to finish in one sitting and still demonstrates a real database, a real durable retry
queue and a real settings page. Move to `fliks.download` once you need a wider set of host
functions, concurrent outbound requests, a non-trivial settings UI (`providers` and `table` pages,
bulk actions, a release picker) or `network.internal`. If your plugin turns out not to need to run
any code at all, see the full manifest in
[Data plugins](/plugins/data-plugins#a-worked-example) for the shortest possible example of exactly
that.
