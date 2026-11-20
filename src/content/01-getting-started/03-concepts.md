---
title: Concepts
description: The vocabulary Fliks uses for its library, its users and its playback pipeline.
---

> [!SUMMARY]
> A short glossary: library, metadata, profiles, requests, roles, the three ways a file is played, plugins and Live TV. Read it when a term in the docs isn't clear.

## Library

A **library** is one or more folders on the server plus the media types they hold: movies,
series, books and audiobooks, comics or music albums. You can have several side by side, each
pointed at its own folders, and each with its own set of users allowed to see it. See [Libraries](/features/libraries).

Inside a library, a **media** is one movie or one show; a show is further broken into seasons and
episodes. Each of those has one or more **media files** on disk: normally one, but a movie kept
in two cuts, or an episode you re-downloaded in a better quality without deleting the old file
first, both have more than one file attached to the same media.

## Metadata

Posters, backdrops, descriptions, cast and genres come from metadata providers such as TMDB
and TVDB, which are plugins (**Advanced > Plugins** in **Administration**). A library scan
matches what it finds against them automatically. When it can't (an ambiguous name, or a file
that legitimately isn't in either database), you choose **No match: add as is** in the scan
review, and the title appears with whatever Fliks can read from the filename, marked
**Unidentified** in the library's admin page. **Identify** on the title fixes it later. See
[Quick start](/getting-started/quick-start#fix-an-unidentified-file-later) and
[Metadata](/features/metadata).

## Where things live

Settings sit in three areas behind your avatar: **Administration** (the server), **App settings**
(your preferences on this device) and **Account settings** (your account). The click path to
each task is in [Finding your way around](/getting-started/finding-your-way).

## Quality and language profiles

These only matter once you've installed the download plugin and are grabbing releases, not
for browsing an existing library:

- A **quality profile** lists which qualities are acceptable and which are preferred (1080p over
  720p, for instance), and rejects anything below its floor.
- A **language profile** lists which audio and subtitle languages you want, in order of
  preference.
- A **custom format** is a scoring rule (title patterns, release group, and so on) layered on top
  of a quality profile to prefer or penalize specific kinds of releases.

A title (or a season, or an episode) is **monitored** when Fliks keeps working on it: the download
plugin looks for a missing or better release of it, and automatic subtitle search covers it.

## Requests

A **request** is how a non-admin user asks for something to be added to the library: search for
a title that isn't there yet and submit it. An admin (or an auto-approval rule matching who
asked and what they asked for) approves it, and from there it follows the normal acquisition
pipeline. See [Requests](/downloads/requests).

## Users, roles and permissions

Every account has one **role**, and a role is a named set of **permissions** (read the library,
create requests, manage users, and so on). Fliks ships three default roles (Admin, User,
Readonly) and you can create your own with any combination of permissions. An account flagged
as administrator (a **super-admin**), like the default `admin`, has every permission whatever
its role. Library
access is separate from roles: which libraries a given user can see is set per user (a role
only picks the libraries a new user starts with). See
[Users and permissions](/administration/users-and-permissions).

## Playback: Direct Play, Direct Stream, and Transcode

When you hit play, Fliks decides how to get the file to your device in one of three ways:

- **Direct Play**: the file is sent as-is. No CPU or GPU cost on the server, the fastest and
  highest-quality option, used whenever the device can decode the file's codec and container
  natively.
- **Direct Stream** (shown in the app as "Remux"): the video is copied without re-encoding, just
  repackaged into a container the device understands, with the audio converted only if the device
  can't play it. Cheap, and no loss in picture quality.
- **Transcode**: the video is actually re-encoded, because the codec, the resolution, or the
  bitrate doesn't fit the device or the network. This is the expensive path, and the one that
  benefits from [hardware acceleration](/install/hardware-acceleration).

See [Streaming and transcoding](/features/streaming-and-transcoding) for the full decision, and
[Transcoding dashboard](/administration/transcoding-dashboard) to watch it happen live.

## Plugins

Fliks ships with no way to acquire media by itself; you add that capability with a plugin from
**Settings > Plugins**. A plugin is either:

- **Data**: ships static data (a JSON catalog, for instance) and executes no code at all.
- **Process**: runs actual code as a WebAssembly component sandboxed by the server, with capped
  memory and run time, one private folder and its own PostgreSQL role and schema, so it can't
  reach another plugin's data, or yours, outside what it's explicitly granted.

See [Plugins](/administration/plugins).

## Live TV

**Live TV** is a separate concept from the library: it turns an IPTV subscription (an M3U
playlist or an Xtream account, both things you bring yourself) into a lineup of channels with a
program guide, sitting next to your library rather than inside it. See [Live TV](/features/live-tv).
