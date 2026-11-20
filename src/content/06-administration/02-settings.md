---
title: Settings
description: An index of every Administration page, grouped as in the sidebar, with a link to the page that explains it.
---

> [!SUMMARY]
> Open the user menu, then **Administration**. Find the group below, then the row, then follow its link. If you only watch your own files, read [Which areas you can ignore](#which-areas-you-can-ignore).

## Getting there

The entry needs the `settings.access` permission and never shows on a TV. These docs write paths as **Settings > Users**. A plugin that adds pages gets its own group at the bottom.

![The General page, with the administration sidebar on the left](/img/admin-general.webp)

## System

| Entry | What it is |
|---|---|
| [Statistics](/administration/system#statistics) | Counts, disk space per library path and subtitle totals. |
| [System](/administration/system#system) | Server health, tasks to trigger, task history, [backups](/administration/backups) and [logs](/administration/logs-and-troubleshooting). |
| [Video activity](/administration/system#video-activity) | Who is watching what, on which hardware path: the [Transcoding dashboard](/administration/transcoding-dashboard). |
| [Optimization queue](/administration/optimization#the-queue) | Running, waiting and finished optimization jobs. |
| [Playback quality](/administration/playback-quality) | Why a client stuttered, with a verdict per playback. |

## Settings

| Entry | What it is |
|---|---|
| [General](/administration/general-and-naming#general) | Setup checklist, server name, **Public address**, login user list, metadata language, import automation. |
| [Libraries](/features/libraries) | Add, edit or remove libraries and who can access them. |
| [Naming](/administration/general-and-naming#naming) | Templates used to rename imported files. |
| [Outgoing mail](/administration/general-and-naming#outgoing-mail) | The SMTP account used to send books to e-readers. |

## Media

| Entry | What it is |
|---|---|
| [Quality profiles](/downloads/quality-profiles) | Accepted qualities, ranking, cutoff and upgrades for downloads. |
| [Language profiles](/downloads/language-profiles) | Audio and subtitle languages wanted, for downloads and subtitle search. |
| [Quality definitions](/downloads/quality-definitions) | Size limits per quality, shared by every profile. |
| [Custom formats](/downloads/custom-formats) | Score points for releases that match a pattern. |
| [Auto-approval](/downloads/auto-approval) | Rules that approve [requests](/downloads/requests) automatically. |
| [Cleanup](/administration/library-cleanup) | Rules that flag and remove stale media. Destructive. |
| [Metadata](/administration/metadata-settings) | Metadata providers and the order they are asked in. |
| [Downloads](/downloads/automatic-search) | Provider order and how often missing titles are searched. Needs the [Torrent manager](/downloads/plugin). |
| [Lyrics](/administration/lyrics-and-karaoke#lyrics) | Automatic lyrics for music libraries. |
| [Karaoke](/administration/lyrics-and-karaoke#karaoke) | Voice separation and word-by-word lyrics. |

## Subtitles

| Entry | What it is |
|---|---|
| [Subtitles](/administration/subtitle-settings#subtitles) | Automatic search, minimum score, OCR, sync and cleaning. |
| [Subtitle providers](/administration/subtitle-settings#subtitle-providers) | Where subtitles and translations come from. |
| [Subtitle activity](/administration/subtitle-settings#subtitle-activity) | Log of what was found, synced, translated or failed. |

How subtitles work per title is on [Subtitles](/features/subtitles).

## Live TV

| Entry | What it is |
|---|---|
| [Live TV](/features/live-tv) | One page with tabs: Sources, Channels, Guide, Settings, Access, Health. |

## Integrations

| Entry | What it is |
|---|---|
| [Media servers](/administration/integrations#media-servers) | Tell another media server to refresh when Fliks adds something. |
| [Imports](/administration/integrations#imports) | Disk import and migration from other tools. |
| [Notifications](/administration/alerts-to-services) | Alerts to Discord, Slack, ntfy or a webhook, and phone push. |

## Users

| Entry | What it is |
|---|---|
| [Users](/administration/users-and-permissions) | Accounts and their library access. |
| [Roles](/administration/users-and-permissions#roles-and-permissions) | Named sets of permissions. |
| [Single sign-on](/administration/single-sign-on) | OpenID Connect providers and the sign-in policy. |

## Optimization

| Entry | What it is |
|---|---|
| [Profiles](/administration/optimization#profiles) | The wanted state of files, created from a preset. |
| [Settings](/administration/optimization#settings) | Time window, what happens to originals, trash retention. |
| [Workers](/administration/optimization#workers) | The local engine and remote workers. |

## Advanced

| Entry | What it is |
|---|---|
| [Scheduled tasks](/administration/system#scheduled-tasks) | Every timed background job, with last and next run and a button to run it now. |
| [Streaming](/administration/streaming-settings) | Segments, preset, tone-mapping, transcode cache and "Auto" quality. See also [Hardware acceleration](/install/hardware-acceleration). |
| [Remote engine](/administration/remote-engine) | Use a streaming engine running elsewhere. |
| [Plugins](/administration/plugins) | Install, update and configure plugins. |

## Which areas you can ignore

If you only watch files you already have:

- **Quality profiles, Quality definitions, Custom formats, Auto-approval and Downloads** only steer downloads and requests. See [Downloads](/downloads/quality-profiles).
- **Language profiles** matter for downloads and automatic subtitle search only.
- **Naming** applies only when Fliks renames or moves a file. Untick **Move / rename according to the naming rules** on a folder scan to keep your files where they are.
- **Cleanup**, **Optimization**, **Karaoke**, **Lyrics**, **Outgoing mail**, **Remote engine** and **Media servers** are opt-in.

The setup checklist on **General** still lists a quality profile and an auto-approval rule: dismiss them with the cross. What you do need is a [library](/features/libraries), a metadata provider (installed by default), and optionally a subtitle provider and a non-admin [user](/administration/users-and-permissions#users).

## See also

- [Environment variables](/install/environment-variables) for values set before the server starts.
