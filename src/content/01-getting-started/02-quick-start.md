---
title: Quick start
description: Install the server, create the administrator, add your first library and open Fliks on your devices.
---

> [!SUMMARY]
> Install the server, create the administrator at `http://<host>:4848`, create your language and quality profiles, add a library, set up a download plugin if you want downloads, then open Fliks on your devices.

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

## 3. Create your profiles

Create them before your first library, so it can use them:

- **A language profile**: the audio and subtitle languages you want. Fliks uses it to find subtitles
  on its own and to pick the right release. The default profile has no subtitle language.
- **A quality profile**: which qualities Fliks accepts (720p, 1080p, 4K...). Every request needs one.

:::steps
![**Settings > Language profiles**: a new server lists one default profile](/img/admin-lprofile-1-sidebar.webp)
![Click **New profile**](/img/admin-lprofile-2-new.webp)
![Name it and tick the **Accepted audio languages**](/img/admin-lprofile-3-audio.webp)
![Tick your **Subtitle languages**](/img/admin-lprofile-4-subtitles.webp)
![Click **Save**](/img/admin-lprofile-5-save.webp)
![**Settings > Quality profiles**: click **New profile**](/img/admin-qprofile-2-new.webp)
![Name it and pick the **Cutoff quality**](/img/admin-qprofile-3-form.webp)
![Tick the qualities you accept, then **Save**](/img/admin-qprofile-4-allowed.webp)
:::

Only watching files you already have? The language profile is enough. Details:
[Language profiles](/downloads/language-profiles), [Quality profiles](/downloads/quality-profiles).

## 4. Add a library

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

## 5. Set up a download plugin

To let Fliks fetch the titles people request, install a download plugin such as
[Torrent manager](/built-in-plugins/torrent-manager), then give it an [indexer](/built-in-plugins/indexers)
and a [download client](/built-in-plugins/download-clients). Skip this if you only watch your own files.

## 6. Open Fliks on your devices

Open the same address in any browser, or install an app: phone, tablet, TV, desktop. Sign in with
your account. On a TV, choose **Quick Connect** and type the code it shows on your phone.

Every client is in [Clients](/clients/overview).

## Next

- [Finding your way around](/getting-started/finding-your-way) to locate any setting.
- [Users and permissions](/administration/users-and-permissions) to add the rest of the household.
- [Settings > General](/administration/general-and-naming#setup-checklist) for the setup checklist.
