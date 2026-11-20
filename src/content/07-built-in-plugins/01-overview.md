---
title: Overview
description: Which plugins Fliks ships with or offers in its catalogue, where to manage them, and which ones need an API key or an account.
---

## Bundled and catalogue plugins

Fliks gets most of its data and some of its features from plugins made by the Fliks project. They
come in two kinds.

- **Bundled plugins** ship inside the server and are installed on first start, so a new install
  can identify movies, series, books and albums without a catalogue. You can disable them, but not
  uninstall them. They are all metadata providers.
- **Catalogue plugins** are not installed until you ask. You install them from the catalogue
  built into the plugin page, with a consent step that lists what the plugin asks for. They add
  features such as downloads, free ebooks and audiobooks, comics metadata, music lists and
  notifications.

All of them are published by the Fliks project. A bundled plugin shows the **Official** badge. For
how trust badges, sources and permissions work, see [Plugins](/administration/plugins). To write your own, see
the [developer documentation](/plugins/overview).

## The first-party plugins

| Plugin | What it does | Kind | API key or account |
|---|---|---|---|
| [TMDB](/built-in-plugins/metadata-movies-and-series#tmdb) | Movie and series metadata, artwork, people, trending and discover lists | Bundled | Optional, Fliks ships a key |
| [TheTVDB](/built-in-plugins/metadata-movies-and-series#thetvdb) | Movie and series metadata, as a second source | Bundled | Optional, Fliks ships a key |
| [TheXEM scene numbering](/built-in-plugins/metadata-movies-and-series#thexem-scene-numbering) | Maps release season and episode numbers to aired ones | Bundled | No |
| [OpenLibrary](/built-in-plugins/metadata-books#openlibrary) | Book search and editions | Bundled | No |
| [BnF](/built-in-plugins/metadata-books#bnf) | Book editions from the French national library catalogue | Bundled | No |
| [Google Books](/built-in-plugins/metadata-books#google-books) | Book search and editions | Bundled | No |
| [Audible](/built-in-plugins/metadata-books#audible) | Audiobook search and editions | Bundled | No |
| [Audnexus](/built-in-plugins/metadata-books#audnexus) | Audiobook editions and chapters by ASIN | Bundled | No |
| [Project Gutenberg](/built-in-plugins/metadata-books#project-gutenberg) | Search and add free ebooks | Catalogue | No |
| [LibriVox](/built-in-plugins/metadata-books#librivox) | Search and add free audiobooks | Catalogue | No |
| [Comic Vine](/built-in-plugins/comics#comic-vine) | Comic volumes and issues | Catalogue | Your own API key |
| [Metron](/built-in-plugins/comics#metron) | Comic series and issues | Catalogue | Your own Metron account and API token |
| [MusicBrainz](/built-in-plugins/music#musicbrainz) | Albums, releases, artists, cover art | Bundled | No (ListenBrainz token optional) |
| [Fanart.tv](/built-in-plugins/music#fanarttv) | Artist images and album covers | Bundled | Optional, Fliks ships a key |
| [LRCLIB](/built-in-plugins/music#lrclib) | Synced and plain lyrics | Bundled | No |
| [Music lists](/built-in-plugins/music#music-lists) | Follows ListenBrainz, Last.fm, Spotify, Deezer and MusicBrainz lists | Catalogue | Depends on the source |
| [Notify](/built-in-plugins/notify) | Posts Fliks events to an HTTPS address as JSON | Catalogue | No |
| [Download](/built-in-plugins/download-overview) | Indexer search, download clients and the grab pipeline | Catalogue | Depends on your indexers and clients |

The Download plugin has its own guide: start with [Download overview](/built-in-plugins/download-overview).

> [!NOTE]
> The catalogue also lists the bundled plugins, marked **Installed**. They are the same plugins.

## Where plugins live

Open the user menu, choose **Administration**, then **Advanced > Plugins**. The page lists what is
installed as a grid of cards. Each card has the plugin's logo, name and version.

![The Plugins page: one card per installed plugin, **Search for a plugin** and the menu at the top](/img/builtin-plugins-list.webp)

Click a card to open the plugin's page: status (**Active**), trust badge, tier, what it can do,
its identifier, version and source, and its metrics. The buttons are **Disable** or **Enable** and
**Export**, plus **Uninstall** for a catalogue plugin.

![The page of a bundled plugin, with Disable under its name](/img/builtin-plugin-page.webp)

## Install a catalogue plugin

**Search for a plugin** opens the catalogue. A plugin you do not have shows **Install**. The click
path with screenshots is in [First-day admin tasks](/administration/first-day-tasks#install-a-plugin-from-the-catalogue).

The catalogue loads without any account. Installing shows what the plugin asks to do and its trust
badge: read it, then confirm.

## Configure a plugin

A plugin with settings has a settings page. Where it lives depends on the kind of plugin.

- **Metadata providers** (every bundled plugin, plus Project Gutenberg, LibriVox, Comic Vine and
  Metron) are configured from **Settings > Metadata**. The provider's row has a **Configure** link.
- **Other plugins** (Download, Notify, Music lists) get a section of their own in the Administration
  sidebar, named after the plugin.

> [!NOTE]
> The page of a plugin does not link to its settings. Use **Configure** on **Settings > Metadata**
> or the plugin's own sidebar section.

Open **Metadata** in the Administration sidebar and click **Configure** on the provider's row. Fill the field, then click **Save**.

![Opening Metadata and clicking Configure on a provider](/img/admin-metadata-3-tmdb-anim.webp)

Nothing is applied until you click **Save**. API keys and tokens are stored as secrets.

## Provider order

**Settings > Metadata** has an **Order per kind** section: **Movies**, **Series**, **Books** and
**Albums**, each a list of providers. Fliks asks them from the first to the last. Drag a row, or use
its up and down arrows, to change the order.

![Order per kind on Settings > Metadata](/img/admin-metadata-order.webp)

On a fresh install the order is:

| Kind | Order |
|---|---|
| Movies | TMDB, TheTVDB |
| Series | TMDB, TheTVDB, TheXEM scene numbering |
| Books | Audible, Audnexus, BnF, Google Books, OpenLibrary |
| Albums | Fanart.tv, LRCLIB, MusicBrainz |

A library can prefer one provider over the others, and a single title can be overridden. See
[Metadata](/features/metadata). The order of lyrics providers is set separately on
**Settings > Lyrics**.

## Updates

Open the menu next to **Search for a plugin** (the three dots). It has **Refresh all sources**,
**Manage sources**, **Settings** and **Import a plugin**.

![The menu next to Search for a plugin, with Settings highlighted](/img/builtin-plugins-menu.webp)

**Settings** has **Update plugins automatically**, on by default.

![The Settings dialog, with Update plugins automatically on](/img/builtin-plugins-auto-update.webp)

With it on, the scheduled task **Refresh plugin sources** (every day at 03:00 server time, listed under
**Advanced > Scheduled tasks**) refreshes the catalogue, then installs the newest version of every
plugin you have, as long as it is signed by the source's catalogue key. A version that asks for
new permissions is held until you install it by hand, and a version that fails to start is rolled
back. Updating keeps a plugin's settings.

With it off, an **Update available** badge shows in the catalogue and you update by hand.

The other three settings (**Ignore the required Fliks version**, **Allow installing older
versions**, **Allow unsigned plugins**) are off by default and meant for development. They are
described in [Plugins](/administration/plugins#plugin-settings).

## See also

- [Plugins](/administration/plugins) for trust, sources, import, export and uninstalling.
- [Metadata](/features/metadata) for languages, regions and fixing a wrong match.
- [Plugin development](/plugins/overview) to write your own.
