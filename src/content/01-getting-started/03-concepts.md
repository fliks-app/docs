---
title: Concepts
description: The vocabulary Fliks uses for its library, its users and its playback pipeline.
---

## Library

A **library** is one folder tree plus a type: movies, shows, or a generic type for anything you
don't want matched against online metadata (home videos, for instance). You can have several
side by side, each pointed at its own folder, and each with its own set of users allowed to see
it. See [Libraries](/features/libraries).

Inside a library, a **media** is one movie or one show; a show is further broken into seasons and
episodes. Each of those has one or more **media files** on disk: normally one, but a movie kept
in two cuts, or an episode you re-downloaded in a better quality without deleting the old file
first, both have more than one file attached to the same media.

## Metadata

Posters, backdrops, descriptions, cast and genres come from TMDB and TVDB. A library scan
matches what it finds against these providers automatically; when it can't (an ambiguous name,
or a file that legitimately isn't in either database), the title still appears using whatever
Fliks can read from the filename, unidentified. See [Metadata](/features/metadata).

## Quality and language profiles

These two only matter once you've installed the download plugin and are grabbing releases, not
for browsing an existing library:

- A **quality profile** lists which qualities are acceptable and which are preferred (1080p over
  720p, for instance), and rejects anything below its floor.
- A **language profile** lists which audio and subtitle languages you want, in order of
  preference.
- A **custom format** is a scoring rule (title patterns, release group, and so on) layered on top
  of a quality profile to prefer or penalize specific kinds of releases.

## Requests

A **request** is how a non-admin user asks for something to be added to the library: search for
a title that isn't there yet and submit it. An admin (or an auto-approval rule matching who
asked and what they asked for) approves it, and from there it follows the normal acquisition
pipeline. See [Requests](/features/requests).

## Users, roles and permissions

Every account belongs to exactly one **role**, and a role is a named set of **permissions**
(read the library, create media, manage requests, and so on). Fliks ships three default roles
(Admin, User, Readonly) but you can create your own with any combination of permissions. Library
access is separate from roles: which libraries a given user can see is set per user. See
[Users and permissions](/administration/users-and-permissions).

## Playback: Direct Play, remux, and transcode

When you hit play, Fliks decides how to get the file to your device in one of three ways:

- **Direct Play**: the file is sent as-is. No CPU or GPU cost on the server, the fastest and
  highest-quality option, used whenever the device can decode the file's codec and container
  natively.
- **Remux**: the video and audio streams are copied without re-encoding, just repackaged into a
  container the device understands. Cheap, and still no quality loss.
- **Transcode**: the video is actually re-encoded, because the codec, the resolution, or the
  bitrate doesn't fit the device or the network. This is the expensive path, and the one that
  benefits from [hardware acceleration](/install/hardware-acceleration).

See [Streaming and transcoding](/features/streaming-and-transcoding) for the full decision, and
[Transcoding dashboard](/administration/transcoding-dashboard) to watch it happen live.

## Plugins

Fliks ships with no way to acquire media by itself; you add that capability with a plugin from
**Settings > Plugins**. A plugin is either:

- **Data**: ships static data (a JSON catalog, for instance) and executes no code at all.
- **Process**: runs actual code, but in its own child process under its own system user and its
  own database schema, so it can't reach another plugin's data, or yours, outside what it's
  explicitly granted.

See [Plugins](/administration/plugins).

## Live TV

**Live TV** is a separate concept from the library: it turns an IPTV subscription (an M3U
playlist or an Xtream account, both things you bring yourself) into a lineup of channels with a
program guide, sitting next to your library rather than inside it. See [Live TV](/features/live-tv).
