---
title: The manifest
description: Every plugin.json field, its type, whether it's required, its constraints, and the exact errors a bad value produces.
---

## Where it comes from

`plugin.json` sits at the archive root. It is validated in layers, and each layer produces a
different kind of failure:

1. **Structural parsing.** Not valid JSON, missing a required base field, an unknown top-level key,
   or a `kind` other than `data`/`process` all fail the same way: `PLUGIN_BAD_MANIFEST`,
   "plugin.json failed structural validation." No finer reason is given at this layer.
2. **Id and version.** Checked separately, with a specific reason each: `PLUGIN_BAD_ID` or
   `PLUGIN_BAD_VERSION`.
3. **UI and events shape.** The `ui.*` and `events` blocks are checked field by field, each with
   its own reason (`PLUGIN_BAD_UI_CONTRIBUTIONS`, `PLUGIN_BAD_UI_CONFIG_PAGES`, and so on).
4. **Registration-time semantics**, once the archive has already been installed: route policies,
   scopes, jobs, the release picker, the i18n namespace. A failure here does not undo the install;
   the plugin is written to disk with `status: 'failed'` and a `statusReason` naming exactly which
   rule it broke, so you can fix the manifest and reinstall.

Layers 1-3 run during **inspect**, before anything reaches the database (see
[Architecture](/plugins/architecture)). Layer 4 runs during **register**, right after **confirm**.

> [!NOTE]
> Unknown top-level keys are rejected outright, on both tiers, so a typo in a field name fails the
> install instead of being silently ignored.

## Base fields (both tiers)

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | string | yes | Pattern `^[a-z][a-z0-9]*(\.[a-z0-9]+)*$`, lowercase letters, digits and dots only, no hyphens or underscores, max 56 characters. Reverse-DNS style, e.g. `acme.subtitles`. The cap is Postgres's 63-character identifier limit minus the `plugin_` prefix a `process` plugin's schema name gets. |
| `pluginApi` | number | yes | The contract revision this plugin is written against. Core accepts every value in `SUPPORTED_PLUGIN_API_VERSIONS`; today that's just `1`. |
| `name` | string | yes | Display name. |
| `version` | string | yes | Must be valid semver (`semver.valid()`). |
| `fliks` | string | yes | A semver range, matched against the running core version with its prerelease stripped (so a `3.0.0-rc.1` core satisfies `>=3.0.0`). See the callout below about upper bounds. |
| `author` | string | yes | Free text; may be empty. |
| `description` | string | yes | Free text; may be empty. |
| `license` | string | yes | Free text; may be empty. |
| `logo` | string | yes | The archived file name, `logo.svg` or `logo.png`. Must match a file actually present. |
| `homepage` | string | no | The only identity field that's optional. |
| `kind` | `"data" \| "process"` | yes | Picks which of the two shapes below applies. |
| `ui` | object | no | See [UI extensions](/plugins/ui-extensions). |
| `events` | array | no | Webhook subscriptions. Functionally honoured for a `data` plugin only; see [Data plugins](/plugins/data-plugins#events). |
| `i18n` | `{ locale: { key: string } }` | no | See the i18n rules below. |

> [!IMPORTANT]
> Core does **not** currently refuse a `fliks` range that has no upper bound (`">=2.1.0"` installs
> fine on a manual upload). Give it one anyway, `">=3.0.0 <4.0.0"`, never a bare lower bound: the
> official catalog's own submission check refuses a range without one, and a plugin that has never
> been checked against a future major will be the first thing that breaks when it ships. Treat the
> upper bound as mandatory even though core's install path doesn't enforce it today.

## Process-only fields

A `data` manifest may not carry any of these; a `process` manifest must carry all of them except
where marked optional.

| Field | Type | Required | Constraint |
|---|---|---|---|
| `runtime` | `"node"` | yes | The only legal value. |
| `memoryMb` | number | yes | Passed straight through as `--max-old-space-size`. Core does not clamp it; the default when a manifest omits it entirely is 256, but once `kind: 'process'` is declared this field itself is required. |
| `files` | `{ path: sha256 }` | yes | sha256 of every archived entry except the manifest and its own signature. Leave it `{}` in your source; the packaging tool recomputes it and refuses a hand-written value that doesn't match. |
| `database` | `{ schema: boolean, coreRefs: string[] }` | yes | Whether the plugin wants its own Postgres schema, and which core tables it needs `REFERENCES` grants on. Each `coreRefs` name must match `^[a-z_][a-z0-9_]*$`, be at most 63 characters, and appear once. If `schema` is `false`, `coreRefs` must be empty. |
| `routes` | array of `{ method, path, policy, objectGuard? }` | yes, may be empty | Every HTTP route core will proxy to this plugin. A route not declared here does not exist, full stop. |
| `scopes` | array | yes, non-empty | Which host-method groups this plugin may call. Table below. |
| `ingestRoots` | array of strings | yes, may be empty | Absolute path prefixes `library.ingest` is allowed to write under. |
| `jobs` | array of `{ name, cron, triggerable, labelKey }` | no | Named cron entries core schedules and dispatches. |
| `permissions` | array of strings | no | Raw names; core builds the CASL subject as `plugin:<id>:<name>`. |
| `checklist` | array of strings | no | Accepted and silently ignored; core reads nothing from it. |

### `routes[]`

| Field | Constraint |
|---|---|
| `method` | One of `GET POST PUT PATCH DELETE HEAD OPTIONS` (case-insensitive, stored uppercased). |
| `path` | Starts with `/`, must parse as an [Express-style path](https://github.com/pillarjs/path-to-regexp) (`:param` segments allowed). |
| `policy` | `"<action>:<Subject>"`, split at the first colon. `action` is one of `manage create read update delete approve decline grab track`. `Subject` is one of the closed core set (`User`, `Media`, `FliksRequest`, `QualityProfile`, `LanguageProfile`, `SubtitleProvider`, `SubtitleFile`, `TranslationProvider`, `Library`, `Playlist`, `Settings`) or this plugin's own `plugin:<id>:<name>` subject, where `<name>` is one of this same manifest's declared `permissions`. |
| `objectGuard` (optional) | `"<guard>:<paramName>"`. Exactly two guards exist today: `libraryAccessible` and `mediaAccessible`, each checking the numeric path param against the requesting user's accessible libraries or media. `<paramName>` must actually appear in `path`. |

No two routes may share the same method and path (`duplicate-route`).

### `scopes[]`

| Scope | Host methods it unlocks |
|---|---|
| `media:read` | `media.acquisitionContext`, `media.resolve`, `media.exists`, and (because both answer with media identity across the whole library) `acquisition.candidates` and `releases.match` |
| `acquisition:candidates` | `acquisition.candidates`, `releases.match` |
| `releases:score` | `releases.score` |
| `requests:progress` | `requests.markInProgress` |
| `ingest:write` | `library.ingest` |
| `events:emit` | `events.publish`, `notifications.dispatch`, `events.emitOwn`, `counts.set`, `progress.set` |
| `config:rw` | `config.get`, `config.set` |

Calling a host method without every scope it needs rejects with `plugin "<id>" is missing scope
"<scope>" required for "<method>"`. Declare every scope every method you call needs; there's no
partial grant within one method.

### `jobs[]`

| Field | Constraint |
|---|---|
| `name` | Non-empty, unique within this manifest, and not one of core's own reserved job names or another plugin's. |
| `cron` | Parsed with a standard cron expression parser; 5- or 6-field (seconds-first) both work. |
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
- At registration, that root is claimed: a second plugin declaring the same root fails with
  `i18n-namespace-conflict`; whichever plugin loaded first keeps it.

## Full validation error reference

| Code / reason | Meaning |
|---|---|
| `PLUGIN_BAD_MANIFEST` | Not valid JSON, a required base field is missing, an unknown top-level key is present, or `kind` isn't `data`/`process`. |
| `PLUGIN_BAD_ID` | `id` fails the pattern or exceeds 56 characters. |
| `PLUGIN_BAD_VERSION` | `version` isn't valid semver. |
| `PLUGIN_BAD_UI` | `ui` is present but isn't an object. |
| `PLUGIN_BAD_UI_CONTRIBUTIONS` | A `ui.contributions[]` entry is missing `id`, `slot`, `labelKey`, a numeric `weight`, or an `action` object with a string `kind`. |
| `PLUGIN_BAD_UI_CONFIG_PAGES` | A `ui.configPages[]` entry is missing what its `kind` requires (see [UI extensions](/plugins/ui-extensions)), or a `group` page item nests another `group` inside it. |
| `PLUGIN_BAD_UI_RELEASE_PICKER` | `ui.releasePicker` doesn't declare `{search, grab}` for all three of movie, season and episode. |
| `PLUGIN_BAD_EVENTS` | An `events[]` entry is missing a string `event` or `webhook`. |
| `PLUGIN_TIER_VIOLATION` | A `data` archive carries `plugin.js`, or a `process` archive doesn't. |
| `PLUGIN_UNSIGNED` | A `process` plugin has no signature and **Allow unsigned plugins** is off. |
| `PLUGIN_FILE_SET_MISMATCH` | The manifest's `files` keys don't match the actual set of `plugin.js` plus logo entries in the archive. |
| `PLUGIN_HASH_MISMATCH` | An entry's sha256 doesn't match what `files` declares for it. |
| `PLUGIN_BAD_LOGO` | The logo's bytes don't match its claimed format, or an SVG logo carries a `<script>`, an event-handler attribute, or a `javascript:` URI. |
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
| `invalid-job-name` / `job-name-conflict` / `invalid-job-cron` / `invalid-job-triggerable` / `invalid-job-label` | A `jobs[]` entry is malformed, one field at a time. |
| `invalid-route-method` / `invalid-route-path` / `invalid-route-policy` / `invalid-route-object-guard` / `duplicate-route` | A `routes[]` entry is malformed, one field at a time. |
| `db-provision-failed` | The plugin's Postgres role/schema couldn't be created, or a declared `coreRefs` table/column doesn't exist. |
| `spawn-failed` | The child process didn't complete its handshake in time. |
| `tampered` | Re-extracting the stored archive no longer matches the signed `files` hashes. |

Any reason other than `disabled`, `tampered`, `db-provision-failed`, `spawn-failed`,
`incompatible-fliks` or `incompatible-api` tears the plugin's routes, contributions, permissions and
jobs down entirely; those six instead leave the plugin "installed but not running", so a request to
one of its routes gets a `503` rather than acting as if the plugin never existed.

## A worked example

The scaffold's manifest in [Your first plugin](/plugins/first-plugin) is the minimum that
satisfies every process-tier rule above. For every field in real, production use at once, read
[Examples](/plugins/examples), which walks through `fliks.download`'s full manifest field by field.

## Proposing a new extension point

Everything a plugin can reach, the host methods, the scopes, the UI slots, the routes a manifest
may declare, is a closed set on purpose: a closed set is what makes a plugin's blast radius
reviewable, and what lets core promise a plugin keeps working across a release. "Can my plugin do
X?" has no answer an author can reach alone when X isn't already in one of those sets; that's a
core change, proposed as an issue that says:

1. **What the plugin is trying to do**, as a user-visible outcome, not the API you imagined for it.
2. **What you tried within the existing set**, and where it stopped.
3. **What core would have to trust you with**: a new host method is a new scope, or a widening of
   one, say which, and what a hostile plugin holding it could do.
4. **Whether it can be additive.** A new method, scope or slot ships in a minor `pluginApi` bump. A
   change to an existing one's shape or meaning is a breaking `pluginApi` bump, which orphans every
   plugin that hasn't republished, and waits for a scheduled break.
