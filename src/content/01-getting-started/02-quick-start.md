---
title: Quick start
description: Install the server, add your first library, and open Fliks on your other devices.
---

## 1. Install the server

Pick whichever fits the machine that holds your video files. Every option gives you the same Fliks.

| Platform | Guide |
|---|---|
| Docker (Linux, NAS, home server) | [Docker](/install/docker) |
| Windows | [Windows](/install/windows) |
| macOS | [macOS](/install/macos) |
| TrueNAS | [TrueNAS](/install/truenas) |

Each guide ends with the server listening on port `4848`, except TrueNAS, whose app publishes
port `30485` by default.

## 2. Open it and log in

Open `http://<host>:4848` in a browser (`http://localhost:4848` on the machine itself, port
`30485` on TrueNAS). Fliks creates one account the first time it starts with no users in its
database:

| Username | Password |
|---|---|
| `admin` | `password` |

> [!IMPORTANT]
> Change that password immediately: user menu > **Account settings** > **Password**. It is a
> well-known default, and anyone who can reach the server can log in with it until you do.

## 3. Add a library

The user menu (your avatar) opens three settings areas, and these docs name each page after
its entry in that area's sidebar:

- **Settings > X** is an admin page, under user menu > **Administration**: **Settings >
  Libraries** means the **Libraries** entry there.
- **App settings > X** holds your own preferences (playback, subtitles, display, ...), under
  user menu > **App settings** (for example **App settings > Playback**).
- **Account settings > X** is a page about your account, under user menu > **Account
  settings** (for example **Account settings > Password**).

Go to **Settings > Libraries** and click **Add a library**. The wizard has three steps:

1. **Information**: give it a name and choose its media types (**Movies**, **Series**, or both).
2. **Users**: pick who can see it (administrators always can).
3. **Media**: set the **Root path** to a folder on the server (type it or use **Browse...**).
   Under Docker that's the path you mounted at `/medias` (or a subfolder of it); on Windows or
   macOS it's any folder on disk. Click **Scan the folder**, review what it found, then click
   **Create the library**.

Fliks matches what it finds against TMDB or TVDB and downloads covers, backdrops and cast
information. A large library can take a while on the first pass.

## 4. Check the setup checklist

**Settings > General** shows a setup checklist with the steps most self-hosters want next; the
pending ones also appear on an admin's home page. Some are marked required, others recommended:

| Item | Why |
|---|---|
| Add at least one library | Required: nothing shows up in Fliks without one. |
| Create a quality profile | Marked required, but only used when downloading: which qualities are acceptable or preferred. |
| Create a language profile | Marked required, but only used when downloading: preferred audio and subtitle languages. |
| Enable a subtitle provider | Lets Fliks search for subtitles automatically instead of only using what's embedded. |
| Create a non-administrator user | Give the rest of the household an account without admin rights (see [Users and permissions](/administration/users-and-permissions)). |
| Configure notifications | Get pinged on Discord, ntfy, Slack or similar when something happens. |
| Configure an auto-approval rule | Requests matching the rule are approved without you clicking anything. |

Dismiss any item you don't need. It disappears from the home page, and **Settings > General**
keeps a **Re-enable** button for it.

## 5. Install the clients

Point the web app, or any native client, at the same address and log in with your account. Web,
iOS, Android, Android TV, Apple TV, Samsung and LG TVs, the desktop app and Chromecast are all
covered in [Clients](/clients/overview). On a TV you don't have to type your password with the
remote: pick your account, choose **Quick Connect**, and approve the request from your phone (see
[Pairing](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect)). Start a
film on one device and pick it up on another: the position syncs live.

## Where to go from here

- [Concepts](/getting-started/concepts) if some of the terms above (library, quality profile,
  request) aren't obvious yet.
- [Users and permissions](/administration/users-and-permissions) to set up accounts for the rest
  of the household.
- [Hardware acceleration](/install/hardware-acceleration) if playback on a slow connection or an
  incompatible device is transcoding instead of playing the file directly.
