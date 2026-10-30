---
title: Offline downloads
description: Download a title, a season, a whole series or a playlist to a phone, tablet or the desktop app for playback without a connection.
---

## Which clients support it

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

Android TV, Samsung, LG and Apple TV have no offline downloads. They are hidden from the interface
entirely on every TV client: there's nowhere to start one, and nothing to manage.

Downloads and the rules below belong to the signed-in account on that server. Another account on
the same device doesn't see them.

## Downloading a single title

Open a movie or episode and choose **Download**, then pick a quality from the list Fliks offers for
that specific file, each with an estimated size. The quality set as the default in
[Storage settings](#storage-settings) is highlighted, but nothing starts until you tap a quality.
On a phone or tablet the copy is saved in the app, in a web browser it's kept in the browser's own
storage, and the desktop app saves it to disk and plays it back through its own player.

Where the client isn't a native mobile app, there's an extra option: **Original file**, the
untouched source file with no re-encoding, played back exactly as stored. External subtitle files
aren't included with it. In the desktop app it lands in the Downloads screen like any other
download; in a web browser it's an ordinary file save to your computer, which the Downloads screen
doesn't track. The original file is not offered for a season or a series.

Once a title is on the device, its page shows **Downloaded** where **Download** was. Tap it to open
**Change quality**: the quality of the copy you have is marked, and picking another one replaces the
copy. **Delete download** removes it from the device. While a download is still transferring, the
same window shows its progress and a button to stop it, after a confirmation that the part already
downloaded is removed.

## Downloading a season or a series

A series page has four ways to download more than one episode at once. All of them open the
quality picker, which lists the number of episodes it will fetch and multiplies each estimated size
by that number.

- **Download all episodes**, in the series' actions menu. Specials are left out.
- **Download season**, in the menu of the season you're viewing.
- **Select**, above the episode list: tick episodes, use **Select all** if you like, then
  **Download**.
- **Download** in the menu of a single episode card.

Only episodes that have a file are included. When some of the episodes were already watched and
some were not, an **Unwatched episodes only** box is ticked by default, so a season you've started
only downloads the rest. Episodes you tick by hand are never filtered by what you've watched.

Fliks announces how many episodes it will download, for example "12 episodes will be downloaded",
before it starts, and queues them one after the other. Episodes already on the device are skipped.
If there was nothing to download, you get **Already downloaded** (everything was on the device) or
**Nothing new to download**. If a file doesn't offer the quality you picked, it gets the nearest
lower one instead.

Each episode card shows where it stands: a small download mark once it's on the device, or a
progress ring while it transfers. The card's menu offers **Download**, or **Delete download** once
the copy is finished.

## The Downloads screen

**Downloads** in the main navigation lists everything on the device, with the space the downloads
use and the free space left where the device can tell. Movies are single cards. Episodes are grouped
by show, then by season, with the number of episodes and their size on each group header. Tap a
group to fold it open or closed. Shows start closed, a show with a single season shows it
unfolded, and the groups you open stay open when you leave the page and come back. The newest
download is at the end of the list.

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

Opening a download from here and then leaving the player brings you back to the Downloads screen.

## Playing a download

Press **Play** on a movie or episode that has a finished download, from its page or from anywhere
else in the app, and Fliks plays the copy on the device, with or without a connection. The one
exception is casting: a Cast receiver can't read files on your device, so Fliks streams from the
server instead.

When the server answers, your resume point on it wins over what this device recorded, so you pick up
where another device left off. Offline, playback resumes from the last position this device saved.

## Automatic downloads for a playlist

Turn on **Automatic download** in a playlist's own settings (not on the Downloads screen) and Fliks
keeps that playlist current on the device by itself: anything in it you haven't watched yet gets
downloaded, and anything you finish watching is deleted again to free the space. This is meant for
a playlist you keep adding to, so there's always something ready to watch without planning ahead of
a trip.

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

## Keeping the next episodes of a series

For a series you're following, Fliks can keep the next few unwatched episodes on the device. Open
the series' actions menu, choose **Auto-download**, then **Next 3 episodes**, **Next 5 episodes** or
**Next 10 episodes**. **Off** turns it off. The same selector sits at the top of a show's group on
the Downloads screen, and a show with a rule says so on its header.

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

This is available on iOS, Android and the desktop app.

## Storage settings

**App settings > Storage** (on every client except TVs) has these settings. They belong to the
device, not to your account.

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

There's no overall storage quota on downloads you start by hand and no choice of download folder:
downloads use whatever storage the operating system gives the app.

## Download notifications

On Android, a notification follows the queue. A single download shows its title, its percentage
and the time left, with **Pause** (or **Resume** while paused) and **Cancel** buttons. Several
downloads show a count and list each item, with paused ones marked. It reads **Waiting for Wi-Fi**
while **Wi-Fi only** holds the queue. Each download also gets its own notice when it completes or
fails. Tapping any of them opens the Downloads screen. On iOS, progress is shown in a Live Activity,
and tapping the banner that announces a finished download opens the Downloads screen.

An administrator sees a download in progress under **Downloads in progress** on **Settings > Video
activity**, apart from the playbacks, without a position or playback controls. See
[Transcoding dashboard](/administration/transcoding-dashboard).

## See also

- [Playlists](/features/playlists) for turning a playlist itself into an automatic download queue.
- [Streaming and transcoding](/features/streaming-and-transcoding) for what quality options a file
  actually offers.
