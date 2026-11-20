---
title: Finding your way around
description: A map of the Fliks interface, from the sidebar to the Administration pages, with the click path to each common task.
---

## The three buttons to know

Everything you configure sits behind your avatar, top right. Click it to open the user menu.

:::steps
![The avatar button (1) is always at the top right](/img/nav-desktop-avatar-button.webp)
![The menu lists **Account settings** (2), **App settings** (3) and **Administration** (4)](/img/nav-desktop-menu-entries.webp)
:::

On a phone the avatar sits at the top right too, and the menu opens as a sheet from the bottom of
the screen. The **Administration** entry only shows for accounts that may open the admin pages.

:::steps
![On a phone, the avatar button (1) is at the top right and the menu button at the top left](/img/nav-phone-avatar-button.webp)
![The user menu opens from the bottom: **Account settings** (2), **App settings** (3), **Administration** (4)](/img/nav-phone-menu-entries.webp)
:::

| Entry | What it holds | Docs call it |
|---|---|---|
| **Administration** | Server-wide setup: libraries, users, subtitles, plugins, monitoring. | **Settings > X** (or the group name) |
| **App settings** | Your own preferences on this device: playback, subtitles, display. | **App settings > X** |
| **Account settings** | Your account: password, privacy, devices. | **Account settings > X** |

The same menu also has **Login requests** (to pair a TV), **Switch user** and **Log out**.

## The sidebar

The left sidebar is the everyday navigation. On a phone it hides behind the menu button at the
top left.

![The main sidebar: Home, Search, My profile, then the Library and Downloads groups](/img/nav-home-sidebar.webp)

![On a phone, tap the menu button at the top left to slide the sidebar in](/img/nav-phone-sidebar.webp)

- **Home**, **Search** and **My profile** are at the top.
- **Library** holds one entry per library you can see (with its title count), then **Playlists**,
  **Downloads** (titles saved for offline playback on this device) and **History** (what you
  watched). **Live TV** appears here when a source is set up.
- **Downloads** holds the request and acquisition side: **Requests**, **Queue**, **History** and
  **Calendar**. **Queue** and the queue **History** show for accounts allowed to grab releases and
  only when the download plugin is in use. If you never download, you can ignore this group.

## Administration

**Administration** opens its own sidebar, grouped. **Back to app** at the top returns to the main
interface.

![The Administration sidebar and its groups](/img/nav-admin-sidebar.webp)

| Group | Entries |
|---|---|
| **System** | **Statistics**, **System** (status, backups, logs, restart), **Video activity** (who is watching), **Optimization queue**, **Playback quality** |
| **Settings** | **General** (server name, setup checklist), **Libraries**, **Naming**, **Outgoing mail** |
| **Media** | **Quality profiles**, **Language profiles**, **Quality definitions**, **Custom formats**, **Auto-approval**, **Cleanup**, **Metadata**, **Downloads**, **Lyrics**, **Karaoke** |
| **Subtitles** | **Subtitles**, **Subtitle providers**, **Subtitle activity** |
| **Live TV** | **Live TV** |
| **Integrations** | **Media servers**, **Imports**, **Notifications** |
| **Users** | **Users**, **Roles**, **Single sign-on** |
| **Optimization** | **Profiles**, **Settings**, **Workers** |
| **Advanced** | **Scheduled tasks**, **Streaming**, **Remote engine**, **Plugins** |

Some entries only show when the server version or your permissions allow them (**Users** needs the
permission to manage users, for example).

## App settings and Account settings

Both open a short sidebar of their own.

![App settings: Home, Display, Playback, Subtitles, Chromecast, Remote control, Storage](/img/nav-app-settings.webp)

- **App settings**: **Home**, **Display**, **Playback**, **Subtitles**, **Chromecast**, **Remote
  control** and **Storage**. They apply to you, on this device.
- **Account settings**: **Password**, **Recommendations**, **Privacy**, **Spoilers**, **What's
  new**, **Continue across devices**, **Devices** and **E-mail devices**.

![Account settings: Password, Recommendations, Privacy, Spoilers and more](/img/nav-account.webp)

## On a title page

Per-title actions live in the **More** menu (three dots) next to **Play**. This is where **Edit
subtitles** is, and where **Identify** fixes a wrong match.

:::steps
![Open a title and click the **More** menu next to **Play**](/img/nav-title-more-menu.webp)
![**Edit subtitles** lists, searches and syncs the subtitles of that title; **Metadata** holds **Identify** and **Refresh metadata**](/img/nav-title-metadata-menu.webp)
:::

## I want to... go to

| I want to... | Go to |
|---|---|
| Add a library | **Administration** > **Settings > Libraries** > **Add a library** ([Quick start](/getting-started/quick-start#3-add-a-library)) |
| Fix a wrongly matched or unidentified title | The title page > **More** > **Metadata** > **Identify** ([Quick start](/getting-started/quick-start#fixing-an-unidentified-file-later)) |
| Add a user | **Administration** > **Settings > Users** > **Add a user** ([Users and permissions](/administration/users-and-permissions)) |
| Change the subtitle look (size, color, position) | **App settings > Subtitles**, section **Subtitle appearance** |
| Pick my default subtitle language | **App settings > Subtitles**, **Preferred subtitle language** (and **Subtitle mode**) |
| Pick my default audio language | **App settings > Playback**, **Audio selection** > **Preferred language** |
| Manage the subtitles of one title | The title page > **More** > **Edit subtitles** ([Subtitles](/features/subtitles)) |
| Set up automatic subtitle search | **Administration** > **Subtitles > Subtitle providers**, then **Subtitles** for the rules |
| Change the streaming quality while watching | The quality menu in the player ([Quality and stats](/player/quality-and-stats)) |
| Make the server's Auto quality prefer Direct Play or adaptive streaming | **Administration** > **Advanced > Streaming** ([Streaming and transcoding](/features/streaming-and-transcoding)) |
| Show low-bandwidth qualities in the player | **App settings > Playback**, **Show low-bandwidth qualities** |
| Pair a TV (Quick Connect) | On the TV choose **Quick Connect**, then on a signed-in device open the avatar menu > **Login requests** and type the code ([Pairing](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect)) |
| Install a plugin | **Administration** > **Advanced > Plugins** ([Plugins](/administration/plugins)) |
| See who is watching right now | **Administration** > **System > Video activity** |
| Check why a stream stutters | **Administration** > **System > Playback quality** |
| Take or restore a backup | **Administration** > **System**, **Backups** tab ([Backups](/administration/backups)) |
| Change when automatic tasks run (including the nightly backup) | **Administration** > **Advanced > Scheduled tasks** |
| Change my password | **Account settings > Password** |
| Change the interface language | **App settings > Display** |
| Read logs | **Administration** > **System**, **Logs** tab ([Logs](/administration/logs-and-troubleshooting)) |
| Dismiss or bring back a setup checklist item | **Administration** > **Settings > General** |

> [!TIP]
> Every admin page has a **Back to app** link at the top of its sidebar. Settings pages in the
> docs are written as the group, then the entry: **Advanced > Plugins** is the **Plugins** entry
> under the **Advanced** heading of the Administration sidebar.
