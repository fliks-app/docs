---
title: Playlists
description: Build a running order of movies and episodes, share it with other users, or save someone else's public list to your own.
---

> [!SUMMARY]
> Click **Playlists** in the sidebar, or the add-to-list icon on any title, to create a playlist and add movies and episodes. Share it with other users, autoplay it, or save someone else's.

> [!SUMMARY]
> Click **Playlists** in the sidebar, or the add-to-list icon on any title, to create a playlist and add movies and episodes. Share it with other users, autoplay it, or save someone else's.

## Open your playlists

Click **Playlists** in the left sidebar (under **LIBRARY**). The page lists your playlists and
the ones shared with you, and has three buttons at the top right: **Import M3U**, **New smart
playlist** and **Create a playlist**. The home page also has a **Recent playlists** row.

## Create a playlist and add titles

:::steps
![On a title's page, click the add-to-list icon under **Play** (or **More > Add to list**)](/img/playlist-add-1-title.webp)
![Pick a playlist, or type a name and click **Create a playlist** to start a new one](/img/playlist-add-dialog.webp)
![The playlist page lists its items. **Play** starts it from the top.](/img/playlist-detail.webp)
:::

A card's **Actions** menu in a library grid has the same **Add to list** entry. You can also click
**Create a playlist** on the **Playlists** page first, then add titles.

## What a playlist holds

A playlist is an ordered list of movies and episodes; the two can be mixed freely in one list. A
movie or an episode can only appear once in the same playlist. Adding a season or a whole series
expands it into one row per episode, and the playlist detail page groups those rows back under the
series with a "Remove series" action.

There are three ways to add content to a playlist: a single episode, a whole season, or a movie (or
a whole series, which adds every episode). Adding respects your library access: you can't add
something from a library you can't see.

The page's top row has **Play**, **Export M3U** (download the list as an M3U file),
**Watch together** (start a [watch party](/features/watch-party) on it) and a three-dot menu.

![The three-dot menu of a playlist](/img/playlist-menu.webp)

:::details What the playlist menu does
| Entry | What it does |
|---|---|
| **Users** | Add collaborators and set their role, see [Sharing a playlist](#sharing-a-playlist) |
| **Settings** | Visibility, **Autoplay**, **Remove watched items**, **Automatic download** |
| **Rename** | Change the name |
| **Delete** | Delete the playlist (owner only) |
:::

Each item has its own three-dot menu with **View details**, **Mark as watched** and **Delete**
(remove from the playlist).

## Smart playlists and M3U import

**New smart playlist** builds a list of **music tracks** from rules instead of a fixed list.
Choose whether tracks must match **all of the rules** or **any of the rules**, add rules
(artist, album artist, composer, genre, year, release type, favourite, play count, last played,
added, duration, lossless, codec, popularity, library), pick a **Sort by** order and an optional
**Limit**. The dialog shows how many tracks match. A smart playlist follows its rules: you can't
reorder it, only use **Edit rules**.

![The New smart playlist dialog](/img/playlist-smart-editor.webp)

**Import M3U** reads an M3U file and matches each line to a track already in your library. Lines
it cannot find are listed under **Not found in your library**, and **Open playlist** takes you to
the result.

## Reorder a playlist and autoplay it

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

:::details Visibility levels and member roles
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
:::

## Save someone else's playlist

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

On iOS, Android and the desktop app, a playlist can keep itself downloaded to the device. See [Keep a playlist downloaded automatically](/features/offline-downloads#keep-a-playlist-downloaded-automatically).

## See also

- [Sharing and social](/features/sharing-and-social) for following, recommending content to a
  specific person, and public profiles.
- [Offline downloads](/features/offline-downloads) for automatic playlist downloads in detail.
