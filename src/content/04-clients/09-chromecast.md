---
title: Chromecast
description: Cast from the web app, mobile apps or desktop app to any Chromecast device, using a custom receiver built on the same player engine.
---

## How it works

Fliks ships its own Chromecast receiver app rather than relying on a generic media receiver. When
you cast, the sending client (web, mobile or desktop) tells the Chromecast to launch that receiver
and hands it a direct URL to stream from: the Chromecast then pulls the video straight from your
Fliks server over the local network, not through the sending device.

The receiver uses the same adaptive-streaming player engine as the rest of Fliks, so quality
switching, subtitles and multiple audio tracks all work the same way they do everywhere else. It
also answers a short capability probe when a cast session starts, so the server knows which codecs
that particular Chromecast model can decode before it picks a format.

## Casting from a client

| Client | Can cast |
|---|---|
| Web browser | Yes, using the browser's own Cast integration |
| Mobile (iOS, Android) | Yes, with an in-app device picker |
| Desktop | Yes, with an in-app device picker |
| Any TV client | No: TVs are cast destinations for [remote control](/features/pairing-and-remote-control), not senders |

## Cast settings

**Settings > Playback > Cast** controls what gets sent to a Chromecast once you start casting:

| Setting | Default | What it does |
|---|---|---|
| HDR | Off | Only turn this on if both the Chromecast device and the TV it's plugged into support HDR. Left off, the server converts HDR sources to SDR before sending them. |
| Maximum quality | 1080p | Caps the resolution sent to the device (original, 2160p, 1080p, 720p or 480p). |
| Audio channels | Stereo | Stereo, 5.1 or 7.1. Leave it at stereo unless the TV is connected to a surround system. |
| Subtitle appearance | Normal size, white, drop shadow, transparent background | Matches the in-app subtitle styling described in [Subtitles](/features/subtitles). |

The volume slider that appears while casting controls the Chromecast device's own volume, not the
phone or computer you're casting from.

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for how direct play, remux and
  transcode decisions are made.
- [Pairing and remote control](/features/pairing-and-remote-control) for controlling playback on
  another device, Chromecast or otherwise.
