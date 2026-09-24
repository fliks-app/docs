---
title: Desktop
description: A native Windows, macOS and Linux app that connects to a Fliks server and plays through an embedded mpv engine.
---

## What it is

The desktop app is a client, not the server: it connects to a Fliks server running elsewhere on
the network (or on the same machine) the same way the mobile and web clients do. The first screen
after install asks for that server's address.

It wraps the same Angular interface as the web client inside Electron, but plays video through an
embedded [mpv](https://mpv.io) engine instead of the browser's own player, which is what lets it
Direct Play formats a browser can't.

> [!NOTE]
> Looking for the Windows tray app or the macOS menu-bar app that runs the *server* itself? That's
> a different piece of software, covered in [Install > Windows](/install/windows) and
> [Install > macOS](/install/macos).

## Getting it

Download the installer for your platform from the
[latest release](https://github.com/fliks-app/fliks/releases):

| Platform | File | Notes |
|---|---|---|
| Windows | `.exe` (NSIS installer) | |
| macOS | `.dmg` | Apple Silicon only |
| Linux | `.AppImage` or `.deb` | The `.deb` needs `libsdl2-2.0-0`, `libgles2` and `libegl1` |

The Linux packages are built on Ubuntu 24.04; a much older distribution may not have the libraries
the native player needs.

## Playback engine

Video plays through a vendored, self-contained build of mpv rather than the system browser engine,
which is what makes Direct Play possible for containers and codecs an embedded web view can't
handle on its own. Windows and macOS decode in hardware; Linux decodes in software by default.
On a screen without HDR, the app tone-maps HDR sources to SDR itself, so the server sends the HDR
file as-is instead of converting it. On macOS, an HDR-capable screen shows HDR10 and HLG content
in HDR. See [Streaming and transcoding](/features/streaming-and-transcoding)
for how the server decides what to send in the first place.

## Casting to a Chromecast

The desktop app can act as a Chromecast sender: it discovers devices on the network and casts to
them directly, the same way the mobile apps do. See [Chromecast](/clients/chromecast) for what
happens on the receiving end.

## Offline downloads

Downloads work the same way as on mobile: turn on automatic download for a playlist and unwatched
items are fetched to local storage, with watched ones cleared out again. See
[Offline downloads](/features/offline-downloads) for storage settings and manual downloads.

## Updates

The app checks for a new version 10 seconds after launch and every 6 hours afterward, and you can
check by hand from **App settings > Update**. It never downloads silently: when an update is found
you choose to install it, then it's downloaded and the app restarts to apply it. If the check
itself fails (no connection, GitHub unreachable), it fails quietly in the background rather than
interrupting playback.

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding)
- [Chromecast](/clients/chromecast)
- [Offline downloads](/features/offline-downloads)
