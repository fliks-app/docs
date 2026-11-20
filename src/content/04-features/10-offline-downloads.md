---
title: Offline downloads
description: Download a title, a season, a whole series or a playlist to a phone, tablet or the desktop app for playback without a connection.
---

> [!SUMMARY]
> On a phone, tablet, desktop or browser, open a movie or episode and choose **Download**, pick a quality, then play it from **Downloads** without a connection. TV apps have no offline downloads.

## Download a movie or episode

Open a movie or episode, press **Download** and pick a quality. The button shows the progress.

![Press Download, pick a quality, and the button fills up as it downloads](/img/offline-download-quality-anim.webp)

:::details Original file
On the web and the desktop app the list also offers **Original file**: the source file, untouched, without
external subtitles. In a browser it is a plain file save that the Downloads screen doesn't track. It isn't
offered for a season or a series.
:::

Once downloaded, tap the mark again to change the quality or **Delete download**.

![Tap the downloaded mark on a title page: Change quality opens](/img/offline-change-quality-anim.webp)

## Download a season or a whole series

On a series page: **Download all episodes** (series menu), **Download season** (season menu), or **Select**
episodes then **Download**. Episodes already on the device are skipped.

## The Downloads screen

**Downloads** in the sidebar lists everything on the device and the space used. Episodes are grouped by show and season.

![The Downloads screen: one finished download and one in progress, with the pause button under the cursor](/img/offline-downloads-screen.webp)

![The Downloads screen on a phone](/img/offline-downloads-phone.webp)

:::details Download states and row actions
Each row shows its quality, its size once known, and its state:

| State | Meaning |
|---|---|
| Downloading | Transferring, with a progress bar. |
| Queued | Waiting for a free slot (see **Simultaneous downloads**). |
| Paused | Held by you; keeps what it has already fetched. |
| Waiting for Wi-Fi | Held because **Wi-Fi only** is on and there's no Wi-Fi. Android only. |
| Ready | On the device. |
| Failed | Could not finish. |

What you can do:

- **Pause** or **resume** a single download from its row. **Pause all** and **Resume all** at the top
  do the same for the whole list.
- **Play** a ready download straight from local storage, **Retry** a failed one, or delete one with
  the trash button after a confirmation.
- Delete a whole show or a whole season from its group header.
- **Select** to tick several rows (every group opens while you select), then **Retry** the failed
  ones or **Delete** the selection in one go.
:::

## Play a download offline

Open it from **Downloads**: it plays without a connection.

:::details Playback and resume rules
Press **Play** on a movie or episode that has a finished download, from its page or from anywhere
else in the app, and Fliks plays the copy on the device, with or without a connection. The one
exception is casting: a Cast receiver can't read files on your device, so Fliks streams from the
server instead.

When the server answers, your resume point on it wins over what this device recorded, so you pick up
where another device left off. Offline, playback resumes from the last position this device saved.
:::

## Keep a playlist downloaded automatically

In the mobile and desktop apps, turn on **Automatic download** in a playlist's settings: unwatched items are
downloaded, watched ones are removed.

:::details Rules of automatic playlist downloads
A few things worth knowing:

- The toggle is set **per device**, not on your account, so turning it on on your phone doesn't
  also turn it on on your tablet.
- The toggle lives in the playlist's settings, which only its owner or an administrator of the
  playlist can open. A playlist where you're only a viewer (including one you saved) is never
  auto-downloaded.
- It uses the **Default quality** from [Storage settings](#storage-settings), or the best quality
  available for the file when that is set to **Best available**. There is no per-playlist quality
  choice.
- It stops adding items once the **Auto-download limit** is reached.
- Only downloads created by this automatic sync get cleaned up when watched. A file you downloaded
  by hand is never removed automatically.
- Removing an item from the playlist without watching it doesn't delete anything already
  downloaded for it; delete it from the Downloads screen instead.
:::

## Keep the next episodes of a series on the device

In the mobile and desktop apps, a series' menu has **Auto-download**: keep the next 3, 5 or 10 unwatched episodes
on the device.

:::details How the next-episodes rule behaves
Once a rule is on:

- The next unwatched episodes that have a file are downloaded, in season then episode order.
  Specials are skipped.
- An episode is deleted from the device once you've watched it, and the next one is fetched to
  refill the count. The refill happens when you open the app again, when it reconnects, or when you
  change the rule or the limit.
- It uses the **Default quality** and stops adding episodes once the **Auto-download limit** is
  reached.
- Like playlists, the rule is **per device**, and only the downloads the rule created are cleaned up
  when watched. An episode you had already downloaded by hand stays.
:::

## Storage settings

**App settings > Storage** sets the default quality, how many downloads run at once, and clears them all.

![App settings > Storage, with the Default quality menu under the cursor](/img/offline-storage-settings.webp)

:::details Every storage setting
- **Simultaneous downloads**: how many downloads run at once, from 1 to 5 (default 3). Downloads
  beyond that number wait in the queue. Not shown in the desktop app.
- **Default quality**: **Best available** (the default), **Original**, 2160p, 1080p, 720p, 480p or
  360p. It's highlighted in the quality picker, and automatic downloads use it. A file that doesn't
  have the chosen quality gets the nearest lower one.
- **Wi-Fi only** (iOS and Android): downloads wait for Wi-Fi instead of using mobile data. On iOS the
  change applies the next time the app starts. Android shows the **Waiting for Wi-Fi** state while
  it holds the queue.
- **Auto-download limit (GB)** (iOS, Android and desktop): automatic downloads stop adding items once
  the ones already finished take this much space. `0` means no limit. Downloads you start by hand
  don't count toward it.
- **Clear cache**: clears the app's own working cache, not your downloads.
- **Delete all downloads**: removes every downloaded file from the device in one action.
:::

:::details Download notifications and admin view
On Android, a notification follows the queue. A single download shows its title, its percentage
and the time left, with **Pause** (or **Resume** while paused) and **Cancel** buttons. Several
downloads show a count and list each item, with paused ones marked. It reads **Waiting for Wi-Fi**
while **Wi-Fi only** holds the queue. Each download also gets its own notice when it completes or
fails. Tapping any of them opens the Downloads screen. On iOS, progress is shown in a Live Activity,
and tapping the banner that announces a finished download opens the Downloads screen.

An administrator sees a download in progress under **Downloads in progress** on **Settings > Video
activity**, apart from the playbacks, without a position or playback controls. See
[Transcoding dashboard](/administration/transcoding-dashboard).
:::

## Which client supports what

:::details Which client supports which feature
| | Web browser | iOS, Android | Desktop |
|---|:-:|:-:|:-:|
| Download a movie or episode | Yes (kept in the browser itself) | Yes | Yes |
| Download a season, a series or picked episodes | Yes | Yes | Yes |
| Pause and resume each download | Yes | Yes | Yes |
| Automatic playlist download | No | Yes | Yes |
| Keep the next episodes of a series | No | Yes | Yes |
| Auto-download limit | No | Yes | Yes |
| Wi-Fi only | No | Yes | No |
| Free space shown | Yes (the browser's estimate) | Yes | Yes |
:::

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for what quality options a file
  actually offers.
