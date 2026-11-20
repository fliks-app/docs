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

Windows and macOS: download the installer from the
[latest release](https://github.com/fliks-app/fliks/releases). Linux has four options, listed below.

| Platform | File | Notes |
|---|---|---|
| Windows | `.exe` (NSIS installer) | |
| macOS | `.dmg` | Apple Silicon only |
| Linux | APT repository, Snap, `.deb` or `.AppImage` | APT and Snap are covered below; the `.deb` and `.AppImage` are on the release page |

The Linux packages are built on Ubuntu 24.04; a much older distribution may not have the libraries
the native player needs.

### Linux with APT

On Ubuntu 24.04, Debian 13 and later, add the Fliks repository and install the `fliks-desktop`
package:

```bash
sudo curl -fsSLo /etc/apt/sources.list.d/fliks.sources https://github.com/fliks-app/fliks/releases/download/apt/fliks.sources
sudo apt update && sudo apt install fliks-desktop
```

The `.sources` file adds the Fliks repository and its signing key to APT. A `.deb` downloaded from
the releases installs the same file, so `apt upgrade` keeps it current too. The repository carries
stable releases only. APT installs the system libraries the package needs; the graphics layer
(SDL3) ships inside it.

### Linux with Snap

```bash
sudo snap install fliks
```

The `stable` channel follows the releases and the `beta` channel follows the pre-releases
(`sudo snap refresh fliks --channel=beta`).

### The Linux window

The window is native on Wayland as well as X11, and sharp on HiDPI and fractionally scaled
screens. It draws its own title bar with minimize, maximize and close buttons, and a right click on
the bar opens the window menu. The bar is hidden in full screen.

## System media controls

While the desktop app plays something, it shows up in the operating system's media controls with
its title, artwork, playback state and progress. An episode appears under its episode label
(number and title), with the show's name beneath it. The controls disappear when playback ends.

| Platform | Where it shows up |
|---|---|
| Linux | Any MPRIS client: the desktop's media widget, media keys and `playerctl` |
| macOS | Now Playing in Control Center, plus the keyboard media keys and headphone buttons |
| Windows | The system media flyout, plus the keyboard media keys |

They send back play, pause, play/pause and stop (stop leaves the player). Previous and next skip 10
seconds back and forward. Dragging the progress bar in the OS control seeks to that position, and
the position stays correct at any playback speed.

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
them directly, the same way the mobile apps do. If you restart the app while a cast is running and
the Chromecast still runs that session, the app re-joins it at launch: the cast bar and the player
reattach to what is playing, and the TV isn't relaunched. See [Chromecast](/clients/chromecast) for
what happens on the receiving end.

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

How an update installs depends on how you installed the app:

| Install | Updated by |
|---|---|
| Windows `.exe`, macOS `.dmg`, Linux `.AppImage` | The in-app update described above |
| Linux APT or `.deb` | `apt upgrade`, or the in-app update, which reinstalls the package and asks for administrator rights |
| Linux Snap | `snapd`, in the background. The in-app check is skipped, so **App settings > Update** always reports the app as up to date |

Setting the `FLIKS_DISABLE_UPDATE_CHECK` environment variable to `1`, `true` or `yes` turns the
in-app check off.

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding)
- [Chromecast](/clients/chromecast)
- [Offline downloads](/features/offline-downloads)
