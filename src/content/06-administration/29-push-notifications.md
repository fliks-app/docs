---
title: Push notifications
description: Turn on mobile notifications for your users with one switch, and what the Fliks Relay does and does not see.
---

> [!SUMMARY]
> Phones need one switch from you: **Fliks Relay active** in **Administration > Integrations > Notifications**. Browsers, the desktop app and TVs need nothing. Users then turn notifications on in [their own settings](/features/notifications).

## Turn on mobile notifications

1. Open **Integrations > Notifications** and click **Fliks Relay**. It is in the list from the first start, disabled.
2. Switch on **Fliks Relay active**.
3. Check that **Status** shows **Registered**, then press **Send a test notification**.

![Open Fliks Relay and look at the Fliks Relay active switch](/img/push-relay-open-anim.webp)

The relay never sees what a notification says: your server encrypts it for the phone. It is not the connection to [Discord or ntfy](/administration/alerts-to-services), which are separate.

To stop, switch **Fliks Relay active** off: every phone subscription of your server is deleted.

:::details What the relay sees
The relay stores the public key of your server, and for each phone the platform push token and an opaque subscription id. It never sees a notification's content. It keeps no history, IP addresses, server address or version. Apple and Google see the encrypted message and the phone's token, as for any app. The full list is in the [privacy policy](https://github.com/fliks-app/fliks/blob/main/PRIVACY.md#push-notifications).
:::

:::details Status and statistics
- **Status**: Disabled, Registered or Error. An error shows its reason and the server retries by itself.
- Subscriptions: how many mobile and browser subscriptions your users hold.
- Last 30 days: notifications sent, delivered, limited, failed and dead tokens, for your server alone. A dead token is a phone that uninstalled the app; the relay forgets it.

The connection is built in: you cannot create a second one, rename it or delete it, and it has no setting to fill.
:::

:::details Turning it off, and when subscriptions are deleted
Turning the switch off deletes every phone subscription at once, then unregisters your server at the relay. If the relay does not answer, the page shows the pending deletion and the server retries every 10 minutes. **Give up** drops a deletion that cannot succeed, for instance a relay that no longer exists.

A user who signs out, a session you revoke, a password change and a disabled user each delete the phone subscriptions concerned.
:::

:::details Limits
### Limits

The official relay applies these defaults to every server:

| Limit | Default |
|---|---|
| Notifications per device | 30 per hour |
| Notifications per phone, across all servers | 60 per hour |
| Notifications per server | 1000 per hour (one notification to many users counts once) |
| Subscriptions per server | 1000 |

A notification refused by a limit is not queued or retried. A user holds at most 10 subscriptions across their devices; the oldest is replaced. The server sends at most 8 notifications at a time with a 10 second timeout, and does not retry. A plugin may send 10 notifications per hour (see [Sending notifications](/plugins/sending-notifications)).
:::

:::details Your own relay, identity file and HTTPS
- The store apps talk only to the official relay, and a relay delivers only to an app built by its operator. A custom relay matters for a fork that builds its own apps, and for development. Point the server at it with the `FLIKS_PUSH_RELAY_URL` environment variable (see [Environment variables](/install/environment-variables)); it is not in the UI. Changing it registers at the new relay at once and deletes the old identity in the background; phones subscribe again at their next launch. Running a relay is documented in the [relay repository](https://github.com/fliks-app/relay).
- Your server keeps its relay identity and Web Push key in `.push-identity.json` next to its other secrets. Back it up with your configuration; if you lose it, switch the connection off and on, and phones subscribe again.
- Web Push needs your server on HTTPS and a browser on the push service of Google, Mozilla, Apple or Microsoft.
:::
