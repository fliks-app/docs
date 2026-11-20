---
title: Overview
description: Which plugins Fliks ships with or offers in its catalogue, where to manage them, and which ones need an API key or an account.
---

> [!SUMMARY]
> Fliks ships bundled metadata plugins and offers more in a catalogue: torrent downloads, free ebooks, comics, music lists, notifications. Find a plugin in the table below. Metadata providers are configured from **Settings > Metadata**, other plugins in their own sidebar section.

## Bundled and catalogue plugins

**Bundled** plugins ship inside the server and are all metadata providers: you can disable but not uninstall them. **Catalogue** plugins are installed on demand from the plugin page, with a consent step. All are published by the Fliks project ([trust badges and permissions](/administration/plugins); [write your own](/plugins/overview)).

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
| [Torrent manager](/built-in-plugins/torrent-manager) | Torrent search on Torznab indexers, torrent clients and the grab pipeline | Catalogue | Depends on your indexers and clients |

Torrent manager has its own guide: start with [Set up the plugin](/built-in-plugins/torrent-manager).

## Where plugins live

Open **Advanced > Plugins**: one card per installed plugin. Installing, updating, trust badges and removing are in [Plugins](/administration/plugins).

![The Plugins page: one card per installed plugin, **Search for a plugin** and the menu at the top](/img/builtin-plugins-list.webp)

## Configure a plugin

The plugin's page does not link to its settings. Where they live depends on the kind of plugin.

- **Metadata providers** (every bundled plugin, plus Project Gutenberg, LibriVox, Comic Vine and
  Metron) are configured from **Settings > Metadata**. The provider's row has a **Configure** link.
- **Other plugins** (Torrent manager, Notify, Music lists) get a section of their own in the Administration
  sidebar, named after the plugin.

Open **Metadata** in the Administration sidebar and click **Configure** on the provider's row. Fill the field, then click **Save**.

![Opening Metadata and clicking Configure on a provider](/img/admin-metadata-3-tmdb-anim.webp)

Nothing is applied until you click **Save**. API keys and tokens are stored as secrets.

## Provider order

**Settings > Metadata > Order per kind** sets which provider is asked first. See [Metadata settings](/administration/metadata-settings).

## See also

- [Plugins](/administration/plugins) for installing, trust, automatic updates, import, export and uninstalling.
- [Metadata](/features/metadata) for languages, regions and fixing a wrong match.
- [Plugin development](/plugins/overview) to write your own.
