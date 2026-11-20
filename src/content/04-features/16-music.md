---
title: Music
description: Add an albums library, browse artists, albums and tracks, use the player, lyrics, smart playlists and karaoke.
---

## Creating a music library

In **Settings > Libraries > Add a library**, switch on **Albums** under **Media types**, then set
the folders and scan as described in [Libraries](/features/libraries#creating-a-library).

- Fliks reads your tags: the folder is the album, disc folders are merged, and MusicBrainz ids
  decide the match. Cover art and artist images come through plugins installed with Fliks.
- **Settings > Naming** has an **Albums** section (artist folder, album folder, track file and
  multi-disc track file). The defaults are `{Artist Name}`, `{Album Title} ({Release Year})` and
  `{track:00} - {Track Title}`. The scan toggle **Move / rename according to the naming rules**
  applies, see the [warning in Libraries](/features/libraries#finding-media-in-the-folder).
- **Settings > Lyrics** and **Settings > Karaoke** (administrators) configure those two features.

## Browsing

Click the library in the left sidebar. Besides the album grid, a music library has the tabs
**Artists**, **Tracks** and **Composers**, next to the usual **Suggestions**, **Genres**,
**Collections** and **Likes**.

- **Tracks** can be sorted by title, album, date added or last played, and filtered to **All
  tracks**, **Favourites** or **Albums**.
- An artist page shows the discography in tabs: **Albums**, **Singles & EPs**, **Compilations**
  and **Live & other**. Albums you don't have yet can be added or requested.
- A composer page lists **Works** and their recordings, which suits classical music.
- A **Recently played** row lists what you played last.

## An album's page

The page has the cover, artists, release type, year, track count and duration, then **Play**,
**Shuffle**, a download button and **Add to list**. The tracklist is split by disc. Each track
has **Play next**, **Add to queue**, a favourite heart and, in the credits, composers, lyricists
and performers. Other versions of the same album (a deluxe edition, a different country) fold
into an **Other versions** row. A missing or orphaned album says so with a badge.

The menu has the same **Metadata** (**Identify**, **Refresh metadata**) and **Advanced** entries
as other titles. See [Libraries](/features/libraries#the-title-page-and-its-actions).

> [!CAUTION]
> **Delete from library** on an album deletes its files from disk. If tracks of another album
> play those same files, the confirmation says how many and that they will be wanted again.

## The player

A mini player stays at the bottom while you browse and opens into the full player.

- The **Queue** lists what plays next. Use **Edit** to reorder, **Move to top** or remove tracks.
- **Shuffle** and **Repeat** (off, all, one track).
- **Volume levelling** (ReplayGain) by **Track** or **Album**, or **Off**, with a level
  adjustment.
- **Lyrics** shows synced lyrics line by line, or word by word when the source has them.

## Lyrics

Lyrics come from the files (embedded, or `.lrc`, `.elrc`, `.ttml`, `.srt`, `.txt` beside the
track), from the LRCLIB plugin, or from you. **Edit lyrics** opens a dialog to **Fetch from
providers**, **Add lyrics** from a pasted text or a file, mark one version as **Make default**,
and use **Tap to sync**: press **Stamp line** as each line starts to sing, **Back** undoes the
last stamp.

## Smart playlists and M3U

Rule-based playlists and M3U import are described in [Playlists](/features/playlists#smart-playlists-and-m3u-import).

## Karaoke

An administrator turns karaoke on in **Settings > Karaoke** and installs a voice separation
model. Any track can then be prepared (voice separated, lyrics aligned word by word) and sung
with a score per singer, a **Difficulty** from **Easy** to **Hard**, a change of **Key** and a
**Sound mix** of **Original**, **Guide** or **Instrumental**. Phones can act as microphones in a
[watch party](/features/watch-party).

> [!NOTE]
> This page was written from the app's source and release notes. It has no screenshots yet: the
> demo server has no music.

## See also

- [Playlists](/features/playlists) for smart playlists and M3U import.
- [Offline downloads](/features/offline-downloads) for keeping tracks and albums on a device.
