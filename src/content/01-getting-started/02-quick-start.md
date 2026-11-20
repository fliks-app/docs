---
title: Quick start
description: Install the server, add your first library, and open Fliks on your other devices.
---

> [!SUMMARY]
> Install the server, create the administrator at `http://<host>:4848`, add a library with the wizard, then sign in from your other devices. About five minutes.

> [!NOTE]
> These docs name a page after where it lives. **Settings > Libraries** is the **Libraries** entry
> of **Administration** (user menu, your avatar), **App settings > X** and **Account settings > X**
> are entries of those two areas of the same menu. [Finding your way around](/getting-started/finding-your-way)
> shows each one.

## Install the server

Pick whichever fits the machine that holds your video files. Every option gives you the same Fliks.

| Platform | Guide |
|---|---|
| Docker (Linux, NAS, home server) | [Docker](/install/docker) |
| Windows | [Windows](/install/windows) |
| macOS | [macOS](/install/macos) |
| TrueNAS | [TrueNAS](/install/truenas) |

Each guide ends with the server listening on port `4848`, except TrueNAS, whose app publishes
port `30485` by default.

## Create the administrator

Open `http://<host>:4848` in a browser (`http://localhost:4848` on the machine itself, port
`30485` on TrueNAS). A server with no account has no default login: Fliks shows the **Create the
administrator** page instead. Pick a username, a password of at least 8 characters, type it again
to confirm, and click **Create account**. You're signed in as that administrator, who has every
permission.

![The Create the administrator page: username, password, confirmation](/img/setup-create-admin-filled.webp)

The page only shows while the server has no user. After that, the address opens the normal
login.

## Add your media as a library

Open the user menu (your avatar, top right), choose **Administration**, click **Libraries** in its
sidebar, then **Add a library**. A wizard takes you through three steps.

:::steps
![Open the user menu (your avatar, top right) and choose **Administration**](/img/libraries-path-1-user-menu.webp)
![In the Administration sidebar, click **Libraries**](/img/libraries-path-2-admin-sidebar.webp)
![Click **Add a library**](/img/libraries-path-3-libraries.webp)
![**Information**: a name, an icon and the media types, then click **Next**](/img/libraries-wizard-step1.webp)
![**Users**: who sees the library, then click **Next**](/img/libraries-wizard-step2.webp)
![**Media**: click **Browse...** to pick the root path (or type it)](/img/libraries-wizard-browse-movies.webp)
![Open the folders down to your media, then click **Select this folder**](/img/libraries-wizard-browse-select.webp)
![Click **Scan the folder** to list the files it finds](/img/libraries-wizard-scan.webp)
![Review the matches, then click **Create the library**](/img/libraries-wizard-create.webp)
![The new library page lists its files, matched](/img/libraries-created.webp)
:::

1. **Information**: give it a name and choose its media types (**Movies**, **Series**, or both; books, comics and albums have their own switches).
2. **Users**: pick who can see it (administrators always can).
3. **Media**: set the **Root path** to a folder on the server. Under Docker that's the path you
   mounted at `/medias` (or a subfolder of it); on Windows or macOS it's any folder on disk.

> [!TIP]
> On a new server, the **Setup** card on the home page has a **Configure** button next to *Add at
> least one library* that opens the same page.

### Fix a wrong match before creating the library


:::details What the scan review shows
**Scan the folder** lists every video file it found, one block per file. Each block shows the
file path, a title and year search field, and the candidates found on TMDB or TVDB. Fliks
pre-selects the best candidate, so on a tidy library you only click **Create the library**.

![One block of the scan review: the file, a search field, and the candidates with the pre-selected one outlined. Here `Spring (2019)` was matched to *Spring Breakers* (2013): pick another candidate or search again](/img/libraries-scan-review-spring.webp)

Look at the picks before you create the library, because a short or ambiguous name can match the
wrong film (a file named `Spring (2019)` was pre-selected as *Spring Breakers* in our test). For a
wrong pick:

- Choose another candidate in the block.
- Edit the title or year and click **Search** to look again.
- Pick **No match: add as is** when the file isn't in either database (a home video, say). The
  title is added with the name Fliks reads from the file name, no cover and no description, and is
  badged **No metadata**.

A file with no result at all, like `bbb sunflower 1080p 30fps normal`, is set to **No match: add
as is** by default.

![A file with no result: badged No metadata, with No match: add as is selected](/img/libraries-scan-review-no-match.webp)
:::

### Fix an unidentified file later

After the library exists, **Settings > Libraries**, then **View** on the library and its
**Medias** tab lists every title. An **Unidentified** button, with a count, shows up next to
**Scan the folder** as soon as one title has no match. Click it to list only those.

1. Open the title from that list.
2. Open the **More** menu (three dots next to **Play**), then **Metadata**, then **Identify**.
3. Edit the title and year, or paste an IMDb, TMDB or TVDB ID and click **Use these IDs**.
4. Pick the right result. The title gets its cover, description and cast.

![The Identify dialog: title, year, provider IDs and a Search button](/img/nav-identify.webp)

The same **Identify** entry fixes a wrong match on any title. The rest of library management
(extra folders, users, rescans) is in [Libraries](/features/libraries), and matching in
[Metadata](/features/metadata).

## Work through the setup checklist

**Settings > General** starts with a **Setup** card listing seven steps. Done ones are struck
through there; the pending ones also appear in a **Setup** card on an admin's home page. Two kinds
exist: required (red icon) and recommended (yellow icon).

![Home page of a fresh server: the Setup card with its pending steps and a Configure button on each](/img/onboarding-home-empty.webp)

:::details What each checklist item is for
| Item | Level | What it is for |
|---|---|---|
| Add at least one library | Required | Nothing shows up in Fliks without one. |
| Create a quality profile | Required | Download only: which qualities are acceptable or preferred. |
| Create a language profile | Required | Download only: preferred audio and subtitle languages. A default profile is created for you, so this one is already ticked on a fresh server. |
| Enable a subtitle provider | Recommended | Lets Fliks search for subtitles itself instead of only using embedded or imported ones. |
| Configure notifications | Recommended | Get pinged on Discord, Telegram, ntfy or similar when something happens. |
| Create a non-administrator user | Recommended | An account without admin rights for the rest of the household (see [Users and permissions](/administration/users-and-permissions)). |
| Configure an auto-approval rule | Recommended | Requests matching the rule are approved without you clicking anything. |
:::

**If you only want to watch your own files**, you need the library and nothing else. Dismiss
**Create a quality profile** (the red "required" mark only matters when you download releases),
**Configure an auto-approval rule** (it only acts on requests) and, if you don't care about
alerts, **Configure notifications**. Keep **Enable a subtitle provider** if you want subtitles
found for you, and **Create a non-administrator user** as soon as someone else uses the server.

Click the **X** at the end of a row to dismiss it. It leaves the home page, and **Settings >
General** keeps a **Re-enable** button for it.

## Open Fliks on your phone or TV

Point the web app, or any native client, at the same address and log in with your account. Web,
iOS, Android, Android TV, Apple TV, Samsung and LG TVs, the desktop app and Chromecast are all
covered in [Clients](/clients/overview). On a TV you don't have to type your password with the
remote: choose **Quick Connect**, then type the code the TV shows on your phone's **Login requests** page (see
[Pairing](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect)). Start a
film on one device and pick it up on another: the position syncs live.

## Where to go from here

- [Finding your way around](/getting-started/finding-your-way) if you can't find a setting: a map of
  the sidebar, the user menu and Administration, with the click path to common tasks.
- [Concepts](/getting-started/concepts) if some of the terms above (library, quality profile,
  request) aren't obvious yet.
- [Users and permissions](/administration/users-and-permissions) to set up accounts for the rest
  of the household.
- [Hardware acceleration](/install/hardware-acceleration) if playback on a slow connection or an
  incompatible device is transcoding instead of playing the file directly.
