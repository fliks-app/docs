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

Drag items into the order you want by their handles (on a TV, where dragging isn't available, use
the Move up / Move down buttons instead). A series' episodes move together as one block.
Reordering needs at least the editor role on a shared playlist.

Turn on **Autoplay** in the playlist's settings and the player advances to the next item
automatically when one ends, with no confirmation prompt. An item with no playable file is skipped.
Turn on **Remove watched items** and each item you finish disappears from the list on its own, so a
playlist can work as a queue that empties itself as you get through it.

> [!NOTE]
> Remove watched items only reacts to the owner's playback. If you share a playlist with someone
> else, an item they finish stays in the list, even if they're an editor.

## Sharing a playlist

Every playlist has a visibility:

| Visibility | Who can see and play it |
|---|---|
| Private | Only the owner, plus anyone added by hand |
| Followers only | The owner's accepted followers |
| Public | Any signed-in user |

An account that turned off sharing features can only keep its playlists private.

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

Any playlist someone else owns that you can see (public, followers-only, or one you were added to)
can be saved to your own playlist list with the **Save** button, the same way you'd bookmark a
playlist in a music app. Saving doesn't grant you any extra access: your access to its content
still comes from the rules above, so you need at least viewer access to save it in the first place.

## Covers

A playlist's cover is generated automatically from the posters of the titles in it, counting each
movie or series once (ten episodes of one series give a single poster): a 2x2 mosaic once there
are four different posters, a single poster for one to three, or a placeholder icon when there are
none. There is no custom cover upload.

## Automatic download

On mobile (iOS, Android) and the desktop app, a playlist can be turned into an automatic download:
unwatched items are fetched to the device, and items you've already watched are removed again to
give the space back. This is a per-device setting, not something that follows your account, and it
only appears on those clients: TVs and the web app don't offer it. The toggle sits in the
playlist's settings, so only the owner or an administrator of the playlist can turn it on.

See [Offline downloads](/features/offline-downloads) for the full picture, including storage
limits.

## See also

- [Sharing and social](/features/sharing-and-social) for following, recommending content to a
  specific person, and public profiles.
- [Offline downloads](/features/offline-downloads) for automatic playlist downloads in detail.
