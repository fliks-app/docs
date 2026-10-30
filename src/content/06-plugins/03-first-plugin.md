---
title: Your first plugin
description: Build, package and install a minimal process plugin from zero, and see it appear in Settings > Advanced > Plugins.
---

## Prerequisites

A few words used on this page:

- **Core** is the Fliks server itself, as opposed to a plugin.
- A **`process` plugin** is a plugin that ships code: a WebAssembly component core runs in a
  sandbox (the other tier, `data`, ships no code; see [Overview](/plugins/overview)).
- The **manifest** is `plugin.json`, the file that declares what the plugin is and what it may do.
- The **archive** is the `.fkplugin` file you install: a ZIP holding the manifest, the component
  and a logo.

What you need installed:

- **Rust** (stable, edition 2024) with the WebAssembly target:

  ```bash
  rustup target add wasm32-wasip2
  ```

- **git**, which Cargo uses to fetch the SDK from the Fliks repository.
- A **running Fliks 5.x instance** you can log into as an admin. See
  [Dev environment](/development/dev-environment) if you don't have one yet, or
  [Docker](/install/docker) for a packaged one.

You don't need a database or a bundler: a plugin is one Rust crate.

## Step 1: create the crate

A plugin repository has the shape of `fk-plugin-notify`: the plugin crate at the root plus a tiny
`xtask` crate that wraps the SDK's packaging tool.

```text
my-plugin/
  Cargo.toml
  .cargo/config.toml
  plugin.template.json
  logo.svg
  src/lib.rs
  xtask/
    Cargo.toml
    src/main.rs
```

`Cargo.toml`. The `fliks-plugin-sdk` dependency is a git dependency; pin the tag of the Fliks
release you target (the real plugins pin a `rev`):

```toml
[workspace]
resolver = "3"
members = [".", "xtask"]
default-members = ["."]

[package]
name = "fk-plugin-hello"
version = "0.1.0"
edition = "2024"
license = "MIT"
publish = false

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
fliks-plugin-sdk = { git = "https://github.com/fliks-app/fliks", tag = "v5.2.0" }
serde_json = "1"

[profile.release]
opt-level = "s"
lto = true
codegen-units = 1
strip = true
```

`.cargo/config.toml`:

```toml
[alias]
xtask = "run -q -p xtask --"
```

`xtask/Cargo.toml`:

```toml
[package]
name = "xtask"
version = "0.1.0"
edition = "2024"
publish = false

[target.'cfg(not(target_arch = "wasm32"))'.dependencies]
fliks-plugin-sdk = { git = "https://github.com/fliks-app/fliks", tag = "v5.2.0", features = ["build"] }
```

`xtask/src/main.rs`:

```rust
#[cfg(not(target_arch = "wasm32"))]
fn main() -> std::process::ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match fliks_plugin_sdk::build::cli(&args) {
        Ok(()) => std::process::ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("{e}");
            std::process::ExitCode::FAILURE
        }
    }
}

#[cfg(target_arch = "wasm32")]
fn main() {}
```

`plugin.template.json`, the manifest without `version` and `files`: packaging takes the version
from `Cargo.toml` and computes the file hashes itself. Every field is explained in
[the manifest reference](/plugins/manifest); this is a small `process` manifest with one route and
one settings page.

```json
{
  "id": "example.hello",
  "pluginApi": 2,
  "name": "Hello",
  "fliks": ">=5.0.0 <6.0.0",
  "author": "you",
  "description": "Starting point for a Fliks plugin.",
  "license": "MIT",
  "logo": "logo.svg",
  "kind": "process",
  "runtime": "wasm",
  "memoryMb": 32,
  "database": { "schema": false, "coreRefs": [] },
  "scopes": ["config:rw"],
  "ingestRoots": [],
  "permissions": ["ping"],
  "routes": [
    { "method": "GET", "path": "/ping", "policy": "read:plugin:example.hello:ping" }
  ],
  "ui": {
    "contributions": [
      {
        "id": "hello.settings",
        "slot": "settings.page",
        "weight": 100,
        "labelKey": "hello.title",
        "action": { "kind": "route", "path": "/admin/settings/plugins/example.hello/main" }
      }
    ],
    "configPages": [
      {
        "id": "main",
        "labelKey": "hello.title",
        "fields": [
          { "key": "greeting", "type": "text", "labelKey": "hello.greeting", "default": "hello" }
        ]
      }
    ]
  },
  "i18n": {
    "en": { "hello.title": "Hello", "hello.greeting": "Greeting" }
  }
}
```

Keep the id `example.hello` while you follow this page, since the route and the settings link use
it. Before you share a plugin, give it an id of your own (see
[the manifest reference](/plugins/manifest#base-fields-both-tiers)). `scopes` must not be empty
for a `process` plugin, so the manifest asks for `config:rw`, which the code below uses.

`logo.svg` can be any SVG under 64 KiB with an `<svg>` root element and no `<script>` tag,
event-handler attribute or `javascript:` URI; core sniffs the bytes and refuses anything else. A
`logo.png` works too, if `logo` names it.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#4f46e5"/></svg>
```

`src/lib.rs`, the entry point. The `Plugin` trait has one method per guest export, all with
defaults; this plugin implements `http` and answers one route through the SDK's router:

```rust
use fliks_plugin_sdk::router::{Request, Response, Router};
use fliks_plugin_sdk::{HttpRequest, HttpResponse, Plugin, host, serde_json::json};

struct Hello;

fn greeting() -> String {
    host::config_get(Some(&["greeting".to_owned()]))
        .ok()
        .and_then(|kv| kv.into_iter().find(|(k, _)| k == "greeting"))
        .map_or_else(|| "hello".to_owned(), |(_, v)| v)
}

fn ping(req: &Request) -> Result<Response, String> {
    Ok(Response::json(
        200,
        &json!({ greeting(): format!("{} {}", req.method, req.path) }),
    ))
}

impl Plugin for Hello {
    fn http(req: HttpRequest) -> Result<HttpResponse, String> {
        Router::new().route("GET", "/ping", ping).handle(req)
    }
}

fliks_plugin_sdk::export!(Hello);
```

`export!` generates the component's exports and the `hello` handshake from `plugin.template.json`
(the `id` and `pluginApi`) and `CARGO_PKG_VERSION`. That's the whole plugin: it starts, answers
`health` with `ok`, serves one route, and reads its own setting live on every request.

## Step 2: build and package

From `my-plugin`:

```bash
cargo xtask package --out dist
```

This builds the release component for `wasm32-wasip2`, writes `plugin.json` (the template plus
`version` and the sha256 of every file), writes a deterministic archive, and then verifies it the
way core will: the archive guards, the component's world and a size budget. The first run compiles
the SDK's build tooling, which includes core's own archive inspector, so it takes a few minutes.

It prints the path of the archive, `dist/example.hello-0.1.0.fkplugin`. If it stops with a message
instead, the message names the field or file it refused. See
[Packaging and signing](/plugins/packaging-and-signing) for what the archive holds and why this
one is unsigned.

## Step 3: allow unsigned plugins (once)

A `process` plugin must be signed by the official release key unless the admin allows otherwise.
Log into your Fliks instance as an admin, open **Settings > Advanced > Plugins**, then the **⋮**
menu next to **Search for a plugin**, then **Settings**, and turn on **Allow unsigned plugins**.
This exists for local development; leave it off otherwise.

## Step 4: install it

Back on **Settings > Advanced > Plugins**, open the **⋮** menu again and choose **Import a
plugin**. Pick the `.fkplugin` file you just built.

This opens the consent sheet: **Install Hello?**, its id and version, a trust badge (it will say
**Imported manually**, since it's unsigned), a short explanation of what a `process` plugin can do,
and a capability list built from your manifest. Here it lists three lines: **Add a "settings.page"
interface element** (from `ui.contributions`), **Add a "main" settings page** (from
`ui.configPages`) and **Access: config:rw** (from `scopes`). Routes are not listed. Because the
archive is unsigned, the **Install** button stays disabled until you tick the acknowledgement
checkbox. Tick it, click **Install**.

## Step 5: see it running

Back in the plugin list you should see one new row:

| Plugin | Version | Tier | Trust | Status | Enabled |
|---|---|---|---|---|---|
| Hello (`example.hello`) | 0.1.0 | Process | Imported manually | Active | on |

If it instead shows **Failed**, click the status badge: it shows the reason. `incompatible-fliks`
means the `fliks` range in the manifest doesn't include your core version.
See [Testing and debugging](/plugins/testing-and-debugging#common-errors) for the other common
ones.

Expand the **Metrics** row under it (`process` plugins only) to see **Host calls**, **Restarts**
and **Memory (RSS)**, all zero or near-zero for a plugin that's just started.

Now call the plugin's one route. Core serves a plugin's routes under `/api/plugins/<id>/`, so in
the same browser where you are logged in, open:

```text
http://<your-fliks-host>/api/plugins/example.hello/ping
```

You should get `{"hello":"GET /ping"}`: core checked the route's `read:plugin:example.hello:ping`
policy against your account (nothing is granted by default, so only admins pass), forwarded the
request to the plugin's `http` export, and returned its answer. A `503` means the plugin isn't
`ready`; check the status badge.

Open **Hello** in the settings sidebar, type `bonjour` in **Greeting**, save, and reload the
`/ping` URL: it answers `{"bonjour":"GET /ping"}`.

## Step 6: add a job and reinstall

A job is a cron entry core runs for you. In `plugin.template.json`, add a `jobs` array next to
`routes`, and a label for it in `i18n.en`:

```json
"jobs": [
  { "name": "Greet", "cron": "*/5 * * * *", "triggerable": true, "labelKey": "hello.jobs.greet" }
],
```

```json
"en": { "hello.title": "Hello", "hello.greeting": "Greeting", "hello.jobs.greet": "Say hello" }
```

In `src/lib.rs`, add the `info` macro to the SDK import and a `job` method to the `impl`:

```rust
use fliks_plugin_sdk::{HttpRequest, HttpResponse, Plugin, host, info, serde_json::json};
```

```rust
    fn job(name: String, _job_id: String, _args: Option<String>) -> Result<(), String> {
        match name.as_str() {
            "Greet" => {
                info!("{}", greeting());
                Ok(())
            }
            other => Err(format!("unknown job {other}")),
        }
    }
```

Raise `version` in `Cargo.toml` to `0.1.1`, repackage and import the new archive the same way:

```bash
cargo xtask package --out dist
```

The consent sheet now also lists **Run a scheduled job: Greet**. **Reinstalling the same id
replaces the running plugin**, there is no need to uninstall first; the existing settings and (if
it had one) database schema are kept. Run the job from the scheduler page, then read its line in
the log viewer by searching for `plugin:example.hello` (see
[Testing and debugging](/plugins/testing-and-debugging#reading-the-plugin-logs)).

## What to read next

- [The manifest reference](/plugins/manifest) for every field you just used and the ones you
  didn't.
- [Process plugins](/plugins/process-plugins) for the full runtime contract: lifecycle, config,
  logging, jobs, crashes.
- [SDK reference](/plugins/sdk-reference) for the host functions, the database and the HTTP client.
- [Testing and debugging](/plugins/testing-and-debugging) before you build anything you'd want to
  keep working.
