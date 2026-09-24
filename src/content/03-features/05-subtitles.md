---
title: Subtitles
description: Automatic subtitle search across six providers, one-click sync, on-demand translation, and OCR for image-based tracks.
---

## How automatic search works

Fliks searches for subtitles on its own for every monitored title, using the language, forced and
hearing-impaired preferences set on that title's **language profile** (not a global setting: each
library has a default profile, and each title can use its own). A search runs automatically after
a file is imported, and again on a recurring schedule for anything still missing a language its
profile asks for; both can be turned off. A **Search missing** button on the media page also runs
it on demand, and the per-row **Search** action ignores the schedule entirely.

### Providers

Six sources can be searched, each turned on and given a priority under **Settings > Subtitle
providers > Download providers**. A lower priority number is tried first, and wins if two providers
return what looks like the same result.

| Provider | Covers | Credentials needed |
|---|---|---|
| OpenSubtitles | Movies and episodes, most languages | Username and password (an API key is optional) |
| Subdl | Movies and episodes, most languages | An API key |
| Gestdown (an Addic7ed mirror) | TV episodes only, a fixed set of languages | None |
| Supersubtitles | Movies and episodes, Hungarian and English only | None |
| YIFY | Movies only | None |
| Subsynchro | Movies only, French only | None |

### Picking the right match

Every result is scored against the video file: a hash of the file itself is worth the most (a hash
match is treated as a certain match), and the title, year, release group, source and codecs each
add a little more. Episodes are scored the same way, with the series name and season/episode
numbers standing in for the movie-specific fields. The best-scoring result above a minimum score
(70 by default) is downloaded automatically.

A separate upgrade pass revisits anything downloaded below a higher threshold (90 by default) and
replaces it if a strictly better match turns up later. A subtitle you've manually synced,
translated or marked as **Validated** is locked and skipped by the upgrade pass from then on.

Downloaded files are always cleaned of ads; optionally (see settings below) also of hearing-impaired
tags and of your own custom exclusion patterns.

## Searching and downloading by hand

From a title's page, open **Edit subtitles** for the full list of what's already there, plus a
**Search** button to browse and download something specific yourself, and an **Import** button to
upload your own file (`.srt`, `.ass`, `.ssa`, `.vtt`, `.sub` and a few others).

## Fixing out-of-sync subtitles

A subtitle that drifts against the dialogue can be corrected without hunting for the right offset
by hand: open its row's **Actions > Timing > Sync**. Fliks listens to the audio (or another
subtitle track you point it at) and slides the whole file back onto it, using
[ffsubsync](https://github.com/smacke/ffsubsync) first and falling back to
[alass](https://github.com/kaegi/alass) if that doesn't work. Options in the same dialog: a maximum
offset in seconds, whether to also let it correct a framerate mismatch, and a slower, more accurate
search mode.

If you already know the fix, **Adjust timing** shifts a subtitle by a fixed amount, and **Change
framerate** rescales it between two frame rates. Embedded subtitle tracks can't be synced or
adjusted directly: extract or download one first.

> [!TIP]
> Turn on **Automatically sync subtitles** in the subtitle settings and every new automatic
> download or upgrade gets this treatment on its own.

## Translating a subtitle

When nothing is available in a language you want, translate a track you do have instead: open its
**Actions > Translate**, choose the target language, and (if more than one translation provider is
configured) which one to use. The result is saved next to the video as its own file, so the same
translation is never paid for or re-run automatically; running it again for the same language
creates a separate copy rather than replacing the first.

Three kinds of translation engine are supported, configured under **Settings > Subtitle providers >
Subtitle translation**, and you can enable more than one and set a default:

| Engine | What it needs |
|---|---|
| Gemini | An API key, and a model (defaults to a small, fast one) |
| OpenAI-compatible | A base URL and a model; works with Groq, OpenRouter, a local Ollama, or any compatible endpoint. The API key is optional, for setups that don't need one. |
| LibreTranslate | A server URL; the API key is optional |

Each provider has a **Test** button that sends a couple of short lines through it before you rely on
it. Credentials are stored on the server and are never sent back to the client once saved: the
settings page always shows a masked field, with the choice to leave it as-is or clear it.

> [!NOTE]
> Translation only runs when you ask for it. Nothing is translated automatically in the background.

## Extracting text from image-based subtitles

A track like PGS or VobSub is a picture of the text, not the text itself, so it can't be edited,
translated, or displayed on every client. **Extract to text (OCR)** reads the images and produces a
normal, editable subtitle file from them.

- **PGS** tracks (common in Blu-ray rips) and **VobSub / DVD** tracks (VobSub needs a Matroska
  file) are supported. DVB subtitles and XSub are not: OCR isn't offered for them.
- Only a track embedded in the video file can be OCR'd, not a separate image subtitle file.
- If the track's language isn't tagged, you're asked for it before the OCR runs; it can be
  relabelled afterwards without redoing the work.
- An admin can turn on **Prefer OCR of embedded image tracks over a download**, so Fliks tries this
  before searching online for a missing language.

## Subtitle appearance

**Settings > Playback > Subtitles** controls how subtitles look, and this is remembered per device
rather than following your account to every screen:

| Setting | Options |
|---|---|
| Preferred language | Any language |
| Subtitle mode | Off, forced only, smart (matches your audio language), always |
| Hearing-impaired subtitles | Avoid, no preference, prefer |
| Text size | Very small to extra large |
| Text colour | White, yellow, green, cyan |
| Outline style | None, drop shadow, outline, raised |
| Background | Transparent, semi-transparent, solid black |
| Vertical position | Adjustable top and bottom margins |
| Remember my track choice per show | On or off |
| Hide image-based subtitles | Keeps PGS/VobSub tracks out of the picker on this device |

> [!NOTE]
> None of this changes how an ASS/SSA subtitle that carries its own styling is rendered, or how an
> image-based track looks: those keep their original appearance.

## Admin settings

**Settings > Subtitles** groups the tuning knobs behind the behaviour above:

| Setting | Default | What it does |
|---|---|---|
| Automatic subtitle search | On | Master switch for the scheduled and post-import search |
| Search interval | 360 minutes | How often the scheduler re-checks for missing languages |
| Minimum score | 70 | The score a result needs to be downloaded automatically |
| Upgrade interval | 720 minutes | How often the upgrade pass runs |
| Upgrade threshold | 90 | Below this score, a strictly better match replaces what's there |
| An image track counts as present | Off | Whether an embedded image subtitle already satisfies a profile's language, skipping a text search for it |
| Prefer OCR over a download | Off | Tries OCR on an embedded image track before searching online |
| Automatically sync subtitles | Off | Runs the sync tool after every automatic download or upgrade |
| Re-encode to UTF-8 after download | On | Normalizes the file's text encoding |
| Remove hearing-impaired tags | Off | Strips things like `[music]` or `(sighs)` from downloaded text |
| Delete the image track once extracted | Off | Removes the OCR'd track's database entry (the track itself stays in the video file and reappears on the next scan) |
| Custom exclusions | None | Your own regular expressions to strip from downloaded subtitles |

The same page's **Statistics** tab lists every language still missing a subtitle across your
library, with a one-click search for each row. **Settings > Subtitles activity** is a searchable
history of every subtitle file Fliks has downloaded, translated or OCR'd, with its score and
status.

## See also

- [Playback](/features/playback) for how a subtitle track is picked when you press play.
- [Libraries](/features/libraries) for language profiles, which decide what gets searched for.
