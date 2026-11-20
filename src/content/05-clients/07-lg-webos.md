---
title: LG TV (webOS)
description: A native webOS app for LG TVs, approved and distributed through the LG Content Store.
---

## Compatibility

Fliks supports **webOS 7.0 and newer** (the floor of its LG Content Store listing), and is approved
on the **LG Content Store**: install it from the TV like any other app, no sideloading required.

## Playback

The webOS app plays through the TV's native `<video>` element on LG's own hardware pipeline, which
gives it native HLS, HEVC (8 and 10-bit), and Dolby AC3/EAC3 audio pass-through, plus HDR where
the TV supports it. AV1 is not offered to TVs: an AV1 source is converted by the server.

A few playback details are specific to this platform:

- **Containers**: MP4 and WebM play natively. An MKV file is not played back as-is; the server
  remuxes or transcodes it into HLS first, the same way it would for a client with no native MKV
  support.
- **Trick play**: the TV has no fast-forward/rewind at a sped-up rate. Seeking works normally.
- **Subtitles**: text subtitles are drawn as an overlay by the app; image-based subtitles are
  burned into the video server-side.
- **Audio tracks**: webOS only lists one audio track per language, so if a title has two English
  tracks (say, stereo and 5.1), only one is reachable from the in-app track picker without a reload.
- **Seeking**: a seek far outside what's already buffered is intentionally delayed for a fraction of
  a second before reloading, because seeking too quickly in a row can crash the TV's own media
  pipeline.
- Casting to a Chromecast isn't available from an LG TV: it can be a
  [remote control](/features/pairing-and-remote-control) target, but not a Chromecast sender.

## Installing

Install it directly from the **LG Content Store** on the TV; the store picks the right package for
your TV automatically.

Sideloading is only for development. Each
[GitHub release](https://github.com/fliks-app/fliks/releases) attaches two `.ipk` packages that
differ only by resolution: `media.fliks.app_<version>_uhd_1920x1080.ipk` for 4K (UHD) TVs and
`media.fliks.app_<version>_fhd_1280x720.ipk` for Full HD ones. With the TV in developer mode
(LG's **Developer Mode** app) and the webOS CLI registered against it (`ares-setup-device`),
install with `ares-install <file>.ipk` and start it with `ares-launch media.fliks.app`.

## See also

- [Pairing and remote control](/features/pairing-and-remote-control)
- [Streaming and transcoding](/features/streaming-and-transcoding)
