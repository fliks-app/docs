---
title: Android TV
description: The same Android app, adapted for a 10-foot interface and D-pad navigation on a TV.
---

> [!SUMMARY]
> Install Fliks from the Play Store on the TV, enter the server address, then sign in with Quick Connect instead of typing a password. It is the same app as the phone one, in TV mode.

## Install and sign in

Install "Fliks" from the Play Store on the TV (Android 7 or newer). It is the same app as the
[phone](/clients/mobile) one and switches to a TV interface by itself.

On first launch, enter your server's address, then choose
[Quick Connect](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect):
the TV shows a code, and you type it on your phone under **Login requests**. Or type your password
with the on-screen keyboard.

## Surround sound through an AV receiver

:::details Surround sound through an AV receiver
When the TV's HDMI output is connected to a receiver or soundbar that accepts Dolby Digital (AC3),
Dolby Digital Plus (E-AC3), DTS (including DTS-HD) or Dolby TrueHD as a bitstream, Fliks asks it
which of those it takes and sends matching audio tracks through untouched. The receiver decodes
them, even when the TV has no decoder for the format, so a TrueHD or DTS track plays as is
instead of being converted. The list is read again when you plug or unplug HDMI audio, so
switching receivers needs no restart. There is no setting for it.

A file with an [`.edl` file](/features/playback#commercials-cuts-and-mutes-edl) that mutes part of
the audio is the exception: a bitstream can't be muted, so its audio is decoded and converted as
before.
:::

## What's missing on TV

No offline downloads, no casting out (the TV can still be a [remote control](/features/pairing-and-remote-control) target), no public profiles and no server administration.

## See also

- [Pairing and remote control](/features/pairing-and-remote-control)
- [Streaming and transcoding](/features/streaming-and-transcoding)
