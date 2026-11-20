---
title: Comics
description: Comic Vine and Metron, the catalogue plugins that identify comic volumes and issues. Both need your own key.
---

Fliks reads `.cbz`, `.cb7`, `.cbr` and `.pdf` files without any plugin. To get covers, publishers,
descriptions and issue lists, install a comics provider. Both are catalogue plugins: install them
from **Administration > Advanced > Plugins > Search for a plugin**, then configure them from
**Settings > Metadata** (see [Overview](/built-in-plugins/overview#configure-a-plugin)).

Fliks ships no key and no account for either. Until you set one, the provider stays inactive and
comics are not matched.

Both providers search volumes, return a volume as a work and list its issues (number as printed,
cover and store dates, cover). Both handle annuals.

## Comic Vine

Data from [Comic Vine](https://comicvine.gamespot.com).

**Settings**:

| Field | Default | Notes |
|---|---|---|
| **API key** | Empty | Required. Create an account on comicvine.gamespot.com, then get a key at comicvine.gamespot.com/api. |

Limits: Comic Vine allows 200 requests per resource and per hour. Fliks paces itself well under it
(one request every 20 seconds), so a first scan of a large comics library is slow. A rate-limit
answer pauses the provider.

> [!IMPORTANT]
> Comic Vine's terms limit its API and data to **non-commercial use** and ask for a link back to
> Comic Vine wherever its data shows. The plugin's settings page carries that link.

## Metron

Data from [Metron](https://metron.cloud), a community comic database, licensed CC BY-SA 4.0.

**Settings**:

| Field | Default | Notes |
|---|---|---|
| **API token** | Empty | Required. Create an account on metron.cloud, then create a token in the API Tokens section of your account page. |

Limits are per account: 20 requests per minute and 5,000 per day. Fetching a volume costs two
requests, and an issue list one request per 100 issues plus one. A long scan can hit the daily limit:
Fliks then waits and retries.

## Which one first

Metron's data is open (CC BY-SA) and its limits are published per day. Comic Vine's data is for
non-commercial use only and paced much slower. If you install both, rank them in **Order per kind**
on **Settings > Metadata**: the first one that knows a volume answers.

## See also

- [Comics](/features/comics) for libraries, editing details and the reader.
