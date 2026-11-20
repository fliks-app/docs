---
title: Transcoding dashboard
description: Watch every active stream live, see why each one is or isn't being transcoded, and step in if you need to.
---

> [!SUMMARY]
> **Settings > Video activity** shows every active stream live, with the reason each one is or isn't transcoded. Pause, message or stop a stream from its card. It refreshes every 5 seconds by itself.

## Watch a stream live

Open **Settings > Video activity** (**System** section). Live TV viewers show up here too.

![A stream card: source and output per track, why, health verdict, and the pause, message and stop buttons](/img/admin-video-activity-stream.webp)

## Stepping in

Three buttons at the bottom of each card, all sent to the playing client:

| Action | Effect |
|---|---|
| Pause / Resume | Toggles playback on that client. |
| Message | Shows a short text in the client's player. |
| Stop | Ends the session after you confirm. |

:::details What each stream card shows

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
- **Playback quality**: a health dot with the verdict so far (healthy, network, device, server, error
  or not enough data); expand it for the reasons, throughput, bitrate, buffer, dropped frames,
  decoder, transcode speed, engine, CMCD, stalls and the last stall. Hidden when collection is off.
  See [Playback quality](/administration/playback-quality).
- **Hardware path**: on a transcoded video line, which of CPU, QSV, VAAPI, NVENC, AMF or
  VideoToolbox (shown as "Apple VT") is doing the encoding. See
  [Hardware acceleration](/install/hardware-acceleration) for what each of those means.
:::

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for the full Direct
  Play, Direct Stream or Transcode decision this dashboard is showing you the result of.
- [Hardware acceleration](/install/hardware-acceleration) for the GPU paths shown on each card.
- [Settings](/administration/settings) for the Streaming page that controls the cache budget and
  concurrency these sessions share.
