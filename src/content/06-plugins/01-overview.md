---
title: Overview
description: What a Fliks plugin can do, the two tiers it can ship as, and how to pick between them.
---

## What a plugin is

A Fliks plugin is a package described by one file, `plugin.json` (the **manifest**), that
**core** (the Fliks server itself) reads, verifies and registers. It is installed as a `.fkplugin`
archive, a ZIP holding the manifest, a logo and, for a `process` plugin, its code. A manifest can be
all there is (a **data** plugin) or it can carry a WebAssembly component that core runs inside its
own sandbox (a **process** plugin). Either way, a plugin never ships Angular code and never gets a
database connection or a filesystem path outside what core hands it explicitly. Everything a plugin
can reach, from the functions it can call on core to the menu it can add an entry to, comes from a
closed, versioned list. That list is what makes a plugin's blast radius reviewable, and what lets
core promise a plugin will keep working across a release: see [Architecture](/plugins/architecture)
for how that promise is kept, and the closing section of [the manifest reference](/plugins/manifest)
for how the list itself grows.

This section is written for someone who has never touched Fliks before. Read
[Architecture](/plugins/architecture) next for the lifecycle, then
[Your first plugin](/plugins/first-plugin) to build one.

## The two tiers

| | `data` | `process` |
|---|---|---|
| Ships code | No, JSON only | Yes, one WebAssembly component (`plugin.wasm`) |
| Runs on your server | Never | Inside core, in a sandbox |
| Can answer an HTTP route | No | Yes, routes it declares in its manifest |
| Can own a database schema | No | Optionally |
| Can run scheduled jobs | No | Optionally |
| Can add UI (nav entries, menu actions, settings pages) | Yes | Yes |
| Can subscribe to domain events | Yes, as a webhook core POSTs on its behalf | Yes, as a call it handles itself |
| Installing it can execute something | Never | Yes, that's the point |

**A `data` plugin** is a manifest and nothing else. It can add pages and menu entries, declare a
settings form, and ask to be told about certain events happening in your library (a title was
imported, a request was approved). When one of those events fires, **core** makes the outbound
HTTPS request on the plugin's behalf, at most once, no retry. The plugin itself never runs: there
is no code to crash, no code to audit beyond the JSON, and installing one cannot execute anything.

**A `process` plugin** ships a WebAssembly component, written in Rust against the
`fliks-plugin-sdk` crate, that core loads into a wasmtime sandbox. It has no sockets, no
environment and no files outside its own data directory. It answers HTTP requests core proxies to
it, runs jobs on a cron schedule, owns a Postgres schema if it asks for one, and calls a fixed set
of functions on core to read library state, ingest a finished download, publish events, or read and
write its own settings. It is the tier that can do work of its own, and the one whose failure needs
supervision, which is why core watches its health and recreates its instances on a backoff ladder
(see [Architecture](/plugins/architecture)).

> [!TIP]
> Pick `data` unless the plugin genuinely needs to act. The tiers are not a spectrum: a `data`
> plugin that turns out to need one HTTP route is a `process` plugin, full stop. There's no
> intermediate step for "mostly declarative, but with a little bit of code."

## What each tier can concretely do

**Every plugin, either tier, can:**

- Add a navigation entry, a settings-sidebar entry, or a row in the media/season action menus
  (`ui.contributions`, see [UI extensions](/plugins/ui-extensions)).
- Declare a settings page rendered by core's own form, provider-list, or table components
  (`ui.configPages`, same chapter).
- Ship translated strings for its own labels (`i18n`).
- Get installed, updated and (if revoked) shut down through the same trust machinery as any other
  plugin (see [Publishing](/plugins/publishing)).

**Only a `process` plugin can additionally:**

- Answer HTTP routes it declares (`routes[]`), each behind its own permission and an optional
  object-level guard.
- Own a Postgres schema and run its own migrations against it
  (see [Storage and database](/plugins/storage-and-database)).
- Run named jobs on a cron schedule, triggerable by an admin as well, and schedule durable delayed
  calls to itself.
- Make outbound HTTP requests, vetted by core.
- Call core's host functions: read what needs acquiring, score candidate releases, ingest a
  finished file into the library, publish domain events, read and write its own settings (the full
  list is in [SDK reference](/plugins/sdk-reference)).
- Contribute a release picker (the "search releases" panel on a title) or a player pre-roll hook.

**Only a `data` plugin can additionally:**

- Have its webhook subscriptions honoured with no code review needed on its own delivery logic,
  because core makes every request. That's also its ceiling: no retry, no batching, no filtering
  beyond "this event, to this URL."

## What's out of reach

If something a plugin might want to do isn't in one of the lists above, it isn't available, by
design, and there's no per-installation escape hatch:

- No arbitrary database access. A `process` plugin only ever sees its own schema, plus
  `REFERENCES`-only column grants on the core tables it declared needing.
- No sockets of its own. Outbound HTTP goes through core, which refuses private and reserved
  addresses unless the admin consented to `network.internal` at install.
- No filesystem access outside its own data directory, mounted as `/data`.
- No environment variables and no command line: configuration arrives through the `hello` call and
  `config_get`.
- No author-supplied validation logic in a settings form: field constraints are a closed set
  (`min`/`max`/`minLength`/`maxLength`), never a regular expression, because an attacker-supplied
  pattern can hang the tab that renders it.
- No custom UI. A plugin describes what its pages and menu entries look like; core renders them
  with its own components. There is no way to ship a custom widget.
- No calling another plugin, or knowing another plugin exists, beyond what's visible in the shared
  admin UI.

Proposing a new extension point (a new host function, a new UI slot, a wider scope) is a real path,
not a dead end, it's just a core change rather than something a plugin can reach for on its own.
See the closing section of [the manifest reference](/plugins/manifest#proposing-a-new-extension-point)
for what a proposal needs to say.

## Real plugins, for reference

[Examples](/plugins/examples) walks through two shipping `process` plugins in detail:
`fliks.download` (indexers, download clients, the acquisition pipeline) and `fliks.notify`
(webhook delivery with retries). [Data plugins](/plugins/data-plugins#a-worked-example) has a full
worked manifest for the `data` tier. Reading them together is the fastest way to see the tiers side
by side.
