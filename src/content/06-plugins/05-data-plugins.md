---
title: Data plugins
description: The zero-code tier, what it can declare, and how its webhook events actually get delivered.
---

## What ships

A `data` plugin is exactly one file: `plugin.json`. There's no `plugin.js`, no build step, no
runtime at all. It can't own a database schema, can't answer an HTTP route, and can't run a job,
because there's no process to do any of that. Installing one writes a manifest to a database row
and nothing else executes.

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
  declares on one of its own `form` pages, the field an operator fills in after installing. Either
  way it's re-checked at registration and again on **every delivery**: must be https, and its host
  (if it's a bare IP literal) must not resolve to a private or internal address. DNS is re-resolved
  on every attempt precisely because a name that passed the check at install time can be repointed
  at a private address afterwards.

When the event fires, **core** makes the POST, not the plugin. Delivery is **at-most-once, with no
retry**: if the endpoint is down or slow, that delivery is simply lost, logged, and never tried
again. There is no queue, no batching, and no per-event filtering beyond "this event, to this URL."
If you need retries, backoff, or a delivery log an operator can inspect, that's a `process` plugin
instead; see [Process plugins](/plugins/process-plugins) and the retrying delivery-queue pattern in
[Examples](/plugins/examples).

## A worked example

This is the same shape as the real webhook-notification plugin that ships in the official catalog,
with current field values (`pluginApi: 1`, a `fliks` range against a current core major) rather than
its published, now-outdated ones:

```json
{
  "id": "acme.webhooks",
  "pluginApi": 1,
  "name": "Webhook notifications",
  "version": "1.0.0",
  "fliks": ">=4.0.0 <5.0.0",
  "author": "you",
  "description": "Posts a JSON payload to an admin-configured HTTPS endpoint when a title finishes importing or a request is approved.",
  "license": "MIT",
  "logo": "logo.svg",
  "kind": "data",
  "events": [
    { "event": "media.imported", "webhook": "setting:endpoint_url" },
    { "event": "request.approved", "webhook": "setting:endpoint_url" }
  ],
  "ui": {
    "contributions": [
      {
        "id": "acme-webhooks.settings.general",
        "slot": "settings.page",
        "weight": 100,
        "labelKey": "acme.webhooks.config.title",
        "icon": "webhook",
        "action": { "kind": "route", "path": "/admin/settings/plugins/acme.webhooks/general" }
      }
    ],
    "configPages": [
      {
        "id": "general",
        "labelKey": "acme.webhooks.config.title",
        "icon": "webhook",
        "fields": [
          {
            "key": "endpoint_url",
            "type": "url",
            "labelKey": "acme.webhooks.config.endpoint_url",
            "hint": "acme.webhooks.config.endpoint_url_hint",
            "required": true
          }
        ],
        "actions": [
          { "id": "test-delivery", "labelKey": "acme.webhooks.config.test", "actionId": "events.test-delivery" }
        ]
      }
    ]
  },
  "i18n": {
    "en": {
      "acme.webhooks.config.title": "Webhook notifications",
      "acme.webhooks.config.endpoint_url": "Endpoint URL",
      "acme.webhooks.config.endpoint_url_hint": "Fliks POSTs the event here over https. Nothing is sent while this is empty.",
      "acme.webhooks.config.test": "Send a test event"
    }
  }
}
```

Its i18n keys sit under `acme.`, not `webhooks.` as in the official plugin: an i18n root is claimed
by the first plugin that uses it, so reusing the official plugin's root would fail with
`i18n-namespace-conflict` on a server that has it installed.

The `actionId: "events.test-delivery"` button is one of the small set of buttons core itself
implements on a `form` page: since a `data` plugin executes no code of its own, this is the only way
it can ever offer an action. Clicking it makes core send a synthetic event through the exact same
delivery path as a real one, so the operator can confirm their endpoint works before anything real
depends on it.

## Packaging and installing

A `data` archive still goes through the same [inspect/confirm](/plugins/architecture) flow, the
same signature and trust rules, and the same consent step as a `process` plugin, it's simply a much
smaller thing to verify: no `plugin.js`, no database provisioning, no child process to spawn. See
[Packaging and signing](/plugins/packaging-and-signing) for the archive format either tier uses.
