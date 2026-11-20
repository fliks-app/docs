---
title: Download indexers
description: Add the trackers the Download plugin searches, by importing them from Prowlarr or Jackett or by typing a Torznab address.
---

An **indexer** is a Torznab endpoint: a web address and an API key that answer "which releases match
this title". The Download plugin queries every indexer you enable, in parallel, each time it searches.

There are two ways to get indexers into Fliks.

| Way | Use it when |
|---|---|
| [Import from Prowlarr or Jackett](#import-from-prowlarr-or-jackett) | You already run one of them. One connection brings in all its trackers. |
| [Add a Torznab indexer by hand](#add-a-torznab-indexer-by-hand) | You have a single Torznab address, or Jackett has an admin password. |

Both end in the same list, **Settings > Download > Indexers**. An imported indexer is an ordinary Torznab
row: you can edit, disable or delete it like one you typed.

![The Indexers page, with one row per indexer](/img/download-indexers-list.webp)

> [!NOTE]
> Prowlarr and Jackett are separate programs. Fliks does not install them, does not add trackers
> to them and does not ship any tracker. You add your own trackers there, under their terms.

## What Fliks needs from you

The address you type is the one **Fliks** uses to reach Prowlarr or Jackett, not the one in your
browser.

| Fliks runs | Prowlarr or Jackett runs | Address to type |
|---|---|---|
| In Docker, same Compose project or network | In Docker, same network | The service name, for example `http://prowlarr:9696` or `http://jackett:9117` |
| In Docker | On the host, or another machine | The host's LAN address, for example `http://192.168.1.20:9696` |
| In Docker | In another Compose project | Join one network, or use the host's LAN address and the published port |

> [!WARNING]
> Do not type `localhost` or `127.0.0.1` when Fliks runs in Docker. Inside the Fliks container they mean
> the Fliks container itself, so the test fails with **Could not reach the source**.

If you changed Prowlarr's **URL Base** or Jackett's **Base path override**, add it to the address, for
example `http://jackett:9117/jackett`. Use `https://` only if the program serves HTTPS with a certificate
the Fliks server trusts.

## Import from Prowlarr or Jackett

Open **Settings > Download > Indexer sources**. A source is a saved connection to Prowlarr or Jackett.
The page does not hold trackers: it holds the way to read them.

### Prowlarr

You need its address and its API key. The key is in Prowlarr, under **Settings > General > Security**,
**API Key**.

:::steps
![In Prowlarr, open **Settings**](/img/download-prowlarr-key-1-settings.webp)
![Open **General**](/img/download-prowlarr-key-2-general.webp)
![In **Security**, copy the **API Key** with the button next to it](/img/download-prowlarr-key-3-apikey.webp)
:::

Prowlarr only exposes the trackers you added to it. If its list is empty, add one first. Any tracker
type works; the screens below add a generic Torznab feed.

:::steps
![In Prowlarr, click **Add Indexer**](/img/download-prowlarr-add-1-button.webp)
![Search for your tracker. Here the generic **Torznab** entry](/img/download-prowlarr-add-2-pick.webp)
![Fill its address and key, then **Test** and **Save**](/img/download-prowlarr-add-3-form.webp)
:::

Then connect Fliks:

:::steps
![In Fliks, **Settings > Download > Indexer sources**, click **New source**](/img/download-source-prowlarr-1-new.webp)
![Name it, keep **Type** on **Prowlarr**, type the **Base URL** and paste the **API key**, then **Test connection**](/img/download-source-prowlarr-2-form.webp)
![**Indexer list read, connection OK** means both are right. Click **Save**](/img/download-source-prowlarr-3-test.webp)
![Saving imports straight away. **Import the indexers** reads the list again later](/img/download-source-prowlarr-4-saved.webp)
:::

What the import does with Prowlarr:

- It reads Prowlarr's list through its API, with the key you gave.
- Each **torrent** indexer becomes a Torznab indexer in Fliks, reached through Prowlarr
  (`http://prowlarr:9696/<id>/api`). Fliks never talks to the tracker itself.
- A usenet indexer is skipped.
- An indexer that is disabled in Prowlarr is imported disabled.

### Jackett

You need its address and its API key. The key is at the top right of Jackett's dashboard: click the
copy button next to **API Key**.

Jackett also needs the trackers you want, added with **Add indexer**. Only the ones listed
on its dashboard, which means configured, are imported.

:::steps
![In Jackett, click **Add indexer**](/img/download-jackett-1-add.webp)
![Search for your tracker and click the **+** button of its row](/img/download-jackett-2-pick.webp)
![The tracker is listed. Copy the **API Key** at the top right](/img/download-jackett-3-key.webp)
:::

Then connect Fliks, the same way as Prowlarr but with **Type** set to **Jackett**:

:::steps
![Pick **Jackett**, type the **Base URL** and paste the **API key**](/img/download-source-jackett-1-form.webp)
![**Test connection**, then **Save**](/img/download-source-jackett-2-test.webp)
![Saving imports straight away. **Import the indexers** reads the list again later](/img/download-source-jackett-3-saved.webp)
:::

Each configured Jackett tracker becomes a Torznab indexer reached through Jackett
(`http://jackett:9117/api/v2.0/indexers/<id>/results/torznab/`).

> [!IMPORTANT]
> **Jackett with an admin password cannot be imported.** Jackett only answers its list of trackers to a
> browser that has logged in, and the source form has no password field. The test fails with *The source
> asks for a login this import cannot provide.* You have two choices:
>
> - **Without a password** (the default of a fresh Jackett): type the address and the API key, nothing
>   else. Fliks follows Jackett's own sign-in redirect, which needs no password in that case. Keep Jackett
>   on a private network, because anyone who reaches it can use it.
> - **With a password**: remove it in Jackett (empty **Admin password**, **Set Password**), or skip the import and
>   [add each indexer by hand](#add-a-torznab-indexer-by-hand). The Torznab feed itself is protected by the
>   API key only, so a hand-added indexer works with the password on.

![The test of a Jackett source that has an admin password](/img/download-source-jackett-password-error.webp)

### After the import

- **Import the indexers** (in the row of the source) reads the list again. It adds the new trackers and
  never deletes one, even if you removed it in Prowlarr or Jackett.
- An indexer already in Fliks keeps your settings, such as its priority and seeding limits. Only its API
  key is updated, which matters if you regenerated the key in Prowlarr or Jackett.
- The toast reads for example **1 indexers added, 0 updated**.
- Deleting a source keeps the indexers it imported.
- The **Active** switch of a source turns its import off. Importing a disabled source is refused.

## Add a Torznab indexer by hand

Use this for a tracker that exposes its own Torznab address, for Jackett with a password, or to test.
You need two things: the **Base URL** of the feed and its **API key**. In Jackett, click **Copy
Torznab Feed** on the tracker's row for the URL; the key is the dashboard's **API Key**.

:::steps
![In **Settings > Download > Indexers**, click **New indexer**](/img/download-indexer-manual-1-new.webp)
![Type a **Name**, the **Base URL** of the Torznab feed and the **API key**](/img/download-indexer-manual-2-form.webp)
![Adjust the other options if needed, then click **Test connection**](/img/download-indexer-manual-3-options.webp)
![**Capabilities read, connection OK**: click **Save**](/img/download-indexer-manual-4-test.webp)
:::

The test asks the indexer for its capabilities. It tells you at once whether the address and key work.
A failure reads **Could not reach the indexer**, **The indexer answered with an HTTP error**, **The indexer
reported an error** or **Unexpected response**, which usually means the address points at a web page
instead of the Torznab feed.

### Indexer options

| Option | Default | What it does |
|---|---|---|
| **Name** | | The name shown in the lists and in the release tabs. |
| **Base URL** | | The Torznab feed address. Required. |
| **API key** | | Stored encrypted. Leave it blank when editing to keep the saved one, or click **Clear stored value**. |
| **Request delay (seconds)** | 2 | Minimum time between two search requests to this indexer. Raise it for a tracker that rate-limits you. |
| **Use for** | All three | Which searches may use this indexer: **Automatic searches**, **Manual searches**, **RSS sync**. At least one. |
| **Minimum seeders** | 0 | Releases with fewer seeders than this are refused. |
| **Seed ratio target** | 1 | A finished download is removed from the client once it reaches this ratio. |
| **Maximum seeding days** | empty | Removes a finished download this many days after it completed, even if the ratio is not reached. Empty waits for the ratio alone. |
| **Unknown-language code** | empty | A two-letter language code, such as `en`, assumed when a release does not name its language. Free text: a typo is stored as typed. |
| **Priority** | 25 | Indexers are queried from the lowest number to the highest. |
| **Active** | on | A disabled indexer is never queried. |

The seeding options are explained under [Settings](/built-in-plugins/download-settings#seeding).

## Keeping an eye on indexers

The list has a name filter, a sort menu and checkboxes to select several rows. Each row has:

- **Stats**: queries, average response time, results and errors per day, for the last 30 days.
- **Delete**.
- A **Cooldown** column. A cooldown is a pause after the indexer failed or asked to be left alone.

![The Stats of an indexer](/img/download-indexer-stats.webp)

**Cooldowns.** After a failed query the indexer is left alone for 30 seconds, then 2 minutes, 15 minutes,
1 hour and finally 6 hours if it keeps failing. A success resets the count. An indexer that answers with a
"retry after" delay is paused for that delay. A search never waits for an indexer in cooldown: it simply
skips it. **Clear cooldown** on a row, or **Clear all cooldowns** at the top, queries it again at once.

**Slow indexers.** A search stops waiting for an indexer after the time set in
[**Seconds allowed for a release search**](/built-in-plugins/download-settings#search) and keeps the answers
it already has.

**Tracker quirks.** The plugin asks each indexer which kinds of search it supports. If a typed search such
as "movie" is refused, it falls back to a plain text search and remembers that.
