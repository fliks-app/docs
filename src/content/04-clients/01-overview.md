---
title: Overview
description: What Fliks runs on, what's shared across every client, and where to find the details for each one.
---

## One server, many screens

Fliks is a single server with a client for nearly every screen in the house. Sign in on any of
them and your library, your progress and your preferences are the same everywhere: start a film on
your phone, and the TV offers to resume it from the same spot.

| Client | Where to get it | Minimum version |
|---|---|---|
| [Web](/clients/web) | Any browser, at your server's address | Any current browser |
| [Mobile](/clients/mobile) (iOS, iPadOS) | App Store | iOS 16.6 |
| [Mobile](/clients/mobile) (Android) | Play Store | Android 6 (API 23) |
| [Android TV](/clients/android-tv) | Play Store | Android 6 |
| [Samsung TV](/clients/samsung-tizen) (Tizen) | Sideload (not yet on Samsung Apps) | Tizen 5.5 |
| [LG TV](/clients/lg-webos) (webOS) | LG Content Store | webOS 7.0 |
| [Desktop](/clients/desktop) | GitHub release download | Windows, macOS (Apple Silicon only), Linux |
| [Chromecast](/clients/chromecast) | Built in, cast from any client above | Any Chromecast device |
| [Apple TV](/clients/apple-tv) | App Store | tvOS 17 |

> [!NOTE]
> There is also a beta Nintendo Switch client, built separately as a homebrew `.nro` from the
> [switchfliks](https://github.com/fliks-app/switchfliks) project. It's a separate codebase from
> everything above, so it isn't covered by the rest of this documentation.

## What every client shares

- **The same account system**: resume position, watch history, playlists, likes and requests all
  live on the server, not on any one device.
- **[Pairing](/features/pairing-and-remote-control)**: sign a TV into an account without typing a
  password on the remote, by approving the request from a phone that's already signed in.
- **[Remote control](/features/pairing-and-remote-control)**: send a title from one signed-in
  device to play on another.
- **Adaptive playback**: each client tells the server what it can decode, and the server picks
  between sending the file as-is, repackaging it, or converting it, per [Streaming and
  transcoding](/features/streaming-and-transcoding).

## What's different on TV clients

Android TV, Samsung (Tizen) and LG (webOS) share the same restrictions, because they're built for
navigation with a remote control rather than a mouse or touchscreen:

- No offline downloads: the feature and its settings are hidden entirely.
  See [Offline downloads](/features/offline-downloads) for which clients do support it.
- No casting *from* the TV to a Chromecast: a TV can be a [remote control](/features/pairing-and-remote-control)
  target, but it doesn't act as a Chromecast sender itself.
- No public profile pages and no server administration screens.
- Navigation moves with the remote's arrow keys or D-pad instead of a pointer, moving between rows
  and cards the way a typical TV interface does.

Apple TV is a separate, native app rather than a build of the same interface (see
[Apple TV](/clients/apple-tv) for exactly what it does and doesn't cover), but follows the same
restrictions: no downloads, no casting out, no server administration.

## See also

Each client's own page covers install steps, its specific playback capabilities, and anything it
can't do. Start with [Web](/clients/web) or [Mobile](/clients/mobile) if you're setting up your
first device.
