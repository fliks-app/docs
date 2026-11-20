---
title: Downloads
description: Choose which download provider is asked first, how often missing and upgradable titles are searched, and what happens to extra album tracks.
---

> [!NOTE]
> **Do you need this?** Only if you use [requests](/features/requests) or the download plugin. This page controls
> the automatic search for files. Fliks itself never downloads anything: it decides what to look for and
> which release is best, and a download provider plugin does the searching and grabbing. If you only watch
> files you already have, skip this page.

## What it is for

The **Downloads** page holds the settings of the automatic search:

- The order of the download providers, when more than one is installed.
- How often Fliks runs a search for everything still missing or still upgradable.
- What to do with tracks of a downloaded album that nobody asked for.

The page is empty of providers until a download plugin is installed. Install it from **Settings > Advanced >
Plugins**, see [Plugins](/administration/plugins). With none installed the list reads "No download provider is
installed."

## Where to find it

**Settings > Downloads**, in the **Media** section of the admin sidebar. You need the **Settings access**
permission.

Open **Settings > Downloads**. The page holds the provider order, **Search interval (minutes)**, the music option and **Save**.

![Opening Settings > Downloads](/img/admin-downloads-2-page-anim.webp)

## Every setting

| Setting | What it does |
|---|---|
| **Provider order** | One row per installed download provider, with its name and id. Drag a row by its handle, or use the up and down arrows. When two providers offer a release that ranks the same, the first in the list wins. |
| **Search interval (minutes)** | How often the scheduled search runs. A whole number of 1 or more. Default 360, which is every 6 hours. |
| **Music: Tracks nobody asked for** | For a downloaded album: **Import unmonitored** (the default) keeps the other tracks in the library but does not look for missing ones. **Do not import** leaves them out. |
| **Save** | Stores the three settings together. Nothing is saved until you click it. |

The scheduler checks once an hour, and runs the search once the interval has passed since the last one. In
practice the interval is rounded up to whole hours, so a value under 60 searches hourly.

## What a search does

The search is the **Search for missing downloads** task. It also runs on demand from **System > Trigger a task**,
and for a single title as soon as that title is approved as a request or added to the library as monitored.

For every monitored title that has a [quality profile](/administration/quality-profiles) and still needs a file,
or has a file below its cutoff with upgrades on:

1. If a download for that title is already in flight, it is skipped.
2. Each installed provider is asked for releases. Fliks scores every answer: quality, language, size, custom
   formats, title match. It keeps the first three clean releases of each provider.
3. The kept releases are sorted by quality rank, then custom format score. A tie goes to the provider that is first in
   **Provider order**.
4. The best release is sent to its provider to grab. If that provider refuses, the next best is tried, up to three times.

A provider that fails or is busy is left out of that pass and asked again later; it never blocks the others.

## Worked example: search every 12 hours, prefer one provider

1. Open **Settings > Downloads**.
2. Drag the provider you trust most to the top of **Provider order**.
3. Set **Search interval (minutes)** to `720`.
4. Click **Save**.

Missing titles are now searched at most twice a day. When two providers offer the same quality and score, the
top one is asked to grab it. A new request is still searched at once when it is approved, whatever the interval.

## How it connects

- [Quality profiles](/administration/quality-profiles) say which qualities are accepted and when to stop upgrading.
- [Quality definitions](/administration/quality-definitions) and [custom formats](/administration/custom-formats)
  refuse or rank the releases.
- [Language profiles](/administration/language-profiles) filter audio languages.
- [Auto-approval](/administration/auto-approval) lets a request reach this search without waiting for a person.
- [Requests](/features/requests#what-happens-after-approval) shows what the requester sees as a download moves on.
- [System](/administration/system) has the task history and the button to run a search now.
