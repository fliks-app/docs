---
title: Data plugins
description: The zero-code tier, what it can declare, and how its webhook events actually get delivered.
---

## What ships

A `data` plugin is exactly one file of substance: `plugin.json`, plus a logo. There's no
`plugin.wasm`, no build step, no runtime at all. It can't own a database schema, can't answer an
HTTP route, and can't run a job, because there's no code to do any of that. Installing one stores
a manifest in a database row and nothing else executes.

What it can declare:

- `ui.contributions` and `ui.configPages`, exactly as a `process` plugin does (see
  [UI extensions](/plugins/ui-extensions)), with one practical limit: a `configPages` entry of kind
  `providers` or `table` needs a route to read its list from, and a `data` manifest has no
  `routes[]` field at all. In practice a `data` plugin's settings pages are always `form` pages.
- `events`, its one way of doing anything in the outside world.
- `i18n`, for its own labels.

## Events

```json
"events": [
  { "event": "media.imported", "webhook": "setting:endpoint_url" },
  { "event": "request.approved", "webhook": "https://example.com/hooks/fliks" }
]
```

Each entry names a **domain event** and a **target**:

- `event` must be one of the eleven names core recognises (`media.imported`,
  `media.monitored.changed`, `media.season.monitored.changed`, `media.removed`,
  `media.files.imported`, `media.acquisition.requested`, `acquisition.grabbed`, `request.created`,
  `request.approved`, `library.scan.completed`, `settings.changed`).
- `webhook` is either a literal `https://` URL, or `setting:<key>` naming a field the same manifest
  declares on one of its own `form` pages, the field an operator fills in after installing. A
  literal URL is checked at registration (https only, and a bare IP literal must not be private or
  internal). Either way core checks again on **every delivery**: the URL must be https, the name is
  resolved once, every address it returns is vetted, and the connection goes to the vetted address.
  DNS is re-resolved on every attempt precisely because a name that passed the check at install
  time can be repointed at a private address afterwards. An empty `setting:` value means "not
  configured": nothing is sent.

When the event fires, **core** makes the POST, not the plugin. The body is JSON,
`{ "event": <the domain event, with its "type">, "pluginId": "<id>" }`, sent with the user agent
`Fliks-Plugin-Webhook/1.0`. Delivery is **at-most-once, with no retry**: the request has a 5 second
limit, follows no redirect, and if the endpoint is down or slow that delivery is simply lost,
logged, and never tried again. There is no queue, no batching, and no per-event filtering beyond
"this event, to this URL." If you need retries, backoff, or a delivery log an operator can inspect,
that's a `process` plugin instead; see [Process plugins](/plugins/process-plugins) and the
scheduled-call retry queue in [Examples](/plugins/examples#fliksnotify-a-second-process-plugin-a-different-shape).

## A worked example

A full manifest for a `data` plugin that pings an admin-configured HTTPS endpoint whenever a
library scan finishes or a title is removed, so an external status page can reflect catalog
freshness without polling Fliks:

```json
{
  "id": "acme.librarystatus",
  "pluginApi": 2,
  "name": "Library status page",
  "version": "1.0.0",
  "fliks": ">=5.0.0 <6.0.0",
  "author": "you",
  "description": "Posts a JSON payload to an admin-configured HTTPS endpoint when a library scan finishes or a title is removed.",
  "license": "MIT",
  "logo": "logo.svg",
  "kind": "data",
  "events": [
    { "event": "library.scan.completed", "webhook": "setting:endpoint_url" },
    { "event": "media.removed", "webhook": "setting:endpoint_url" }
  ],
  "ui": {
    "contributions": [
      {
        "id": "acme-librarystatus.settings.general",
        "slot": "settings.page",
        "weight": 100,
        "labelKey": "acme.status.config.title",
        "icon": "webhook",
        "action": { "kind": "route", "path": "/admin/settings/plugins/acme.librarystatus/general" }
      }
    ],
    "configPages": [
      {
        "id": "general",
        "labelKey": "acme.status.config.title",
        "icon": "webhook",
        "fields": [
          {
            "key": "endpoint_url",
            "type": "url",
            "labelKey": "acme.status.config.endpoint_url",
            "hint": "acme.status.config.endpoint_url_hint",
            "required": true
          }
        ],
        "actions": [
          { "id": "test-delivery", "labelKey": "acme.status.config.test", "actionId": "events.test-delivery" }
        ]
      }
    ]
  },
  "i18n": {
    "en": {
      "acme.status.config.title": "Library status page",
      "acme.status.config.endpoint_url": "Endpoint URL",
      "acme.status.config.endpoint_url_hint": "Fliks POSTs the event here over https. Nothing is sent while this is empty.",
      "acme.status.config.test": "Send a test event"
    }
  }
}
```

Its i18n keys all sit under `acme.`, the plugin's own root: reusing a root another installed plugin
already claims fails with `i18n-namespace-conflict`, so pick something distinctive rather than a
generic vendor-style prefix.

The `actionId: "events.test-delivery"` button is one of the small set of buttons core itself
implements on a `form` page: since a `data` plugin executes no code of its own, this is the only way
it can ever offer an action. Clicking it makes core send a synthetic event,
`{ "event": { "type": "test.delivery", "declaredFor": "<event>" }, "pluginId": "<id>", "test": true }`,
through the exact same delivery path as a real one, so the operator can confirm their endpoint
works before anything real depends on it. The answer lists which targets were reached and which
were refused.

## Packaging and installing

A `data` archive goes through the same [inspect/confirm](/plugins/architecture) flow, the same
signature and trust rules, and the same consent step as a `process` plugin. It is simply a much
smaller thing to verify: no `plugin.wasm`, no database provisioning, no instances to supervise. Unlike
a `process` plugin it installs unsigned without the **Allow unsigned plugins** setting. The
SDK's `cargo xtask package` is built for wasm crates, so a `data` archive is a ZIP of
`plugin.json` (a `data` manifest carries no `files` map) and the logo, written by your own tooling.
The catalog repository's `scripts/package-plugin.mjs` is a working writer. See
[Packaging and signing](/plugins/packaging-and-signing) for the archive format either tier uses.
