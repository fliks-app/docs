---
title: Metadata
description: Posters, backdrops, cast and details come from provider plugins bundled with the server, cached locally so nothing hotlinks to an outside service while you browse.
---

> [!SUMMARY]
> Posters, cast and details come from provider plugins bundled with the server (TMDB and TVDB for video). To fix a wrong match, open the title, **More** > **Metadata** > **Identify**. Metadata refreshes nightly.

## Fixing a wrong match

Open the title, then **More > Metadata > Identify**: the step-by-step walkthrough is in
[Libraries](/features/libraries#fixing-a-wrong-or-missing-match).

The same **Metadata** menu has **Refresh metadata**, which re-reads one title from its provider. To prefer
another provider for one title, use **Advanced > Library** and set **Metadata provider**.

## Add a title that isn't in your library yet

Search brings up matching titles from TMDB or TVDB alongside what's already in your library. Open
one you don't have yet for a full preview: cast, crew, release dates in every region, original
language, studios, and (for a series) its seasons. From there:

- **Add** it directly, picking a quality profile, a language profile and a library (only libraries
  that accept its type are offered), plus which seasons to include for a series.
- **Request** it instead, if you don't have permission to add media directly: see
  [Requests](/downloads/requests).

## Language and region

**Settings > General** has a server-wide **Metadata language** and **Metadata region**, used for
every library unless a library overrides them (**Settings > Libraries**, per library). The language
picks which translation of titles, overviews, genres and artwork text is fetched; the region picks
which release dates (and which upcoming titles) are considered relevant to you. Changing either
takes effect on the next refresh: anything already imported keeps what it has until then.

## Keeping metadata current

A background job refreshes metadata every night: movies released more than a year ago and series
that have ended are refreshed about once a week, and everything else daily. You can also trigger
this by hand from **Settings > System**: **Refresh metadata** runs that same pass right away (so
settled titles refreshed in the last week are still skipped), and **Reload missing metadata**
catches titles that are missing a poster, overview or seasons, or haven't been refreshed in three
months. Titles added without metadata are skipped by both until you identify them.

## Where the data comes from

Fliks fetches titles, artwork, cast and crew through provider plugins. They ship inside the server
and are installed at boot, so metadata works on a first start without a catalog. They can be
disabled but not uninstalled.

:::details Which providers cover what
| Provider | Covers |
|---|---|
| **TMDB** | Movies and series; also trending, popular, upcoming and discovery browsing |
| **TVDB** | Movies and series, as an alternative source |
| **OpenLibrary**, **BnF**, **Google Books** | Books |
| **Audible**, **Audnexus** | Audiobooks |
:::

**Settings > Metadata** sets the order in which providers are tried, per kind of media.

TMDB is the default, and the fallback whenever a library's **Metadata provider** is left on
**Auto**. A library can be set to prefer one provider over the other (**Settings > Libraries**), and
that preference can be overridden again for one specific title, or even one specific season, if the
usual source is missing something for it.

:::details API keys and upgrading from 5.x
TMDB and TVDB need an API key. Official builds ship default keys. To use your own, enter it in
the plugin's settings (**Settings > Plugins**); clearing it restores the default. A source build
has no default key: without a TMDB key, video titles are matched through TVDB if it has a key,
and otherwise stay unidentified.

Upgrading from 5.x: `TMDB_API_KEY` and `TVDB_API_KEY` are imported once into the plugin settings
on the first 6.0.0 boot. You can then remove them from your compose file.
`FLIKS_PLUGINS_DISABLED` does not disable the bundled providers.
:::

## What you can and cannot edit by hand

Movies and series have no free-form editor: their fields (title, synopsis, poster, backdrop) come
from the matched provider entry, and there is no custom artwork upload. To change them, identify
the title against a better entry. Comic volumes and issues are the exception: their three-dot
menu has **Edit details** (and each issue a pencil button) for title, publisher, start year, volume number, overview and, for an issue, its
number, type and release date, with **Reset to automatic** to go back to the provider values. Books
let you edit their provider links (**Metadata > Sources**) and series (**Metadata > Edit series**).

## Cast, crew and people pages

Every actor, director, writer or producer credited on something in your library gets their own
page: a photo, biography, and every local credit, split into **In my library** and their **Full
filmography** from the provider. A title from the filmography that isn't in your library yet opens
the add screen described below instead of a dead end. The **People** section lists everyone who
shows up in your libraries, filterable by role.

![A movie detail page with cast, crew and release details](/img/detail.webp)

## Local image cache

Every poster, backdrop and logo is downloaded once and kept on your own server, resized locally
into a few sizes as needed. Once cached, browsing your library never reaches out to TMDB or TVDB
again for the image itself, which keeps casual browsing off an external service.

## See also

- [Libraries](/features/libraries) for scanning folders and the profiles that decide what quality
  to keep.
- [Discovery and search](/features/discovery-and-search) for trending, popular and personalised
  suggestions built on top of this metadata.
