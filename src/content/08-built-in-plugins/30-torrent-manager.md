---
title: Set up the plugin
group: Torrent manager
description: What Torrent manager does, what to set up before it can fetch anything, and how a request turns into a file in your library.
---

> [!SUMMARY]
> Torrent manager turns an approved request into a file in your library: it searches your indexers, picks the best release, hands it to your download client and files the result. Install it from **Settings > Plugins**. Without it requests stay approved forever.

Its pages: [Indexers](/built-in-plugins/indexers), [Download clients](/built-in-plugins/download-clients), [Settings](/built-in-plugins/torrent-manager-settings), [Troubleshooting](/built-in-plugins/torrent-manager-troubleshooting).

## Get it working

1. [Install the plugin](#install-the-plugin), below.
2. [Add an indexer](/built-in-plugins/indexers): where the plugin searches for releases.
3. [Add a download client](/built-in-plugins/download-clients): qBittorrent or Transmission, which downloads them.

Requests also use a [quality profile](/downloads/quality-profiles) and a
[language profile](/downloads/language-profiles), set in the Downloads section.

## Install the plugin

Install it from the catalogue with the admin account. Keep **Reach services on the local network** in the consent list: without it the plugin cannot reach a client or indexer on your network.

:::steps
![Open **Settings > Plugins** and click **Search for a plugin**](/img/download-install-1-plugins.webp)
![Click **Install** on the **Torrent manager** card](/img/download-install-2-catalogue.webp)
![Read the consent list, then click **Install**](/img/download-install-3-consent.webp)
:::

Trust badges and sources are in [Plugins](/administration/plugins).

## Where everything is

:::details Where every page of the plugin is
| What | Where |
|---|---|
| The plugin card, **Disable**, **Export**, **Uninstall** | **Settings > Plugins**, click **Torrent manager** |
| General options | **Settings > Torrent manager > General** |
| Indexers and indexer sources | **Settings > Torrent manager > Indexers** and **Indexer sources** |
| Download clients | **Settings > Torrent manager > Download clients** |
| Queue and history | **Downloads** section of the main sidebar |
| Search for a release yourself | A title's **⋮** menu, **Files** |

![Torrent manager page, with Disable, Export and Uninstall](/img/download-plugin-page.webp)

> [!WARNING]
> The **Downloads** item under **Library** in the main sidebar is something else: it lists the
> copies you saved for offline playback, see [Offline downloads](/features/offline-downloads).
> The plugin's queue and history are under the **Downloads** heading, a few lines below.
:::

The **Queue** and **History** pages need the **Download releases** permission.

## What it does with an approved request

When a [request](/downloads/requests) is approved, or an admin adds a title, the plugin takes over:

1. **Search**: it asks every indexer allowed for automatic searches and scores each release against the
   title's quality and language profiles, the [quality definitions](/downloads/quality-definitions) and
   the [custom formats](/downloads/custom-formats).
2. **Grab**: it sends the best release to your download client.
3. **Import**: once a minute it copies finished downloads into the library, renamed with your
   [naming](/administration/general-and-naming) rules. The original stays in the client until it has
   [seeded](/built-in-plugins/torrent-manager-settings#seeding) long enough.

If nothing suitable exists yet, it searches again on a schedule and reads the indexers' new releases
every 15 minutes.

## Searching yourself

You do not need to wait for the automatic search. On any title in a library you can search now.

:::steps
![Open the title and click **⋮ More**](/img/download-search-1-more.webp)
![Open **Files**](/img/download-search-2-files.webp)
![Click **Search manually** to choose, or **Search automatically** to let Fliks pick](/img/download-search-3-manual.webp)
![The **Available releases** list: one tab per indexer, the download button on the right](/img/download-search-4-releases.webp)
:::

:::details Manual search: warnings, automatic search and tracking status
- **Search manually** lists every release the indexers returned, with quality, size and seeders. A warning icon means
  the release does not fit the profile, for example **Not an upgrade on the file on disk**. You can still
  download it after a confirmation.
- **Search automatically** runs the same pick as the scheduled search for this title only.
- **View tracking status** tells whether the title still needs a file, for example **Cutoff met** once the file reaches the profile's cutoff.

A series has the same search on its seasons and episodes.
:::

## Scheduled jobs

:::details The four scheduled jobs
The plugin registers four jobs. You can see and run them in **Settings > Advanced > Scheduled tasks**.

| Job | When | What it does |
|---|---|---|
| **RSS sync** | Every 15 minutes | Reads the newest releases of every indexer allowed for RSS, and grabs those that match a monitored title. |
| **Import completed downloads** | Every minute | Imports finished downloads and updates the queue. |
| **Clean stalled downloads** | Every 5 minutes | Removes downloads that stopped moving, if you turned that on. |
| **Clean seeded downloads** | Every 5 minutes | Removes finished torrents that reached their seeding limit. |
:::

## What it supports

:::details What the plugin supports
| | Supported |
|---|---|
| Indexers | Torznab. Prowlarr and Jackett can feed the list. Usenet is not supported. |
| Download clients | qBittorrent and Transmission (3.0 or later). |
| Media | Movies, series, books and audiobooks, comics, albums. |
:::

## Disabling and uninstalling

**Disable** stops all searching and importing and keeps your indexers, clients, history and blocklist. **Uninstall** deletes them with the plugin. See [Plugins](/administration/plugins).
