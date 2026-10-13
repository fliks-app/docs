---
title: Playback quality
description: See why a playback stuttered, by client, with a verdict, a per-playback timeline and a cause for every stall.
---

## Where it is

**Settings > Playback quality**, the fourth entry of the **System** section in the admin sidebar
(`/admin/playback-quality`). It needs the same access as the rest of the admin area. Every Fliks
client reports how each playback goes, the server works out what went wrong, and this page shows
the result. A live version of the verdict also sits on each card of the
[Transcoding dashboard](/administration/transcoding-dashboard).

Nothing here is sent anywhere else: see [What is stored](#what-is-stored).

## Verdicts

Each playback gets one verdict, with a confidence (**high**, or **low confidence** when the evidence
is thin):

| Verdict | Meaning |
|---|---|
| Healthy | No issue detected. |
| Network | The data did not arrive fast enough for the video. |
| Device | The device could not keep up with data it already had. |
| Server | The server could not produce the stream fast enough, or lost track of the session. |
| Error | Playback failed with an error and never recovered. |
| Not enough data | Under a minute of playback, or nothing reported, so nothing to judge. |

The verdict is worked out from the whole viewing: a quality switch or reload starts a new session
inside it, but they are merged into one playback.

## The three tabs

**Sessions** is the default. A bar shows the share of each verdict over the last **7** or **30**
days, and the list below can be filtered by verdict, user and device. Each row is one playback
(verdict, user, device, media, start time); click it for the detail.

**Devices** groups the same data per device, with the number of playbacks, how many had stalls,
the average share of dropped frames, how many were decoded by hardware, and the most frequent
verdict. It is the place to spot the TV that struggles with HEVC. Every browser version of "Chrome on
Linux" counts as one device.

**Settings** holds the two settings (see [Settings](#settings)).

## A playback in detail

The detail window opens with a summary: playback time, device and app version, player engine,
quality and resolution, video codec, measured throughput, video bitrate, dropped frames, decoder
(hardware or software), whether CMCD arrived, and the number of sessions. Under it:

- **Stalls by cause**: a table of server, network, device and unknown stalls with their count and
  total duration.
- **Timeline**: the playback in order, with each moment the picture froze (and how long, and at what
  position in the video), the cause of each stall with a plain sentence, and what changed in
  between: a quality change, an audio or subtitle reload, a switch to Chromecast, or a recovery
  after an error. A recovery shows how long it took and why the player had to restart its session
  (server lost the session, or refused the rest of the stream).
- **Technical details**, per session: the **pipeline** the server used (source and output codec,
  HDR, quality tier, decode and encode on CPU or which GPU path, tone-mapping path, burned-in
  subtitles, crop, audio transcode), and the server load when a stall happened (transcodes, sessions,
  load average and cores).

**Export JSON** saves the whole detail (sessions, events, causes) as
`playback-quality-<id>.json`, handy for a bug report.

## How a stall's cause is decided

Fliks looks at each stall as it is recorded, and the first rule that matches wins:

1. **Server production too slow.** While the player was frozen, the server took more than 1 second to
   produce a segment, or produced segments slower than real time (under 1x; under 0.9x for Live TV,
   which is paced at real time anyway). Only counted when the buffer was nearly empty or unknown, because a wait
   while plenty of video is buffered is ffmpeg pausing ahead of the player, not a starved one.
2. **Network.** The buffer was nearly empty (under 1 second) **and** the measured throughput was
   under 1.2 times the video bitrate: the link could not carry the stream.
3. **Device dropping frames.** At least 10% of the decoded frames were dropped around the stall.
4. **Device, data buffered.** The buffer still held a second or more, so the data was there and the
   device did not show it in time.
5. **Network, unconfirmed.** The buffer was empty but throughput looked fine or is unknown: data
   still did not arrive in time. Low confidence.
6. **Unknown.** Not enough measurements.

A server cause comes with hints that make it plausible but never change the decision: software
encode, burned-in subtitles, tone-mapping on the CPU, or two or more transcodes running at once. A
match that only works after allowing for the server and client clocks being a few seconds apart is
shown as low confidence.

The playback's verdict then follows the cause holding most of the stalled time, with the dominant
reason named. When stalls are not classified, it falls back to simpler rules:

- A fatal error that was never recovered is **Error**.
- Stalls count once there is at least one per 10 minutes or 1% of playback time stalled. Then:
  median transcode speed under 1x is **Server**; a starved buffer with low throughput is **Network**
  (low confidence when throughput or the buffer is unknown); stalls with data buffered are
  **Device**.
- With no stalls, at least 5% of frames dropped (over 300 decoded frames) is **Device**.
- Otherwise **Healthy**, or **Not enough data** under a minute of playback.

A software decoder at 720p or above is added as a hint on a Device verdict. It is never a verdict by
itself, and below 720p it is normal.

## What each client can report

Clients send a sample with every heartbeat and stall, error, recovery and quality events as they
happen. What they can measure differs:

| Client | Dropped frames | Throughput | Buffer | Decoder | CMCD |
|---|---|---|---|---|---|
| Web and installed app (Shaka) | Yes | Player estimate | Yes | No | Yes, in the URL |
| Android and Android TV (ExoPlayer) | Yes | Yes | Yes | Name, hardware or software | HLS online only |
| iPhone, iPad and Apple TV (AVPlayer) | Dropped, decoded estimated | From the access log | Yes | Codec only | iOS and tvOS 18 or later, in headers |
| Desktop (mpv) | Dropped, decoded estimated | Cache speed | Yes | Hardware decoding | No |
| LG webOS | Yes | No | Yes | No | No |
| Samsung Tizen | No | No | No | No | No |
| Chromecast receiver | Yes | Yes | Yes, per stall | No | Yes, in the URL |

A client that cannot measure something leaves it empty and Fliks assumes nothing, so a Tizen verdict
rests on stalls and the server's own timing. The Chromecast receiver passes its numbers to the app
that started the cast, which forwards them to your server.

**CMCD** (Common Media Client Data) is a standard way for a player to attach its buffer length,
measured throughput and bitrate to each segment request. Fliks reads it on the server, from the
request itself, and ties it to the right session by its own session id. The page says whether CMCD
arrived. A client that says it sends CMCD while the server sees none is flagged as a hint, never a
verdict.

## Settings

On the **Settings** tab:

| Setting | Effect | Default |
|---|---|---|
| Collect playback quality from clients | Off: nothing is recorded, and the live verdict disappears from the transcoding dashboard. | On |
| Retention (days) | Playbacks older than this are deleted every night at 4:00. | 30 |

## What is stored

Everything is kept in your own Fliks database and never leaves your server. Fliks sends no playback
data to any third party, and the app and server run no analytics service for it.

- **Per session** (table `playback_qoe_sessions`): user id, media file id and title, device label
  (the browser's user agent for web and desktop), system name, app version, player engine, play
  method, quality, the reasons for a transcode, codec, resolution, decoder, counters (playback time,
  stalls, dropped and decoded frames, errors, recoveries), average and lowest throughput, bitrate,
  the stream pipeline, the verdict and the times it started and ended.
- **Per event** (table `playback_qoe_events`): stalls, errors, recoveries, quality switches and
  reloads, with the position in the video, duration, buffer and throughput at that moment, the
  cause Fliks assigned, the server load, and for an error its code, category and a short message.
- **Not stored**: the video or audio itself, subtitles, or IP addresses.

Rows are deleted after the retention period, 30 days unless you change it. Turning collection off
stops new recording, and rows already stored stay until they expire.

## See also

- [Transcoding dashboard](/administration/transcoding-dashboard) for the live view of each stream.
- [Streaming and transcoding](/features/streaming-and-transcoding) for how Direct Play and
  transcoding are decided.
- [Hardware acceleration](/install/hardware-acceleration) when a Server verdict points to a slow
  software encode.
- [Logs and troubleshooting](/administration/logs-and-troubleshooting).
