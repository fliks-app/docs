---
title: Quick start
description: Install the server, add your first library, and open Fliks on your other devices.
---

## 1. Install the server

Pick whichever fits the machine that holds your video files. All three give you the same Fliks.

| Platform | Guide |
|---|---|
| Docker (Linux, NAS, home server) | [Docker](/install/docker) |
| Windows | [Windows](/install/windows) |
| macOS | [macOS](/install/macos) |
| TrueNAS | [TrueNAS](/install/truenas) |

Each guide ends with the server listening on port `4848`.

## 2. Open it and log in

Open `http://<host>:4848` in a browser (`http://localhost:4848` on the machine itself). Fliks
creates one account the first time it starts with no users in its database:

| Username | Password |
|---|---|
| `admin` | `password` |

> [!IMPORTANT]
> Change that password immediately: user menu > **Account**. It is a well-known default, and
> anyone who can reach port `4848` can log in with it until you do.

## 3. Add a library

Go to **Settings > Libraries > New library** and point it at a folder: under Docker that's the
path you mounted at `/medias` (or a subfolder of it), on Windows or macOS it's any folder on
disk. Pick a type (movies, shows, or a generic "other videos" library for home videos or
anything you don't want matched against metadata), name it, and save.

Fliks scans the folder, matches what it finds against TMDB or TVDB, and downloads covers,
backdrops and cast information. A large library can take a while on the first pass; subsequent
scans only look at what changed.

## 4. Check the setup checklist

**Settings > General** shows a setup checklist with the steps most self-hosters want next. Some
are required, others just recommended:

| Item | Why |
|---|---|
| Add at least one library | Required: nothing shows up in Fliks without one. |
| Create a quality profile | Which resolutions and qualities are acceptable or preferred, used when grabbing releases. |
| Create a language profile | Preferred audio and subtitle languages for grabbed releases. |
| Enable a subtitle provider | Lets Fliks search for subtitles automatically instead of only using what's embedded. |
| Create a non-administrator user | Give the rest of the household an account without admin rights (see [Users and permissions](/administration/users-and-permissions)). |
| Configure notifications | Get pinged on Discord, ntfy, Slack or similar when something happens. |
| Configure an auto-approval rule | Requests matching the rule are approved without you clicking anything. |

Dismiss any item you don't need; it won't come back.

## 5. Install the clients

Point the web app, or any native client, at the same address and log in with your account. Web,
iOS, Android, Android TV, Apple TV, Samsung and LG TVs, the desktop app and Chromecast are all
covered in [Clients](/clients/overview). Start a film on one device and pick it up on another:
the position syncs live.

## Where to go from here

- [Concepts](/getting-started/concepts) if some of the terms above (library, quality profile,
  request) aren't obvious yet.
- [Users and permissions](/administration/users-and-permissions) to set up accounts for the rest
  of the household.
- [Hardware acceleration](/install/hardware-acceleration) if playback on a slow connection or an
  incompatible device is transcoding instead of playing the file directly.
