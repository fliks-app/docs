---
title: Desktop
description: A native Windows, macOS and Linux app that connects to a Fliks server and plays through an embedded mpv engine.
---

> [!SUMMARY]
> Install from the Mac App Store, download the installer for Windows or macOS, or install on Linux with APT, Snap, `.deb` or AppImage, then enter your server's address. It plays through mpv, so it Direct Plays more formats than a browser.

## Install and sign in

Install the app for your system below, then on first launch enter your server's address and sign
in. Every installer is also on the [latest release](https://github.com/fliks-app/fliks/releases/latest).

The desktop app is a client: the server runs elsewhere. (The Windows tray and macOS menu-bar apps
that run the *server* are in [Install](/install/windows).) It plays through an embedded
[mpv](https://mpv.io), so it Direct Plays formats a browser can't.

### Windows

Download the installer and run it. Windows 10 or later, x64.

:::downloads
Download Fliks v{version} for Windows | Fliks-Client-{version}-Setup.exe
:::

### macOS

Install from the Mac App Store, or download the `.dmg` and drag **Fliks** to Applications. Apple
Silicon, macOS 13 or later.

:::downloads
Get Fliks on the Mac App Store | https://apps.apple.com/app/fliks/id6771854507
Download Fliks v{version} for macOS | Fliks-Client-{version}-arm64.dmg
:::

### Linux

On Ubuntu 24.04 and Debian 13 or later, with APT:

```bash
sudo curl -fsSLo /etc/apt/sources.list.d/fliks.sources https://github.com/fliks-app/fliks/releases/download/apt/fliks.sources
sudo apt update && sudo apt install fliks-desktop
```

With Snap: `sudo snap install fliks`. Or download a package:

:::downloads
Download Fliks v{version} (.deb) | Fliks-Client-{version}-amd64.deb
Download Fliks v{version} (AppImage) | Fliks-Client-{version}-x86_64.AppImage
:::

:::details More on the Linux install
The `.sources` file adds the Fliks repository and its signing key. The repository carries stable
releases only, and a downloaded `.deb` adds the same source. Packages are built on Ubuntu
24.04, so a much older distribution may lack the libraries the player needs. The `beta` Snap channel
follows pre-releases (`sudo snap refresh fliks --channel=beta`). The window is native on Wayland and
X11, draws its own title bar (right click for the window menu) and hides it in full screen.
:::

## System media controls

:::details System media controls
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
:::

## Playback engine

:::details About the mpv playback engine
Video plays through a vendored, self-contained build of mpv rather than the system browser engine,
which is what makes Direct Play possible for containers and codecs an embedded web view can't
handle on its own. Windows and macOS decode in hardware; Linux decodes in software by default.
On a screen without HDR, the app tone-maps HDR sources to SDR itself, so the server sends the HDR
file as-is instead of converting it. On macOS, an HDR-capable screen shows HDR10 and HLG content
in HDR. See [Streaming and transcoding](/features/streaming-and-transcoding)
for how the server decides what to send in the first place.
:::

## Casting and downloads

The app casts to Chromecasts directly (see [Chromecast](/clients/chromecast)); restarting it while casting re-joins the running session. Offline downloads work as on mobile: see [Offline downloads](/features/offline-downloads).

## Updates

:::details How updates work
The app checks for a new version 10 seconds after launch and every 6 hours afterward, and you can
check by hand from **App settings > Update**. It never downloads silently: when an update is found
you choose to install it, then it's downloaded and the app restarts to apply it. If the check
itself fails (no connection, GitHub unreachable), it fails quietly in the background rather than
interrupting playback.

How an update installs depends on how you installed the app:

| Install | Updated by |
|---|---|
| Windows `.exe`, macOS `.dmg`, Linux `.AppImage` | The in-app update described above |
| Mac App Store | The App Store. The in-app check is skipped |
| Linux APT or `.deb` | `apt upgrade`, or the in-app update, which reinstalls the package and asks for administrator rights |
| Linux Snap | `snapd`, in the background. The in-app check is skipped, so **App settings > Update** always reports the app as up to date |

Setting the `FLIKS_DISABLE_UPDATE_CHECK` environment variable to `1`, `true` or `yes` turns the
in-app check off.
:::

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding)
- [Chromecast](/clients/chromecast)
- [Offline downloads](/features/offline-downloads)
