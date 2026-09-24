---
title: Introduction
description: What Fliks is, how it's put together, and what to read next.
---

## What Fliks is

Fliks turns a folder of video files into a streaming service for your household. Point it at
the folders where your movies and shows live, and it fetches covers, descriptions, cast and
episode listings, then lays them out like the streaming apps you already use. Everyone in the
house gets their own profile, their own watch progress, and their own place in every episode.

It is self-hosted: the server runs on a machine you control, there is no account to create with
a third party, no subscription, and nothing leaves the house unless you choose to expose it.

## How it's put together

A Fliks install is one server plus as many clients as you like.

- **The server** holds your library, your users, and the database. It scans your media folders,
  talks to metadata providers, and serves video to every client, converting it on the fly when a
  device can't play the original file directly. It runs as a Docker container, a Windows tray
  app, or a macOS menu-bar app (plus a TrueNAS app and a build from source); see
  [Installation](/install/docker).
- **The clients** are what people actually watch on: a web app (installable as a PWA), native
  apps for iOS, Android, Android TV, Apple TV, Samsung and LG TVs, a desktop app for Windows,
  macOS and Linux, and casting to Chromecast. Every client talks to the same server over your
  network (or over the internet, if you expose it). Watch progress follows you from one device
  to the next.

Fliks ships with no way to acquire media on its own. If you want automatic downloading from
indexers, you install the download plugin from **Settings > Plugins** once the server is
running; the rest of the app works fully without it, on media you already have.

## Where to go next

- [Quick start](/getting-started/quick-start): install the server, add a library, and open it on
  your phone or TV, in a few minutes.
- [Concepts](/getting-started/concepts): the vocabulary Fliks uses (libraries, profiles,
  requests, roles) before you dig into the admin pages.
- [Installation](/install/docker): every way to run the server, one page each.
