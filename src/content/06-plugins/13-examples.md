---
title: Examples
description: Three real plugins walked through in detail, a full process plugin, a second process plugin with a different shape, and a zero-code data plugin.
---

## Three plugins, three shapes

| | `fliks.download` | `fliks.notify` | `fliks.webhooks` |
|---|---|---|---|
| Tier | `process` | `process` | `data` |
| Ships code | Yes | Yes | No |
| Own database schema | Yes | No | No |
| Retries on delivery failure | n/a (no outbound deliveries of its own) | Yes, bounded backoff | No, at-most-once |
| Repository | [`fliks-app/fk-plugin-download`](https://github.com/fliks-app/fk-plugin-download) | [`fliks-app/fk-plugin-notify`](https://github.com/fliks-app/fk-plugin-notify) | Lives inside the catalog itself (`plugins/fliks.webhooks/`), no separate repo |
| Publish status | Published, current | **Not yet published** (see the callout below) | Published, but stale (see the callout below) |

> [!WARNING]
> Both `fliks.notify` and the published `fliks.webhooks` currently declare `pluginApi: 0`, which
> today's core no longer supports (`SUPPORTED_PLUGIN_API_VERSIONS` is just `[1]`), and a `fliks`
> range of `>=2.0.0 <3.0.0`. Neither would install as-is against a current Fliks. Read them for the **pattern**, retrying delivery on one
> side, zero-code delivery on the other, not for their literal version numbers; a plugin built from
> these patterns today should declare `pluginApi: 1` and a `fliks` range against a current major,
> exactly as `fliks.download` does.

## `fliks.download`: the full reference process plugin

Indexer search (Torznab), download-client management (qBittorrent), and the acquisition grab
pipeline, in full production use. This is the plugin to read end to end if you're building
anything non-trivial.

**Flow**, roughly: a cron `job` or an `event` note (a user's manual grab request) reaches the
dispatcher, which hands off to the grab pipeline. That pipeline asks core for candidates
(`acquisition.candidates`) or context for one title (`media.acquisitionContext`), searches every
configured indexer over Torznab, hands the results to core to score
(`releases.score`, using core's own quality/language/custom-format logic, the plugin only supplies
what only it can know: per-indexer minimum seeders, its own blocklist flag), sends the winning
release to a download client driver, and records it. A separate poller watches the download client,
and on completion calls `library.ingest` to move the finished file into the library, `progress.set`
to report live download progress, and `events.publish` to announce the grab and the import.

**What it actually uses, of the 15 host methods:** every read method except `media.exists`
(`media.acquisitionContext`, `acquisition.candidates`, `releases.match`, `releases.score`,
`media.resolve`), plus `library.ingest`, `progress.set`, `events.publish`, `notifications.dispatch`,
`events.emitOwn` and `config.get`. It requests all seven scopes, so it could also call the other four
(`media.exists`, `requests.markInProgress`, `counts.set`, `config.set`), but never does, a reminder that declaring a scope only grants the *ability* to
call something, not an obligation to.

**Config pattern:** always live `config.get`, never the `FLIKS_CFG_*` environment variables, so a
setting an admin just changed (a search budget, a stall-detection threshold) is honoured on the
very next thing that reads it, not on the plugin's next restart.

**Database:** owns its schema (indexers, download clients, download history, a blocklist), with
`coreRefs` into `media`, `seasons`, `episodes` and `users`. Its migrations run its own bookkeeping
table inside its own schema and apply in order at every boot, before `hello` replies.

**Secrets:** every indexer's API key and every download client's password is a `secret: true`
field; the plugin masks them in every read response and only overwrites a stored value when the
incoming one is non-empty, exactly the pattern in
[UI extensions](/plugins/ui-extensions#form-the-default-and-the-only-kind-that-works-with-the-process-stopped).

**Contract dependency:** predates the published `@fliks/plugin-contract` package, so it hand-restates
the protocol and method types instead of depending on it, and diffs that restatement against core's
real source (`npm run check-contract-drift`, plus a test that runs the same check when a sibling
Fliks checkout is present), to catch drift before it becomes a runtime bug.
A new plugin should just depend on the package (see [SDK reference](/plugins/sdk-reference)) rather
than copy this pattern; it exists here for a historical reason that no longer applies to a fresh
start.

Full source, including its migrations, its test harness, and its CI pipeline (which spins up a real
Postgres service container and creates stand-in `coreRefs` tables before running anything):
[github.com/fliks-app/fk-plugin-download](https://github.com/fliks-app/fk-plugin-download).

## `fliks.notify`: a second process plugin, a different shape

Where `fliks.download` calls host methods across almost every group, `fliks.notify` does one
narrow thing well: forward Fliks's own domain events to an admin-configured HTTPS endpoint, with
retries. It's a smaller, more approachable second reference for the parts of the runtime contract
`fliks.download` doesn't exercise as clearly:

- **A bounded, in-memory retry queue.** Up to 200 queued items, oldest dropped first if it fills;
  up to 6 delivery attempts per item, on a fixed backoff ladder (1s, 5s, 15s, 30s, 60s, 120s), so a
  target down for a few minutes doesn't lose events, but a target down for good doesn't grow the
  queue forever. Nothing is persisted, a restart loses whatever was still queued, that trade-off is
  explicit and stated in its own README, not a bug to fix later.
- **An SSRF guard re-run on every single attempt, not once at configuration time.** The target must
  be `https://`, and its resolved address (every one, if DNS returns several) must not be a
  private, loopback, link-local, or otherwise internal address, checked fresh via `dns.lookup` each
  time, since a hostname that was public when saved can be repointed at an internal address later.
- **No database schema at all** (`database.schema: false`): it keeps no state that needs to survive
  a restart, so it declares none. Its only scope is `config:rw`.
- **Reads `FLIKS_CFG_TARGET_URL`, not `config.get`.** A deliberately different config pattern from
  `fliks.download`: it takes a snapshot at spawn and logs that a settings change "takes effect on
  next restart" rather than fetching a fresh value on every delivery, a real, valid choice when a
  value changes rarely and reading it live buys you little.

Source: [github.com/fliks-app/fk-plugin-notify](https://github.com/fliks-app/fk-plugin-notify).

## `fliks.webhooks`: the same job, zero code

The `data`-tier alternative to `fliks.notify`: one settings field (an HTTPS endpoint URL), one
event subscription referencing it, and nothing else, no `plugin.js`, no process, no retries. Its
own README states its trade-off plainly: one attempt per event, no queue, no retry, if that's not
enough, install the process-tier plugin instead. This is the manifest shape reproduced in full in
[Data plugins](/plugins/data-plugins#a-worked-example).

Because a `data` plugin has no repository of its own (there's no code to hold one), it lives
directly inside the catalog at `plugins/fliks.webhooks/` rather than as a separate GitHub project.

## Reading order

If you're building your first `process` plugin, start with `fliks.notify`: it's small enough to
read start to finish in one sitting and still demonstrates a real retry queue and a real SSRF
guard. Move to `fliks.download` once you need database access, a wider set of host methods, or a
non-trivial settings UI (`providers` and `table` pages, bulk actions, a release picker). If your
plugin turns out not to need to run any code at all, `fliks.webhooks`'s manifest is the shortest
possible example of exactly that.
