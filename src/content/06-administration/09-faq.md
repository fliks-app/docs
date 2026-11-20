---
title: FAQ
description: Honest answers to the questions self-hosters ask most often.
---

> [!SUMMARY]
> Short answers to the questions self-hosters ask most, each with the fix and a link to the full page. Looking for a symptom (nothing shows up, no subtitles, buffering)? The headings below are written the way you would search for them.

## Setup

### Do I need Docker?

No. Docker is recommended, but native builds exist for [Windows](/install/windows) and [macOS](/install/macos), and you can [build it from source](/install/from-source).

### I forgot the admin password and it's my only admin account. What now?

There is no "forgot password" flow. Another account with `users.manage` and `settings.access` can set you a new password in **Settings > Users**. A [backup](/administration/backups) holds the same password, so it won't help.

:::details With no other admin: write a new password hash into the database
On the Docker setup from [Docker](/install/docker), open the database with `docker compose exec postgres psql -U fliks -d fliks`, then run this with your username and a temporary password. `pgcrypto` produces the bcrypt hash and the last line removes it again:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
UPDATE users SET "passwordHash" = crypt('temporary-password', gen_salt('bf', 12)), "requirePasswordChange" = true WHERE username = '<username>';
DROP EXTENSION pgcrypto;
```

Log in with the temporary password; Fliks asks you to pick a new one straight away.
:::

### Nothing shows up after I add a library. Is it broken?

Check in this order:

1. The library path must exist **inside** the server (the container path such as `/medias/movies`, not the host one).
2. Fliks doesn't watch the folder: click **Scan the folder** on the library's **Medias** tab in **Settings > Libraries**. See [Finding media in the folder](/features/libraries#finding-media-in-the-folder).
3. Episodes need their own folder, the scan reads three levels deep, and `Title Part 2` is taken for an episode.
4. A non-admin only sees the libraries ticked on its page: [Users and permissions](/administration/users-and-permissions).
5. A large first import takes a while: watch **Settings > System > Status**. A file that can't be matched still appears, unidentified: use **Identify**.

![The Trigger a task row on System, with the Rescan menu open](/img/admin-system-rescan.webp)

### My titles have no posters or descriptions

Artwork comes from the metadata provider plugins and needs internet access. Check in **Settings > Plugins** that TMDB is installed and running, then run **Settings > System > Trigger a task > Metadata > Reload missing metadata**. Wrong language: change **Metadata language** in **Settings > General**. An unidentified title has none: use **Identify**.

### Subtitles are missing

1. Add a download provider in **Settings > Subtitle providers** (a fresh install has none): [walkthrough](/administration/first-day-tasks#enable-a-subtitle-provider).
2. Automatic search covers the languages of the title's language profile: [Subtitles](/features/subtitles).
3. Run **Settings > System > Trigger a task > Subtitles > Search for missing subtitles**, then read **Settings > Subtitle activity** for failures.
4. Or search and upload from the subtitles dialog of a title.

### Playback buffers or stutters

1. **Settings > Playback quality** gives each stall a verdict and a cause: [Playback quality](/administration/playback-quality).
2. A CPU transcode on a small machine is the usual cause: see the [Transcoding dashboard](/administration/transcoding-dashboard) and [Hardware acceleration](/install/hardware-acceleration).
3. On a slow link, pick a lower quality in the player, or set **Settings > Streaming > "Auto" quality behavior** to adaptive streaming.
4. A media folder on a slow network share stalls reads whatever the CPU does.

### Do I need quality profiles, auto-approval and the other download settings?

Not to play files you already have. See [Which areas you can ignore](/administration/settings#which-areas-you-can-ignore).

### Where is the setting for X?

See the [map of the admin area](/administration/settings) or the [first-day walkthroughs](/administration/first-day-tasks).

### Does Fliks need internet access to work?

Only for metadata (TMDB, TVDB), the optional update check ([Updating](/install/updating)) and plugin catalogs. Playback and transcoding work on your network without it.

## Playback and transcoding

### Why is Fliks transcoding instead of playing the file directly?

The device can't decode the file's codec, container or bitrate as-is. The [Transcoding dashboard](/administration/transcoding-dashboard) shows the reason for a live stream; [Streaming and transcoding](/features/streaming-and-transcoding) explains Direct Play, Direct Stream and Transcode.

### My GPU isn't being used for transcoding

Fliks only uses a hardware path it tested successfully at startup. Look for `HW accel test passed` or `HW accel test failed` in the server log, then see [Hardware acceleration](/install/hardware-acceleration) for what each vendor needs.

### Does Fliks support 4K and HDR?

Yes. Direct Play and Direct Stream pass HDR through; for a screen that can't show it, HDR10, HLG and Dolby Vision are tone-mapped to SDR. An HDR-preserving transcode needs HEVC on Intel QSV or NVIDIA NVENC, or AV1 on NVENC. See [HDR and Dolby Vision](/features/streaming-and-transcoding#hdr-and-dolby-vision).

## Accounts and access

### Can I give someone access to only some of my libraries?

Yes, per user, independent of the role: [Users and permissions](/administration/users-and-permissions).

### Can non-admin users request new content?

Yes, if their role has `requests.create` (the default **User** role does). `requests.manage` or an auto-approval rule approves it.

## License and project

### What license is Fliks under?

AGPL-3.0-or-later: if you run a modified version and let others use it over a network, you owe them the modified source.

### Is there a Nintendo Switch client?

Yes, in beta, in a separate repository ([switchfliks](https://github.com/fliks-app/switchfliks)) that you build yourself as a homebrew `.nro`. It isn't part of the main release.

## See also

- [Logs and troubleshooting](/administration/logs-and-troubleshooting) for warnings the server logs about its own setup.
- [Concepts](/getting-started/concepts) if a term used above isn't familiar yet.
