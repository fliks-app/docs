---
title: Settings
description: A map of the admin area, section by section, with where each setting actually lives.
---

## Getting there

Open the user menu and pick **Administration**. The entry only shows up when your account has
`settings.access`, and never on a TV: the admin area isn't available there. These docs write
paths into it as **Settings > ...**, for example **Settings > Users**.

![The General page, with the administration sidebar on the left](/img/admin-general.webp)

The sidebar is organized into fixed sections, listed below in the order it shows them. A few items only appear once you hold the matching
permission (Users needs `users.manage`, Roles needs `roles.manage`, Subtitle activity needs
`media.read`), and an installed plugin that adds pages gets its own section at the bottom, named
after the plugin.

## System

| Page | What it's for |
|---|---|
| [Statistics](/administration/system#statistics) | The admin landing page: counts of movies, series and pending requests, disk space per library path, and subtitle totals (downloaded, failed, synced). |
| [System](/administration/system#system) | Three tabs. **Status**: server health (app version, uptime, database, running plugins), running and queued activity, **Trigger a task** (metadata refresh, subtitle search, download search, rescan, sprites, intros, backup and more), the task history, and a **Restart server** button when Fliks runs under a supervisor that can bring it back (Docker, for instance). **Backups**: see [Backups](/administration/backups). **Logs**: see [Logs and troubleshooting](/administration/logs-and-troubleshooting). |
| [Video activity](/administration/system#video-activity) | The live [Transcoding dashboard](/administration/transcoding-dashboard): who's watching what, and on which hardware path. |
| [Optimization queue](/administration/optimization#the-queue) | Running, waiting, failed and finished [optimization](#optimization) jobs, with an estimated end time and a **Pause the queue** button. |
| Playback quality | [Why a client stuttered](/administration/playback-quality): a verdict per playback, a timeline with the cause of each stall, and the two settings that turn collection on and set how long it is kept. |

## Settings

| Page | What it's for |
|---|---|
| [General](/administration/general-and-naming#general) | The setup checklist; the server name shown in client apps; the **Public address** Chromecast uses to reach streams (set it when Fliks sits behind a [reverse proxy](/install/reverse-proxy), leave it empty otherwise); the **Login user list**, which sets [who sees the account list on the login screen](/administration/users-and-permissions#login-user-list); metadata language and region; and import automation (detect intros and credits, generate seek thumbnails). |
| Libraries | Add, edit or remove libraries: a disk path, a media type, and who can access it. See [Libraries](/features/libraries). |
| [Naming](/administration/general-and-naming#naming) | The templates used to rename a file once it is grabbed and imported, per media type (movies, series, books, albums), with a live preview and clickable tokens. Only used when Fliks renames files. |
| [Outgoing mail](/administration/general-and-naming#outgoing-mail) | The SMTP account (host, port, security, sender, login, size limit) the server uses to send books to e-readers, with **Send test**. Leave it empty if you don't use that. |

The checklist at the top of **General** lists the usual first steps. Each row has a **Configure**
button, and the cross dismisses a step you don't need. See
[Which areas you can ignore](#which-areas-you-can-ignore).

## Media

Despite the name, most of this group is about *getting* media, not playing it.

| Page | What it's for |
|---|---|
| [Quality profiles](/administration/quality-profiles) | Which qualities are accepted when a release is downloaded, how they rank, the cutoff and whether upgrades are allowed. |
| [Language profiles](/administration/language-profiles) | Accepted audio languages for downloads, and the subtitle languages to fetch automatically. The subtitle part also drives [automatic subtitle search](/features/subtitles). |
| [Quality definitions](/administration/quality-definitions) | Size limits per quality, in MB per hour of content, shared by every profile. |
| [Custom formats](/administration/custom-formats) | Score points added to releases that match a pattern, applied to every profile, with a **Test a release title** box. |
| [Auto-approval](/administration/auto-approval) | Rules that approve a [request](/features/requests) without an administrator. |
| [Cleanup](/administration/library-cleanup) | Rules that flag and remove stale media. Destructive: read the page first. |
| [Metadata](/administration/metadata-settings) | The metadata providers installed (TMDB, TheTVDB, MusicBrainz, book sources and so on), the namespace each one owns, a **Configure** link where the provider has settings, and the order in which providers are asked for each kind of media. See [Metadata](/features/metadata). |
| [Downloads](/administration/downloads) | Provider order for automatic downloads and how often missing and upgradable titles are searched (default every 6 hours). Needs the download plugin, otherwise it says no download provider is installed. |
| [Lyrics](/administration/lyrics-and-karaoke#lyrics) | For music libraries: fetch lyrics automatically for every new track, the provider order, and whether fetched lyrics are written next to the track as `.lrc` files. |
| [Karaoke](/administration/lyrics-and-karaoke#karaoke) | For music libraries: separate the voice from a track and sync lyrics word by word. Holds the on/off switch, background preparation, a disk budget, the models to download and the detected acceleration. |

Quality profiles, quality definitions, custom formats, auto-approval and Downloads only matter once you
have installed the download plugin; language profiles also drive automatic subtitle search. See
[Requests](/features/requests) for how they fit together.

## Subtitles

| Page | What it's for |
|---|---|
| [Subtitles](/administration/subtitle-settings#subtitles) | Automatic subtitle search: search and upgrade intervals, minimum score, OCR of image tracks, automatic sync, and cleaning (hearing-impaired tags, custom exclusions). The **Statistics** and **Search** tabs show totals and a manual search. |
| [Subtitle providers](/administration/subtitle-settings#subtitle-providers) | Where subtitles come from: **Download providers** (OpenSubtitles, Subdl and others) and **Subtitle translation** engines. A walkthrough is in [First-day admin tasks](/administration/first-day-tasks#enable-a-subtitle-provider). |
| [Subtitle activity](/administration/subtitle-settings#subtitle-activity) | A log of what was found, downloaded, upgraded, synced or translated, and what failed, filterable by status and language. |

How subtitles are found and managed per title is in [Subtitles](/features/subtitles).

## Live TV

**Live TV** is one page with tabs for Sources, Channels, Guide, Settings, Access and Health,
fully covered in [Live TV](/features/live-tv).

## Integrations

| Page | What it's for |
|---|---|
| [Media servers](/administration/integrations#media-servers) | Notify another self-hosted media server pointed at the same files to refresh its own library when Fliks adds something new. |
| [Imports](/administration/integrations#imports) | A manual disk import (a folder outside any library is identified, then copied or moved into a library), plus importing watch history, requests or a library from the other tools you are migrating away from. |
| [Notifications](/administration/integrations#notifications) | Send events to Discord, Slack, ntfy, Gotify or a webhook. A walkthrough is in [First-day admin tasks](/administration/first-day-tasks#set-up-notifications). |

## Users

| Page | What it's for |
|---|---|
| Users | Accounts and their library access. See [Users and permissions](/administration/users-and-permissions). |
| Roles | Named sets of permissions. See [Roles and permissions](/administration/users-and-permissions#roles-and-permissions). |
| Single sign-on | Administrators only: OpenID Connect providers and the sign-in policy. See [Single sign-on](/administration/single-sign-on). |

## Optimization

Optimization re-encodes or remuxes library files in the background so they play without a
transcode, following a profile that describes the wanted state of the files. Each library picks
one profile, or none. The three pages are:

| Page | What it's for |
|---|---|
| [Profiles](/administration/optimization#profiles) | Create a profile from a preset. Fliks only creates a job when a file differs from it. |
| [Settings](/administration/optimization#settings) | A time window, what happens to the originals (move to the trash, keep as `.orig`, delete), trash retention, periodic re-verification, and how devices are shared with playback. |
| [Workers](/administration/optimization#workers) | The local engine, plus remote workers that connect with a token (shown once, stored hashed). Needs the **Public address** set on **General**. |

The queue itself is **System > Optimization queue**. These pages only show on servers recent
enough to support optimization.

## Advanced

![The Scheduled tasks list, with the interval, last run and next run of each job](/img/scheduled-tasks.webp)

| Page | What it's for |
|---|---|
| [Scheduled tasks](/administration/system#scheduled-tasks) | Every background job Fliks runs on a timer (the daily backup, metadata refresh, plugin source refresh, subtitle search and upgrade, library cleanup, Live TV refreshes, plus any job a plugin adds), with its schedule, last and next run, and a play button to run it now. Schedules are fixed; they can't be edited here. |
| [Streaming](/administration/streaming-settings) | Segment duration, encoding preset, automatic black bar cropping, HDR to SDR tone-mapping curve, transcode cache size limit and retention (plus a **Clear cache** button), concurrent background FFmpeg jobs, and what the "Auto" quality does (Direct Play first, or adaptive streaming first). See [Hardware acceleration](/install/hardware-acceleration) and [Streaming and transcoding](/features/streaming-and-transcoding). |
| [Remote engine](/administration/remote-engine) | Point the server at a streaming engine running elsewhere (URL, token, path mappings) and **Test connection**. Leave it empty to use the engine that ships with the server. |
| Plugins | Install, update and configure plugins. See [Plugins](/administration/plugins). |

## Which areas you can ignore

If you only want to watch files you already have, you can leave the download side alone:

- **Quality profiles, Quality definitions, Custom formats, Auto-approval and Downloads** only
  steer what is downloaded and who may request it. Nothing in playback reads them, and
  Downloads is empty until you install the download plugin.
- **Language profiles** only matter for downloads and for automatic subtitle search. Skip them if you
  add your own subtitle files or don't use subtitles.
- **Naming** only applies when Fliks renames or moves a file: a download, or a folder scan with
  **Move / rename according to the naming rules** ticked (it is by default). Untick it to leave
  your files where they are.
- **Cleanup** does nothing until you write a rule.
- **Optimization**, **Karaoke**, **Lyrics**, **Outgoing mail**, **Remote engine** and **Media
  servers** are opt-in.

The setup checklist on **General** still lists a quality profile and an auto-approval rule. Dismiss
them with the cross. What you do need: a [library](/features/libraries), a metadata provider
(installed by default), and optionally a subtitle provider and a non-admin
[user](/administration/first-day-tasks#create-a-user-and-give-access-to-a-library).

## See also

- [Environment variables](/install/environment-variables) for the handful of values that are set
  before the server starts, rather than from this area.
