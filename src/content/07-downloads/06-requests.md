---
title: Requests
description: Let household members ask for a title to be added, or for one to be removed, without giving them direct control over the library.
---

> [!SUMMARY]
> A request lets someone ask for a title without adding it to the library themselves. Search for it, click request, choose the library and profiles, then someone with **Manage requests** approves it (or an [auto-approval rule](/downloads/auto-approval) does). Actually fetching the file needs the [Torrent manager](/built-in-plugins/torrent-manager).

## Request a title

Anyone with request permission can search for a movie or series (from the same search used to
browse metadata) and submit a request instead of adding it to a library directly. A request
carries:

- The title, and which library it should land in.
- A quality profile and a language profile to use for it.
- For a series, which seasons are wanted (a request for only part of a series is possible).

:::details Library picker and extra seasons
The library picker is skipped automatically when there's only one library to choose from. When
asking for more seasons of a series that's already requested or in the library, the quality and
language profiles are the ones already set and can't be changed.
:::

## Statuses

:::details Request statuses
| Status | Meaning |
|---|---|
| Pending | Waiting for someone with permission to approve or decline it |
| Approved | Accepted; the title is now being monitored |
| Processing | A release has been grabbed and is being downloaded |
| Downloaded | The requested files are on disk |
| Declined | Turned down, optionally with a reason |
| Failed | Could not be carried out (in practice only seen on requests imported from another tool) |

Once a request is approved, its badge shows whether the title is monitored, and switches to a live
view of the download itself once one is in progress (searching, queued, downloading with a
percentage, stalled, paused, or importing), so a requester can watch their request move without
leaving the page.
:::

## Approving and declining

A moderator with **Manage requests** approves or declines from the requests list. Declining takes an optional reason.

:::details Who can approve, edit and cancel, and what auto-declines a request
Making a request needs the **Create requests** permission; approving and declining needs **Manage
requests**. A moderator only sees requests aimed at libraries they can access themselves (plus
requests that have no library yet), so restricting someone's library access also limits which
requests they moderate. Declining takes an optional reason, shown back to whoever made the request.

A request still in flight (pending, approved or processing) is automatically declined if the title
it points to gets unmonitored or removed from the library. For a request covering several seasons,
unmonitoring one season just drops that season from the request.

Each requester can edit (library, quality and language profile) or cancel their own request only
while it's still pending; anyone with **Manage requests** can remove a request at any point.
:::

## Limits per user

:::details Quotas and duplicate requests
Two quotas, set per user: how many movie requests and how many series requests they can make within
a rolling window (7 days by default, also set per user). Set either to 0, the default, to make it
unlimited. Only pending and approved requests count.

A new request for a title that anyone already has an active request for (pending, approved,
processing or downloaded) is rejected outright. The exception is a series, when the new request
asks only for seasons no other active request covers and nobody has requested the whole series.
:::

## Auto-approval rules

Rules in **Settings > Auto-approval** approve matching requests on the spot. See [Auto-approval rules](/downloads/auto-approval).

![The New rule dialog, with its Who and What condition builder](/img/auto-approval-rule.webp)

## Requesting a deletion

:::details Request a deletion
A user with request permission, but without permission to delete media outright, can ask for an
existing title to be removed instead: **Request deletion** on its detail page, after a
confirmation. Only one deletion request per title can be pending at a time, and this kind of
request is never auto-approved, and doesn't count toward the quotas. Approving it removes the
title from the library and deletes its files from disk, exactly as if an admin had deleted it
directly.
:::

## From request to file

Approving a request marks the title as monitored and hands it to the installed acquisition plugin, such as
[Torrent manager](/built-in-plugins/torrent-manager), which searches, downloads and imports it. The request
moves to **Processing** while a release is being grabbed, then to **Downloaded** once the files are on disk.

:::steps
![A user opens the title and clicks **Request**](/img/download-flow-1-request.webp)
![The button now reads **Already requested**](/img/download-flow-2-requested.webp)
![An admin opens **Downloads > Requests** and clicks **Approve**](/img/download-flow-3-approve.webp)
![The release is in **Downloads > Queue**, here **Importing**](/img/download-flow-4-queue.webp)
![When the import ends, **Downloads > History** shows **Imported**](/img/download-flow-5-history.webp)
![The request reads **Downloaded** and the title is in the library](/img/download-flow-6-downloaded.webp)
:::

> [!NOTE]
> Requests need an acquisition plugin installed to ever leave the Approved state on their own; see
> **Settings > Plugins**. Without one, an admin can still add the title to the library by hand:
> matching open requests are linked to it (a pending one is approved on the spot) and move to
> Downloaded once its files are on disk.
