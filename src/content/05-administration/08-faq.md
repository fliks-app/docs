---
title: FAQ
description: Honest answers to the questions self-hosters ask most often.
---

## Setup

### Do I need Docker?

No. Docker is the recommended way to run the server, but native builds exist for
[Windows](/install/windows) and [macOS](/install/macos) with no separate dependencies to
install, and you can [build it from source](/install/from-source) on a machine with Node.js,
PostgreSQL and FFmpeg.

### I forgot the admin password and it's my only admin account. What now?

There's no self-service "forgot password" flow and no reset command. If another account has
`users.manage` (and `settings.access`), it can set you a new password from **Settings > Users**. A
[backup](/administration/backups) won't help: it holds the same forgotten password.

With no other admin, you have to write a new password hash into the database yourself. On the
Docker setup from [Docker](/install/docker), generate a hash for a temporary password:

```bash
docker compose exec fliks node -e "require('bcrypt').hash('temporary-password', 12).then(console.log)"
```

Then open the database with `docker compose exec postgres psql -U fliks -d fliks` and run this,
pasting the hash printed above:

```sql
UPDATE users SET "passwordHash" = '<hash>', "requirePasswordChange" = true WHERE username = 'admin';
```

Replace `admin` with your username if you renamed it. Log in with the temporary password; Fliks
asks you to pick a new one straight away.

### Nothing shows up after I add a library. Is it broken?

Probably not; a first scan matches every file against TMDB/TVDB and downloads artwork for each
one, which takes a while on a large library. Watch the Activity list on **Settings > System**
for the scan's progress. A file that genuinely can't be matched still appears, unidentified,
rather than being silently dropped.

### Does Fliks need internet access to work?

Mostly for two things: fetching metadata (posters, descriptions, cast) from TMDB/TVDB, and the
check for a newer Fliks release on GitHub (which you can turn off, see
[Updating](/install/updating)). Playback, transcoding and everything else works entirely on your
network without it. Browsing and installing from a plugin catalog also needs internet access.

## Playback and transcoding

### Why is Fliks transcoding instead of playing the file directly?

Because the device asking for it can't decode the file's codec, container, or bitrate as-is.
Check [Transcoding dashboard](/administration/transcoding-dashboard) for the exact reason on a
live stream, and [Streaming and transcoding](/features/streaming-and-transcoding) for the full
decision behind Direct Play, Direct Stream and Transcode.

### My GPU isn't being used for transcoding

Fliks only uses a hardware path it successfully tested at startup; it never assumes one works
just because a device exists. Check the server log for `HW accel test passed` or
`HW accel test failed` lines and see
[Hardware acceleration](/install/hardware-acceleration) for what each vendor's path needs (a
device passed into the container, a driver version, a container capability).

### Does Fliks support 4K and HDR?

Yes. Direct Play and Direct Stream pass HDR through untouched. For a device or display that can't
render HDR, HDR10, HLG and Dolby Vision are tone-mapped to SDR on whichever encoding path (hardware
or CPU) is active. A transcode that stays in HDR needs HEVC on Intel QSV or NVIDIA NVENC, or AV1 on
NVENC; other backends hand it to the much slower CPU encoder. See
[HDR and Dolby Vision](/features/streaming-and-transcoding#hdr-and-dolby-vision).

## Accounts and access

### Can I give someone access to only some of my libraries?

Yes; library access is set per user, independent of their role. See
[Users and permissions](/administration/users-and-permissions).

### Can non-admin users request new content?

Yes, if their role has the `requests.create` permission (the default **User** role does).
Someone with `requests.manage`, or an auto-approval rule, approves it from there.

## License and project

### What license is Fliks under?

AGPL-3.0-or-later. In practice: if you run a modified version of Fliks and let others use it
over a network, you owe those users the modified source, the same as if you'd distributed it to
them directly.

### Is there a Nintendo Switch client?

Yes, in beta: a native client in a separate repository
([switchfliks](https://github.com/fliks-app/switchfliks)) that you build yourself as a homebrew
`.nro`, for a homebrew-enabled console, with hardware video decode. It isn't part of the main
Fliks release.

## See also

- [Logs and troubleshooting](/administration/logs-and-troubleshooting) for warnings the server
  logs about its own setup, and what they mean.
- [Concepts](/getting-started/concepts) if a term used above isn't familiar yet.
