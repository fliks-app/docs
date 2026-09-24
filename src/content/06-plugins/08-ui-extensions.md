---
title: UI extensions
description: Every ui.contributions and ui.configPages field, the closed predicate and actionId vocabularies, and how each slot actually renders in the client.
---

## The rule

A plugin ships **no Angular**. It declares data in its manifest's `ui.*` block; core renders it
with its own, existing components. If a settings page needs something none of the three page kinds
below can express, it isn't a plugin page, the answer is a core change adding a new kind, not a
plugin shipping code. This is deliberately restrictive: it's what lets every plugin's admin surface
look and behave consistently, and what lets core keep rendering an old plugin's declared UI
correctly across a client release.

## `ui.contributions[]`

One entry per nav item, menu row, or settings-sidebar link.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within your manifest. |
| `slot` | one of six, below | yes | |
| `weight` | number | yes | Sort order within the slot, ascending, then by `id`. |
| `labelKey` | string | yes | An i18n key from your own `i18n` block. |
| `shortLabelKey` | string | no | A shorter label for compact surfaces (the phone dock); falls back to `labelKey`. |
| `icon` | string | no | Name from a closed icon set the surface understands; an unrecognised name renders a plain circle rather than nothing. |
| `tone` | `'default' \| 'danger'` | no | |
| `badge` | string | no | A counter key read from the counts endpoint; the badge only shows when its value is `> 0`. |
| `confirmKey` | string | no | Accepted, but no slot's renderer reads it today, so a contribution never asks for confirmation. Confirmation dialogs come from the separate `confirmKey` on a `table` or `providers` page action (below). |
| `when` | array of predicates | no | See below. |
| `action` | `{kind:'route', path}` \| `{kind:'action', actionId}` \| `{kind:'submenu'}` | yes | A `submenu` only opens its `children`; an older client that doesn't know this kind drops the row rather than showing a parent that does nothing. |
| `children` | `UiContribution[]` | no | Only meaningful under `action.kind: 'submenu'`. |

### The six slots

| Slot | Where it renders | Core has entries here too? |
|---|---|---|
| `nav.main` | The main sidebar/nav bar (desktop), the TV tab row, or the phone "more" sheet, depending on client. | Yes, home/search/profile/live TV/playlists/downloads/history. |
| `nav.acquisition` | The requests area's own nav. | Yes, requests and calendar. |
| `settings.page` | The admin settings sidebar. Each plugin gets its **own** section named after it, it never joins a core section. | Yes, 8 core sections; plugin sections come after them, ordered by plugin id. |
| `media.actions` | The card context menu and the detail page's ⋯ menu, both built from one merged list. | Yes, 22 core actions. |
| `card.actions` | Same merged list as `media.actions`. | Same list. |
| `media.season.actions` | Extra buttons in a season's action row. | No, this slot is plugin-only. |

A route contribution opening one of your **own** views must be exactly
`/plugins/<your-id>/<pageId>` or `/admin/settings/plugins/<your-id>/<pageId>`, where `<pageId>` is a
page you declare in `ui.configPages`; anything else fails registration
(`invalid-ui-contribution`). Declaring a page does **not** link to it: only a `settings.page`
contribution actually puts it in the sidebar.

### The `when` predicate vocabulary

Evaluated with `.every()`, entirely **client-side**, from state the client already has, nothing is
re-fetched to answer a `when`. A leading `!` negates. **An unrecognised predicate always evaluates
false**, negated or not, so a client that doesn't understand a rule hides the row instead of
guessing.

| Predicate | True when |
|---|---|
| `isAdmin` | The signed-in user is an admin. |
| `` hasPermission:<policy> `` | The signed-in user's ability grants that policy. |
| `mediaType:movie` / `mediaType:series` | The surface has a media item of that kind in context. |
| `hasFiles` | The item has at least one file on disk. |
| `isMonitored` | The item is monitored. |
| `hasQualityProfile` | The item has a quality profile assigned. |
| `isEpisode` | The context is a single episode. |
| `identified` | The item has at least one metadata-provider id (defaults true when the surface doesn't supply this fact). |
| `isTv` | Running on a TV form factor. |
| `isTouch` | Running on a touch device. |
| `liveTv` | The signed-in user has at least one Live TV channel available. |
| `surface:card` / `surface:detail` | Which menu is being built; a "Play" row makes no sense on the page you're already on. |

None of this is a trust boundary: whatever a `when` hides, the route behind it is still checked
server-side with the same CASL policy as ever. A plugin row that reuses a core `actionId` inherits
that core action's own guards too, a plugin can narrow a core action, never widen it.

### `actionId`, per slot: also a closed vocabulary

An `action.kind: 'action'` row names an id core implements; an id core doesn't recognise, or that
the current surface has no handler for, makes the row disappear rather than render inert.

| Slot | Closed set |
|---|---|
| `media.actions` / `card.actions` | 22 core ids (`media.play`, `media.request`, `media.grab-best`, `media.search-releases`, `media.delete`, and so on), plus whatever your manifest names among them. Each surface serves only a subset; "Play" and "Open", for instance, exist only on the card. |
| `media.season.actions` | `season.search-releases`, `season.grab-best`. Plugin-only, core declares no entries here. |
| `nav.main` | `nav.my-profile` only, and only for core's own row. |
| A `form` page's `actions[]` | `events.test-delivery` only, today. |
| A `table` page's row `actionId` | `table.open-media` only: needs the row's `mediaId` and `mediaType` columns (and optionally `episodeId`); missing either means no button renders at all. |

## `ui.configPages[]`

One entry per settings page, discriminated on `kind`. Missing `kind` means `form`.

| Field (every kind) | Type | Notes |
|---|---|---|
| `id` | string | Matched by a `settings.page` contribution's route. |
| `labelKey` | string | Page title, and the admin sidebar link text. |
| `icon` | string | Same closed icon set as contributions. |
| `subtitleKey` | string, optional | One explanatory line under the title. |

### `form` (the default, and the only kind that works with the process stopped)

Rendered by a generic schema-form component. `fields` is an ordered array of items:

| Item `kind` | Fields | Renders as |
|---|---|---|
| (absent) or `'field'` | `key`, `type`, `labelKey`, `hint?`, `placeholder?`, `required?`, `secret?`, `default?`, `options?` (required for `multiselect`), `topLevel?`, `min?`/`max?`/`minLength?`/`maxLength?` | One input, by `type`: `text`/`email`/`password`/`url`/`number` as a text-style input, `toggle` as a switch, `select` as a dropdown from `options`, `multiselect` as a multi-value picker. |
| `'caption'` | `textKey` | A line of static text, no input, no stored value. |
| `'group'` | `labelKey`, `fields` (plain fields only, **one level deep**) | A labelled, bordered section. Nesting a group inside a group is refused at install, not merely ignored. |
| `'status'` | `labelKey`, `settingKey` | A read-only line showing whatever the plugin last wrote to `plugin.<id>.<settingKey>` via `config.set`. No route behind it, so it still renders with the process stopped, it is not a live check. |

`min`/`max` (numbers) and `minLength`/`maxLength` (everything else) are the **only** validation a
field may declare, enforced by the renderer before it saves. There's deliberately no
author-supplied regular expression: a pattern from an untrusted manifest, or from a `providers`
page's fields arriving over HTTP at render time, has no syntactic check that separates a safe
expression from one that hangs the tab. A blank `required` field is shown as a hint but never
blocks saving, clearing a value is how an operator unsets it.

**Secrets.** `secret: true` on a field means: stripped from every read response, and only written
back when the incoming value is non-empty. A resource that honours this lists which of its secret
keys currently hold a value under the response key `secretsSet` (`SECRETS_SET_KEY` in the
contract); the editor then shows those masked, with an option to erase (write `null`) rather than
ask the operator to retype a credential it never received. A blank field on save means "leave it
alone", not "clear it", clearing needs the explicit erase.

`actions[]` on a `form` page (`{ id, labelKey, actionId }`) renders outline buttons beside Save,
restricted to the closed `actionId` set above, today just `events.test-delivery`.

### `providers`

A CRUD list of instances (indexers, download clients, notification targets) over the plugin's own
routes. Needs the process running.

| Field | Notes |
|---|---|
| `list`, `implementations` | Routes: the current rows, and the driver list (`{implementation, labelKey, fields}` per driver). |
| `testConnection.route` | Tests the **unsaved draft**: `POST {implementation, settings, id?}` before anything is saved. |
| `showPriority`, `defaultPriority`, `reorderable` | A priority column and drag-to-reorder, when the resource has a meaningful priority concept. |
| `bulkSelect` | Adds a selection column plus bulk enable/disable/delete and one bulk field edit. |
| `labels` | Overrides generic wording ("New provider") with domain terms ("New indexer"). |
| `actions[]` | `{ id, labelKey, method: GET\|POST\|DELETE, route, scope: 'row'\|'list', confirmKey?, slot?, result? }`. A `GET` row action needs a declared `result: { kind: 'table', columns, emptyKey }` or it renders no button at all, core has no domain view to fall back on. `slot: 'cooldown-reset'` is the one recognised placement, next to a row's own reported cooldown rather than as its own button. |

### `table`

A read-only list over one route, with declared columns and row/list actions. Needs the process
running.

| Field | Notes |
|---|---|
| `list` | The route. With `paged: true` it answers `{data, total, page, pageSize}` instead of a bare array. |
| `columns[]` | `key`, `labelKey`, `format?` (`date`/`bytes`/`percent`/`speed`), `labelKeys?` (enum-to-label map), `badges?` (value-to-tone map, `*` covers everything else), `nowrap?`, `truncate?`, `subValues?` (a second line under the cell), `detailField?`+`detailTitleKey?` (turns the cell into a button opening a dialog), `linkActionId?` (the closed `table.open-media` id), `progressField?` (a 0-100 field that fills a badge left to right). |
| `filters[]` | `{kind:'search', key, placeholderKey}` (debounced) or `{kind:'select', key, labelKey, options}` (reloads immediately). Sent as query params; an empty value is omitted. |
| `bulkSelect` | Turns declared `proxy` row actions into batch actions with one confirmation for the whole selection. |
| `refreshMs` / `refreshOn` | Poll on an interval (floored at 2000 ms, paused while the tab is hidden), or re-fetch when one of the named SSE event types arrives. Prefer `refreshOn`; `refreshMs` is for a value no event announces. |
| `rowActions[]` | Four kinds: `route`, `action` (the closed id set), `detail` (a read-only dialog built from the row's own already-loaded fields, no extra route), `proxy` (`POST`/`DELETE`, with `:id` filled from the row, an optional `confirmKey`, an optional `confirmToggle` checkbox sent as a query param, and `tone: 'danger'` styling). `when` gates on the viewer; `visibleWhen: {key, in}` gates on the row itself, pausing a paused download is not an action, it's a button that fails. |
| `listActions[]` | Same `proxy` shape, rendered once above the rows rather than per-row. |
| `defaultSortKey` | Applied once; there's no click-to-resort. |

## `ui.releasePicker`

```json
"releasePicker": {
  "movie":   { "search": "/:id/releases",                       "grab": "/:id/grab" },
  "season":  { "search": "/:id/seasons/:seasonId/releases",      "grab": "/:id/seasons/:seasonId/grab" },
  "episode": { "search": "/:id/episodes/:episodeId/releases",    "grab": "/:id/episodes/:episodeId/grab" }
}
```

Every route named here must also appear in this manifest's own `routes[]`, `search` as `GET`,
`grab` as `POST`, so it carries a policy like any other. If more than one installed plugin declares
`releasePicker`, the lexicographically smallest plugin id wins; the rest are logged and ignored.
Only the winner's declaration is served from `GET /plugins/ui`.

## `ui.player`

```json
"player": { "preRollRoute": "/pre-roll" }
```

One route, which must be a declared `POST` entry in this manifest's own `routes[]`. Before a
playback-info response goes out, core POSTs `{ mediaFileId, mediaId, episodeId }` to the winning
plugin's route (same lexicographic tie-break as the release picker) and expects a JSON array of
`{ mediaFileId, labelKey?, skippable? }`, **an id, never a URL or a path**. The array is capped at 5
items; anything past the cap, a non-positive-integer id, a repeat, or the item about to play anyway
is dropped. Every id core gets back is still resolved and ACL-checked through the exact path the
main item uses, a plugin can only *name* a candidate, never grant access to one. If nothing answers
in time, or answers anything other than exactly this shape, `playback-info` simply omits `preRoll`,
the feature is invisible on failure, never a broken call. The Apple TV and Cast players don't model
this field at all and only ever play the main item.

## How each slot actually renders

There's no generic "plugin slot" component; each slot is merged into an existing one, sorted by
weight alongside core's own entries in the same slot:

| Slot | Rendered by |
|---|---|
| `nav.main`, `nav.acquisition` | The app's nav/sidebar service, into the same list as core's own nav items. Icons come from a closed icon set; an unrecognised name shows a generic circle rather than nothing. |
| `settings.page` | The admin settings sidebar, one section per plugin, named after it, after every core section. |
| `media.actions`, `card.actions` | The card's context menu and the detail page's ⋯ menu, both built from one merged list (core items first, then this slot, then `card.actions`), rendered as an anchored dropdown on desktop or a bottom sheet on touch/TV. |
| `media.season.actions` | Extra buttons in the season action row; only `action`-kind rows with the two closed ids above are kept. |
| `form` / `providers` / `table` config pages | A generic schema-form component, a generic provider-list component, and a generic data-table component respectively, at `/plugins/<id>/<pageId>` or `/admin/settings/plugins/<id>/<pageId>`. |

## i18n

Same rules as [the manifest reference](/plugins/manifest#the-i18n-block): one shared root per
plugin, first plugin loaded keeps it, a conflicting second plugin fails registration with
`i18n-namespace-conflict` rather than silently losing its strings.
