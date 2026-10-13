---
title: Playback
description: Resume across devices, remembered audio and subtitle tracks, skip intro and next episode, chapter markers, scrubbing previews, and skipping commercials from an EDL file.
---

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

![The player control bar: seek bar, transport buttons, speed, settings and fullscreen](/img/player-controls.webp)

## Track selection

Every embedded audio track, and every embedded or external text subtitle, can be switched
mid-playback without interrupting the stream. An image-based subtitle (PGS, VobSub) has to be burned
into the picture, which restarts the stream as a transcode, and these are hidden from the picker by
default (see [Subtitles](/features/subtitles#subtitle-appearance)).

![The subtitle track picker in the player, listing every language including a hearing-impaired track](/img/player-subtitles-menu.webp)

Your choice is remembered per
device (not tied to your account), and it applies to the whole show, not just the one episode you
were on, so picking a language once carries across the rest of a series.

**App settings > Playback** (in your user menu) controls how the *default* track is chosen the
first time you open something new:

| Setting | Options | Default |
|---|---|---|
| Preferred audio language | Any language | None |
| Audio selection | Preferred language, title's original language, file's default track, or first audio track | File's default track |
| Remember audio selections | On or off | On |

![The App settings > Playback page: audio selection rule and its related toggles](/img/app-settings-playback.webp)

When the chosen rule finds no match, the first audio track plays. The same page also has **Disable
HDR** (only on a device that reports HDR support; forces an SDR conversion when HDR looks washed
out) and **Show low-bandwidth qualities** (see [Streaming and transcoding](/features/streaming-and-transcoding#picking-a-quality)).

Subtitle defaults, and their appearance, are covered in [Subtitles](/features/subtitles#subtitle-appearance).

## Skip intro and next episode

For a series, Fliks looks at each episode's audio to find the recurring intro and, separately, the
part near the end shared across episodes (the outro or credits), and offers to skip past either
one:

- A **Skip intro** button appears once playback enters the detected range, and hides again after a
  few seconds if you don't press it.
- A **Next episode** button appears once playback enters the outro, if there's another episode
  queued up after this one.

Turn on **Skip intro automatically** (in **App settings > Playback**) and the intro is skipped for you
without needing to press anything, once per episode. Turn on **Automatically play next episode**
(on by default) and the next one starts on its own when this one ends; inside a playlist, the
playlist's own autoplay setting decides instead.

> [!NOTE]
> Detection runs automatically after a series is imported (**Detect intros / credits when importing
> series** in **Settings > General**, on by default), fingerprinting the audio at the start (and
> separately, the end) of every episode in a season to find what repeats; a file with a chapter
> named like an intro is used directly. It can also be re-run by hand from a title's **Analyze**
> dialog (**Recompute intros / outros**) if a season's markers look wrong, for example after
> replacing a file.

## Chapters

Where the video file itself carries chapter markers, Fliks reads them and shows them on the seek
bar, the same way a lot of well-produced Blu-ray rips already have "Opening Titles" or "Chapter 4"
markers baked into the file. These come from the file, not from Fliks: a file with no chapters
shows none.

## Scrubbing previews

Dragging the seek bar shows a filmstrip of small preview frames rather than a plain progress bar,
so you can see roughly where you'll land before letting go. These are generated once, right after a
file is imported (**Generate seek thumbnails when importing** in **Settings > General**, on by
default; turn it off on a low-power server), or later on demand from the **Analyze** dialog
(**Regenerate sprites**) or **Settings > System** (**Generate missing sprites**), not on the fly
while you scrub.

## Commercials, cuts and mutes (EDL)

Put a Kodi `.edl` file next to a video, with the same name (`Movie (2020).mkv` and
`Movie (2020).edl`), and every client acts on it: commercials are skipped, cuts are jumped over, and
muted stretches go silent. This is the format Comskip and MCEBuddy write. Fliks reads the file when
playback starts, so adding, editing or removing it needs no rescan.

Each line is `start end action`, separated by spaces or tabs. Times are seconds (`61.5`),
`h:mm:ss.ms`, or `#frame` numbers (these need the video's frame rate).

| Action | Code | What playback does |
|---|---|---|
| Cut | `0` | Always skipped, including when you seek or resume inside it. |
| Mute | `1` | Audio is silenced for that stretch; the picture keeps playing. |
| Scene marker | `2` | Read and ignored. |
| Commercial | `3` | Skipped once per viewing, then plays normally, so you can seek back to watch it. |

A skip shows a short "Commercial skipped" or "Scene skipped" notice, a muted stretch shows an "Audio
muted" badge, and the seek bar draws the ranges (cuts greyed, commercials tinted, mutes as a thin
strip). A range that reaches the end of the file ends playback. Mutes are separate from your own
mute and volume, which they never change, and are accurate to about 100 ms.

On Apple TV, desktop, Android, iOS, web, Tizen, webOS and Chromecast, skips and mutes work the same
way. Two details: on Android a file with mutes plays decoded PCM audio instead of Dolby passthrough,
and a Chromecast gets an AAC transcode instead of AC-3 or E-AC-3 when the file has mutes. A very large
EDL is dropped for casting (the file still works everywhere else).

### Turning it off

In **App settings > Playback** (user menu), per user:

- **Skip cuts and mutes** is on by default. Off, the server stops sending ranges and no client acts
  on the file. It applies to streaming and to downloads made afterwards.
- **Skip commercial breaks automatically** is on by default. Off, a **Skip ad** button appears
  during a commercial instead (cuts still skip on their own).

### Adding an EDL from Fliks

On a title's file information, **View companion files** lists the `.edl` next to the video, and
lets you download or delete it. If you can edit media, **Import a file** accepts a new one:

1. Pick the type **EDL (skip / mute list)** and choose the file.
2. Fliks checks it and writes it beside the video as `<video name>.edl`. If one already exists it
   asks before replacing it.

Lines Fliks can't use are skipped, and the result says how many. An import fails when the file is
over 1 MiB, isn't UTF-8 text, or has no valid range.

> [!NOTE]
> A line with a bad time or action, or one overlapping an earlier line, is skipped and logged. At
> most 10000 ranges are read per file. Only `.edl` is supported, not Comskip's `.txt`. Times count
> from the start of the file, as in Kodi.

An EDL belongs to one encode. It travels with the video when Fliks moves or renames it (`.edl` is in
the default **Companion file extensions**), is removed when an import replaces the video, and is
deleted along with the video when you delete the file from disk, unless another video shares its name.

## See also

- [Subtitles](/features/subtitles) for search, sync, translation and appearance.
- [Streaming and transcoding](/features/streaming-and-transcoding) for how the quality you actually
  get is decided.
