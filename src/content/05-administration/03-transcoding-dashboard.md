---
title: Transcoding dashboard
description: Watch every active stream live, see why each one is or isn't being transcoded, and step in if you need to.
---

## Where it is

**Settings > Video activity**, the third entry of the **System** section in the admin sidebar.
It polls for updates every 5 seconds while the page is open; nothing to refresh by hand. Live TV
viewers show up here too.

## What each stream card shows

One card per active playback session, with:

- **Who and what**: poster, title (and episode, for a show), username, and the device it's
  playing on, with the client app's version when the client reports one.
- **Progress**: position and duration, and a bar showing playback position (green) and, for an
  active transcode, how far ahead the encoder has gotten (red). A Live TV stream shows how long
  it has been watched instead.
- **Stream, video and audio, each broken down independently**: what the source is (container
  and bitrate, video format, audio language, codec and channels), and what's sent to the client
  instead: Direct Play, an audio copy, or a real transcode. HDR content that the client
  tone-maps itself is flagged separately from server-side tone-mapping.
- **Why**: whenever a line isn't Direct Play, a short reason in italics explains what forced the
  decision (an incompatible codec, a bitrate over the device's cap, a subtitle burned in, and so
  on). A Direct Play stream shows none.
- **Hardware path**: on a transcoded video line, which of CPU, QSV, VAAPI, NVENC, AMF or
  VideoToolbox (shown as "Apple VT") is doing the encoding. See
  [Hardware acceleration](/install/hardware-acceleration) for what each of those means.

## Stepping in

Three buttons at the bottom of each card, all sent to the playing client:

| Action | Effect |
|---|---|
| Pause / Resume | Toggles playback on that client. |
| Message | Sends a short text message that appears in the client's player (useful for "wrapping up in 5 minutes" without walking to the TV). |
| Stop | Ends the session after you confirm; the client's playback is interrupted immediately. |

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for the full Direct
  Play, Direct Stream or Transcode decision this dashboard is showing you the result of.
- [Hardware acceleration](/install/hardware-acceleration) for the GPU paths shown on each card.
- [Settings](/administration/settings) for the Streaming page that controls the cache budget and
  concurrency these sessions share.
