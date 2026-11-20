---
title: Playback
description: Resume across devices, how intros and credits are detected, how seek previews are generated, and skipping commercials from an EDL file. The in-player controls are in the Player section.
---

This page covers what the server does around playback. For the player itself (buttons, audio and
subtitle tracks, keyboard), see [The player](/player/overview).

## Resume anywhere

Fliks saves your position in the background while you watch, and reads it back on any device you
sign in on: start a film on your phone, sit down at the TV, and it offers to resume from the same
spot. Progress is saved a few times a minute during playback, and immediately whenever you pause,
seek, or finish something, so switching devices mid-scene loses at most a few seconds.

- Under about 10 seconds of progress, a title still shows up under Continue Watching but resumes
  from the start rather than at that tiny offset.
- Under about 5 seconds, it doesn't count as watched at all, and won't appear in your history or
  under Continue Watching.
- A title is marked as finished once you reach roughly 90% of it, or come within 30 seconds of the
  end, whichever happens first.
- If you were offline when you finished something, the position is kept on the device and sent to
  the server as soon as it reconnects.

## Intro and credits detection

For a series, Fliks looks at each episode's audio to find the recurring intro and, separately, the
part near the end shared across episodes (the outro or credits). The player then offers
**Skip intro** and **Next episode** buttons (see [The player](/player/overview#skip-intro-and-next-episode)),
and two settings in **App settings > Playback**, **Skip intro automatically** and
**Automatically play next episode** (on by default), act on them. Inside a playlist, the
playlist's own autoplay setting decides instead.

> [!NOTE]
> Detection runs automatically after a series is imported (**Detect intros / credits when importing
> series** in **Settings > General**, on by default), fingerprinting the audio at the start (and
> separately, the end) of every episode in a season to find what repeats; a file with a chapter
> named like an intro is used directly. It can also be re-run by hand from a title's **Analyze**
> dialog (**Recompute intros / outros**) if a season's markers look wrong, for example after
> replacing a file.

## Scrubbing previews

Pointing at or dragging the seek bar shows a preview frame, so you can see roughly where you'll
land (see [The player](/player/overview#seek-bar-previews)). These are generated once, right after a
file is imported (**Generate seek thumbnails when importing** in **Settings > General**, on by
default; turn it off on a low-power server), or later on demand from the **Analyze** dialog
(**Regenerate sprites**) or **Settings > System** (**Generate missing sprites**), not on the fly
while you scrub.

## Commercials, cuts and mutes (EDL)

Put a Kodi `.edl` file next to a video, with the same name (`Movie (2020).mkv` and
`Movie (2020).edl`), and every client acts on it: commercials are skipped, cuts are jumped over, and
muted stretches go silent. This is the Kodi EDL format, which Comskip and MCEBuddy can write. Fliks reads the file when
playback starts, so adding, editing or removing it needs no rescan.

Each line is `start end action`, separated by spaces or tabs. Times are seconds (`61.5`),
`h:mm:ss.ms`, or `#frame` numbers (these need the video's frame rate).

| Action | Code | What playback does |
|---|---|---|
| Cut | `0` | Always skipped, including when you seek or resume inside it. |
| Mute | `1` | Audio is silenced for that stretch; the picture keeps playing. |
| Scene marker | `2` | Read and ignored. |
| Commercial | `3` | Skipped once per viewing, then plays normally, so you can seek back to watch it. |

A skip shows a short "Commercial skipped" or "Scene skipped" notice. Except on Apple TV and on the
Chromecast screen, a muted stretch also shows an "Audio muted" badge, and the seek bar draws the
ranges (cuts greyed, commercials tinted, mutes as a thin strip). A range that reaches the end of the
file ends playback. Mutes leave your own volume and mute setting alone; on a Samsung TV they use the
TV's mute, then give it back the way you left it. They are accurate to about 100 ms, and two mutes
less than 0.2 s apart become one.

Apple TV, desktop, Android, iOS, web, Tizen, webOS and Chromecast all skip and mute. When the file
has mutes, Android plays decoded PCM audio instead of Dolby passthrough, a Chromecast gets an AAC
transcode instead of AC-3, and iOS keeps the video off AirPlay. An EDL over about 48 KB once encoded
is dropped for casting (the file still works everywhere else).

### Turning it off

In **App settings > Playback** (user menu), per user. The Apple TV app has no switch, but follows
what you set in another app:

- **Skip cuts and mutes** is on by default. Off, the server stops sending ranges and no client acts
  on the file. A download keeps the ranges it had when it was made: turning this off also stops
  downloads you already have from using them, and turning it back on only adds ranges to downloads
  made afterwards.
- **Skip commercial breaks automatically** is on by default. Off, a **Skip ad** button appears
  during a commercial instead (cuts still skip on their own). While casting there is no button, and
  commercials play.

### Adding an EDL from Fliks

On a title's file information, **View companion files** lists the `.edl` next to the video. You can
download it from a browser or the desktop app, and delete it if you can delete media. If you can
edit media, **Import a file** accepts a new one:

1. Pick the type **EDL (skip / mute list)** and choose the file.
2. Fliks checks it and writes it beside the video as `<video name>.edl`. If one already exists it
   asks before replacing it.

Lines Fliks can't use are skipped, and the result says how many. An import fails when the file is
over 1 MiB, isn't UTF-8 text, or has no valid range.

> [!NOTE]
> A line with a bad time or action, or one overlapping an earlier line, is skipped and logged. At
> most 10000 ranges are read per file. Only `.edl` is supported, not Comskip's `.txt`. Times count
> from the start of the file, as in Kodi.

An EDL belongs to one encode. It is copied or moved, and renamed, with the video when Fliks imports
it into a library (`.edl` is in the default **Companion file extensions**), is removed when an
import replaces the video, and is deleted along with the video when you delete the file from disk,
unless another video shares its name.

## See also

- [The player](/player/overview) for the controls, audio and subtitle tracks, keyboard shortcuts and casting.
- [Subtitles](/features/subtitles) for search, sync and translation.
- [Streaming and transcoding](/features/streaming-and-transcoding) for how the quality you actually
  get is decided.
