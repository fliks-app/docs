---
title: Push notifications
description: Turn on mobile notifications with the Fliks Relay connection, what the relay sees, its limits and the statistics your server shows.
---

Fliks notifies each user of what concerns them: a decision on their request, a watch party
invitation, a follow request, new episodes of a series they watch, a sign-in request from another
device, and messages from plugins. What each user receives on each device is covered in
[Notifications](/features/notifications). This page is what an administrator sets up.

Only phones need something from you. Browsers, the desktop app and the in-app toasts work with no
setting on the server.

| Where | Needs the Fliks Relay |
|---|---|
| iPhone, iPad, Android | Yes |
| Browser (Web Push) | No |
| Desktop app, in-app toasts, TV toasts | No |

## Enable the Fliks Relay connection

Phones are woken by Apple and Google, and only the publisher's apps can use the publisher's keys. The
Fliks Relay is a small service that takes a notification your server already encrypted and hands it
to Apple or Google.

1. Open **Administration > Integrations > Notifications**.
2. Open the **Fliks Relay** connection. It is in the list from the first start, disabled.
3. Turn on **Fliks Relay active**.

The state shows **Registered** once your server has made its identity and signed up. **Error** shows
the reason; the server retries by itself. Use **Send a test notification** on the connection to check the
registration.

The connection is built in: you cannot create a second one, rename it or delete it, and it has no
settings, so there is no secret to enter. It only carries notifications for users. The events you
send to Discord, ntfy and the other connections are not sent to the relay.

### What the relay sees

The relay stores the public key of your server, and for each phone the platform push token and an
opaque subscription id. It never sees a notification's content: your server encrypts each one for the
phone, and only the phone can read it. It does not keep a history, IP addresses, your server's address
or its version. Apple and Google see the encrypted message and the phone's token, as for any app.

The full list, what is kept and for how long, is in the [privacy policy](https://github.com/fliks-app/fliks/blob/main/PRIVACY.md#push-notifications).

### Turn it off

Turning the switch off deletes every phone subscription of your server at once, then unregisters your
server at the relay. If the relay does not answer, the page shows the pending deletion and the server retries
every 10 minutes. **Give up** drops a deletion that cannot succeed, for instance a relay that no longer
exists.

A user who signs out, a session you revoke, a password change and a disabled user each delete the
phone subscriptions concerned.

## What the page shows

- **Status**: Disabled, Registered or Error.
- **Subscriptions**: how many mobile and browser subscriptions your users hold.
- **Last 30 days**: notifications sent, delivered, limited, failed and dead tokens, as the relay counted them for your server alone.

A dead token is a phone that uninstalled the app; the relay forgets it. A high number of failures
after an app update is worth a look; a few are normal.

## Limits

The official relay applies these defaults to every server:

| Limit | Default |
|---|---|
| Notifications per device | 30 per hour |
| Notifications per phone, across all servers | 60 per hour |
| Notifications per server | 1000 per hour (one notification to many users counts once) |
| Subscriptions per server | 1000 |

A notification refused by a limit is not queued or retried: there is no inbox, a missed one is lost.
A user holds at most 10 subscriptions across their devices; the oldest is replaced.

The server itself sends at most 8 notifications at a time with a 10 second timeout, and does not retry.
A plugin may send 10 notifications per hour (see [Sending notifications](/plugins/sending-notifications)).

A key that sends mostly to dead tokens is blocked by the relay, because APNs drops connections that do.
That does not happen to a server that works normally.

## Your own relay and development

The store apps talk only to the official relay, and a relay delivers only to an app built by its
operator (Apple and Google tokens belong to the publisher's app). So a custom relay matters for a
fork that builds its own apps, and for development.

Point the server at it with the `FLIKS_PUSH_RELAY_URL` environment variable (see
[Environment variables](/install/environment-variables)). It is not a setting and is not in the UI.
Changing it makes the server register at the new relay at once and delete its identity at the old
one in the background. Phones subscribe again at their next launch.

Running a relay is documented in the [relay repository](https://github.com/fliks-app/relay)
(`README.md`, and `PROTOCOL.md` for the wire protocol).

## Other things to know

- Your server keeps its relay identity and its Web Push key in `.push-identity.json` next to its
  other secrets (mode 0600). Back it up with the rest of your configuration; if you lose it, turn the
  connection off and on, and phones subscribe again.
- Web Push needs your server on HTTPS. Browsers accept only the push services of the major vendors
  (Google, Mozilla, Apple, Microsoft); a browser on another push service cannot subscribe.
- Notifications to administrators about server health stay on the other connections of the
  notification page.
