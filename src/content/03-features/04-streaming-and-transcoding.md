---
title: Streaming and transcoding
description: How Fliks decides between sending a file untouched, repackaging it, or converting it on the fly, and how hardware acceleration is used.
---

## The three ways a file can be sent

![The player with its quality and stats overlay](/img/player.webp)

Every time you press play, Fliks compares the file against what your device says it can handle,
and picks the cheapest option that still works:

| Method | What happens | When it's used |
|---|---|---|
| **Direct Play** | The file is sent exactly as stored, with nothing re-encoded or repackaged | The container, video codec and audio codec are all in your device's supported list, the resolution and bitrate are within its limits, and nothing else (see below) forces a change |
| **Direct Stream** (shown in the app as "Remux") | The video is copied without re-encoding, just repackaged into a streaming-friendly container | The video itself is compatible but the container or the audio track isn't |
| **Transcode** | The video is re-encoded, at a quality your device can decode, and packaged for adaptive streaming | Nothing above applies: an incompatible codec, a bitrate over your limit, HDR your screen can't show, or a feature (like burned-in subtitles) that needs it |

A few specific things always force a transcode, no matter how compatible the codec otherwise is:
subtitles that have to be burned into the picture, automatic black-bar cropping (if turned on and
your device doesn't already crop locally), HDR that your screen can't display, and deliberately
picking a lower quality than the source.

The player's **Stats for nerds** overlay shows which of the three methods is active for whatever
you're watching, plus the exact reason if it isn't a plain Direct Play.

## Picking a quality

The quality menu always offers **Auto**, plus a fixed ladder of resolutions with their target
bitrate (2160p, 1080p, 720p, 480p, 360p, 240p, 144p), and **Original** when the source can be
copied as-is. Toggle **Show low-bandwidth qualities** (on by default, in **Settings > Playback >
Player**) to also see lighter "eco" rungs at each resolution, meant for a slow connection.

What "Auto" does depends on an admin setting:

- **Direct Play prioritized** (the default, recommended for a home server on a local network):
  Auto plays the file as-is whenever it can, with no adaptive bitrate switching.
- **Adaptive streaming prioritized (ABR)**: Auto always goes through the adaptive HLS ladder, so
  quality can step down automatically if the connection gets worse mid-playback.

Picking a specific resolution by hand always locks it in and disables adaptive switching, whichever
mode is active; picking one equal to the source resolution can still Direct Play.

## HDR and Dolby Vision

An HDR10, HLG or Dolby Vision source is kept as HDR whenever it can be: a Direct Play or a Remux
never touches it, and a transcode keeps it in HDR when your device supports HDR and a hardware
encoder capable of HDR output is available on the server. Only H.264 has no HDR output path; HEVC
and AV1 both do, across every hardware backend Fliks supports.

When none of that is possible, HDR is tone-mapped down to SDR instead, so the picture still looks
right rather than washed out or over-bright on a screen that can't display HDR. Which tone-mapping
method runs, and the curve it uses, are admin settings under **Settings > Streaming**, and a
desktop client with its own tone-mapping capability (see [Desktop](/clients/desktop)) can ask the
server to skip this step and hand over the untouched HDR stream instead.

## Audio

An HLS stream carries one output codec per group of audio tracks: if every track in a title already
shares one codec your device supports, they're all copied as-is; otherwise Fliks converts every
track in the group to a single common codec (preferring a surround format when the source and your
device both support it, falling back to AAC otherwise). Each audio track is still its own
switchable rendition, so changing the audio track mid-playback doesn't restart the video.

## Hardware acceleration

Encoding happens on whichever hardware path the server finds at startup, probed automatically in
this order, with a plain CPU encode as the fallback if nothing else works:

| Platform | Tried in order |
|---|---|
| Linux | Intel QSV, then VAAPI, then NVIDIA NVENC |
| Windows | Intel QSV, then AMD AMF, then NVIDIA NVENC |
| macOS | Apple VideoToolbox |

| Codec | CPU | Intel QSV | VAAPI | NVIDIA NVENC | AMD AMF | VideoToolbox |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| H.264 | Yes | Yes | Yes | Yes | Yes | Yes |
| HEVC | Yes | Yes | Yes | Yes | Yes | Yes |
| AV1 | Yes | Yes | Yes | Yes | Yes | No |

On a server with more than one GPU, **Settings > Streaming > GPU device** picks which one handles
transcoding (the picker only appears once a second GPU is actually detected); left on **Automatic**,
Fliks uses the first one it finds.

## Admin settings

**Settings > Streaming**, in addition to the tone-mapping and GPU settings above:

| Setting | What it does |
|---|---|
| "Auto" quality behavior | Direct Play prioritized vs. adaptive streaming prioritized, described above |
| Embedded subtitle extraction | Whether embedded subtitles are pre-extracted at import time, on first playback, or not at all |
| Segment duration | Length of each HLS segment (default 3 seconds) |
| Automatic black bar cropping | Detects and crops letterboxing on the fly |
| Encoding preset (QSV / CPU) | Speed-versus-quality tradeoff; has no effect on VAAPI or NVENC |
| Concurrent background jobs | How many FFmpeg jobs can run at once for scans, thumbnails and marker detection (playback transcodes aren't limited by this) |
| Cache size limit / retention | How much disk the transcode cache may use, and how long a cached segment is kept, with a manual "Clear cache" action |

## See also

- The live transcode dashboard, under **Settings > System > Video activity**, shows every active
  stream, its method, and why: see the administration guide.
- [Live TV](/features/live-tv) for how the same decision applies to a live channel.
- [Desktop](/clients/desktop) and [Chromecast](/clients/chromecast) for platform-specific playback
  notes.
