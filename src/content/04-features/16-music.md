---
title: Music
description: Add an albums library, browse artists, albums and tracks, use the player, lyrics, smart playlists and karaoke.
---

> [!SUMMARY]
> Switch on **Albums** when adding a library, scan, then open an album and press **Play**. The mini player, queue and lyrics are in [The music player](/player/music-player).

## Add a music library

In **Settings > Libraries > Add a library**, switch on **Albums** under **Media types**, then set
the folders and scan as described in [Libraries](/features/libraries#creating-a-library).

:::details What the scan reads and the naming settings
- Fliks reads your tags: the folder is the album, disc folders are merged, and MusicBrainz ids
  decide the match. Cover art and artist images come through plugins installed with Fliks.
- **Settings > Naming** has an **Albums** section (artist folder, album folder, track file and
  multi-disc track file). The defaults are `{Artist Name}`, `{Album Title} ({Release Year})` and
  `{track:00} - {Track Title}`. The scan toggle **Move / rename according to the naming rules**
  applies, see the [warning in Libraries](/features/libraries#finding-media-in-the-folder).
- **Settings > Lyrics** and **Settings > Karaoke** (administrators) configure those two features.
:::

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

The mini player, queue, shuffle, repeat and lyrics are in [The music player](/player/music-player).

## Lyrics

Lyrics come from the files, a provider plugin or from you. Where they come from and how to show, add and sync them: [The music player](/player/music-player#lyrics).

## Smart playlists and M3U

Rule-based playlists and M3U import are described in [Playlists](/features/playlists#smart-playlists-and-m3u-import).

## Karaoke

:::details How karaoke works
An administrator turns karaoke on in **Settings > Karaoke** and installs a voice separation
model. Any track can then be prepared (voice separated, lyrics aligned word by word) and sung
with a score per singer, a **Difficulty** from **Easy** to **Hard**, a change of **Key** and a
**Sound mix** of **Original**, **Guide** or **Instrumental**. Phones can act as microphones in a
[watch party](/features/watch-party).
:::

## See also

- [Playlists](/features/playlists) for smart playlists and M3U import.
- [Offline downloads](/features/offline-downloads) for keeping tracks and albums on a device.
