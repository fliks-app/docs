---
title: Pairing and remote control
description: Sign in on a TV without typing a password, and send a title from one of your devices to play on another.
---

## Pairing a TV or new device (Quick Connect)

Typing a password on a TV remote is slow, so Fliks lets a new device get signed in through a device
that's already logged in instead. The new device shows a 6-digit code, and you type it on the
signed-in device: approving means reading the screen of the device you mean to sign in.

> [!IMPORTANT]
> Quick Connect needs server 6.0.0 and an app that shows and sends the code. A TV or mobile app that
> predates it can't use Quick Connect until you update it; password login is unaffected.

**On the new device** (a TV the first time it's set up, or any client after signing out):

1. The "Who's watching?" screen lists the accounts on the server, with a **Quick Connect** button
   below them. Pick **Quick Connect** to sign in without choosing an account first: whoever approves
   the code is the account that gets signed in.
2. Or choose an account that has no saved session on this device and pick **Quick Connect** in the
   sheet that opens (next to **Password**): the request is then meant for that account only, and no
   other account can approve it. An account that already has a saved session signs straight back in,
   with no password (this works even offline, for downloaded content).
3. The waiting screen reads "Waiting for approval", with the code in large digits, the device's own
   name ("This device: ..."), the operating system when known, and the minutes left before the
   request expires. **Cancel** drops the request.

An admin can limit that account list, or hide it: see the
[login user list](/administration/users-and-permissions#login-user-list). With it hidden, people
type their username and a new device isn't offered Quick Connect, since it starts from that list.

**On a phone or another device already signed in:**

1. Open the user menu and go to **Login requests**.
2. Type the code in **Code shown on the device** and press **Continue**.
3. Check the device name, its operating system, its network address and how long ago it asked, then
   press **Approve**, or **Cancel** to back out.

The rows listed under the code field are the pending requests that name your account. They only
carry **Deny**: there's no one-tap approval, so the code is always typed. An unnamed request
(started without choosing an account) is not listed there; it is approved by its code alone.

The request expires after 10 minutes if nobody responds, and a device can only have a few requests
pending at once. A wrong code is refused, and after several wrong codes in a short time the page
asks you to try again later. A request meant for one account can only be approved by that account.

> [!NOTE]
> On the Apple TV app specifically, the waiting screen also shows a QR code that opens the phone's
> **Login requests** page. It doesn't carry the code: you still type it.

## Remote control: playing on another device

Once signed in on more than one device, any of them can tell another one to start playing
something instead of playing it locally, similar to sending a track to a speaker. This is separate
from Chromecast: it works between any two Fliks clients, including two phones, a phone and a TV, or
a browser and the desktop app.

### Controlling your own devices

Any other device signed in to your own account shows up automatically wherever the device picker
appears (the top bar, and the player controls), with no setup needed. Pick it, and from then on:

- Loading a title plays it on that device instead of the one you're holding.
- Play, pause, stop, seek, volume, mute, next episode, quality, and switching the audio or subtitle
  track all apply to the remote device.
- The remote device's now-playing state is reflected back to you as it changes.

Playback started this way is credited to your account, whichever account happens to be signed in
on the device that's actually playing.

### Controlling someone else's device

This needs that device's owner to grant access first:

![The App settings > Remote control page, before a code is shown or a device is added](/img/app-settings-remote.webp)

1. On the device to be controlled, go to **App settings > Remote control** and choose **Show a
   code**. It displays a 6-character code (avoiding easily confused characters), valid for 10
   minutes. This code only grants remote control; it is not the Quick Connect code (see above).
2. On the controlling device, enter that code under **Control other devices** and press **Add**.
3. The grant covers that one device, not every device its owner has, and goes to your account: any
   device signed in to your account can then control it. It stays in place until either side
   removes it: **Revoke** on the controlled device (under the accounts that can control it), or
   **Forget** on your side (under the devices you can control).

Administrators can additionally see and control every device that's currently online, without
needing a grant. Other people's devices appear in the device picker next to your own as long as
**Show household devices** is on (the default); turn it off to list only your own devices.

### Limits

- A TV can be controlled, but it never controls another device itself: the device picker doesn't
  appear on TV clients.
- A device can't be used to control itself.
- A command not delivered within a few seconds of being sent is dropped rather than applied late.

## See also

- [Chromecast](/clients/chromecast) for casting specifically to a Chromecast device.
- [Sharing and social](/features/sharing-and-social) for account-level privacy, which is separate
  from device-to-device remote control.
