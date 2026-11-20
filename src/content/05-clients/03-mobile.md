---
title: Mobile
description: Native iOS and Android apps for phones and tablets, with offline downloads and background download support.
---

## Getting it

| Platform | Where | Minimum version |
|---|---|---|
| iOS, iPadOS | App Store | iOS 16.6 |
| Android | Play Store | Android 6 (API 23) |

Both apps work on phones and tablets. The Android app is also the
[Android TV](/clients/android-tv) app: the same package switches to a TV interface when it runs on
a TV.

## What's native here

The mobile apps aren't just the web client in a wrapper: playback goes through each platform's own
native player (ExoPlayer on Android, AVPlayer on iOS) instead of the browser engine, which is part
of what makes [offline downloads](#offline-downloads) and background downloading possible.

### Offline downloads

This is the main thing mobile does that the web client doesn't do as fully: turn on **Automatic
download** on a playlist and downloads keep running in the background, even if you close the app,
using each platform's native download machinery. On iOS, a Live Activity shows download progress
on the lock screen while it's in progress. See [Offline downloads](/features/offline-downloads) for
what quality is downloaded, storage settings, and which content updates itself automatically.

### Notifications

Both apps ask for notification permission: Android asks at first launch (Android 13 and newer
only, older versions don't ask), iOS asks when the download service starts. Notifications are used
for downloads only: progress while a download runs on Android, and a banner when it finishes or
fails. Declining doesn't disable downloads, you just won't see those notifications.

## Store listings

Screenshots for both stores live in the project repository (`store/android`, `store/ios`),
covering the home screen, library browsing, genres, a title's detail page, the player and search.

## See also

- [Offline downloads](/features/offline-downloads)
- [Pairing and remote control](/features/pairing-and-remote-control)
- [Chromecast](/clients/chromecast), which both mobile apps can cast to
