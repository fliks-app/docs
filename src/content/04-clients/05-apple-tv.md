---
title: Apple TV
description: A native SwiftUI app covering the core Fliks experience, built specifically for tvOS.
---

## What it is

![The Fliks home screen on Apple TV](/img/clients-appletv-home.jpg)

The Apple TV app is a separate, native SwiftUI codebase, not a build of the same Angular interface
used everywhere else: tvOS has no web view to run that interface in, so it's a purpose-built app
instead. It covers the core of Fliks: signing in, the home page, browsing a library, a title's
detail page (including individual episodes), search, playlists, settings, and the player.

## Getting it

Install "Fliks" from the App Store. Requires **tvOS 17** or newer.

## Signing in

Enter your server's address on first launch, then sign in with a password, or use **Quick
Connect**: the same "approve from your phone" flow every other client uses, with no code to type.
The waiting screen also shows a QR code that opens the **Login requests** page on a phone that's
already signed in. See [Pairing and remote
control](/features/pairing-and-remote-control) for how approval works.

A new server has no account yet, and the Apple TV app can't create the first administrator: it
asks you to open the server in a web browser and finish the [setup](/getting-started/quick-start)
there.

## Watch parties

The Apple TV app takes part in [watch parties](/features/watch-party). When your account can
create parties, **Watch together** on a title, an episode or a playlist starts one, and so does
**New party** in the home page's watch parties row. That row also lists your live and scheduled
parties.

Before the film starts, the party's lobby shows who is in, the programme and any proposals. Each
person can mark themselves ready, and guests vote on proposals with a thumbs up or down. The host
starts the party, picks the film, invites people, passes the host role on and removes members. In
the player, the transport bar has a party menu: the member list, quick chat phrases and the
message history, reactions, the queue, a resync button and the party settings. The host ends the
party; everyone else leaves it.

## Playback

![The player on Apple TV](/img/clients-appletv-player.jpg)

Video plays through tvOS's own system player, which is what gives you the standard Apple TV
scrubbing bar, info panel, and audio/subtitle pickers. On top of that, Fliks adds its own skip-intro
button with a countdown, a next-episode prompt with autoplay, and the same automatic subtitle
selection logic (off, always, or automatically matching your audio) used elsewhere.

Because the Apple TV app doesn't keep a permanently open connection to the server,
[remote control](/features/pairing-and-remote-control) commands sent to it (play, pause, load a
title, switch a track) are picked up by checking in with the server every 2 seconds rather
than arriving instantly.

## What isn't on Apple TV

- **No offline downloads.**
- **No Live TV.**
- **No casting to a Chromecast.**
- **No server administration.**

These follow the same pattern as every other TV client: consistent with keeping TV apps focused on
watching rather than managing the server.

## See also

- [Pairing and remote control](/features/pairing-and-remote-control)
- [Playback](/features/playback) for skip intro, next episode and resume, which all apply here too
