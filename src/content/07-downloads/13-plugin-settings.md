---
title: Plugin settings
group: Torrent manager
description: Every option of Torrent manager, with its default: search time, stalled-download cleanup, seeding, cooldowns and where each one lives.
---

> [!SUMMARY]
> Torrent manager has few options of its own: pause automatic downloads, how long a search waits, and optional stalled-download cleanup, all in **Settings > Torrent manager > General**. Everything else lives on indexers, clients, profiles and **Settings > Downloads**.

The plugin's own options are few. Most of what changes its behaviour sits in four places:

:::details Where each download option lives
| Where | What it holds |
|---|---|
| **Settings > Torrent manager > General** | The options on this page: pause, search time, stalled-download cleanup. |
| [Indexers](/downloads/indexers#indexer-options) | Per tracker: request delay, which searches use it, minimum seeders, seeding limits, priority. |
| [Download clients](/downloads/download-clients#client-options) | Per client: address, categories, priority. |
| **Settings > Downloads** | Fliks's own search schedule and provider order, see [Downloads](/downloads/automatic-search). |

[quality profile](/downloads/quality-profiles), the [language profile](/administration/language-profiles),
the [quality definitions](/downloads/quality-definitions) and the
[custom formats](/downloads/custom-formats), not by this plugin.
:::

## General

Open **Settings > Torrent manager > General** and click **Save** after any change.

### Search

:::details Search options: pause and search time
| Option | Default | Range | What it does |
|---|---|---|---|
| **Pause automatic downloads** | off | | No new release is grabbed on its own: no scheduled search, no RSS grab. Downloads already in progress finish and are imported, and you can still grab a release yourself. |
| **Seconds allowed for a release search** | 30 | 5 to 120 | A search stops waiting for indexers slower than this and keeps the answers it already has. Raise it if a slow tracker never shows up in the results. |

![Pause automatic downloads and the search time](/img/download-settings-search.webp)
:::

**Pause automatic downloads** is the quick way to stop everything without touching the plugin: use it while you move
the download folder, or before a maintenance on the client.

### Stalled downloads

A download is stalled when it barely moves. The plugin can remove such a download and look for another
release. This is **off** until you set **Stalled-download checks before cleanup**.

:::details Stalled-download options and how the count works
| Option | Default | Range | What it does |
|---|---|---|---|
| **Stalled-download checks before cleanup** | empty (off) | 2 to 100 | How many consecutive failed checks remove a download. Empty never cleans up. |
| **Minutes between checks** | 60 | 5 to 1440 | The delay between two checks of the same download. |
| **Minimum average speed (KiB/s)** | 8 | 1 to 102400 | A check counts as failed when the download averaged less than this since the previous check, even if it is still moving. |
| **Search again after cleanup** | on | | Look for another release once a stalled download has been removed. |
| **Search again for downloads you started yourself too** | off | | Searches for a replacement for downloads you grabbed by hand as well. A stalled download is removed either way. |

![The stalled-download options](/img/download-settings-stalled.webp)

How it adds up: the plugin reads each unfinished download's progress, at most once per **Minutes
between checks**. After **Stalled-download checks before cleanup** failed checks in a row the download is
removed, so with 3 checks every 60 minutes it goes after about 3 hours without progress. A check that sees
enough progress resets the count.
:::

> [!WARNING]
> Removing a stalled download deletes the torrent **and its files** from the client. The release is
> also added to the plugin's blocklist so the same one is not grabbed again, and the history keeps a line
> **Stalled, removed by stalled-download cleanup**. Only downloads the plugin itself sent are touched.

## Seeding

Finished torrents keep seeding in the client after Fliks copied the file. The **Clean seeded downloads** job,
every 5 minutes, removes a finished torrent **and its files** when its tracker's limits are met. The limits are
set per indexer, because trackers have different rules:

| Option (on the indexer) | Default | Removes the torrent when |
|---|---|---|
| **Seed ratio target** | 1 | Its share ratio reaches the target. |
| **Maximum seeding days** | empty | It finished this many days ago, even if the ratio is lower. Empty relies on the ratio alone. |

Either condition is enough. The days limit makes sure a torrent that will never reach its ratio still
leaves. A torrent that holds a second kind of file you still want, for example an ebook release with an
audiobook not yet imported, is kept until it is imported, unless the days limit is reached.

> [!IMPORTANT]
> A private tracker usually demands a minimum ratio or seeding time. Set these two options to meet it,
> since the cleanup deletes the files as soon as the limits are reached.

## Search

:::details How a search is built and which indexers it uses
When a search runs, the plugin builds the query from the title and its year, for example
`Caminandes: Llamigos 2016`, and asks each indexer allowed for that kind of search.

- **Automatic searches**: the scheduled search, the one right after an approval, **Search automatically**.
- **Manual searches**: **Search manually** on a title.
- **RSS sync**: the 15-minute read of each indexer's newest releases.

An indexer ticked for none of them is never used, which is why the form refuses an empty **Use for**.
Each indexer is spaced by its **Request delay**, and an indexer that fails is paused for a while, see
[cooldowns](/downloads/indexers#keeping-an-eye-on-indexers).
:::

## Import

:::details How the import works
Once a minute the plugin checks the client for finished downloads it grabbed and copies them into the
library. There is nothing to configure here: the destination and the file name come from the library and the
[naming](/administration/general-and-naming) settings. A download that ends with no usable file is removed
from the client and its release blocklisted. One that holds only other media files fails with a message in
the **History**, and **Retry the import** in the row menu tries again.
:::

## Blocklist

:::details What gets a release blocklisted
The plugin keeps a list of releases it must not grab again. A release gets on it in three ways:

- You choose **Also blocklist this release** when you remove a transfer from the **Queue**.
- A stalled download is cleaned up.
- A finished download contains no media file.

There is no page that lists the blocklist.
:::

## Where the Fliks side lives

Provider order, how often missing titles are searched, and what to do with extra album tracks are
core settings, because they apply to any download provider. See [Downloads](/downloads/automatic-search).
