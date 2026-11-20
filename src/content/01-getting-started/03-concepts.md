---
title: Concepts
description: A short glossary of the words Fliks uses: library, metadata, profiles, requests, roles, playback modes, plugins and Live TV.
---

> [!SUMMARY]
> A glossary: read it when a term in the docs isn't clear.

- **Library**: One or more folders on the server plus the media types they hold (movies, series, books, comics, albums). Each library has its own list of users who can see it. See [Libraries](/features/libraries).
- **Media and media file**: A media is one movie or one show (split into seasons and episodes). Each has one or more files on disk.
- **Metadata**: Posters, descriptions, cast and genres, fetched from providers such as TMDB and TVDB. A title Fliks can't match is marked **Unidentified**; **Identify** fixes it. See [Metadata](/features/metadata).
- **Quality profile, language profile, custom format**: Rules for the optional download side: which qualities, audio and subtitle languages you want, and extra scoring on release names. See [Quality profiles](/downloads/quality-profiles) and [Language profiles](/downloads/language-profiles).
- **Monitored**: A title Fliks keeps working on: it looks for a missing or better release and for subtitles.
- **Request**: A non-admin user asking for a title that isn't in the library yet. An admin or an auto-approval rule approves it. See [Requests](/downloads/requests).
- **Role and permission**: An account has one role, a named set of permissions. The default roles are Admin, User and Readonly. Which libraries a user sees is set per user. See [Users and permissions](/administration/users-and-permissions).
- **Direct Play, Direct Stream, Transcode**: The three ways a file reaches your device. Direct Play sends the file as is. Direct Stream (shown as "Remux") repackages it without re-encoding. Transcode re-encodes it and is the only one that costs CPU or GPU (see [hardware acceleration](/install/hardware-acceleration)). See [Streaming and transcoding](/features/streaming-and-transcoding).
- **Plugin**: Adds a capability to the server, such as metadata providers or downloading. Installed from **Advanced > Plugins**. See [Plugins](/administration/plugins).
- **Live TV**: Channels and a program guide built from an IPTV playlist you bring, next to your libraries. See [Live TV](/features/live-tv).
- **Administration, App settings, Account settings**: The three areas behind your avatar: the server, your preferences on this device, your account. See [Finding your way around](/getting-started/finding-your-way).
