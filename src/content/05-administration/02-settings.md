---
title: Settings
description: A map of the admin area, section by section, with where each setting actually lives.
---

## Getting there

Settings is admin-only, reached through the user menu once your account has `settings.access`.
It's organized into fixed sections in the sidebar; a few items only appear once you hold the
matching permission (Users needs `users.manage`, Roles needs `roles.manage`), and an installed
plugin adds its own section at the bottom, named after the plugin.

## System

| Page | What it's for |
|---|---|
| Statistics | Library counts, pending requests, disk space: the admin landing page. |
| System | Server health (app version, uptime, database status, installed plugins), running/queued activity, [Backups](/administration/backups), and [Logs](/administration/logs-and-troubleshooting). |
| Video activity | The live [Transcoding dashboard](/administration/transcoding-dashboard): who's watching what, and on which hardware path. |

## Settings

| Page | What it's for |
|---|---|
| General | Server name, the public URL used behind a reverse proxy (see [Reverse proxy](/install/reverse-proxy)), metadata language and region, and the setup checklist. |
| Libraries | Add, edit or remove libraries: a disk path, a media type, and who can access it. See [Libraries](/features/libraries). |
| Naming | The template used to rename a file once it's grabbed and imported. |

## Media

Quality profiles, language profiles, quality definitions (size limits per quality, in MB per
hour of content, shared across every profile), custom formats (scoring rules layered on a
profile), and auto-approval rules all live here. They only matter once you've installed the
download plugin; see [Requests](/features/requests) for how they fit together end to end.

## Subtitles

Subtitle search settings, subtitle providers (including translation sources), and subtitle
activity (a log of what was found, downloaded, synced or translated, and what failed). See
[Subtitles](/features/subtitles).

## Live TV

One page, six tabs (Sources, Channels, Guide, Settings, Access, Health), fully covered in
[Live TV](/features/live-tv).

## Integrations

| Page | What it's for |
|---|---|
| Media servers | Notify another self-hosted media server pointed at the same files to refresh its own library when Fliks adds something new. |
| Imports | A manual disk (re)scan tool, plus importing watch history and pending requests from another self-hosted media server or request manager you're migrating away from. |
| Notifications | Send events (new downloads, failures, and so on) to Discord, Slack, ntfy or a similar service. |

## Users

[Users and permissions](/administration/users-and-permissions): accounts, roles, and library
access.

## Advanced

| Page | What it's for |
|---|---|
| Scheduled tasks | Every background job Fliks runs on a timer (metadata refresh, backups, update checks…), with a manual "run now" per job. |
| Streaming | Segment duration, tone-mapping algorithm and curve, transcode cache budget and retention, background FFmpeg job count, GPU selection on a multi-GPU host, and the Auto-quality behavior (Direct Play first vs. always adaptive). See [Hardware acceleration](/install/hardware-acceleration) and [Streaming and transcoding](/features/streaming-and-transcoding). |
| Plugins | Install, update and configure plugins. See [Plugins](/administration/plugins). |

## See also

- [Environment variables](/install/environment-variables) for the handful of values that are set
  before the server starts, rather than from this area.
