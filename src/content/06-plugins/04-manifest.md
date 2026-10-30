---
title: The manifest
description: Every plugin.json field, its type, whether it's required, its constraints, and the exact errors a bad value produces.
---

## Where it comes from

`plugin.json` sits at the archive root. For a `process` plugin you don't write it by hand: you keep
`plugin.template.json` (the same document without `version` and `files`) and
`cargo xtask package` produces `plugin.json` from it. The manifest is validated in layers, and each
layer produces a different kind of failure:

1. **Structural parsing.** Not valid JSON, larger than 256 KiB, missing a required field, a wrong
   type, an unknown top-level key, a `kind` other than `data`/`process`, a `runtime` other than
   `wasm`, an unknown or empty `scopes` list, a bad `ingestRoots` entry, a malformed `network`,
   `memoryMb` over 1024, or an `i18n` block that breaks the rules below all fail the same way:
   `PLUGIN_BAD_MANIFEST`, "plugin.json failed structural validation." No finer reason is given at
   this layer. The packaging tool runs the same check, so it catches these before you install.
2. **Id and version.** Checked separately, with a specific reason each: `PLUGIN_BAD_ID` or
   `PLUGIN_BAD_VERSION`.
3. **UI and events shape.** The `ui.*` and `events` blocks are checked field by field, each with
   its own reason (`PLUGIN_BAD_UI_CONTRIBUTIONS`, `PLUGIN_BAD_UI_CONFIG_PAGES`, and so on).
4. **Registration-time semantics**, once the archive has already been installed: `pluginApi`, the
   `fliks` range, route methods, paths and policies, jobs, permissions, webhooks, the release
   picker, contribution targets, the i18n namespace, the component itself. A failure here does not
   undo the install; the plugin is stored with `status: 'failed'` and a `statusReason` naming
   exactly which rule it broke, so you can fix the manifest and reinstall.

Layers 1-3 run during **inspect**, before anything reaches the database (see
[Architecture](/plugins/architecture)). Layer 4 runs during **register**, right after **confirm**.

> [!NOTE]
> Unknown top-level keys are rejected outright, on both tiers, so a typo in a field name fails the
> install instead of being silently ignored.

## Base fields (both tiers)

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | string | yes | Pattern `^[a-z][a-z0-9]*(\.[a-z0-9]+)*$`, lowercase letters, digits and dots only, no hyphens or underscores, at most 51 characters. Reverse-DNS style, e.g. `acme.subtitles`. The cap keeps the longest name derived from it (the database role `fp_<8 hex>_<id>`) inside Postgres's 63-byte identifier limit. `ui`, `metrics`, `sources` and `import` are reserved. |
| `pluginApi` | number | yes | The contract revision this plugin is written against. Core accepts every value in `SUPPORTED_PLUGIN_API_VERSIONS`; today that's just `2`. |
| `name` | string | yes | Display name, non-empty. |
| `version` | string | yes | Must be valid semver. `cargo xtask package` writes it from the crate version. |
| `fliks` | string | yes | A non-empty semver range, matched against the running core version with its prerelease stripped (so a `5.0.0-rc.1` core satisfies `>=5.0.0`). See the callout below about upper bounds. |
| `author` | string | yes | Free text; may be empty. |
| `description` | string | yes | Free text; may be empty. |
| `license` | string | yes | Free text; may be empty. |
| `logo` | string | yes | The archived file name, `logo.svg` or `logo.png`. |
| `homepage` | string | no | The only identity field that's optional. |
| `kind` | `"data" \| "process"` | yes | Picks which of the two shapes below applies. |
| `ui` | object | no | See [UI extensions](/plugins/ui-extensions). |
| `events` | array | no | Webhook subscriptions. Honoured for a `data` plugin only; see [Data plugins](/plugins/data-plugins#events). A `process` plugin receives every domain event and ignores the list. |
| `i18n` | `{ locale: { key: string } }` | no | See the i18n rules below. |

> [!IMPORTANT]
> Core does **not** refuse a `fliks` range that has no upper bound (`">=5.0.0"` installs fine on a
> manual upload). Give it one anyway, `">=5.0.0 <6.0.0"`, never a bare lower bound: the official
> catalog's own submission check refuses a range without one, and a plugin that has never been
> checked against a future major will be the first thing that breaks when it ships.

## Process-only fields

A `data` manifest may not carry any of these; a `process` manifest must carry all of them except
where marked optional.

| Field | Type | Required | Constraint |
|---|---|---|---|
| `runtime` | `"wasm"` | yes | The only legal value. |
| `memoryMb` | number | yes | The cap on each instance's linear memory, in MiB, at most 1024. All live instances of one plugin together may hold at most twice this. A `memory.grow` past the cap traps that instance. |
| `files` | `{ path: sha256 }` | yes | sha256 of every archived entry except the manifest and its own signature: `plugin.wasm` and the logo. `cargo xtask package` computes it. |
| `database` | `{ schema: boolean, coreRefs: string[], secrets?: [...] }` | yes | Whether the plugin wants its own Postgres schema, which core tables it needs `REFERENCES` grants on, and which stored values are credentials. See below. |
| `routes` | array of `{ method, path, policy, objectGuard? }` | yes, may be empty | Every HTTP route core will proxy to this plugin. A route not declared here does not exist, full stop. |
| `scopes` | array | yes, non-empty | Which host-function groups this plugin may call. Table below. |
| `ingestRoots` | array of strings | yes, may be empty | Absolute path prefixes `library_ingest` is allowed to take files from. Each must be absolute, already normalised (no `..`, `.` or `//`), and not a filesystem root (`/` or `C:\`). A drive-letter path is read as a Windows path. |
| `jobs` | array of `{ name, cron, triggerable, labelKey }` | no | Named cron entries core schedules and dispatches. At most 16. |
| `permissions` | array of strings | no | Raw names; core builds the CASL subject as `plugin:<id>:<name>`. |
| `network` | `{ "internal": true }` | no | Lets the plugin's outbound requests reach private addresses (a download client on the LAN). Any other shape is refused. The install consent sheet is the grant. |
| `checklist` | array of strings | no | Accepted and silently ignored; core reads nothing from it. |

### `database`

`schema` is a boolean. If it is `false`, `coreRefs` must be empty, or registration fails with
`db-provision-failed`. Each `coreRefs` name must match `^[a-z_][a-z0-9_]*$`, be at most 63
characters, and appear once.

`secrets` (optional) lists the credentials the plugin stores in its own tables, so an export can
leave them out: an array of `{ table, column, jsonPath? }`. Without `jsonPath` the whole column is
masked. With it, `jsonPath` is a dotted path of object keys inside a `json`, `jsonb` or JSON-text
column (`*` walks the elements of an array and may not be last). A malformed entry or an unknown
key is `PLUGIN_BAD_MANIFEST`. See
[Storage and database](/plugins/storage-and-database#export-and-import).

### `routes[]`

| Field | Constraint |
|---|---|
| `method` | One of `GET POST PUT PATCH DELETE HEAD OPTIONS`, case-insensitive. |
| `path` | Starts with `/` and must parse as a [path-to-regexp](https://github.com/pillarjs/path-to-regexp) v8 pattern: `:name` matches one non-empty segment, `*name` the rest. Matching is case-insensitive, accepts one trailing `/`, and percent-decodes captured values. |
| `policy` | `"<action>:<Subject>"`, split at the first colon. `action` is one of `manage create read update delete approve decline grab track`. `Subject` is one of the closed core set (`User`, `Media`, `FliksRequest`, `QualityProfile`, `LanguageProfile`, `SubtitleProvider`, `SubtitleFile`, `TranslationProvider`, `Library`, `Playlist`, `Settings`) or this plugin's own `plugin:<id>:<name>` subject, where `<name>` is one of this same manifest's declared `permissions`. |
| `objectGuard` (optional) | `"<guard>:<paramName>"`. Exactly two guards exist: `libraryAccessible` and `mediaAccessible`, each checking the numeric path param against the requesting user's accessible libraries or media. `<paramName>` must actually appear in `path`, and the value must be a canonical positive integer. |

No two routes may share the same method and path (`duplicate-route`). A route that one of core's own
`/api/plugins/:id/...` routes would shadow is refused (`invalid-route-path`): `GET /logo`,
`GET /export`, and `POST /import`, `/enable`, `/disable`, `/restart`, `/events/test`. A pattern with
a parameter, such as `/:page`, stays legal.

### `scopes[]`

| Scope | Host functions it unlocks |
|---|---|
| `media:read` | `media_acquisition_context`, `media_resolve`, `media_exists`, and (because both answer with media identity across the whole library) `acquisition_candidates` and `releases_match` |
| `acquisition:candidates` | `acquisition_candidates`, `releases_match` |
| `releases:score` | `releases_score` |
| `requests:progress` | `requests_mark_in_progress` |
| `ingest:write` | `library_ingest` |
| `events:emit` | `events_publish`, `notifications_dispatch_grab_started`, `events_emit_own`, `counts_set`, `progress_set` |
| `config:rw` | `config_get`, `config_set` |

Calling a host function without every scope it needs fails with `ERR_DENIED`, `plugin "<id>" is
missing scope "<scope>" required for "<method>"`. Declare every scope every function you call
needs; there's no partial grant within one function. `db`, `log`, `schedule_call`, `cancel_call`
and `deadline_remaining_ms` need no scope. Scopes are consented once at install and written from
the manifest by a confirmed install only: boot, enable and restart never change them.

### `jobs[]`

| Field | Constraint |
|---|---|
| `name` | Non-empty, unique within this manifest, and not one of core's own job names or another plugin's. |
| `cron` | Five fields, or six with a leading seconds field, or an `@` nickname. Evaluated in the server's time zone. |
| `triggerable` | Boolean: whether an admin can run it on demand from the scheduler page. |
| `labelKey` | Non-empty i18n key shown on the scheduler page. |

### `permissions[]`

Each entry must match `^[a-z][a-z0-9_-]{0,63}$` and be unique. Every distinct `action:subject`
policy your `routes[]` declare under a given permission name becomes its own tick box in the roles
editor (so `read:plugin:<id>:queue` can be granted separately from
`manage:plugin:<id>:queue`); a declared name no route mentions is offered whole and grants every
action once ticked. Nothing is granted by default: until an admin ticks a box, only admins pass the
routes declared under it.

## The `i18n` block

```json
"i18n": {
  "en": { "acme.settings.title": "Settings", "acme.settings.hint": "..." },
  "fr": { "acme.settings.title": "Paramètres", "acme.settings.hint": "..." }
}
```

- Every key must contain at least one dot; a bare `"title"` is refused.
- No key may be a dotted ancestor of another declared key (`acme.config` alongside
  `acme.config.title` is refused).
- Every key across every locale must share exactly one root segment (here, `acme`). It does not
  have to equal or derive from the plugin's own `id`.
- Breaking any of the three rules above refuses the archive with `PLUGIN_BAD_MANIFEST`.
- At registration, that root is claimed: a second plugin declaring the same root fails with
  `i18n-namespace-conflict`; whichever plugin loaded first keeps it.

## Full validation error reference

Archive-level refusals (`PLUGIN_BAD_MAGIC`, `PLUGIN_TOO_LARGE` and the rest) are listed in
[Packaging and signing](/plugins/packaging-and-signing#refusal-codes).

| Code / reason | Meaning |
|---|---|
| `PLUGIN_BAD_MANIFEST` | The structural layer above: not valid JSON, a required field missing, an unknown top-level key, a wrong `kind` or `runtime`, and so on. |
| `PLUGIN_BAD_ID` | `id` fails the pattern, exceeds 51 characters or is reserved. |
| `PLUGIN_BAD_VERSION` | `version` isn't valid semver. |
| `PLUGIN_BAD_UI` | `ui` is present but isn't an object. |
| `PLUGIN_BAD_UI_CONTRIBUTIONS` | A `ui.contributions[]` entry is missing `id`, `slot`, `labelKey`, a numeric `weight`, or an `action` object with a string `kind`. |
| `PLUGIN_BAD_UI_CONFIG_PAGES` | A `ui.configPages[]` entry is missing what its `kind` requires (see [UI extensions](/plugins/ui-extensions)), or a `group` page item nests another `group` inside it. |
| `PLUGIN_BAD_UI_RELEASE_PICKER` | `ui.releasePicker` doesn't declare `{search, grab}` for all three of movie, season and episode. |
| `PLUGIN_BAD_EVENTS` | An `events[]` entry is missing a string `event` or `webhook`. |
| `PLUGIN_TIER_VIOLATION` | A `data` archive carries `plugin.wasm`, or a `process` archive doesn't. |
| `PLUGIN_UNSIGNED` | A `process` plugin isn't signed by the official key and **Allow unsigned plugins** is off. |
| `PLUGIN_FILE_SET_MISMATCH` | The manifest's `files` keys don't match the `plugin.wasm` plus logo entries in the archive. |
| `PLUGIN_BAD_WASM` | `plugin.wasm` doesn't start with the WebAssembly component preamble. |
| `PLUGIN_HASH_MISMATCH` | An entry's sha256 doesn't match what `files` declares for it. |
| `PLUGIN_BAD_LOGO` | The logo's bytes don't match its claimed format, or an SVG logo carries a `<script>`, an event-handler attribute, or a `javascript:` URI. |
| `PLUGIN_SIGNER_CHANGED` (409) | An upgrade over a package that was signed by a key must carry the same key. |
| `PLUGIN_KEPT_DATA_SIGNER` (409) | The plugin's kept data was left by a different signer than this package. Uninstall with the data deleted first. |
| `PLUGIN_DENIED` (403) | A catalog `denyList` entry matches this package. |
| *(registration, not install)* `untrusted` | The archive's signature no longer verifies against the specific key that verified it at install. |
| `revoked` | A denyList entry (see [Publishing](/plugins/publishing#revocation)) matches this exact package. |
| `incompatible-api` | `pluginApi` isn't in `SUPPORTED_PLUGIN_API_VERSIONS`. |
| `incompatible-fliks` | The `fliks` range doesn't match the running core version. Bypassable with the admin setting **Ignore the required Fliks version**; `incompatible-api` never is. |
| `invalid-webhook-event` / `unknown-webhook-setting` / `invalid-webhook-url` / `insecure-webhook-scheme` / `internal-webhook-host` | One of the `events[]` entries is malformed: an unknown event name, a `setting:<key>` naming no declared form field, an unparsable or non-https URL, or a URL whose host is an internal/private IP literal. |
| `invalid-release-picker` | One of the six `releasePicker` routes isn't declared in `routes[]` with the right method. |
| `invalid-player` | `ui.player.preRollRoute` isn't a declared `POST` route. |
| `invalid-ui-contribution` | A contribution's own route opens `/plugins/...` or `/admin/settings/plugins/...` for a page id this same manifest doesn't declare. |
| `i18n-namespace-conflict` | This manifest's i18n root is already claimed by another installed plugin. |
| `invalid-permission` | A `permissions[]` entry fails its pattern or is duplicated. |
| `invalid-job-name` / `job-name-conflict` / `invalid-job-cron` / `invalid-job-triggerable` / `invalid-job-label` | A `jobs[]` entry is malformed, one field at a time, or there are more than 16. |
| `invalid-route-method` / `invalid-route-path` / `invalid-route-policy` / `invalid-route-object-guard` / `duplicate-route` | A `routes[]` entry is malformed, one field at a time. |
| `network-not-granted` | The manifest asks for `network.internal` and the install consent did not grant it. |
| `invalid-component` | `plugin.wasm` doesn't compile, or isn't a component of the `plugin` world. |
| `db-provision-failed` | The plugin's Postgres role/schema couldn't be created, or a declared `coreRefs` table/column doesn't exist. |
| `manifest-mismatch` | The `id`, `version` or `pluginApi` the component reports in `hello` differs from the signed manifest. |
| `spawn-failed` | The first instance didn't come up: `hello` or `start` errored or timed out, or `start` is still running after 15 seconds. |
| `tampered` | The stored archive no longer matches the signed `files` hashes. |

Any reason other than `disabled`, `tampered`, `db-provision-failed`, `spawn-failed`,
`incompatible-fliks`, `incompatible-api`, `network-not-granted`, `manifest-mismatch` or
`invalid-component` tears the plugin's routes, contributions, permissions and jobs down entirely;
those instead leave the plugin "installed but not running", so a request to one of its routes gets
a `503` rather than acting as if the plugin never existed.

## A worked example

The manifest in [Your first plugin](/plugins/first-plugin) is the minimum that satisfies every
process-tier rule above. For every field in real, production use at once, read
[Examples](/plugins/examples), which walks through `fliks.download`'s full manifest field by field.

## Proposing a new extension point

Everything a plugin can reach, the host functions, the scopes, the UI slots, the routes a manifest
may declare, is a closed set on purpose: a closed set is what makes a plugin's blast radius
reviewable, and what lets core promise a plugin keeps working across a release. "Can my plugin do
X?" has no answer an author can reach alone when X isn't already in one of those sets; that's a
core change, proposed as an issue that says:

1. **What the plugin is trying to do**, as a user-visible outcome, not the API you imagined for it.
2. **What you tried within the existing set**, and where it stopped.
3. **What core would have to trust you with**: a new host function is a new scope, or a widening of
   one, say which, and what a hostile plugin holding it could do.
4. **Whether it can be additive.** `pluginApi` is a single integer, and within one value the
   contract only grows: a new optional field or function lands without changing it. Removing
   something, or changing an existing one's shape or meaning, bumps `pluginApi`. Core accepts only
   the values it lists (`SUPPORTED_PLUGIN_API_VERSIONS`, today `[2]`), and a plugin declaring any
   other is installed but `failed` with `incompatible-api`, which is why a change that needs a new
   value waits for a scheduled break and one that fits inside the current value ships far sooner.
