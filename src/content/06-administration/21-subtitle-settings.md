---
title: Subtitle settings
description: The three administration pages for subtitles, field by field - Subtitles, Subtitle providers and Subtitle activity.
---

Three pages under the **Subtitles** group of the administration sidebar control how Fliks finds, downloads, cleans and translates subtitles. What a subtitle is, how scoring works and how to manage them per title is in [Subtitles](/features/subtitles); this page covers only the admin screens.

| Page | Needed to watch with subtitles? |
|---|---|
| **Subtitles** | No. The defaults work. Open it to change how often Fliks searches or how strict it is. |
| **Subtitle providers** | Only for automatic search and downloads. Without a provider Fliks still plays embedded and sidecar subtitles. |
| **Subtitle activity** | No. A history, for checking what happened. |

## Subtitles

**Settings > Subtitles** has two tabs, **Settings** and **Statistics**. Each card of **Settings** has no separate button: one **Save** at the bottom saves the whole page.

![The Search and Upgrade cards](/img/admin-subtitles-settings-1.webp)

### Search

| Field | Default | What it does |
|---|---|---|
| **Automatic subtitle search** | On | Master switch for the scheduled search and the search after an import. Off: subtitles are only fetched by hand. |
| **An image track counts as a present subtitle** | Off | An embedded image track (PGS, VobSub) in a profile language counts as covering that language, so no download or OCR runs for it. Playback of that track then needs a burn-in, which re-encodes every session and rules out Direct Play. |
| **Prefer OCR of embedded image tracks over a download** | Off | When a profile language is missing and an image track exists in it, convert that track to text by OCR instead of downloading. Applies to automatic and manual missing-subtitle searches. OCR is CPU-heavy and runs in the background; if it fails, the language falls back to the providers. |
| **Search interval (minutes)** | 360 | How often missing subtitles are searched for (6 hours). Accepts 30 to 1440. |
| **Minimum score** | 70 | A result must reach this score (0 to 100) to be downloaded automatically. |

### Upgrade

| Field | Default | What it does |
|---|---|---|
| **Upgrade interval (minutes)** | 720 | How often Fliks looks for a better subtitle (12 hours). Accepts 60 to 2880. |
| **Upgrade threshold** | 90 | A subtitle scoring below this is replaced when a better one is found. |

![The Post-processing and Cleaning cards](/img/admin-subtitles-settings-2.webp)

### Post-processing and cleaning

| Field | Default | What it does |
|---|---|---|
| **Automatically sync subtitles (ffsubsync/alass)** | Off | Runs the sync tool on each subtitle after it is downloaded, to line it up with the audio. See [Fixing out-of-sync subtitles](/features/subtitles#fixing-out-of-sync-subtitles). |
| **Remove HI tags ([music], (sigh), ♪, etc.)** | Off | Strips hearing-impaired annotations from downloaded text. |
| **Custom exclusions (regex)** | Empty | One regular expression per line. A subtitle line matching one is removed, handy for advertisements. |

The profile languages that decide *which* languages are searched come from the library's language profile, see [Libraries](/features/libraries).

### Statistics tab

![The Statistics tab](/img/admin-subtitles-stats.webp)

It shows **Total subtitles**, **Missing**, a count per status (downloaded, synced, upgraded, failed, embedded) and, once providers have answered, **By provider**. **Missing subtitles** lists every file lacking a profile language, with a **Forced** badge where it applies and a magnifier button that searches for that one row now (a toast tells you whether a subtitle was found above the minimum score).

## Subtitle providers

The page has two cards: **Subtitle translation** and **Download providers**.

![The Subtitle providers page](/img/admin-subprov-page.webp)

### Add a download provider

:::steps
![Open **Subtitles > Subtitle providers**](/img/admin-subprov-1-sidebar.webp)
![Under **Download providers**, click **Add provider**](/img/admin-subprov-2-add.webp)
![Choose the **Provider type**, fill its fields, press **Test**, then **Save**](/img/admin-subprov-3-form.webp)
:::

| Field | Meaning |
|---|---|
| **Name** | Filled with the provider type's name; rename it freely. |
| **Provider type** | OpenSubtitles, Subdl, Subsynchro, Supersubtitles, YIFY (yts-subs.com) or Gestdown (Addic7ed mirror). |
| **Username** and **Password** | OpenSubtitles only. |
| **API Key** | Subdl only. |
| **Test** | Checks the credentials. Answers **Connection successful.** or **Connection failed.** |
| **Priority** | Default 25. Providers are asked in ascending order: the lowest number first. |
| **Enabled** | On by default. |

Subsynchro, Supersubtitles, YIFY and Gestdown need no credentials.

![The OpenSubtitles form](/img/admin-subprov-opensubtitles.webp)

The list has the columns **Name**, **Type**, **Priority** and **Active** (a switch). A provider that answered with a rate limit shows a **Rate-limited** badge with a delay: requests resume by themselves. Each row has **Stats** (the last 30 days: date, queries, average time, results, errors), **Edit** and **Delete**.

### Translation

Translation turns an existing text subtitle into another language and adds the **Translate** action in the subtitle dialog. See [Translating a subtitle](/features/subtitles#translating-a-subtitle).

| Control | Meaning |
|---|---|
| **Enable translation** | Master switch. Off by default. |
| **Max parallel** | How many translations run at once, at least 1. Default 1. |
| **Add provider** | Opens **New translation provider**. |

In the dialog:

| Field | Meaning |
|---|---|
| **Name**, **Engine** | **Gemini**, **OpenAI-compatible** (Groq, OpenRouter, Ollama and similar) or **LibreTranslate** (self-hosted). |
| **Gemini API key**, **Model** | Gemini engine. The model field is prefilled with `gemini-3.5-flash-lite`. |
| **Base URL** | OpenAI-compatible engine. Examples are shown under the field for Groq, OpenRouter and Ollama. |
| **API key (optional)** | OpenAI-compatible and LibreTranslate engines. |
| **Server URL** | LibreTranslate, for example `http://libretranslate:5000`. |
| **Max tokens per request** | Prompt and reserved answer together. 0 uses the model maximum; a value under 2048 is raised to 2048. Not shown for LibreTranslate. |
| **Tokens per minute** | Requests wait so this budget is never exceeded. 0 turns pacing off. Not shown for LibreTranslate. |
| **Enabled**, **Use as default** | The default engine is used when several are enabled. |
| **Test** | Checks the engine before saving. |

![A Gemini translation provider](/img/admin-subtitle-translation-gemini.webp)

## Subtitle activity

**Subtitles > Subtitle activity** is a history of what Fliks did with subtitle files. Only accounts with the media read permission see the entry.

![The Subtitle activity page](/img/admin-subtitle-activity.webp)

Two filters sit at the top: **All statuses** (**Downloaded**, **Upgraded**, **Synced**, **Failed**) and **All languages**. Rows show the media, language, provider, score, status and flags, and a failed row carries the error behind the failure. A run cut short by a server restart is reported as interrupted. The page is empty (**No subtitle history.**) until the first search ran.

## See also

- [Subtitles](/features/subtitles) for the feature, the title-page dialog and scoring.
- [First-day admin tasks](/administration/first-day-tasks#enable-a-subtitle-provider) for a short provider walkthrough.
- [Scheduled tasks and System](/administration/system#scheduled-tasks): **Search for missing subtitles** and **Upgrade subtitle quality** run from there too.
