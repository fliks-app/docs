---
title: SDK reference
description: Every function a plugin can call or must implement, with its Rust signature, from the fliks-plugin-sdk crate and its WIT interface.
---

## The crate

`fliks-plugin-sdk` is the guest SDK for `pluginApi` 2 (`MIT OR Apache-2.0`). Its source lives at
`server/crates/plugin-sdk/` in the core Fliks repository, next to the WIT package it generates
bindings from (`wit/fliks.wit`, package `fliks:plugin@2.0.0`). It is not published to crates.io;
depend on it from git and pin a Fliks release tag or a commit:

```toml
[dependencies]
fliks-plugin-sdk = { git = "https://github.com/fliks-app/fliks", tag = "v5.2.0" }
```

| Module | What it holds |
|---|---|
| crate root | The `Plugin` trait, the `export!` macro, `json_response`, `manifest_check`, `HttpRequest`, `HttpResponse`, `HealthReport`, `ManifestCheck`, and a re-export of `serde_json`. |
| `host` | The functions a plugin calls on core, and `HostError`. |
| `bindings` | The generated types: `bindings::fliks::plugin::types` for every record and variant below, `bindings::wasi` for the `wasi:http` types. |
| `router` | `Router`, and the `Request` and `Response` it passes to route handlers. |
| `db` | The typed helpers over the `db` import. |
| `http` | The outbound HTTP client. |
| `rt` | A single-threaded async runtime and the per-export budgets. |
| `scheduled` | `schedule` and `cancel`, over durable delayed calls. |
| `log` | The `debug!`, `info!`, `warn!`, `error!` macros, `scrub` and `redact_url`. |
| `time` | `now_rfc3339()` and `rfc3339(unix_ms)`, RFC 3339 UTC with milliseconds. |
| `build` | Native only, feature `build`: build, package and verify tooling behind `cargo xtask`. |
| `harness` | Native only, feature `harness`: component tests under the real host. |

Two native-only features exist so plugin repositories can build and test without a second
toolchain; a `wasm32` build of the SDK never includes them. They are covered in
[Packaging and signing](/plugins/packaging-and-signing) and
[Testing and debugging](/plugins/testing-and-debugging).

## `Plugin` and `export!`

```rust
pub trait Plugin {
    fn health() -> HealthReport;                                  // default: ok
    fn start() -> Result<(), String>;                             // default: Ok(())
    fn job(name: String, job_id: String, args: Option<String>) -> Result<(), String>; // default: Err("unknown job")
    fn scheduled(key: String, payload: String, attempt: u32) -> Result<(), String>;   // default: Ok(())
    fn http(req: HttpRequest) -> Result<HttpResponse, String>;    // default: 404 {"error":"not found"}
    fn event(name: String, payload: String);                      // default: no-op
    fn config_changed(keys: Vec<String>);                         // default: no-op
    fn shutdown();                                                // default: no-op
}
```

`export!(MyPlugin)` implements the component's `guest` interface over the trait and answers `hello`
from `plugin.template.json` (`include_str!` of `CARGO_MANIFEST_DIR/plugin.template.json`, so the file
must sit at the crate root) and `CARGO_PKG_VERSION`. Behavioural notes for each export are in
[Process plugins](/plugins/process-plugins#the-9-exports).

```rust
pub struct HttpRequest {
    pub method: String,
    pub path: String,                    // raw sub-path, percent-encoded, query excluded
    pub query: Vec<(String, String)>,    // decoded, in order
    pub body: Vec<u8>,
    pub principal: Principal,
}
pub struct HttpResponse { pub status: u16, pub headers: Vec<(String, String)>, pub body: Vec<u8> }
pub struct HealthReport { pub ok: bool, pub detail: Option<String> }
pub enum Principal { Delegated(u32), System }
```

`json_response(status, body)` builds an `HttpResponse` with `content-type: application/json`.

## `router`

The SDK's router uses the host's own route matcher (the `fliks-plugin-route` crate), so a path core
routed to the plugin resolves to the same route inside it.

```rust
let router = Router::new()
    .route("GET", "/indexers/cooldowns", cooldowns)   // first match wins
    .route("GET", "/indexers/:id", one)
    .route("POST", "/files/*rest", upload);
router.handle(req)   // HttpRequest -> Result<HttpResponse, String>; 404 JSON when nothing matches
```

A handler is `fn(&router::Request) -> Result<router::Response, String>`. `route` panics on a pattern
the host would refuse at install. Keep the router in a `LazyLock` so it is built once per instance.

| `router::Request` | |
|---|---|
| `method`, `path`, `query`, `body`, `principal` | As in `HttpRequest`, with the method upper-cased. |
| `param(name) -> Option<String>` | A `:name` capture, decoded; a `*name` capture joined with `/`. |
| `query(key) -> Option<&str>` | The first value of a repeated key. |
| `json::<T>() -> Result<T, serde_json::Error>` | Parses the body. |
| `user() -> Option<u32>` | The acting user's id; `None` for a system call. |

| `router::Response` | |
|---|---|
| `Response::json(status, &impl Serialize)` | `application/json`; a 500 if the body does not serialise. |
| `Response::empty(status)` | No headers, no body. |
| `.with_header(name, value)`, `.with_body(bytes)` | Builders. Only the headers core allows reach the client (see [Process plugins](/plugins/process-plugins#proxied-routes-http)). |

## `host`: calling core

Every function is bound to the calling plugin's id, re-reads its registration (an uninstall
mid-call fails the next call with `ERR_NOT_FOUND`) and checks its scopes before anything else. Each
call has an 8 second deadline, `library_ingest` 30 minutes. The calls take no user and do no
per-user access check: a route's policy and object guard are the gate. Kebab-case names in the WIT
become snake_case here.

```rust
use fliks_plugin_sdk::host::{self, HostError};
use fliks_plugin_sdk::bindings::fliks::plugin::types::*;
```

### Reads

```rust
pub fn media_acquisition_context(media_id: u32, season_id: Option<u32>, episode_id: Option<u32>)
    -> Result<Option<AcquisitionTarget>, HostError>;
pub fn acquisition_candidates(query: &CandidatesQuery) -> Result<CandidatesPage, HostError>;
pub fn releases_match(titles: &[ReleaseTitle], min_age_minutes: Option<u32>)
    -> Result<Vec<ReleaseMatch>, HostError>;
pub fn releases_score(media_id: u32, season_number: Option<u32>, episode_number: Option<u32>,
    releases: &[CandidateRelease]) -> Result<Vec<ScoredRelease>, HostError>;
pub fn media_resolve(query: &ResolveQuery) -> Result<Vec<(String, ResolvedMedia)>, HostError>;
pub fn media_exists(media_ids: &[u32]) -> Result<Vec<u32>, HostError>;
```

- `media_acquisition_context` answers everything needed to decide whether and how to acquire one
  piece of media, or `None` for an unknown media, a media with no library, or a season or episode
  of another media. A whole-series lookup has `want: None`.
- `acquisition_candidates` enumerates monitored movies and wanted episodes and season packs,
  sorted by media, season, episode. `available_on` must be a `YYYY-MM-DD` date (else
  `ERR_VALIDATION`); `limit` is at most 500; `cursor` is opaque, and each page reads only the
  next monitored media after it, so nothing is cached. A season with two or more wanted episodes
  yields its pack and every episode.
- `releases_match` indexes the monitored library once per call and decides per title: grab, or
  skip with a reason (`on-disk`, `not-monitored`, `unmatched`, `too-fresh`, `not-available`,
  `unprofiled`). `publish_date` is read as RFC 3339, then RFC 2822, then ISO 8601 without offset as
  UTC; an unparsable date never gates.
- `releases_score` runs core's rejection rules, custom formats and quality and language profiles in
  one call and returns the scored list (`[]` for an unknown media). The plugin supplies only what
  only it can know: per-indexer minimum seeders and its own `blocked` flag.
- `media_resolve` answers queue-page labels, keyed `media:<id>`, `season:<id>`, `episode:<id>`. At
  most 100 ids in total, else `ERR_VALIDATION`.
- `media_exists` answers which of the ids exist.

### Writes

```rust
pub fn requests_mark_in_progress(idempotency_key: &str, media_id: u32, season_number: Option<u32>)
    -> Result<(), HostError>;
pub fn library_ingest(request: &IngestRequest) -> Result<IngestResult, HostError>;
```

`requests_mark_in_progress` moves an approved request to processing. `library_ingest` is the one
function that writes to disk. Core resolves every path with `realpath` and requires it under one of
the manifest's `ingestRoots` (none declared or outside every root: `ERR_DENIED`; missing path:
`ERR_NOT_FOUND`), then imports, replacing an existing file. A retried call with the same files
lands in `already_present`. After an import core dispatches the `download.complete` notification
and refreshes the connected media servers.

### Events, counts and progress

```rust
pub fn events_publish(events: &[AcquisitionEvent]) -> Result<(), HostError>;
pub fn notifications_dispatch_grab_started(payload: &str) -> Result<(), HostError>;
pub fn counts_set(key: &str, value: u64) -> Result<(), HostError>;
pub fn events_emit_own(event_type: &str, payload: &str, audience: Audience) -> Result<(), HostError>;
pub fn progress_set(media_id: u32, downloads: &[DownloadProgress]) -> Result<(), HostError>;
```

- `events_publish` maps each `AcquisitionEvent` in order: `Grabbed` emits the domain event
  `acquisition.grabbed`; `Imported` dispatches `download.complete` and tells the media's viewers;
  `Failed` and `StalledRemoved` tell the media's recipients; `QueueChanged` refreshes the queue
  page. Core resolves the audience.
- `notifications_dispatch_grab_started` takes only the one closed event, `grab.started`, with a
  JSON payload.
- `counts_set` stores a per-plugin integer (`value >= 0`, `key` 1 to 64 characters) read by the
  sidebar badge named in a contribution's `badge`; two plugins pushing one key add up.
- `events_emit_own` emits `plugin.<id>.<event_type>` (the prefix is forced) to `Audience::Everyone`,
  `Audience::User(id)` or `Audience::Media(id)` (the media's recipients).
- `progress_set` is a replacement set for one media, never a delta: whatever is absent is retired
  and an empty slice retires the media. It is coalesced to one emission per media per second.

### Settings, scheduled calls and the clock

```rust
pub fn config_get(keys: Option<&[String]>) -> Result<Vec<(String, String)>, HostError>;
pub fn config_set(key: &str, value: Option<&str>) -> Result<(), HostError>;
pub fn schedule_call(key: &str, delay_ms: u64, payload: &str) -> Result<(), HostError>;
pub fn cancel_call(key: &str) -> Result<bool, HostError>;
pub fn deadline_remaining_ms() -> u64;
```

`config_get(None)` returns every setting the plugin owns, prefix stripped; with a key list, only
those it owns and that hold a value. `config_set` takes 1 to 256 character keys and values up to
64 KiB; `None` stores a null, which reads back as absent. Prefer the typed `scheduled::schedule` and
`scheduled::cancel` to the raw `schedule_call` and `cancel_call`. `deadline_remaining_ms` needs no
scope and never fails: 0 once the deadline has passed.

### Scopes

| Function | Required scopes |
|---|---|
| `media_acquisition_context`, `media_resolve`, `media_exists` | `media:read` |
| `acquisition_candidates`, `releases_match` | `acquisition:candidates` and `media:read` |
| `releases_score` | `releases:score` |
| `requests_mark_in_progress` | `requests:progress` |
| `library_ingest` | `ingest:write` |
| `events_publish`, `notifications_dispatch_grab_started`, `counts_set`, `events_emit_own`, `progress_set` | `events:emit` |
| `config_get`, `config_set` | `config:rw` |
| `schedule_call`, `cancel_call`, `deadline_remaining_ms`, `db`, `log` | none |

### `HostError`

```rust
pub struct HostError { pub code: String, pub message: String }
```

| `code` | Meaning |
|---|---|
| `ERR_NO_METHOD` | The function does not exist. |
| `ERR_TIMEOUT` | The call's deadline passed; abandoned work may still finish. |
| `ERR_NOT_FOUND` | A missing registration or path. |
| `ERR_DENIED` | A missing scope, a path outside `ingestRoots`, or a setting the plugin does not own. |
| `ERR_VALIDATION` | An argument failed validation. |
| `unavailable` | Core could not reach its own database. A `start` that fails after one is retried instead of counted as a crash. |
| `ERR` | Anything else. |

## Types

Field names are the WIT's, in snake_case (`ref` is `ref_`).

```rust
pub enum MediaKind { Movie, Series }
pub enum WantDecision { Missing, Upgrade, Skip }
pub struct Want {
    pub decision: WantDecision, pub allowed_quality_ids: Vec<u32>, pub allowed_language_ids: Vec<u32>,
    pub min_resolution: u32, pub resolution_upgrade_only: bool,
}
pub struct SeasonRef { pub id: u32, pub number: u32, pub episode_count: u32 }
pub struct EpisodeRef {
    pub id: u32, pub number: u32, pub end_number: Option<u32>,
    pub air_date: Option<String>, pub title: Option<String>,
}
pub struct AcquisitionTarget {
    pub media_id: u32, pub kind: MediaKind, pub title: String, pub original_title: Option<String>,
    pub alternative_titles: Vec<String>, pub year: Option<u32>, pub runtime_minutes: Option<u32>,
    pub imdb_id: Option<String>, pub tmdb_id: Option<u32>, pub tvdb_id: Option<u32>,
    pub library_id: u32,
    pub want: Option<Want>,                 // None: unprofiled, nothing can be scored
    pub expected_titles: Vec<String>, pub search_title: String,
    pub season: Option<SeasonRef>, pub episode: Option<EpisodeRef>,
}
pub struct CandidatesQuery {
    pub kind: Option<MediaKind>, pub media_ids: Option<Vec<u32>>, pub available_on: String,
    pub limit: u32, pub cursor: Option<String>,
}
pub struct CandidatesPage { pub items: Vec<AcquisitionTarget>, pub cursor: Option<String> }

pub struct ReleaseTitle { pub id: String, pub title: String, pub publish_date: String }
pub struct ReleaseMatch {
    pub id: String, pub media_id: Option<u32>, pub season_number: Option<u32>,
    pub episode_number: Option<u32>, pub is_full_season: bool, pub coverage: Option<ReleaseCoverage>,
    pub decision: MatchDecision,            // Grab | Skip
    pub skip_reason: Option<SkipReason>,
}
pub struct CandidateRelease {
    pub id: String, pub title: String, pub size: u64, pub seeders: u32, pub leechers: u32,
    pub publish_date: String, pub flags: Option<Vec<String>>, pub freeleech: Option<bool>,
    pub download_volume_factor: Option<f64>, pub source_ref: String, pub min_seeders: Option<u32>,
    pub unknown_language_iso_code: Option<String>,
    pub blocked: bool,                      // only the plugin knows: it owns the blocklist
}
pub struct ScoredRelease {
    pub id: String, pub quality_id: u32, pub quality_name: String, pub rank: i32, pub allowed: bool,
    pub custom_format_score: i32, pub blocklisted: bool, pub language_id: Option<u32>,
    pub language_name: Option<String>, pub language_allowed: bool, pub is_full_season: bool,
    pub coverage: Option<ReleaseCoverage>, pub size_deviation: Option<f64>,
    pub video_codec: Option<String>, pub rejections: Vec<Rejection>,
}
pub struct ReleaseCoverage { pub seasons: Option<Span>, pub episodes: Option<Span>, pub complete_series: bool }
pub struct Span { pub first: u32, pub last: u32 }
pub struct Rejection { pub code: String, pub params: Vec<(String, ParamValue)> }  // ParamValue: Number(f64) | Text(String)

pub struct ResolveQuery { pub media_ids: Vec<u32>, pub season_ids: Vec<u32>, pub episode_ids: Vec<u32> }
pub struct ResolvedMedia {
    pub title: String, pub kind: MediaKind, pub library_id: u32, pub season_number: Option<u32>,
    pub episode_number: Option<u32>, pub episode_title: Option<String>,
}

pub enum TransferMode { Copy, Move }
pub struct IngestRequest {
    pub idempotency_key: String, pub media_id: u32, pub paths: Vec<String>, pub transfer: TransferMode,
    pub fallback_quality: Option<String>, pub source_label: String,
}
pub struct ImportedFile { pub media_file_id: u32, pub relative_path: String, pub quality: String }
pub struct IngestResult {
    pub imported: Vec<ImportedFile>, pub already_present: Vec<String>,
    pub season_number: Option<u32>, pub episode_number: Option<u32>,  // only for a single imported episode
}

pub enum AcquisitionEvent {
    Grabbed(Grabbed),            // { media_id, season_number?, episode_number? }
    Imported(Imported),          // { media_id, season_number?, episode_number?, quality, source_title }
    Failed(Failed),              // { media_id, title, reason }
    QueueChanged,
    StalledRemoved(StalledRemoved), // { media_id: Option<u32>, title }
}
pub enum Audience { Everyone, Media(u32), User(u32) }
pub enum DownloadState { Queued, Active, Stalled, Paused, Importing }
pub struct DownloadProgress {
    pub ref_: String, pub season_number: Option<u32>, pub episode_number: Option<u32>,
    pub progress: f64,                      // 0 to 1
    pub bytes_per_second: Option<f64>, pub eta_seconds: Option<f64>, pub state: DownloadState,
}
```

## `db`

Typed helpers over the `db` import: one statement per call, no transaction across calls. The
host runs them as the plugin's own role with `search_path` set to its schema.

```rust
use fliks_plugin_sdk::db::{self, DbError, Param};

pub fn query(sql: &str, params: &[Param]) -> Result<Rows, DbError>;       // rows and column names
pub fn execute(sql: &str, params: &[Param]) -> Result<u64, DbError>;      // affected rows
pub fn migrate(migrations: &[(&str, &str)]) -> Result<Vec<String>, DbError>; // names applied
```

`Param` is `Null`, `Boolean(bool)`, `Int(i64)`, `Float(f64)`, `Text(String)`, `Bytes(Vec<u8>)`,
`Json(String)`, `TextList(Vec<String>)` or `IntList(Vec<i64>)`; `From` is implemented for `i64`,
`&str`, `String`, `bool` and `Option<T>`, so `&[id.into(), "x".into()]` works. Parameters are sent in
text format with their types inferred by Postgres. `Rows` has `len()`, `is_empty()`,
`get(row, column) -> Option<&Value>`, `int(row, column)` and `text(row, column)`; `Rows.0` is the raw
`RowSet { columns, rows }`. An empty result keeps its column names. `DbError` is
`{ code, message }`: `code` is the SQLSTATE, or `unavailable` when core could not reach Postgres.
The full contract (types, deadlines, migrations) is in
[Storage and database](/plugins/storage-and-database#talking-to-the-database).

## `http`: outbound requests

```rust
use fliks_plugin_sdk::bindings::wasi::http::types::Method;
use fliks_plugin_sdk::http::{Error, Request};

let status = Request::new(Method::Post, url)
    .header("content-type", "application/json")
    .header("user-agent", "my-plugin/1.0")
    .body(body)
    .timeout(Duration::from_secs(5))
    .body_cap(0)
    .send()
    .map(|r| r.status);
```

| `Request` builder | |
|---|---|
| `Request::new(method, url)` | `http` or `https` URL. Defaults: 60 s timeout, 32 MiB body cap. |
| `.header(name, value)`, `.body(bytes)` | The SDK sets `Content-Length` from the body and never sends a chunked body. |
| `.timeout(d)` | Connect, first byte and between bytes all use this value. |
| `.deadline(d)` | Bounds the whole exchange, response body included. It only tightens. |
| `.budget(&Budget)` | Ends the request with the budget, and no later than any deadline already set. |
| `.body_cap(n)` | Response bytes kept; the rest is drained and dropped. |
| `.send()` | Blocks until the response. Not callable inside `rt::block_on`. |
| `.send_async()` | A future. Dropping it before it resolves abandons the request and closes its connection. |

`Response` has `status`, `headers`, `body` and `header(name)`. `Error` is `Denied`, `Dns(String)`,
`Refused`, `Timeout`, `Tls`, `InvalidUrl` or `Other(String)`. `Error::Denied` is core's outbound
guard refusing the address, and its text is exactly `target address is not allowed`: the plugin
learns neither the address nor its class. A name that does not resolve is `Dns`, not `Denied`, so
a plugin can tell a missing name (final) from a refused target. The guard's rules are in
[Architecture](/plugins/architecture#the-sandbox).

## `rt`: async inside an export

One export can have several outbound requests in flight. `rt` is a single-threaded runtime over
`wasi:io/poll`; futures run inside one `block_on` per export.

```rust
use fliks_plugin_sdk::rt::{self, Budget};

let budget = Budget::host();
let statuses = rt::block_on(async {
    let a = Request::new(Method::Get, url_a).budget(&budget).send_async();
    let b = Request::new(Method::Get, url_b).budget(&budget).send_async();
    rt::join_all([a, b]).await
});
```

| Item | |
|---|---|
| `block_on(fut)` | Runs a future to completion. It does not nest, so never call a blocking `send()` inside it. |
| `spawn_local(fut)` | Runs a future on the current `block_on`, which waits for it before returning. Dropping the returned `Task` cancels it. |
| `join_all`, `FuturesUnordered`, `StreamExt` | Re-exports from `futures-util`. |
| `sleep(d)`, `timeout(d, fut)` | `timeout` gives `None` once `d` elapsed first and drops the future, which abandons its requests. |
| `budgets::{HTTP, EVENT, SCHEDULED, JOB}` | 150 s, 50 s, 4 min and 50 min: a margin under each host deadline. |
| `Budget::new(d)`, `Budget::host()` | A monotonic deadline. `host()` is what the host still allows the current export. |
| `.remaining()`, `.expired()` | Time left, and whether it is zero. |
| `.child(fraction)` | `fraction` (clamped to 0 to 1) of what remains, for one indexer's share. |
| `.cap(d)` | `d` cut to what remains, so a request timeout cannot outlive the budget. |

## `scheduled`, `log` and `time`

```rust
pub fn schedule<T: Serialize>(key: &str, delay_ms: u64, payload: &T) -> Result<(), HostError>;
pub fn cancel(key: &str) -> Result<bool, HostError>;   // whether a pending call existed
```

`schedule` serialises the payload to JSON and checks the key (1 to 128 characters) and the 64 KiB
payload cap before calling the host. `log::scrub` turns every `scheme://user:pass@` into
`scheme://***:***@` and line breaks into spaces; the logging macros apply it. `log::redact_url(url)`
removes userinfo, query and fragment. `time::now_rfc3339()` and `time::rfc3339(unix_ms)` format
RFC 3339 UTC with milliseconds, which is the form the database layer reads and writes timestamps in.

## The WIT package

The interface is `fliks:plugin@2.0.0`, with one world, `plugin`. A component may import only what
the world imports (`wasi:cli`, `wasi:http/types`, `wasi:http/outgoing-handler` and the `host`, `db`
and `log` interfaces of the package) and may export only `guest`; `cargo xtask verify` checks both
and core checks the world again when it registers the plugin. `wasi:sockets` links but every address
check refuses and name lookup is off. Ids are `u32`, JSON documents travel as UTF-8 text, and a
`list<tuple<string, string>>` is an ordered multimap.

## Manifest and UI contribution types

The `plugin.template.json` shape is covered field by field in [the manifest reference](/plugins/manifest);
the UI contribution and config page surface (`UiContribution`, the config page kinds, `FieldDef`,
`TableColumn`, and the rest) is covered in [UI extensions](/plugins/ui-extensions). The TypeScript
types the web client reads live at `client/src/app/core/plugin-ui/ui-contribution.ts` in the core
repository.
