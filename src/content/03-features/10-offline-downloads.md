---
title: Offline downloads
description: Download a title, or a whole playlist, to a phone, tablet or the desktop app for playback without a connection.
---

## Which clients support it

| Client | Manual download | Automatic playlist download |
|---|:-:|:-:|
| Web browser | Yes (kept in the browser itself) | No |
| iOS, Android | Yes | Yes |
| Desktop | Yes | Yes |
| Android TV, Samsung, LG, Apple TV | No | No |

Downloads are hidden from the interface entirely on every TV client: there's nowhere to start one,
and nothing to manage.

## Downloading a single title

Open a movie or episode and choose **Download**, then pick a quality from the list Fliks offers for
that specific file, each with an estimated size. On a phone or tablet, or in a web browser, this is
always a transcoded copy at the chosen quality; the desktop app downloads the same kind of copy and
plays it back locally through its own player.

Where the client isn't a native mobile app, there's an extra option: **Original file**, the
untouched source file with no re-encoding, played back exactly as stored. External subtitle files
aren't included with it. In the desktop app it lands in the Downloads screen like any other
download; in a web browser it's an ordinary file save to your computer, which the Downloads screen
doesn't track.

The **Downloads** screen lists every download with its state (queued, downloading, ready, or
failed), and lets you retry a failed one, delete it, or play it straight from local storage.

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
- It always uses the best quality available for the file, with no per-playlist quality choice.
- Only downloads created by this automatic sync get cleaned up when watched. A file you downloaded
  by hand is never removed automatically.
- Removing an item from the playlist without watching it doesn't delete anything already
  downloaded for it; delete it from the Downloads screen instead.

## Storage settings

**App settings > Storage** (on every client except TVs) has:

- **Simultaneous downloads**: how many downloads run at once, from 1 to 5 (default 3). Downloads
  beyond that number wait in the queue. Not shown in the desktop app.
- **Clear cache**: clears the app's own working cache, not your downloads.
- **Delete all downloads**: removes every downloaded file from the device in one action.

There's no overall storage quota and no choice of download folder: downloads use whatever storage
the operating system gives the app.

## See also

- [Playlists](/features/playlists) for turning a playlist itself into an automatic download queue.
- [Streaming and transcoding](/features/streaming-and-transcoding) for what quality options a file
  actually offers.
