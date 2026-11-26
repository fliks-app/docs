---
title: Samsung TV (Tizen)
description: A native Tizen app for Samsung TVs, played through the TV's own hardware video path.
---

> [!SUMMARY]
> Fliks is not on Samsung Apps yet: download the `.wgt` from the GitHub release and sideload it with Tizen Studio (developer mode on the TV, a certificate for that TV). Tizen 6.5 or newer.

## Install and sign in

Fliks needs **Tizen 6.5 or newer** (Samsung TVs from 2022). It is not on Samsung Apps yet, so it is
sideloaded: see the steps below. Then enter your server's address and choose
[Quick Connect](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect), typing
the code the TV shows on your phone's **Login requests** page.

![The Fliks home screen on a Samsung TV](/img/clients-tizen-home.jpg)

:::details How playback works and its limits
The app drives the TV's own hardware player (AVPlay): native HEVC, Dolby audio pass-through, HLS
and the TV's demuxer for MP4, MKV, MOV, TS, M2TS, AVI and WebM. AV1 is converted by the server.
What a TV is offered (codecs, HDR) is read from the TV itself.

- **Playback speed** is 1x or 2x only.
- **Subtitles**: text subtitles are drawn by the app; image subtitles are burned in by the server.
- No casting out: the TV can still be a [remote control](/features/pairing-and-remote-control) target.
:::

## Sideloading

:::details Sideloading steps
Sideloading a Tizen app is a developer-facing process: it needs Tizen Studio's command-line tools,
a Samsung account, and a Samsung author and distributor certificate pair tied to that specific
TV's device ID.
There is no shortcut around this; it's how Samsung's TV platform works for any unpublished app, not
a Fliks-specific limitation.

At a high level:

1. Put the TV into developer mode (on the TV: **Apps**, type `12345` with the remote, turn on
   Developer Mode, set **Host PC IP** to your PC's LAN address, then restart the TV).
2. Connect to it from the PC with the Tizen Studio CLI: `sdb connect <TV_IP>:26101`, then
   `sdb devices` should list the TV.
3. Read the TV's device ID (`sdb -s <TV_IP>:26101 shell 0 getduid`), generate a Samsung author
   certificate and a distributor certificate for that ID, and register them as a security profile
   (`tizen security-profiles add`).
4. Extract the release `Fliks-<version>.wgt` (it's a zip archive) into a folder, sign that folder
   with your profile (`tizen package -t wgt -s <profile> -- <folder>`, which writes a signed
   `Fliks.wgt` inside it), install it (`tizen install -n Fliks.wgt -s <TV_IP>:26101 -- <folder>`)
   and launch it (`tizen run -p FliksMedia.Fliks -s <TV_IP>:26101`).

`sdb install` is not a substitute for `tizen install`: it only copies the file to the TV. The full
walkthrough, including certificate generation, is in `client/tizen/README.md` in the
[project repository](https://github.com/fliks-app/fliks).

Because the distributor certificate is bound to one TV's device ID, a package you sign yourself
only installs on the TV you signed it for; you can't share a signed package between TVs.

![A movie detail page on a Samsung TV](/img/clients-tizen-detail.jpg)
:::

## See also

[Pairing and remote control](/features/pairing-and-remote-control) and [Streaming and transcoding](/features/streaming-and-transcoding).
