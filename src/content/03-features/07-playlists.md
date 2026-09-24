---
title: Playlists
description: Build a running order of movies and episodes, share it with other users, or save someone else's public list to your own.
---

## What a playlist holds

A playlist is an ordered list of movies and episodes; the two can be mixed freely in one list. A
movie or an episode can only appear once in the same playlist. Adding a season or a whole series
expands it into one row per episode, and the playlist detail page groups those rows back under the
series with a "Remove series" action.

There are three ways to add content to a playlist: a single episode, a whole season, or a movie (or
a whole series, which adds every episode). Adding respects your library access: you can't add
something from a library you can't see.

## Reordering and autoplay

Drag items into the order you want (drag handles, or Move up / Move down buttons when dragging
isn't available). Reordering needs at least the editor role on a shared playlist.

Turn on **Autoplay** in the playlist's settings and the player advances to the next item
automatically when one ends, with no confirmation prompt. An item with no playable file is skipped.
Turn on **Remove watched items** and each item you finish disappears from the list on its own, so a
playlist can work as a queue that empties itself as you get through it.

> [!NOTE]
> Remove watched items only reacts to your own playback. If you share a playlist with someone else,
> an item they finish is not removed on your behalf.

## Sharing a playlist

Every playlist has a visibility:

| Visibility | Who can see and play it |
|---|---|
| Private | Only the owner, plus anyone added by hand |
| Followers only | The owner's accepted followers |
| Public | Any signed-in user |

Followers-only and public visibility grant read access without adding anyone by hand. To let
someone actually edit a shared playlist, add them as a member with a role:

| Role | Can do |
|---|---|
| Viewer | See the playlist and its member list |
| Editor | Everything a viewer can, plus add, remove and reorder items |
| Administrator | Everything an editor can, plus rename the playlist, change its settings, and add, remove or change members |
| Owner | Everything, including deleting the playlist. Only the owner can delete it. |

You can only add someone as a member if their profile is public, or if you already follow them and
they've accepted. A user who turned off sharing entirely can never be added.

## Saving someone else's playlist

A public or followers-only playlist you can see can be saved to your own playlist list with one
click, the same way you'd bookmark a playlist in a music app. Saving doesn't grant you any extra
access: your access to its content still comes from the visibility rule above, so you need at
least viewer access to save it in the first place.

## Covers

A playlist's cover is generated automatically: a 2x2 mosaic of the first four posters once a
playlist has four items or more, a single poster for one to three items, or a placeholder icon for
an empty one. There is no custom cover upload.

## Automatic download

On mobile (iOS, Android) and the desktop app, a playlist can be turned into an automatic download:
unwatched items are fetched to the device, and items you've already watched are removed again to
give the space back. This is a per-device setting, not something that follows your account, and it
only appears on those clients: TVs and the web app don't offer it.

See [Offline downloads](/features/offline-downloads) for the full picture, including storage
limits.

## See also

- [Sharing and social](/features/sharing-and-social) for following, recommending content to a
  specific person, and public profiles.
- [Offline downloads](/features/offline-downloads) for automatic playlist downloads in detail.
