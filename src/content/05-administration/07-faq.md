---
title: FAQ
description: Honest answers to the questions self-hosters ask most often.
---

## Setup

### Do I need Docker?

No. Docker is the recommended way to run the server, but native builds exist for
[Windows](/install/windows) and [macOS](/install/macos) with no separate dependencies to
install, and you can [build it from source](/install/from-source) on anything Node.js runs on.

### I forgot the admin password and it's my only admin account. What now?

There's no self-service "forgot password" flow yet. If another admin account exists, they can
reset yours from **Settings > Users**. If not, and you have a
[database backup](/administration/backups) from before you lost access, restoring it is the
practical way back in; there's no built-in password-reset tool that bypasses the database.

### Nothing shows up after I add a library. Is it broken?

Probably not; a first scan matches every file against TMDB/TVDB and downloads artwork for each
one, which takes a while on a large library. Watch **Settings > System** for the scan's progress
under Activity. A file that genuinely can't be matched still appears, unidentified, rather than
being silently dropped.

### Does Fliks need internet access to work?

Mostly for two things: fetching metadata (posters, descriptions, cast) from TMDB/TVDB, and the
daily check for a newer Fliks release (which you can turn off, see
[Updating](/install/updating)). Playback, transcoding and everything else works entirely on your
network without it. A plugin catalog also needs internet to browse and install from, obviously.

## Playback and transcoding

### Why is Fliks transcoding instead of playing the file directly?

Because the device asking for it can't decode the file's codec, container, or bitrate as-is.
Check [Transcoding dashboard](/administration/transcoding-dashboard) for the exact reason on a
live stream, and [Streaming and transcoding](/features/streaming-and-transcoding) for the full
decision behind Direct Play, remux and transcode.

### My GPU isn't being used for transcoding

Fliks only uses a hardware path it successfully tested at startup; it never assumes one works
just because a device exists. Check the server log for `HW accel test failed` and see
[Hardware acceleration](/install/hardware-acceleration) for what each vendor's path needs (a
device passed into the container, a driver version, a container capability).

### Does Fliks support 4K and HDR?

Yes. HDR10, HLG and Dolby Vision are tone-mapped to SDR automatically for a device or display
that can't render HDR itself, on whichever encoding path (hardware or CPU) is active.

## Accounts and access

### Can I give someone access to only some of my libraries?

Yes; library access is set per user, independent of their role. See
[Users and permissions](/administration/users-and-permissions).

### Can non-admin users request new content?

Yes, if their role has the `requests.create` permission (the default **User** role does). An
admin, or an auto-approval rule, approves it from there.

## License and project

### What license is Fliks under?

AGPL-3.0-or-later. In practice: if you run a modified version of Fliks and let others use it
over a network, you owe those users the modified source, the same as if you'd distributed it to
them directly.

### Is there a Nintendo Switch client?

A community-built one, in beta: a separate repository
([switchfliks](https://github.com/fliks-app/switchfliks)) you build yourself as a homebrew
`.nro`, with hardware video decode. It isn't part of the main Fliks release.

## See also

- [Logs and troubleshooting](/administration/logs-and-troubleshooting) for warnings the server
  logs about its own setup, and what they mean.
- [Concepts](/getting-started/concepts) if a term used above isn't familiar yet.
