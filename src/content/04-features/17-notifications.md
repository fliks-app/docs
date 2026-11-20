---
title: Notifications
description: What Fliks notifies you of, how to turn notifications on per device, mute a category, and what each platform can and cannot do.
---

> [!SUMMARY]
> Open **App settings > Notifications**, switch on system notifications for this device, then choose which categories you want. Each device is set up on its own.

## Turn notifications on

Open **App settings > Notifications**. The page has three parts:

- **This device**: a switch for system notifications, the ones that arrive with the app closed, and a switch for the on-screen messages. These are per device: turning them on here does not turn them on elsewhere. **Send a test notification** sends one to every device of yours that receives system notifications.
- **What to be notified about**: one switch per category, plugins included. It applies to all your devices, and a muted category is neither shown nor pushed.
- On the desktop app, the background options below.

A notification is never sent twice to the device you are using: when the app is open on the notified
session, you get the on-screen message instead of a system one.

## See what you are notified of

:::details Every category and what it does
| Category | When | Does |
|---|---|---|
| **Requests** | Your request is approved, declined or available. If you can approve, a request is waiting for you | Approve or Decline from the notification where the platform allows buttons |
| **Watch parties** | You are invited, or a party is about to start | Join |
| **Social** | A follow request, someone accepted yours, someone recommended something to you | Accept, Decline |
| **New episodes** | New episodes of a series you watched | Open the series. Episodes imported within 5 minutes come as one notification |
| **Account** | Another device asks to sign in | Open only: approving needs the code shown on the other device |
| **Plugins** | A plugin an administrator installed sends you something | Open. Each plugin is muted on its own |
:::

A notification opens the page it is about. On platforms with images it shows the poster or the avatar.
The number on the app icon is how many requests wait for your decision plus how many follow requests wait
for your answer.

## By platform

:::details How each platform delivers them
| Platform | How | Notes |
|---|---|---|
| **iPhone, iPad** | Through the Fliks Relay, once your administrator turned it on | Notifications can show a poster and Approve/Decline buttons. If a notification cannot be read, iOS shows a generic text. The app icon number is updated by notifications and when you open the app |
| **Android** | Through the Fliks Relay | Needs Google Play services. Channels per category in the system settings. The launcher shows a dot, not a number |
| **Browser** | Web Push, no relay, nothing for the administrator to enable | Needs HTTPS and a user gesture to subscribe. On iPhone and iPad only for the web app added to the home screen. Safari shows no buttons, images or badge |
| **Desktop app** | Notifications shown by the system while the app runs | Nothing arrives once the app is quit, see below |
| **TV** (Android TV, Fire TV, Tizen, webOS, Apple TV) | A short message on screen, with no buttons and never taking focus | Only while the app is open: TVs get no system notification |
:::

If your administrator has not enabled mobile notifications, the page says so on a phone and
system notifications stay off there.

### Desktop: background mode and start at login

The desktop app can only notify while it runs. Two options in **App settings > Notifications**:

- **Keep running in the background**: closing the window hides it, and a tray icon offers **Open Fliks** and **Quit Fliks**. It is off by default, and offered when you turn notifications on. On Linux it needs a system tray; without one, closing the window quits.
- **Start at login**: Fliks opens in the background when you sign in to your computer.

macOS shows the first action button on a notification and needs the signed app. On Windows and Linux a
click opens the page; there are no buttons.

## Limits

:::details Known limits
- No inbox. A notification you missed, or that a limit refused, is not kept.
- A badge that goes down while the app is closed stays stale until the next notification or launch.
- Images need your phone to reach your server.
- A browser on an unfamiliar push service cannot subscribe.
- You hold at most 10 devices with system notifications; the oldest is replaced.
:::

## Signing out

Signing out removes the device's subscription, with the relay for phones, even when the server is
offline (it retries at the next launch). Your administrator can also turn the relay off, which removes
every phone.

## See also

- [Push notifications](/administration/push-notifications) for administrators
- [Privacy policy](https://github.com/fliks-app/fliks/blob/main/PRIVACY.md#push-notifications)
