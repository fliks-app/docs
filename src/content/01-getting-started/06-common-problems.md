---
title: Common problems
description: Find your symptom, try the most likely fix, and jump to the page that covers it in depth.
---

> [!SUMMARY]
> Find the sentence that matches what you see, try the short fix under it, and follow the link if it is not enough.
> Not listed? Search the docs with the words you would use, or read the server [logs](/administration/logs-and-troubleshooting).

## Setup

### I can't open Fliks from another device

Use the server's LAN address and port (`http://<server-ip>:3000`), not `localhost`. With Docker, check that the port is published in your Compose file and that the machine's firewall lets it through. See [Docker](/install/docker).

### The server won't start or restarts in a loop

Read the container log (`docker compose logs fliks`) or the [platform log](/administration/logs-and-troubleshooting#where-logs-live-per-platform). The usual causes are a database that is not reachable and a database role that cannot create the `pg_trgm` extension. See [the database extension](/administration/logs-and-troubleshooting#common-startup-failure-the-database-extension).

### Everyone is logged out after each restart

The configuration folder is not writable, so a new signing key is generated at every start. Fix the mount or its permissions, or set `JWT_SECRET`. The matching log line is described in [Warnings worth recognizing](/administration/logs-and-troubleshooting#warnings-worth-recognizing).

### Artwork and avatars vanish after a restart

The data folder is not persisted or not writable. Mount a volume on it and make sure the user the container runs as can write to it. See [Volumes](/install/docker#volumes) and [Running as a specific user](/install/docker#running-as-a-specific-user).

### It doesn't work behind my reverse proxy

Serve Fliks at the root of a (sub)domain, never under a path like `/fliks`. Turn off response buffering, forward `X-Forwarded-Proto`, and set **Public address** on **Settings > General**. See [Reverse proxy](/install/reverse-proxy).

### I forgot the admin password

Another administrator can set a new one from **Settings > Users**. With no other admin, the password has to be reset in the database. The steps are in the [FAQ](/administration/faq#i-forgot-the-admin-password-and-its-my-only-admin-account-what-now).

### The update check fails or the server has no internet

Harmless. Set `FLIKS_DISABLE_UPDATE_CHECK=1` to silence it. See [Updating](/install/updating) and [Environment variables](/install/environment-variables).

## Playback

### The video keeps buffering

Open **Settings > Playback quality** to see whether the network, the device or the server caused each stall, then **Settings > Video activity** while it plays. A CPU transcode on a small machine is the usual cause. See [Playback quality](/administration/playback-quality) and the [FAQ entry](/administration/faq#playback-buffers-or-stutters).

### Fliks transcodes instead of playing the file directly

The device can't decode the file's codec, container or bitrate as it is. The dashboard shows the exact reason for each stream. See the [Transcoding dashboard](/administration/transcoding-dashboard) and [Streaming and transcoding](/features/streaming-and-transcoding).

### My GPU isn't used for transcoding

Fliks only uses a hardware path that passed its test at startup. Check the log for `HW accel test` lines, and that the device is passed into the container. See [Hardware acceleration](/install/hardware-acceleration).

### Playback fails to start

The player shows the server's reason in a toast. Open the title in another client to tell a file problem from a device problem, then read the server [logs](/administration/logs-and-troubleshooting). See [The player](/player/overview).

### There is no sound, or the wrong language plays

Pick the track with the **Audio** button in the player. Some TVs and receivers only accept certain codecs. See [Audio and subtitles](/player/subtitles-and-audio) and, for surround sound, [Android TV](/clients/android-tv#surround-sound-through-an-av-receiver).

### Skip intro or next episode doesn't appear

Intros and credits are detected by a background task, which can be switched on in **Settings > General**. Run it from **Settings > System > Trigger a task**. See [Playback](/features/playback).

## Subtitles

### Subtitles are missing

A fresh install has no subtitle provider. Enable one in **Settings > Subtitle providers**, then run **Search for missing subtitles** from **Settings > System**. The checklist is in the [FAQ entry](/administration/faq#subtitles-are-missing) and the [walkthrough](/administration/first-day-tasks#enable-a-subtitle-provider).

### Subtitles are out of sync

Open the subtitles dialog on the title and let Fliks sync the file, or shift it by a fixed amount. While watching, use the timing panel in the player. See [Fixing out-of-sync subtitles](/features/subtitles#fixing-out-of-sync-subtitles) and [Fix the timing while you watch](/player/subtitles-and-audio#fix-the-timing-while-you-watch).

### I want to add or change a subtitle file myself

Open the title, **More > Edit subtitles**: you can search, upload, delete and sync from there. See [Managing subtitles from the title page](/features/subtitles#managing-subtitles-from-the-title-page).

### Image subtitles (PGS, VobSub) don't show

Image formats are burned into the video by the server on clients that can't draw them, which means a transcode. You can also extract their text. See [Burned-in subtitles](/features/subtitles#burned-in-subtitles) and [Extracting text from image-based subtitles](/features/subtitles#extracting-text-from-image-based-subtitles).

## Library and metadata

### My files don't show up

The library path is the path inside the container, Fliks does not watch the folder, and episodes need their own folder. Run **Scan the folder** on the library. See [Finding media in the folder](/features/libraries#finding-media-in-the-folder) and the [FAQ entry](/administration/faq#nothing-shows-up-after-i-add-a-library-is-it-broken).

### No posters or descriptions

Check that TMDB is installed and running on **Settings > Plugins** and that the server can reach the internet. Then run **Reload missing metadata** from **Settings > System**. See [Metadata](/features/metadata) and the [FAQ entry](/administration/faq#my-titles-have-no-posters-or-descriptions).

### A title is matched to the wrong movie or show

Open it and use **More > Metadata > Identify** to pick the right one. See [Fixing a wrong or missing match](/features/libraries#fixing-a-wrong-or-missing-match).

### A title is listed as unidentified

The file name gave nothing to match. Rename it with the title and year (`Title (2020).mkv`), or identify it by hand. See [Unidentified titles](/features/libraries#unidentified-titles) and [File naming](/features/libraries#file-naming).

### Titles are in the wrong language

Change **Metadata language** on **Settings > General**, or the language of the library. Already imported titles change at the next refresh. See [Metadata](/features/metadata).

### An episode is missing or in the wrong season

Check the folder layout and file names first, then identify the episode again. See [File naming](/features/libraries#file-naming) and [Libraries](/features/libraries).

### Books, comics or music don't import

Each needs a library of its own type. Check the type of the library and the file formats listed on its page. See [Books and audiobooks](/features/books-and-audiobooks), [Comics](/features/comics) and [Music](/features/music).

### Live TV channels don't play

New channels start disabled: enable them on the **Channels** tab. For the other errors, the **Health** tab names the cause. See [Live TV troubleshooting](/features/live-tv#troubleshooting).

## Devices and TV

### I can't log in on my TV

Use Quick Connect: the TV shows a code, you type it on a phone that is already signed in (user menu, **Login requests**). It needs server 6.0 or newer and an up-to-date TV app. See [Quick Connect](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect).

### Chromecast doesn't find the server

The device you cast from finds the Chromecast, so it must be on the same network as it. Then the Chromecast has to reach the server: set **Public address** on **Settings > General** to an address it can use. See [Chromecast](/clients/chromecast) and [Chromecast on a bridge network](/install/docker#chromecast-on-a-bridge-network).

### Casting starts but the screen stays black

The Chromecast pulls the video straight from the server, so a wrong **Public address** or a proxy that blocks it shows exactly like this. See [How it works](/clients/chromecast#how-it-works).

### The Samsung or LG app won't install

The Samsung app is not on the store yet and needs sideloading; the LG app comes from the LG Content Store (webOS 7.0 and newer). See [Samsung TV](/clients/samsung-tizen#sideloading) and [LG TV](/clients/lg-webos#installing).

### There is no Download or Cast button on my TV

TV apps have no offline downloads, no casting and no admin screens. They can still be a target for remote control. See [Android TV](/clients/android-tv#whats-hidden-on-this-platform).

### Offline downloads don't start or are stuck

They may be waiting for Wi-Fi, or the device is out of space. Check the **Downloads** screen. See [The Downloads screen](/features/offline-downloads#the-downloads-screen) and [Storage settings](/features/offline-downloads#storage-settings).

## Accounts and access

### A user sees no libraries

Library access is set per user. Tick the libraries on the user's page in **Settings > Users**. See [Users and permissions](/administration/users-and-permissions).

### A user can't request titles or can't see a menu

Menus and actions follow the role's permissions. Check the role on **Settings > Roles**. See [Roles and permissions](/administration/users-and-permissions#roles-and-permissions) and [Which model actually applies](/administration/users-and-permissions#which-model-actually-applies).

### I can't find the Administration entry

It appears in the user menu only for accounts with the `settings.access` permission, and never on a TV. See [Finding your way around](/getting-started/finding-your-way).

### The login screen shows everyone's name, or nobody's

An administrator chooses who sees the account list. See [Login user list](/administration/users-and-permissions#login-user-list).

### Notifications and emails don't arrive

Check the provider settings and send a test message. See [Notifications](/features/notifications), [Push notifications](/administration/push-notifications) and [General, naming and outgoing mail](/administration/general-and-naming#outgoing-mail).

## Downloads

### Nothing gets downloaded

Work down the checklist: plugin active, title monitored with a quality profile, an active indexer, an active download client. See [Nothing is downloaded](/downloads/troubleshooting#nothing-is-downloaded).

### A request stays Approved

No release has been grabbed yet: it is the same checklist as above. See [Requests](/downloads/requests) and [Download troubleshooting](/downloads/troubleshooting).

### The download finishes but the import fails

The client saved the file outside `/downloads`, or Fliks can't see that folder, or the library mount is read-only. See [The download finishes but the import fails](/downloads/troubleshooting#the-download-finishes-but-the-import-fails) and [The shared folder](/downloads/download-clients#the-shared-folder).

### Test connection fails on an indexer or download client

Read the message shown by the test, then check the address and credentials. Each message is explained on [Download troubleshooting](/downloads/troubleshooting). See [Indexers](/downloads/indexers) and [Download clients](/downloads/download-clients).

### The wrong quality or language was downloaded

Adjust the library's quality and language profiles, and the score of custom formats. See [Quality profiles](/downloads/quality-profiles), [Custom formats](/downloads/custom-formats) and [Language profiles](/administration/language-profiles).

### Backups or restores fail

The error line comes from `pg_dump` or `psql`. See [Backup and restore failures](/administration/logs-and-troubleshooting#backup-and-restore-failures) and [Backups](/administration/backups).

## Still stuck

- Read the **Logs** tab of **Settings > System**: [Logs and troubleshooting](/administration/logs-and-troubleshooting).
- Browse the [FAQ](/administration/faq).
- Ask in the project's [GitHub issues](https://github.com/fliks-app/fliks/issues) with the version, the client and the log lines.
