---
title: Requests
description: Let household members ask for a title to be added, or for one to be removed, without giving them direct control over the library.
---

## Asking for something to be added

Anyone with request permission can search for a movie or series (from the same search used to
browse metadata) and submit a request instead of adding it to a library directly. A request
carries:

- The title, and which library it should land in.
- A quality profile and a language profile to use for it.
- For a series, which seasons are wanted (a request for only part of a series is possible).

The library picker is skipped automatically when there's only one library to choose from.

## Statuses

| Status | Meaning |
|---|---|
| Pending | Waiting for someone with permission to approve or decline it |
| Approved | Accepted; the title is now being monitored |
| Processing | A release has been grabbed and is being downloaded |
| Downloaded | The requested files are on disk |
| Declined | Turned down, optionally with a reason |

Once a request is approved and a matching release is being grabbed, its badge switches from a
plain status to a live view of the download itself (queued, downloading with a percentage,
stalled, paused, or failed), so a requester can watch their request move without leaving the page.

## Approving and declining

Whoever has the requests permission (this can be scoped to specific libraries, so a household
member can moderate one library's requests without seeing every other one) sees every pending
request and can approve or decline it. Declining takes an optional reason, shown back to whoever
made the request.

A request is automatically declined, rather than sitting untouched, if the title it points to (or
the specific season it asked for) gets unmonitored or removed from the library before it's acted
on.

Each requester can edit or cancel their own request only while it's still pending; an administrator
can remove a request at any point.

## Limits per user

Two quotas, set per user: how many movie requests and how many series requests they can make within
a rolling window (7 days by default). Set either to 0 to make it unlimited. A second request for a
title that already has one pending is rejected outright, except for a series where the new request
covers different seasons than the first.

## Auto-approval rules

Instead of reviewing every request by hand, an admin can define rules under **Settings > Auto
approval** that approve matching requests immediately. A rule is a set of conditions, and every
condition it sets has to match for the rule to fire:

- Specific users, or specific roles
- Movie or series
- Specific libraries
- Specific genres
- A maximum number of seasons (for a series request)
- A release year range

A condition left empty matches anything, so a rule with nothing set approves every request it sees.
Any one matching rule is enough to approve a request; there's no need for all of them to agree.

## Requesting a deletion

A user with request permission, but without permission to delete media outright, can ask for an
existing title to be removed instead: **Request deletion** on its detail page, after a
confirmation. Only one deletion request per title can be pending at a time, and this kind of
request is never auto-approved. Approving it removes the title from the library and deletes its
files from disk, exactly as if an admin had deleted it directly.

## What happens after approval

Fliks itself doesn't search anywhere for the file: approving a request marks the title as
monitored and hands it to whatever acquisition plugin is installed (see the *Download plugin*
mentioned in the [project overview](/getting-started/introduction)). The request moves to
Processing once a release is actually being grabbed, and to Downloaded once the files for
everything it asked for have landed on disk.

> [!NOTE]
> Requests need an acquisition plugin installed to ever leave the Approved state on their own; see
> **Settings > Plugins**. Without one, an admin can still add the title to the library by hand,
> which the request module picks up as its own file arriving.
