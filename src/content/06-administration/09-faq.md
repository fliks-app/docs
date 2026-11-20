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

Check the container path and click **Scan the folder** on the library. Full checklist: [My files don't show up](/getting-started/common-problems#my-files-dont-show-up).

### My titles have no posters or descriptions

Run **Settings > System > Trigger a task > Metadata > Reload missing metadata**. More: [No posters or descriptions](/getting-started/common-problems#no-posters-or-descriptions).

### Subtitles are missing

A fresh install has no provider: add one in **Settings > Subtitle providers** ([how](/administration/subtitle-settings#subtitle-providers)). More: [Subtitles are missing](/getting-started/common-problems#subtitles-are-missing).

### Playback buffers or stutters

**Settings > Playback quality** gives each stall a cause ([Playback quality](/administration/playback-quality)). More: [The video keeps buffering](/getting-started/common-problems#the-video-keeps-buffering).

### Do I need quality profiles, auto-approval and the other download settings?

Not to play files you already have. See [Which areas you can ignore](/administration/settings#which-areas-you-can-ignore).

### Where is the setting for X?

See the [map of the admin area](/administration/settings) or the [first-day checklist](/administration/first-day-tasks).

### Does Fliks need internet access to work?

Only for metadata, the update check and plugin catalogues. Playback works on your network without it.

## Playback and transcoding

### Why is Fliks transcoding instead of playing the file directly?

The device cannot decode the file as is: [Transcoding dashboard](/administration/transcoding-dashboard) shows the reason. More: [Fliks transcodes instead of playing the file directly](/getting-started/common-problems#fliks-transcodes-instead-of-playing-the-file-directly).

### My GPU isn't being used for transcoding

See [My GPU isn't used for transcoding](/getting-started/common-problems#my-gpu-isnt-used-for-transcoding) and [Hardware acceleration](/install/hardware-acceleration).

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
