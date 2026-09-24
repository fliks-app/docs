---
title: Transcoding dashboard
description: Watch every active stream live, see why each one is or isn't being transcoded, and step in if you need to.
---

## Where it is

**Settings > System > Video activity** (also reachable from the Statistics/System group in the
sidebar). It polls for updates every 5 seconds while the page is open; nothing to refresh by
hand.

## What each stream card shows

One card per active playback session, with:

- **Who and what**: username, the title (and episode, for a show), and the device it's playing
  on (parsed from the client's own reported OS and app version where available, falling back to
  the browser's user agent).
- **Progress**: a bar showing playback position, and (for an active transcode) how far ahead the
  encoder has gotten.
- **Container, video and audio, each broken down independently**: what the source file actually
  is, and what's being sent to the client instead, whichever of Direct Play, a container/audio
  copy, or a real transcode applies to that track. HDR content that the client tone-maps itself
  is flagged separately from server-side tone-mapping.
- **Why**: whenever a track isn't Direct Play, a short reason line explains what forced the
  decision (an incompatible codec, a bitrate over the device's cap, a subtitle burned in, and so
  on): this is the "why a transcode was needed" the product description promises. Direct Play
  needs no explanation, so a fully direct-played stream shows none.
- **Hardware path**: which of CPU, QSV, VAAPI, NVENC or VideoToolbox is doing the encoding, when
  one is. See [Hardware acceleration](/install/hardware-acceleration) for what each of those
  means.

## Stepping in

Three actions per stream, all sent to the playing client rather than acted on locally:

| Action | Effect |
|---|---|
| Pause / Resume | Toggles playback on that client. |
| Message | Sends a short text message that appears in the client's player (useful for "wrapping up in 5 minutes" without walking to the TV). |
| Stop | Ends the session; the client's playback is interrupted immediately. |

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for the full Direct
  Play/remux/transcode decision this dashboard is showing you the result of.
- [Hardware acceleration](/install/hardware-acceleration) for the GPU paths listed as the
  hardware column.
- [Settings](/administration/settings) for the Streaming page that controls the cache budget and
  concurrency these sessions share.
