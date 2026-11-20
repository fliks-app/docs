---
title: Plugin troubleshooting
group: Torrent manager
description: Why a title is not downloading, what each test message and queue state means, and how to fix the usual setup mistakes.
---

> [!SUMMARY]
> Nothing downloads? Work down the six checks in **Nothing is downloaded**: plugin active, title monitored with a quality profile, downloads not paused, an indexer and a client active, a release that fits, then the schedule. Message tables for each part follow.

## Nothing is downloaded

Check these in order, on the title that does not move.

1. **The plugin is installed and Active.** **Settings > Plugins**, click **Torrent manager**. The badge reads **Active**.
2. **The title is monitored and has a quality profile.** A title with no
   [quality profile](/downloads/quality-profiles) is never searched. Give the library a default one, see
   [Quality profiles](/downloads/quality-profiles).
3. **Automatic downloads are not paused.** **Settings > Torrent manager > General**, **Pause automatic downloads** is off.
4. **An indexer is active** and its **Use for** includes **Automatic searches**, and **a download client is active.**
   Without a client the grab fails with *No enabled download client is configured*.
5. **A release exists.** On the title, **⋮ > Files > Search manually**. If the list is empty, the indexers found
   nothing: try the same title in Prowlarr or Jackett. If a release is there with a warning icon, hover it:
   the release does not fit the profile, for example **Not an upgrade on the file on disk** or a size outside
   the [quality definition](/downloads/quality-definitions).
6. **Wait for the schedule, or run it.** A new approval is searched at once. Otherwise
   [Downloads](/downloads/automatic-search) sets how often missing titles are searched.

## Indexer sources

:::details Every indexer source message
| Message | Cause and fix |
|---|---|
| **Could not reach the source** | Wrong host or port, the program is stopped, or the name is unknown from the Fliks container. `localhost` inside Docker is Fliks itself. Use the service name or the LAN address. |
| **The source answered with an HTTP error** (401) | The API key is wrong. Copy it again from Prowlarr or Jackett. |
| **The source answered with an HTTP error** (404) | The address has a wrong path. Remove it, or add the program's URL base. |
| **Unexpected response: not an indexer list** | The address points at something else, such as a web page. Use the root address of Prowlarr or Jackett. |
| **The source asks for a login this import cannot provide** | Jackett has an admin password. Remove it, or [add the indexers by hand](/built-in-plugins/indexers#add-a-torznab-indexer-by-hand). |
| **This source is disabled. Enable it before importing.** | Switch **Active** on in the source. |
| **Base URL is empty** | Fill **Base URL**. |
:::

If the import works but adds **0 indexers**, the program holds none yet: add trackers in Prowlarr or Jackett first.

## Indexers

:::details Every indexer message
| Message | Cause and fix |
|---|---|
| **Could not reach the indexer** | Same as above: address or network. |
| **The indexer answered with an HTTP error** (401) | Wrong API key. |
| **Unexpected response** | The address is not a Torznab feed. For Prowlarr it ends with `/<id>/api`, for Jackett with `/results/torznab/`. |
| **The indexer reported an error** | The indexer is up but refused the request, often a limit or a banned key. Read its own log. |
:::

A row whose **Cooldown** column is filled has failed repeatedly and is being skipped. Fix the cause, then
**Clear cooldown**.

A tracker returns nothing for a title you know it has: the plugin searches by title and year, so a title the
tracker spells differently is missed. Search by hand in **Search manually** to see what the tracker returns.

## Download clients

:::details Every download client message
| Message | Cause and fix |
|---|---|
| **Could not reach the download client** | Wrong host or port, the client is stopped, or `localhost` was typed from a Docker Fliks. |
| **Authentication failed**, check the credentials | Wrong username or password. A qBittorrent that still uses the temporary password has a new one at each restart: set your own in **Options > WebUI**. |
| **Host is required** | **Host** is empty. |
| A grab fails with *already holds this torrent, outside the category Fliks manages* | The release was added to the client by hand in another category. Remove it there, or move it into Fliks's category. |
:::

For Transmission, also check the port. The form keeps `8080` when you switch **Type**.

## The queue and the history

:::details Every queue and history state
| State | Meaning |
|---|---|
| **Queued** | The client has it and has not started. |
| **Downloading** | Data is coming in. |
| **Stalled** | The client reports no activity. Cleanup can remove it, see [Settings](/built-in-plugins/torrent-manager-settings#stalled-downloads). |
| **Paused** | Paused, in the client or from the row menu. **Resume** restarts it. |
| **Importing** | Finished in the client, copied within a minute. |
| **Import failed** | The file could not be placed. Open **Info** for the reason, fix it, then **Retry the import** in the row menu. |
| **Imported** (History) | Done. |
| **Failed** (History) | The client or the plugin gave up. **Info** shows the reason. |
| **Removed** (History) | You removed it, or a cleanup did. |
:::

The row menu also has **Remove**, which stops the transfer and removes it from the client, with **Also
blocklist this release** if it was a bad one. In the History, **Delete entry** only removes the record.

## The download finishes but the import fails

The usual cause is the folder.

- **The path is outside the ingest root.** The client saved the file somewhere other than `/downloads`. The
  plugin may only read from `/downloads`. Set the client's default save path under `/downloads`, and
  mount the same host folder there in both containers, see
  [The shared folder](/built-in-plugins/download-clients#the-shared-folder).
- **Fliks cannot see the file.** The folder is mounted in the client but not in Fliks, or at another path.
  Run `docker exec <fliks container> ls /downloads` and look for the file.
- **The library is read-only.** The import copies into the library, so its mount needs write access.
  A `:ro` mount on `/medias` makes every import fail.
- **No media file.** The torrent holds archives or only samples. The plugin removes the download and
  blocklists the release, and searches again for a better one.
- **Wrong titles inside.** A pack holding other titles' files fails with a message that it has none the
  title wants.

## Where to look

- **Downloads > History**, **Info** on a row: the reason in plain words.
- The server logs: the plugin's lines start with the job name, such as `Import`, `RssSync`
  or `SeedCleanup`. See [Logs and troubleshooting](/administration/logs-and-troubleshooting).
- The plugin page's **Metrics**: failed host calls and restarts.

## Behaviour that looks like a bug

- **The file is twice on disk.** Fliks copies. The original in the download folder is removed when seeding ends.
- **A removed Prowlarr indexer is still in Fliks.** An import only adds. Delete the row yourself.
- **Prowlarr or Jackett has an indexer, Fliks does not list it.** Run **Import the indexers** again. Fliks does
  not poll them.
- **A request stays Approved.** No release has been grabbed. Follow the first section.
