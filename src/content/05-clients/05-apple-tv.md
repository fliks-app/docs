---
title: Apple TV
description: A native SwiftUI app covering the core Fliks experience, built specifically for tvOS.
---

> [!SUMMARY]
> Install Fliks from the App Store (tvOS 17+), enter the server address and sign in with Quick Connect. No downloads, Live TV or casting out; create the first administrator in a browser.

## Install and sign in

Install "Fliks" from the App Store (tvOS 17 or newer), enter your server's address and choose
**Quick Connect**: the screen shows a 6-digit code (and a QR code that opens the right page on your
phone). Type the code on the **Login requests** page of a phone that's already signed in, or sign in
with a password. See [Pairing and remote control](/features/pairing-and-remote-control).

![The Fliks home screen on Apple TV](/img/clients-appletv-home.jpg)

A new server has no account yet, and the app can't create the first administrator: do step 2 of the
[Quick start](/getting-started/quick-start) in a browser first.

:::details What the app is
The Apple TV app is a separate, native SwiftUI codebase, not the Angular interface used elsewhere
(tvOS has no web view). It covers signing in, the home page, library browsing, title and episode
pages, search, playlists, settings and the player.
:::

## Watch parties

:::details How watch parties work on Apple TV
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
:::

## Playback

![The player on Apple TV](/img/clients-appletv-player.jpg)

Video plays through the system player (standard scrubbing bar, info panel, audio and subtitle
pickers), plus Fliks' skip-intro button and a next-episode prompt with autoplay.

:::details Remote control latency
The app keeps no open connection to the server, so [remote control](/features/pairing-and-remote-control) commands sent to it are picked up every 2 seconds rather than instantly.
:::

Not on Apple TV: offline downloads, Live TV, casting out and server administration.

## See also

- [Pairing and remote control](/features/pairing-and-remote-control)
- [Player](/player/overview) for skip intro and next episode, and [Playback](/features/playback) for resume, which all apply here too
