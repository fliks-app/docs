---
title: Subtitles
description: Automatic subtitle search across six providers, one-click sync, live resync in the player, on-demand translation, OCR and burn-in for image-based and styled tracks.
---

> [!SUMMARY]
> Open a title (an episode, for a series), then **More** > **Edit subtitles** to search, import, sync or translate its subtitles. Fliks also searches on its own once a subtitle provider is added in **Settings > Subtitle providers**.

## Managing subtitles from the title page

All subtitle files of a title are managed in one dialog, **Edit subtitles**, on the title page. It
lists every track with its language, file, provider, score and flags. **Search**, **Import** and the
row actions need the permission to manage subtitles.

The player picks tracks and resyncs live: see [Subtitles in the player](/player/subtitles-and-audio#subtitles-in-the-player).

:::steps
![Open the title (a movie, or an episode of a series) from the library](/img/player-detail-page.webp)
![Open the **More** menu (three dots) and choose **Edit subtitles**](/img/player-detail-more-menu.webp)
![The **Edit subtitles** dialog opens, with one row per track. Press **Actions** at the end of a row](/img/player-subtitles-dialog.webp)
![The row menu: **View**, **Download**, **Translate**, **Change language**, **Timing**, **Corrections** and **Delete** on an imported file](/img/player-subtitles-row-actions.webp)
![Press **Search**, choose a language and press **Search** again to look on the subtitle providers](/img/player-subtitles-search.webp)
:::

On a phone:

On the title page, tap the three dots at the top right and choose **Edit subtitles**. The dialog opens: scroll it sideways to reach the **Actions** column.

![Three dots, Edit subtitles, then the Actions column](/img/player-phone-detail-anim.webp)

For a series, open the episode first: subtitles belong to one file, so **Edit subtitles** is on
the page of an episode, not on the series page.

| You want to | Do this |
|---|---|
| Download a subtitle | **Search**, pick the language, then download the result you want. Needs a provider, set up in **Settings > Subtitle providers**. |
| Use your own file | **Import**, see [Importing your own file](#importing-your-own-file). |
| Fix a subtitle that drifts | [Sync or shift it](#fixing-out-of-sync-subtitles). |
| Translate | [Translate it](#translating-a-subtitle). |
| Remove one | **Actions**, then **Delete**. **Blacklist** on a downloaded file also stops the same result from coming back. An embedded track cannot be deleted. |
| Look for every missing language | **Search missing**, shown when the language profile asks for a language with no subtitle yet. |

### Importing your own file

Use **Import** when you already have a subtitle file, for example one you wrote or downloaded by hand.

:::steps
![In **Edit subtitles**, press **Import**](/img/subtitles-import-1.webp)
![Pick the **Language**, set **Forced** or **Hearing-impaired** if they apply, and choose the file. Then press **Import**](/img/subtitles-import-2.webp)
![A **Subtitle uploaded** message appears and the file gets its own row, with **disk** as its provider](/img/subtitles-import-3.webp)
:::

Fliks stores the file next to the video, named after it with the language code (for example
`Movie (2010).en.srt`). It is a normal subtitle: it can be synced, shifted, translated and deleted.

### Actions on a file

:::details What each action does
**Actions** at the end of a row opens the menu for that file. What it offers depends on where the
file comes from.

| Action | What it does | Offered on |
|---|---|---|
| **View** | Lists the cues with their start and end times | Every text row |
| **Download** | Saves the file to your computer (needs the download permission) | Every text row |
| **Translate** | Creates a copy in another language, see [Translating a subtitle](#translating-a-subtitle) | Every text row |
| **Change language** | Changes the language the file is filed under | Downloaded, imported and translated files |
| **Timing** | **Sync**, **Adjust timing** and **Change framerate**, see [Fixing out-of-sync subtitles](#fixing-out-of-sync-subtitles) | Downloaded, imported and translated files |
| **Corrections** | One-click clean-ups of the text | Downloaded, imported and translated files |
| **Validate** | Marks the file as correct, which sets its score to 100 | Files with a score below 100 |
| **Blacklist** | Deletes the file and stops the same result from being downloaded again | Files downloaded from a provider |
| **Delete** | Removes the file from the disk | Downloaded, imported and translated files |
:::

## Fixing out-of-sync subtitles

Works on downloaded and imported files. Embedded tracks cannot be synced: download or import a separate file first.
While the video plays, use the [synchronize panel of the player](/player/subtitles-and-audio#fix-the-timing-while-you-watch) instead.

### Sync automatically

Open the row's **Actions > Timing > Sync**. Fliks listens to the audio (or another subtitle track
you point it at) and slides the whole file back onto it, using
[ffsubsync](https://github.com/smacke/ffsubsync) first and falling back to
[alass](https://github.com/kaegi/alass) if that doesn't work.

:::steps
![Open **Actions > Timing** on the file and choose **Sync**](/img/subtitles-sync-1.webp)
![In **Sync options**, leave **Reference** on the default (the audio of the video file) and press **Sync**](/img/subtitles-sync-2.webp)
![The row shows **Sync in progress** while the file is processed](/img/subtitles-sync-3.webp)
![A **Subtitle synced successfully** message appears when it is done](/img/subtitles-sync-4.webp)
:::

:::details Every option of the sync dialog
The options in **Sync options**:

| Option | Meaning |
|---|---|
| **Reference** | What the file is lined up against. The default is **Default: automatic from the video file**, which uses the audio. The list also offers each audio track, each embedded subtitle track and the other subtitle files of the title: pick one that is already in step with the picture. |
| **Max offset (seconds)** | The largest shift the search may apply. 60 by default. Leave it empty for no limit. |
| **Do not fix the framerate** | Stops the sync from also correcting a framerate mismatch. |
| **Golden-Section Search** | A slower, more accurate search. |
:::

The result replaces the file. The cue list of an English subtitle that was 2.5 seconds late looks
like this before and after a sync (open it with **Actions > View**):

:::steps
![Before: the first line starts at 1:49, 2.5 seconds after the dialogue](/img/subtitles-sync-before.webp)
![After: the same line starts at 1:47, on the dialogue](/img/subtitles-sync-after.webp)
:::

On a film with long silent stretches, pick a subtitle track that is already in step as the **Reference**.

### Shift by a fixed amount

If you already know the offset, use **Actions > Timing > Adjust timing**. Enter minutes, seconds and
milliseconds: a positive value delays every cue, a negative one advances them.

:::steps
![Open **Actions > Timing** on the file and choose **Adjust timing**](/img/subtitles-adjust-1.webp)
![Enter the shift (here minus 2 seconds and minus 500 milliseconds) and press **Adjust timing**](/img/subtitles-adjust-2.webp)
![The cues now start 2.5 seconds earlier: the first line is at 1:47](/img/subtitles-adjust-3.webp)
:::

**Change framerate**, in the same **Timing** menu, rescales a subtitle between two frame rates, for
a file made for a video with another framerate. The **Corrections** menu next to **Timing** has
one-click clean-ups (remove HI tags, style tags or emojis, common fixes, convert to SRT).

Turn on **Automatically sync subtitles** in **Settings > Subtitles** to sync every new download on its own.

## Translating a subtitle

When nothing is available in a language you want, translate a track you do have instead. Nothing
shows up until an admin has turned translation on and added an engine, see
[Setting up a translation engine](/administration/subtitle-settings#translation).

:::steps
![Open **Actions** on the text subtitle to translate and choose **Translate**](/img/subtitles-translate-1.webp)
![Choose the **Target language** and press **Translate**. With several engines set up, a provider picker appears too](/img/subtitles-translate-2.webp)
![A message says the translation started. The new row shows the engine's name as its provider and a progress bar](/img/subtitles-translate-3.webp)
![When the bar is gone the new language has its own row, with its own file](/img/subtitles-translate-4.webp)
:::

This works on any text subtitle, embedded ones included. It runs in the background, so you can close the
dialog, and the result is saved next to the video as its own file (for example `Movie (2010).fr.srt`). An image-based
track must go through [OCR](#extracting-text-from-image-based-subtitles) first.

![The translated French file, listed with its cues](/img/subtitles-translate-5.webp)

:::details Translation engines, cost, privacy and quality
Three kinds of translation engine are supported. They are configured under **Settings > Subtitle
providers > Subtitle translation** (**Add provider**), and you can add more than one and pick a
default with **Use as default**:

| Engine | What it needs |
|---|---|
| Gemini | An API key, and a model (defaults to a small, fast one) |
| OpenAI-compatible | A base URL and a model; works with Groq, OpenRouter, a local Ollama, or any compatible endpoint. The API key is optional, for setups that don't need one. |
| LibreTranslate | The URL of your own LibreTranslate server; the API key is optional. Free and local, but it translates cue by cue without context |

The LLM engines (Gemini and OpenAI-compatible) also take a **Max tokens per request** and a **Tokens per minute** budget, so a
free-tier API isn't pushed past its rate limit. Field by field, with the local LibreTranslate walkthrough, this is in
[Setting up a translation engine](/administration/subtitle-settings#translation).

### Cost and quality

- **Cost.** Gemini and hosted OpenAI-compatible services bill by the token, or limit a free tier. A
  feature film has well over a thousand cues. LibreTranslate and a local Ollama model cost nothing but
  your own hardware.
- **Privacy.** The text of the subtitle is sent to the engine. A hosted service sees it; a
  LibreTranslate or Ollama server on your own network does not leave it.
- **Quality.** The LLM engines translate batches of cues, are given the title, genres and synopsis as context and,
  for languages that have one (French, German, Spanish, Italian, Portuguese, Dutch, Russian),
  keep a consistent informal or formal form of address. LibreTranslate translates chunks of 25 cues
  with no context and no such choice: expect plainer, more literal lines. Read a translation
  before you rely on it.

![The New translation provider dialog, with the Gemini engine and the gemma-4-26b-a4b-it model selected](/img/admin-subtitle-translation-gemini.webp)

> [!TIP]
> The Gemini engine also runs Google's open Gemma 4 model: pick `gemma-4-26b-a4b-it` from the
> **Model** list. It runs through the Gemini API free of charge, with the same API key from [Google
> AI Studio](https://aistudio.google.com/), but it has no paid tier: it stays on the free tier's rate
> limits, and Google may use free-tier requests and responses to improve its products, with human
> reviewers reading some of them. Use a Gemini model on a paid (billed) API key instead if that
> matters to you.

When the source track is flagged hearing-impaired, the translate dialog shows a **Remove
hearing-impaired annotations** switch. It strips cues such as `[door creaks]` or `(SIGHS)` from the
translated result once the run finishes, even if you closed the dialog, and the translated file is
then no longer flagged hearing-impaired. The switch is remembered in your browser. The server-wide
**Remove HI tags** setting (see [Admin settings](#admin-settings)) does the same for every
translation.
:::

## Extracting text from image-based subtitles

:::details What OCR supports
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
:::

## Burned-in subtitles

Some subtitles can't be shown as plain text on every client. For those, the server draws the
subtitle into the video itself. The video then plays through a transcode, and the stream reloads
when you pick or drop such a track.

:::details Which clients burn in which tracks
- **Image tracks** (PGS, VobSub, DVB, XSub). The desktop app, Android and Android TV draw an
  embedded image track themselves when the video Direct Plays. The web client, iPhone and iPad,
  Samsung, LG and Chromecast always get it burned in, and so does a separate image file on every
  client (a `.sup`, or a VobSub `.idx` and `.sub` pair next to the video). Apple TV burns in an
  image track only when it picks it automatically at playback start, from your preferred language
  and mode, when the file has no text track in that language. Its player menu lists text tracks
  only, and the app has no **Hide image subtitles** setting.
- **Styled ASS/SSA tracks.** Only the desktop app draws the track's own fonts, colors and
  positions. The web, mobile, Android TV, Samsung, LG and Chromecast clients get the track burned
  in so it keeps that styling; as plain text it would lose it. Apple TV always plays it as plain
  text.

A styled track you pick yourself from the menu is burned in. One chosen automatically when
playback starts (your preferred language, or a remembered choice) starts as plain text, so the
video doesn't reload at launch.
:::

Both cases need **Hide image subtitles** (in **App settings > Subtitles**, see [Change how subtitles look](/player/subtitles-and-audio#change-how-subtitles-look)) turned
off. It is on by default: image tracks then stay out of the picker, and styled ASS/SSA plays as
plain text.

## How automatic search works

Fliks searches for subtitles on its own for every monitored title, using the language, forced and
hearing-impaired preferences set on that title's **language profile** (not a global setting: each
title has its own, picked when it's added). A search runs automatically after a file is imported,
and again on a recurring schedule for anything still missing a language its profile asks for; the
**Automatic subtitle search** switch in **Settings > Subtitles** turns both off, along with the
upgrade pass below. **Search missing** in a title's **Edit subtitles** dialog runs it on demand,
whatever the schedule says.

### Providers

Six sources can be searched. None is set up out of the box: add each one you want with **Add
provider** under **Settings > Subtitle providers > Download providers**, where it can also be
switched off and given a priority (25 by default). A lower priority number is tried first, and wins
if two providers return what looks like the same result. **Test** checks the credentials before you
save.

:::details The six providers and what they need
| Provider | Covers | Credentials needed |
|---|---|---|
| OpenSubtitles | Movies and episodes, most languages | An OpenSubtitles account username and password (an API key is optional) |
| Subdl | Movies and episodes, most languages | An API key |
| Gestdown (an Addic7ed mirror) | TV episodes only, a fixed set of languages | None |
| Supersubtitles | Movies and episodes, Hungarian and English only | None |
| YIFY | Movies only, looked up by IMDb id | None |
| Subsynchro | Movies only, French only | None |
:::

### Picking the right match

:::details How a result is scored and upgraded
Every result is scored against the video file: a hash of the file itself is worth the most (a hash
match is treated as a certain match), the title and year carry most of the rest, and the release
group, source, resolution and codecs each add a little more. Episodes are scored the same way,
with the series name and season/episode numbers standing in for the movie-specific fields. The
best-scoring result above a minimum score (70 by default) is downloaded automatically.

A separate upgrade pass revisits anything downloaded below a higher threshold (90 by default) and
replaces it if a strictly better match turns up later. A subtitle you've synced or edited by hand
(timing, framerate, corrections) is locked and skipped by the upgrade pass from then on, and
**Validate subtitle** sets a subtitle's score to 100, which keeps it above any threshold. A
translation keeps its source's score and isn't locked.

Downloaded files are always cleaned of ads; optionally (see settings below) also of hearing-impaired
tags and of your own custom exclusion patterns.
:::

## Admin settings

Search interval, minimum score, upgrades, automatic sync and HI-tag removal are set in
**Settings > Subtitles**: see [Subtitle settings](/administration/subtitle-settings).

## See also

- [Audio and subtitles](/player/subtitles-and-audio) for choosing a track, appearance and live resync in the player.
- [Playback](/features/playback) for resume and the other server-side playback behaviour.
- [Libraries](/features/libraries) for language profiles, which decide what gets searched for.
