---
title: Set up the plugin
group: Torrent manager
description: What Torrent manager does, what to set up before it can fetch anything, and how a request turns into a file in your library.
---

> [!SUMMARY]
> Torrent manager turns an approved request into a file in your library: it searches your indexers, picks the best release, hands it to your download client and files the result. Install it from **Settings > Plugins** once the [setup order](/downloads/overview#order-to-set-things-up) is done. Without it requests stay approved forever.

Its pages: [Indexers](/downloads/indexers), [Download clients](/downloads/download-clients), [Settings](/downloads/plugin-settings), [Troubleshooting](/downloads/troubleshooting).

## What you need first

Set up in the order of [Do you need downloads?](/downloads/overview#order-to-set-things-up): profiles on the library, one indexer, one download client, then the plugin. Skipping one is the usual reason nothing happens.

## Install the plugin

Install it from the catalogue with the admin account. Keep **Reach services on the local network** in the consent list: without it the plugin cannot reach a client or indexer on your network.

:::steps
![Open **Settings > Advanced > Plugins** and click **Search for a plugin**](/img/download-install-1-plugins.webp)
![Click **Install** on the **Download** card](/img/download-install-2-catalogue.webp)
![Read the consent list, then click **Install**](/img/download-install-3-consent.webp)
:::

Trust badges and sources are in [Plugins](/administration/plugins).

## Where everything is

:::details Where every page of the plugin is
| What | Where |
|---|---|
| The plugin card, **Disable**, **Export**, **Uninstall** | **Settings > Advanced > Plugins**, click **Download** |
| General options | **Settings > Torrent manager > General** |
| Indexers and indexer sources | **Settings > Torrent manager > Indexers** and **Indexer sources** |
| Download clients | **Settings > Torrent manager > Download clients** |
| Provider order and search interval | **Settings > Downloads**, see [Downloads](/downloads/automatic-search) |
| Requests, queue, history, calendar | **Downloads** section of the main sidebar |
| Search for a release yourself | A title's **⋮** menu, **Files** |

![Torrent manager page, with Disable, Export and Uninstall](/img/download-plugin-page.webp)

> [!WARNING]
> The **Downloads** item under **Library** in the main sidebar is something else: it lists the
> copies you saved for offline playback, see [Offline downloads](/features/offline-downloads).
> The plugin's queue and history are under the **Downloads** heading, a few lines below.
:::

The **Queue** and **History** pages need the **Download releases** permission.

## How a request becomes a file

This is the path with a request. Someone without add rights asks for a title, an admin approves it, and
the plugin does the rest. The slider uses the plugin with one indexer and one qBittorrent.

:::steps
![A user opens the title and clicks **Request**](/img/download-flow-1-request.webp)
![The button now reads **Already requested**](/img/download-flow-2-requested.webp)
![An admin opens **Downloads > Requests** and clicks **Approve**](/img/download-flow-3-approve.webp)
![The release is in **Downloads > Queue**, here **Importing**](/img/download-flow-4-queue.webp)
![When the import ends, **Downloads > History** shows **Imported**](/img/download-flow-5-history.webp)
![The request reads **Downloaded** and the title is in the library](/img/download-flow-6-downloaded.webp)
:::

:::details What happens behind each step of a download
What happens behind each step:

1. **Approval.** The title is added to the library if it was not there, set to monitored, and searched at once.
   An admin who clicks **Add** on a title gets the same result without a request.
2. **Search.** Every indexer allowed for automatic searches is asked in parallel. Each answer is scored
   against the quality profile and the language profile of the title, the
   [quality definitions](/downloads/quality-definitions) and the
   [custom formats](/downloads/custom-formats).
3. **Grab.** The best release that is not refused is sent to the download client, filed under the client's
   category. The plugin fetches the `.torrent` file itself, so the client does not need to reach the indexer.
4. **Download.** The **Queue** follows the client. States: **Queued**, **Downloading**, **Stalled**, **Paused**.
5. **Import.** Once a minute the plugin looks for finished downloads. It **copies** the file into the library,
   renamed with your [naming](/administration/general-and-naming) rules, and the state becomes **Importing**
   then **Imported**. The original stays in the client's folder until it has seeded long enough, see
   [Settings](/downloads/plugin-settings#seeding).
6. **Done.** The request changes to **Downloaded** and the title can be played.

If nothing suitable exists yet, the title stays monitored. The plugin searches again on a schedule and reads
the indexers' new releases every 15 minutes, so a release that appears later is still caught.
:::

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

The **Search for missing downloads** task that looks for every missing title belongs to Fliks itself, see
[Downloads](/downloads/automatic-search).
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
