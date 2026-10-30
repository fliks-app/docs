---
title: Chromecast
description: Cast from the web app, mobile apps or desktop app to any Chromecast device, using a custom receiver built on the same player engine.
---

## How it works

Fliks ships its own Chromecast receiver app rather than relying on a generic media receiver. When
you cast, the sending client (web, mobile or desktop) tells the Chromecast to launch that receiver
and hands it a direct URL to stream from: the Chromecast then pulls the video straight from your
Fliks server, not through the sending device.

So the Chromecast must be able to reach the server at the address Fliks hands it. Discovery is
done by the sending device, not the server, so a Docker install works on the default bridge
network; set **Public address** if the Chromecast can't reach the address Fliks would otherwise
use (see [Chromecast on a bridge network](/install/docker#chromecast-on-a-bridge-network)).

The receiver uses the same adaptive-streaming player engine as the rest of Fliks, so quality
switching, subtitles and multiple audio tracks all work the same way they do everywhere else.

## What the Chromecast can play

The receiver answers a short capability probe when a cast session starts. It reports the video
codecs it can decode (H.264, HEVC, AV1), 10-bit support for HEVC and AV1, and whether the TV shows
HDR. Fliks builds the cast profile from that answer. A Chromecast that decodes HEVC or AV1 gets
those streams as they are, without a re-encode to H.264, when the file stays within conservative
level and bit-depth limits. One that reports only H.264 gets an H.264 stream. The answer is
remembered per device, so only the first cast to a new device pays for the probe.

Audio is AAC, plus AC-3 when **Audio** is set to 5.1 or 7.1 and the device supports it.

## Casting from a client

| Client | Can cast |
|---|---|
| Web browser | Yes, using the browser's own Cast integration |
| Mobile (iOS, Android) | Yes, with an in-app device picker |
| Desktop | Yes, with an in-app device picker; restarting the app while casting re-joins the session (see [Desktop](/clients/desktop#casting-to-a-chromecast)) |
| Any TV client (Android TV, Samsung, LG, Apple TV) | No: a TV can be a [remote control](/features/pairing-and-remote-control) target, but not a Chromecast sender |

## Cast settings

**App settings > Chromecast** controls what gets sent to a Chromecast once you start casting. The page
isn't shown on TV clients.

| Setting | Default | What it does |
|---|---|---|
| HDR | Off | Only turn this on if both the Chromecast device and the TV it's plugged into support HDR. HDR is sent only when the TV reports HDR and the device decodes 10-bit video. Otherwise, or left off, the server converts HDR sources to SDR before sending them. |
| Maximum quality | 1080p | Caps the resolution sent to the device (original, 2160p, 1080p, 720p or 480p). |
| Audio | Stereo | Stereo, 5.1 or 7.1. Leave it at stereo unless the TV is connected to a surround system. |
| Subtitle appearance | Normal size, white, drop shadow, transparent background | Matches the in-app subtitle styling described in [Subtitles](/features/subtitles). |
| Bottom edge position | 5% | How far above the bottom of the screen the subtitles sit (0, 5, 10, 15 or 20%). |

The volume slider that appears while casting controls the Chromecast device's own volume, not the
phone or computer you're casting from.

### Changing subtitles while casting

You don't need to leave the player to restyle the subtitles. While casting, open the player's
**Subtitles** menu, then **Appearance**: **Text size**, **Text color**, **Drop shadow**,
**Background color** and **Bottom position** change on the TV straight away and are saved as the
Chromecast settings above. The top position isn't offered while casting.

The receiver can't draw image subtitles (PGS, VobSub) or styled ASS/SSA, so picking one makes the
server burn it into the video. See [Burned-in subtitles](/features/subtitles#burned-in-subtitles)
for when these tracks are offered.

## On the TV

The receiver draws its own interface instead of the stock Chromecast overlay.

- **Progress bar.** It shows while the video is paused and when you seek or change something.
  It has the elapsed and total time, the buffered range, and a title. An episode leads with its
  label (number and title) and the show's name sits under it. If the file has a detected intro or
  credits, each is tinted on the bar, the same way as the seek bar in the app.
- **Play and pause icon.** A pause icon sits in the middle of the screen while paused. A short
  play icon flashes when playback resumes. A spinner takes its place while the video loads or
  buffers.
- **Subtitles.** The receiver draws them itself in the style you chose, and lifts them above the
  progress bar while it is showing.
- **Skip cues.** During a detected intro, a cue appears in the lower right. Once the credits begin
  and a next episode exists, the cue offers it instead. With a TV remote, the cue reads **Skip
  intro** or **Next episode** and the remote's OK button does it. Until the receiver has seen a
  remote key, the cue says to do it from your device. On your phone or computer, the player's
  controls show **Skip intro** during the intro and a next-episode button when one follows.

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for how Direct Play, Direct Stream
  and Transcode decisions are made.
- [Pairing and remote control](/features/pairing-and-remote-control) for controlling playback on
  another device, Chromecast or otherwise.
