---
title: Testing and debugging
description: Native unit tests, component tests under the real host, checking your archive, and common install errors.
---

## Unit tests need no database and no running core

The wasm exports of the SDK don't link on a native target, so run a plugin's own tests with
`--lib` rather than a bare `cargo test`:

```bash
cargo test --lib
```

The way to keep real logic testable is the one `fk-plugin-notify` uses: put everything the plugin
touches outside itself (config, its database, the scheduler, the HTTP client) behind one trait,
implement it with the SDK in the wasm build, and with an in-memory fake in tests. Its retry ladder
(6 attempts, 1, 5, 15, 30 and 60 second delays), its conditional writes, its capacity drop at 200
and its payloads all run natively that way, with no database and no host. The SQL itself is not
exercised natively. Tests that read the manifest are cheap and worth having: `plugin.template.json`
is a plain JSON file, so a test can assert that every route policy names a declared permission,
that every i18n key a UI block uses exists in every locale, and that the crate version and the
`fliks` range are what you expect.

Lint for both targets, because code behind `#[cfg(target_arch = "wasm32")]` only compiles for the
second one:

```bash
cargo clippy --lib --tests -- -D warnings
cargo clippy --target wasm32-wasip2 --all-targets -- -D warnings
```

## Component tests

The SDK's `harness` feature installs your **built** component into the real Fliks host, the same
code that runs in production, on a scratch Postgres database. This catches what a native test never
can: a manifest the host refuses, a missing scope, a migration that fails, a route policy that
doesn't resolve, a handler that traps.

```toml
[target.'cfg(not(target_arch = "wasm32"))'.dev-dependencies]
fliks-plugin-sdk = { git = "https://github.com/fliks-app/fliks", tag = "v5.2.0", features = ["harness"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

```rust
#![cfg(not(target_arch = "wasm32"))]

use fliks_plugin_sdk::harness::{Harness, Setup, request};
use serde_json::json;

fn setup(target: Option<&str>) -> Setup {
    let mut s = Setup::from_crate(env!("CARGO_MANIFEST_DIR"));
    s.config = target
        .map(|t| vec![("target_url".to_owned(), t.to_owned())])
        .unwrap_or_default();
    s
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn test_delivery_is_logged() {
    let Some(h) = Harness::start(setup(None)).await else {
        return;
    };
    let r = h.proxy("POST", "/test-delivery", Some(&json!({ "event": "custom.event" }))).await;
    assert_eq!(r.status, 202);
    assert_eq!(h.http(request("GET", "/nope", &[], b"")).await.unwrap().status, 404);
    h.finish().await;
}
```

Build the release component first, then point the harness at a Postgres superuser URL. The harness
creates and drops its own databases, named with `FLIKS_HARNESS_DB_PREFIX` (default
`fliks_harness_`):

```bash
cargo build --release --target wasm32-wasip2
FLIKS_HARNESS_PG_URL=postgres://user:pass@host/postgres cargo test --test harness
```

Without `FLIKS_HARNESS_PG_URL` the tests skip locally, with a warning, and fail when `CI` is set.
That is deliberate: a test that quietly returns when it can't reach its database reports a pass
with zero assertions.

`Setup::from_crate` reads the crate's template, version, logo and built component. `Setup.config`
writes `plugin.<id>.<key>` settings before the install so `hello` and `start` see them, and
`Setup.network_internal` adds `network: { internal: true }`. The `Harness` offers:

| Call | What it does |
|---|---|
| `Harness::start(setup)` | A scratch database, the host, then the plugin installed (unsigned allowed) and ready. |
| `proxy(method, path, body)` | `/api/plugins/<id><path>` through the host's proxy route as an admin: route resolution, policy and response header filtering included. |
| `http(request(...))` | The `http` export directly, with none of that. |
| `job(name, args)`, `scheduled(key, payload, attempt)`, `health()` | The matching export directly. |
| `event(name, &payload)` | Queued on the `event` lane, delivered in order; observe the outcome in logs or rows. |
| `set_config(key, value)` | Writes `plugin.<id>.<key>`; the plugin sees `config-changed` before its next call. |
| `restart()` | `hello` and `start` again on fresh instances; clears the breaker. |
| `scheduled_calls()`, `advance(by)` | The pending durable calls, and a way to move their clock so due calls fire. |
| `logs()` | The plugin's log lines, from the `log` import and stdio. |
| `targets` | `answer(name, &[ips])` and `route(to, local)` stub DNS and redirect a vetted connection to a local stub server. The host's outbound guard still vets every address. |
| `until(what, max, f)` | Polls every 50 ms until `f` holds, panics after `max`. |
| `finish()` | Stops the plugin; dropping the harness drops its database and roles. |

Pair the harness with stub servers for whatever your plugin calls: `fk-plugin-download` runs stub
indexer and download-client servers and checks its throttle rows with a superuser session in the
plugin's schema.

## Verifying your archive

`cargo xtask package` already verifies the archive it writes. To check one you didn't just build, or
one a teammate sent:

```bash
cargo xtask verify dist/example.hello-0.1.0.fkplugin
```

It runs core's own archive inspector over the bytes, checks the `files` hashes, the size budget and
that the component imports only the `plugin` world and exports only `guest`, then prints the id,
version and trust. `--max-mib <n>` sets the size budget (default 32), and `--key <hex public key
file>` trusts a dev public key. This catches every archive-format mistake before you'd otherwise
only discover it as a refused import in the admin UI.

## Running against a local dev Fliks instance

1. Turn on **Allow unsigned plugins** (**Settings > Advanced > Plugins > ⋮ > Settings**) while
   you're developing.
2. Import your `.fkplugin` (**Settings > Advanced > Plugins > ⋮ > Import a plugin**).
3. Watch the plugin's row. Its status badge reads **Active**, **Unavailable** (installed, but the
   plugin isn't in its `ready` state), **Failed** (registration failed or the breaker tripped) or
   **Disabled**. Click the badge for the detail: the `statusReason` of a failed registration and,
   once the crash circuit breaker has tripped, the last 4 KiB the plugin wrote to stderr. The raw
   state (`starting`, `handshaking`, `ready`, `degraded`, `crashed`, `backoff`, `failed`, `stopped`)
   is the `processState` field of `GET /api/plugins`.
4. `GET /api/plugins/metrics` (or the **Metrics** panel under the plugin's row) once it's running: a
   climbing `hostCallFailureCount` or a non-zero `restartCount` both mean something's still wrong
   even though the row says `Active`.

Reinstalling the same plugin id replaces the running plugin in place, no need to uninstall first,
and it keeps your existing settings and database schema. To restart it without reinstalling, use
`POST /api/plugins/<id>/restart`.

Setting `FLIKS_PLUGINS_DISABLED=1` starts the server without loading any plugin, which is the way
out when a plugin misbehaves at boot.

## Reading the plugin logs

Core captures everything a plugin logs into its own log buffer, tagged `plugin:<your-id>`. Read it
in **Settings > System > Logs** (`/admin/system/logs`, or
`GET /api/system/logs?q=plugin:<your-id>`): the search matches the context column. The buffer keeps
the last 2000 core log lines overall, so it's a recent window, not an archive.

- The SDK's `debug!`, `info!`, `warn!` and `error!` map to the matching levels. A stdout line is
  logged at `log` level; a stderr line at `error`, unless it starts with `WARN` (after any
  `[bracketed]` prefixes), in which case it's a warning.
- Output is capped at 64 KiB per minute across all of it. Past the cap, the rest of that minute is
  dropped, with a single warning. Rate-limit your own logging.
- Core writes its own lines under the same tag: every crash with its reason, an unhealthy `health`
  reply, a tripped circuit breaker, a foreign key that blocks core deletes, an outbound request the
  guard refused (`plugin "<id>" outbound refused: <host> resolves to <class> address`, never the
  full URL).

## Common errors

The admin UI turns an install refusal into a translated message per family of codes. The raw code
(`PLUGIN_UNSIGNED` and so on) is the `code` field of the failed API response, visible in your
browser's developer tools; codes the UI doesn't know are shown verbatim.

| Symptom | Cause | Fix |
|---|---|---|
| `PLUGIN_UNSIGNED` on import | A `process` archive isn't signed by the official key (unsigned, or signed with your own dev key), and **Allow unsigned plugins** is off. | Turn the setting on for local dev. A plugin for other people ships through the official catalog, which signs it (see [Publishing](/plugins/publishing)). |
| `PLUGIN_BAD_MANIFEST` | Not valid JSON, a required field is missing, an unknown top-level key is present, `runtime` isn't `wasm`, `scopes` is empty. | Check against [the manifest reference](/plugins/manifest); this code gives no finer reason. |
| `PLUGIN_BAD_WASM` | `plugin.wasm` isn't a WebAssembly component. | Build for `wasm32-wasip2` and let `cargo xtask package` write the archive. |
| `PLUGIN_TIER_VIOLATION` | A `data` manifest's archive carries `plugin.wasm`, or a `process` manifest's doesn't. | Match `kind` to what's actually in the archive. |
| `PLUGIN_HASH_MISMATCH` / `PLUGIN_FILE_SET_MISMATCH` | The manifest's `files` map doesn't match what's really in the archive. | Don't hand-write `files`; let `cargo xtask package` compute it from the built bytes. |
| `PLUGIN_TOO_LARGE` | `plugin.wasm` over 32 MiB, the archive over 33 MiB, or the entries over 48 MiB together. | Build with `opt-level = "s"`, LTO and `strip = true`, as both real plugins do. |
| `invalid-component` | The component doesn't compile, or imports something outside the `plugin` world. | Run `cargo xtask verify` on the archive: it prints the imports it refused. |
| `manifest-mismatch` | The `id`, `version` or `pluginApi` the component reports in `hello` differs from the manifest. | Rebuild and repackage from the same crate: `export!` reads `plugin.template.json` and `CARGO_PKG_VERSION` at build time. |
| `incompatible-api` | Your `pluginApi` isn't in core's `SUPPORTED_PLUGIN_API_VERSIONS`. | Use `2` and rebuild against the current [SDK](/plugins/sdk-reference). A `pluginApi` 1 package stays installed but `failed` until a version built for `2` replaces it. |
| `incompatible-fliks` | Your `fliks` range doesn't cover the running core version. | Widen the range (with an upper bound) once you've actually checked compatibility; see [Publishing](/plugins/publishing#compatibility). |
| `network-not-granted` | The manifest asks for `network.internal` and the install didn't grant it, for instance after an unattended update. | Install it by hand from the consent sheet, which lists `network:internal`. |
| `PLUGIN_DB_PROVISION_FAILED` on import, or `db-provision-failed` as the status reason | A declared `coreRefs` table or its `id` column doesn't exist, `coreRefs` is set while `schema` is `false`, or the database role may not create roles. | Confirm the table name and check the core version you're running has it. |
| `spawn-failed` with `still starting` | `start` didn't return within the 15 seconds an install waits. | Keep `start` short: run migrations there, not a data sweep. The plugin keeps starting and its status updates when it settles. |
| Row stays **Unavailable**; `processState` cycles `crashed` / `backoff` (recreated after 1, 2, 4, 8, 16, then 30 s), then settles on `failed` | Six crashes inside 10 minutes trips the circuit breaker. | Fix the underlying crash (the stderr tail is in the badge detail and the logs), then disable and re-enable the plugin, or call `POST /api/plugins/:id/restart`. |
| `processState` shows `degraded` | `health` is replying `ok: false`, timing out, or `start` is retrying because core's database was unreachable. Four consecutive misses drop the instance. | Make sure your `health` answers within 10 seconds and doesn't block on anything that can hang. |
| A route answers 504 `PLUGIN_TIMEOUT` | The handler ran past 180 seconds, and its instance was dropped. | Move long work to a job or a scheduled call, and end outbound requests by a `Budget`. |
| A route answers 503 `PLUGIN_UNAVAILABLE` | The plugin isn't `ready`, its queue of 32 waiting requests is full, or the handler returned `Err` or trapped. | Check the status badge, then the log lines tagged `plugin:<id>`. |
| An outbound request fails with `target address is not allowed` | The host's guard refused the address: private, loopback, link-local or reserved. | Public targets only, unless the manifest declares `network: { "internal": true }` and an admin consented at install. |

For the full archive-guard refusal codes (`PLUGIN_BAD_ID`, `PLUGIN_TOO_LARGE`, and the rest), see
[the manifest reference](/plugins/manifest#full-validation-error-reference) and
[Packaging and signing](/plugins/packaging-and-signing#refusal-codes).
