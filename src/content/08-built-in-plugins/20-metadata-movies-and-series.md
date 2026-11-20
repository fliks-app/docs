---
title: Movies and series
description: TMDB, TheTVDB and TheXEM, the bundled plugins that identify movies and series and map scene numbering.
---

> [!SUMMARY]
> TMDB and TheTVDB identify movies and series out of the box with keys Fliks ships; TheXEM only maps scene numbering. Nothing to set up unless you want your own API key (**Settings > Metadata > Configure**).

Configured from **Settings > Metadata** (see [Overview](/built-in-plugins/overview#configure-a-plugin)).

## Provider order

TMDB is asked first, then TheTVDB, and TheXEM changes nothing for posters or overviews. Reorder on **Settings > Metadata**, see [Metadata settings](/administration/metadata-settings).

## TMDB

The Movie Database. Provides, for movies and series:

- search, details, artwork, cast and crew;
- seasons and episodes;
- lookups by IMDb or TVDB id;
- the trending, popular, upcoming, genre and discover lists used for discovery.

**Settings** (**Settings > Metadata > Configure** on the TMDB row):

| Field | Default | Notes |
|---|---|---|
| **API key** | Empty, which uses the key Fliks ships | Optional. Get your own on themoviedb.org if you want your own quota. Clearing the field goes back to the Fliks key. |

![TMDB settings: the API key field is empty, the Fliks key is used](/img/builtin-tmdb-settings.webp)

Limits: Fliks paces requests at 40 per second. Images come from `image.tmdb.org`, and are cached on
your server after the first download.

> [!NOTE]
> A build from source has no default key. Without a TMDB key, titles are matched through TheTVDB,
> or stay unidentified.

## TheTVDB

Provides movies and series with artwork, seasons and episodes (with translations), people and
credits, and lookups by IMDb id. It is the second source for both kinds.

**Settings**:

| Field | Default | Notes |
|---|---|---|
| **API key** | Empty, which uses the key Fliks ships | Optional. Get your own on thetvdb.com. Clearing the field goes back to the Fliks key. |

Limits: 10 requests per second. Images come from `artworks.thetvdb.com`.

TheTVDB cannot list trending or popular titles. Those lists come from TMDB only.

## TheXEM scene numbering

Some series are released under a numbering that differs from the aired one: a season split in two,
or episodes counted across seasons. TheXEM publishes the mapping. When it knows a series, Fliks
translates the season and episode numbers found in file and release names to the aired ones, so
the file lands on the right episode.

It provides no metadata of its own and works from TVDB ids. Without it, every number is read as
aired numbering.

**Settings**:

| Field | Default | Notes |
|---|---|---|
| **Base URL** | Empty, which uses `https://thexem.info` | Only change it to point at a mirror. |

Limit: one request per second.

## See also

- [Metadata](/features/metadata) for languages, regions and refreshes.
- [Libraries](/features/libraries) for the per-library **Metadata provider** setting.
