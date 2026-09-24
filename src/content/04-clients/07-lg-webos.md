---
title: LG TV (webOS)
description: A native webOS app for LG TVs, approved and distributed through the LG Content Store.
---

## Compatibility

Fliks aims for **webOS 6 and newer** Chromium (webOS 7.0 in practice, per the LG Content Store
listing), and is approved on the **LG Content Store**: install it from the TV like any other app,
no sideloading required.

## Playback

The webOS app plays through the TV's native `<video>` element on LG's own hardware pipeline, which
gives it native HLS, HEVC (8 and 10-bit), AV1, and Dolby AC3/EAC3 audio pass-through, plus HDR where
the TV supports it.

A few playback details are specific to this platform:

- **Containers**: MP4 and WebM play natively. An MKV file is not played back as-is; the server
  remuxes or transcodes it into HLS first, the same way it would for a client with no native MKV
  support.
- **Trick play**: there's no fast-forward/rewind scrubbing at a sped-up rate; seeking works, but
  variable-speed playback doesn't.
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

Install it directly from the **LG Content Store** on the TV. For sideloading during development,
the packaged app is an installable `.ipk`, built in two variants (a 1920x1080 one for UHD TVs, and
a 1280x720 one for others); LG serves TVs the variant that matches their resolution automatically
through the store.

## See also

- [Pairing and remote control](/features/pairing-and-remote-control)
- [Streaming and transcoding](/features/streaming-and-transcoding)
