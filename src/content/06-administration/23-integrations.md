---
title: Integrations
description: The Integrations group of the administration area - Media servers, Imports and Notifications, with every field, notification service and event.
---

> [!SUMMARY]
> **Integrations** connects Fliks to other software, and none of it is needed to watch your files. **Notifications** push events to Discord, Slack, ntfy, Gotify or a webhook: add one connection and keep the events you want. **Media servers** tell another server to rescan, and **Imports** bring data in from elsewhere.

## Notifications

Fliks posts a short message to a service when something happens. A connection is a service, an endpoint and a list of events. Phones get push through the built-in **Fliks Relay** connection, see [Push notifications](/administration/push-notifications).

:::steps
![Open **Integrations > Notifications**](/img/admin-notif-1-sidebar.webp)
![Click **New connection**](/img/admin-notif-2-new.webp)
![Name it, choose the service type, fill its fields, keep the events you want and **Save**](/img/admin-notif-3-form.webp)
:::

Choose the **Service type**, fill the URL or token it asks for, press **Send a test notification** (when editing a saved connection), then **Save**. New connections have every event ticked.

:::details Every field of a notification connection
| Field | Meaning |
|---|---|
| **Name** | Required. |
| **Service type** | `discord`, `slack`, `webhook`, `gotify` or `ntfy`. The fields below change with it. |
| **Webhook URL** | Discord, Slack and webhook. The URL itself is the credential: it is stored hidden, and editing shows a mask. Leave empty to keep it. |
| **ntfy server URL** | ntfy only: the base address of your ntfy server. |
| **Token** | Not shown for Discord and Slack. Optional for ntfy (sent as a bearer token) and webhook (sent as an `Authorization: Bearer` header). Required for Gotify. Leave empty to keep the stored token. |
| **Topic** | ntfy only. Default `fliks`. |
| **Trigger events** | All ticked on a new connection. |
| **Connection active** | A switch; also in the list's **Active** column. |
| **Send a test notification** | Only when editing a saved connection. Shows success or the error. |

![A ntfy connection](/img/admin-notif-ntfy-form.webp)

Each service gets a plain text message: Discord and Slack the text, Gotify a title `Fliks - <event>` and the message (priority 5), ntfy the message with the title header, and a generic webhook a JSON body `{"event": "...", ...}` with the event's fields (title, language and so on). Each send times out after 10 seconds and is not retried.

:::

:::details Every notification event
| Group | Event | Message |
|---|---|---|
| Requests | `request.created` | New request |
| | `request.approved`, `request.declined` | Request approved, declined |
| | `request.processing` | Request downloading |
| | `request.available` | Request available |
| | `request.delete.created`, `.approved`, `.declined` | The same three steps for a deletion request |
| Downloads | `grab.started` | Grabbing a release |
| | `download.complete` | Download complete |
| Subtitles | `subtitle.downloaded`, `subtitle.upgraded`, `subtitle.failed`, `subtitle.synced` | Subtitle downloaded, upgraded, failed, synced, with the language |
| Live TV | `livetv.account_expiring`, `livetv.account_expired` | A source's account expires soon, or has expired |
| | `livetv.adult_guard_failed` | The adult-group restriction pass failed for a source |
| Cleanup | `media.leaving_soon` | A title will be removed soon, with the days left |
| | `media.cleaned_up` | A title was cleaned up |
| Optimization | `optimize.completed`, `optimize.failed` | A file was optimized, or the optimization failed |
| Health | `health.corrupt` | A corrupt file was found |

`media.leaving_soon` and `media.cleaned_up` come from [Library cleanup](/administration/library-cleanup).
:::

## Media servers

Use this when a second media server reads the same files as Fliks and should rescan as soon as Fliks adds a download, a subtitle or deletes a file. A saved server also lets **Imports** read its watch history.

:::steps
![Open **Integrations > Media servers**](/img/admin-mediaservers-1-sidebar.webp)
![Click **New server**](/img/admin-mediaservers-2-new.webp)
![Fill the form, tick the events, press **Save**. Edit the row afterwards to get **Test connection**](/img/admin-mediaservers-3-form.webp)
:::

:::details Media server fields and trigger events
| Field | Meaning |
|---|---|
| **Name** | Your label for the row. Required. |
| **Server type** | The kinds of server Fliks can notify. One type is offered today. |
| **Server URL** | Where the server answers, for example `http://host:8096`. Required. |
| **API key** | The key created on that server. When editing, leave it empty to keep the stored one. |
| **Trigger events** | Which events make Fliks ask the server to refresh. All ticked by default. |
| **Server active** | A switch. A row can also be switched in the list's **Active** column. |
| **Test connection** | Only shown when editing a saved row. Answers with the server's name, or the error. |

The list shows **Name**, **Type**, **URL**, the number of events and **Active**; **Delete** is at the end of the row.

| Event | Fires when |
|---|---|
| `download.complete` | A download finished. |
| `subtitle.downloaded`, `subtitle.upgraded`, `subtitle.synced` | A subtitle file was added, replaced by a better one, or retimed. |
| `file.deleted`, `media.deleted` | A file, or a whole title, was deleted from Fliks. |
| `library.rescan` | A library was rescanned. |

:::

## Imports

**Integrations > Imports** has five cards. Pick the one that matches where your data lives.

- **Manual import from disk**: identify the files of a folder outside any library and copy or move them into one.
- **Watch history of a media server**: **Import history** on a server saved under **Media servers**.
- **Request manager**: import the requests of a request tool. See [Requests](/downloads/requests).
- **Movie, series and music managers**: read their libraries through their APIs.

:::details Every import card, field by field
![The manual import from disk card](/img/admin-imports-disk.webp)

#### Manual import from disk

Identifies the files of a folder that is outside any library, then copies or moves them into a library. A title missing from the library is created.

| Field | Meaning |
|---|---|
| **Folder path** | A path as the server sees it (inside the container if you use Docker). **Browse...** opens a folder picker. |
| **Target library** | Only libraries with a folder. The scan filters by that library's media types, so changing the target after a scan triggers a new scan. |
| **Import method** | **Copy** (default) keeps the source file. **Move** deletes the source once the copy succeeded. |
| **Scan the folder** | Starts the scan. The result is the same review screen as a library scan, where you accept or fix each match before importing. See [Libraries](/features/libraries). |

#### Watch history of a media server

For each server saved under **Media servers**, an **Import history** button imports its playback history: watched movies, episodes in progress and hidden items. Users are matched by name and created if missing; the result toast reports users, views imported and skipped. With no server configured the card says so.

#### Request manager

Imports the movie and series requests made in a request-management tool that has an API. Fill **URL** and **API key**, **Save**, **Test connection**, then **Import requests**. The toast reports users, requests imported, updated and skipped. See [Requests](/downloads/requests).

![The request manager card](/img/admin-imports-seerr.webp)

#### Movie, series and music managers

Three cards read the library of a movie manager, a series manager and a music manager through their APIs. Each has the same fields:

| Field | Meaning |
|---|---|
| **URL**, **API key** | The tool's address and key. Saved, then masked. |
| **Import mode** | **Complete (skip existing)** imports only what Fliks lacks. **Update (update existing)** also refreshes titles already present. |
| **Import external subtitles** | Also imports subtitle files found next to the media. |
| **Target library** | The Fliks library receiving the titles. |
| **Test connection**, **Continue** | **Continue** starts the import. It first shows a **Root folder mapping** step where you map each of the other tool's root folders to a Fliks root folder or choose **Ignore**, because container paths often differ. |

The music card also creates the root folders and quality profiles it finds. If no compatible root folder exists, the mapping step sends you to **Libraries** first.

![The three manager cards](/img/admin-imports-arr.webp)

:::

## See also

- [Requests](/downloads/requests) for the request events.
- [Library cleanup](/administration/library-cleanup) for the cleanup events.
- [Libraries](/features/libraries) for the scan review used by the disk import.
