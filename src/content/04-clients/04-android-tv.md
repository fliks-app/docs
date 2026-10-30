---
title: Android TV
description: The same Android app, adapted for a 10-foot interface and D-pad navigation on a TV.
---

## One app, two form factors

Android TV isn't a separate app: it's the same package as the [phone and tablet](/clients/mobile)
build, listed once on the Play Store for both. Fliks detects at launch that it's running on a TV
(rather than a phone or tablet) and switches the interface into TV mode: a wider layout suited to a
screen viewed from across the room, and navigation driven entirely by the remote's D-pad instead of
touch.

## Getting it

Install "Fliks" from the Play Store on the Android TV device, the same as any other TV app.
Minimum Android version: 6 (API 23), the same floor as the phone app.

## Navigating with a remote

Moving the D-pad up or down between rows of posters, or left and right within a row, works the way
you'd expect from a typical TV app: moving into a row lands on its first item, and moving back into
a row you already had focus in returns you to the same card rather than resetting to the start.

## Surround sound through an AV receiver

When the TV's HDMI output is connected to a receiver or soundbar that accepts Dolby Digital (AC3),
Dolby Digital Plus (E-AC3), DTS (including DTS-HD) or Dolby TrueHD as a bitstream, Fliks asks it
which of those it takes and sends matching audio tracks through untouched. The receiver decodes
them, even when the TV has no decoder for the format, so a TrueHD or DTS track plays as is
instead of being converted. The list is read again when you plug or unplug HDMI audio, so
switching receivers needs no restart. There is no setting for it.

A file with an [`.edl` file](/features/playback#commercials-cuts-and-mutes-edl) that mutes part of
the audio is the exception: a bitstream can't be muted, so its audio is decoded and converted as
before.

## What's hidden on this platform

Consistent with every TV client:

- No offline downloads, and no download-related settings.
- No public profile browsing.
- No Chromecast casting from the device (it can still be a target for
  [remote control](/features/pairing-and-remote-control) from a phone or the web app).
- No server administration screens.

## Signing in

On first launch, enter your server's address. Then use the on-screen keyboard to type a password,
or set the TV up faster with
[Quick Connect](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect):
approve the sign-in from a phone that's already logged in, with nothing to type on the TV itself.

## See also

- [Pairing and remote control](/features/pairing-and-remote-control)
- [Streaming and transcoding](/features/streaming-and-transcoding)
