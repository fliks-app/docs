---
title: Quick start
description: Install the server, create the administrator, add your first library and open Fliks on your devices.
---

> [!SUMMARY]
> Install the server, create the administrator at `http://<host>:4848`, add a library, set a language profile, a quality profile and an indexer, then open Fliks on your devices.

## 1. Install the server

Pick the machine that holds your video files.

| Platform | Guide |
|---|---|
| Docker (Linux, NAS, home server) | [Docker](/install/docker) |
| Windows | [Windows](/install/windows) |
| macOS | [macOS](/install/macos) |
| TrueNAS | [TrueNAS](/install/truenas) |

Each guide ends with the server listening on port `4848` (`30485` on TrueNAS).

## 2. Create the administrator

Open `http://<host>:4848` in a browser (`http://localhost:4848` on the server itself). Fliks shows
**Create the administrator**: pick a username, a password of at least 8 characters, confirm it and
click **Create account**.

![The Create the administrator page: username, password, confirmation](/img/setup-create-admin-filled.webp)

## 3. Add a library

Open your avatar menu, then **Administration > Libraries > Add a library**. Name it, choose who
sees it, then **Browse...** to the folder with your media (under Docker, the path you mounted at
`/medias`). Click **Scan the folder**, then **Create the library**.

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

A wrong match is fixed from the title's **More** menu with **Identify**: see
[Libraries](/features/libraries#fixing-a-wrong-or-missing-match).

## 4. Finish the setup

Do these three once, right after your first library: they are what makes Fliks find subtitles
and fetch what you ask for.

- **A language profile**: the languages you want for audio and subtitles. Fliks uses it to
  search subtitles on its own and to pick the right release. The default profile has no subtitle
  language, so nothing is searched until you add yours.
  [Language profiles](/administration/language-profiles)
- **A quality profile**: which qualities Fliks accepts (720p, 1080p, 4K...) and when it stops
  upgrading a title. Every request needs one.
  [Quality profiles](/downloads/quality-profiles)
- **An indexer**: where Fliks searches for releases, through the Torrent manager plugin. Without
  one, approved requests are never downloaded. [Set up the plugin](/downloads/plugin), then
  [add your indexers](/downloads/indexers).

Only watching files you already have? Set the language profile for subtitles and skip the other
two.

## 5. Open Fliks on your devices

Open the same address in any browser, or install an app: phone, tablet, TV, desktop. Sign in with
your account. On a TV, choose **Quick Connect** and type the code it shows on your phone.

Every client is in [Clients](/clients/overview).

## Next

- [Finding your way around](/getting-started/finding-your-way) to locate any setting.
- [Users and permissions](/administration/users-and-permissions) to add the rest of the household.
- [Settings > General](/administration/general-and-naming#setup-checklist) for the setup checklist.
