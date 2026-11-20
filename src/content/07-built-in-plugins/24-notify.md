---
title: Notify
description: Post Fliks events to your own HTTPS address as JSON, with retries and a delivery log.
---

Notify is a catalogue plugin. Every time something happens in Fliks (a title finishes importing, a
request is approved), it posts the event as JSON to one HTTPS address of yours. Use it to drive a
chat relay, a home automation flow or a script that keeps its own log.

For Discord, Telegram, ntfy and similar services, use **Notifications** under **Integrations**
instead (see [Integrations](/administration/integrations#notifications)). Notify is for your own
endpoint.

## Install and configure

Install it from **Administration > Advanced > Plugins > Search for a plugin**. It adds its own
section to the Administration sidebar, named **Notify**.

**Settings**:

| Field | Default | Notes |
|---|---|---|
| **Target URL** | Empty | The HTTPS address that receives each event. It often carries a token, so it is stored as a secret and never written to logs. |

Two rules the plugin never bends:

- **HTTPS only.** A plain `http` target is refused.
- **Public addresses only.** A target on the Fliks machine or a private network is refused, and
  checked again on every attempt.

A changed target applies from the next attempt, queued deliveries included.

## What it does for delivery

- **It retries.** A target that is down or slow gets six attempts over about two minutes.
- **It absorbs bursts.** A library scan that fires hundreds of events queues them, and drops the
  oldest rather than growing without limit.
- **It keeps a log.** Recent attempts and their outcomes are readable at `GET /delivery-log` on
  the plugin's API.
- **It can be tested.** `POST /test-delivery` sends a synthetic event.

> [!NOTE]
> The delivery log and the test have no button in the settings page. They are API calls.

## Event payloads

Events carry their data as JSON. `media.imported`, `media.removed`, `request.created` and
`request.approved` carry `externalIds`, a list of `{provider, value}`. `media.files.imported` and
`acquisition.grabbed` carry `family`.

## See also

- [Integrations](/administration/integrations#notifications) for the built-in notification targets.
- [Plugin development](/plugins/overview) for the events a plugin can subscribe to.
