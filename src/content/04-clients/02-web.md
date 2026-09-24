---
title: Web
description: The full Fliks interface in a browser, installable to the home screen, no app store required.
---

## Using it

Open your server's address in any current browser and sign in. There's nothing to install: the web
client is the same Angular interface every other non-native client is built from, and it gets every
feature described in this documentation except the ones that need a TV form factor or native OS
support.

## Installing it as an app

The web client is an installable Progressive Web App: your browser can offer to add it to your home
screen or desktop like a native app, with its own icon and window, and no address bar. Once
installed, a service worker keeps the interface itself cached, so the app shell loads instantly even
on a slow connection; the content you actually browse (posters, details) still comes from your
server live.

## Downloads

Downloading a title for offline playback works in a browser too, stored in the browser's own local
storage rather than on disk as a regular file. See [Offline downloads](/features/offline-downloads)
for quality choices and limits. Unlike the mobile and desktop apps, the web client only downloads
the titles you pick yourself: **Automatic download** on a playlist isn't available in a browser.

## Browser-specific notes

- **iOS Safari** doesn't support the standard browser fullscreen API, so the player falls back to
  Safari's own native fullscreen video player on iPhone and iPad instead of Fliks' own fullscreen
  controls.
- **Casting**: the Chromecast button only appears once your browser reports Google's Cast
  extension is available (built into Chrome; not every browser has it).
- **Picture-in-picture** uses the browser's native picture-in-picture support, where the browser
  offers it.

## Updates

The web client updates itself: after your server is updated, the page reloads on its own as soon
as the browser has fetched the new version, with no prompt and no separate install step.

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for how playback compatibility
  is decided per browser.
- [Offline downloads](/features/offline-downloads)
