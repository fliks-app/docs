---
title: Libraries
description: Point Fliks at a folder of video files, scan it, and it builds a browsable library with covers, cast and episode listings.
---

## Creating a library

**Settings > Libraries > New library** walks through three steps: information, user access, and the
media itself.

| Field | What it's for |
|---|---|
| Name | Shown everywhere the library appears; must be unique |
| Icon and colour | How the library's card looks on the home page |
| Media types | Movies, series, or both. At least one is required. |
| Metadata provider | TMDB, TVDB, or automatic (TMDB by default) |
| Metadata language / region | Overrides the server-wide default for this library only; leave blank to inherit it |
| Root path | The single folder on the server where this library's files live (created automatically if it doesn't exist yet) |

A folder can only belong to one library at a time, and once a library has media in it, its root
path can't be changed or cleared.

The last step scans the root folder before the library is actually created, so you can review what
Fliks found (and fix any wrong matches) before anything is saved. Once you confirm, the import runs
in the background and you're free to keep using the app while it works.

> [!NOTE]
> Deleting a library removes its titles from Fliks, but never touches the files on disk.

## Finding media in the folder

Fliks doesn't watch a library's folder continuously in the background. To pick up files you've
added since the last scan, open the library and click **Scan the folder**. The scan:

- Walks the folder (up to four levels deep) for common video file types.
- Groups files into titles: episodes sharing a folder become one series, a loose numbering pattern
  (`S01E02`) is read automatically, and each movie file gets its own group.
- Reads a Kodi-style `.nfo` file next to a video, if one exists, for a title and year hint.
- Picks up a matching poster, fanart or logo image already sitting next to the files, for anything
  you choose to add without an online metadata match.

For each group found, you can **Link** it to a search result, or **Add without metadata** if you'd
rather not wait, with bulk actions to link or auto-import everything at once. Turning on **Move /
rename according to the naming rules** (on by default) also renames and relocates matched files
into the folder structure described below.

> [!TIP]
> **Rescan** (from a library's own page, or **Settings > System** for every library at once) only
> re-checks files Fliks already knows about, for example after replacing one with a better copy.
> It doesn't discover new files: for that, scan the folder again.

## Reviewing and fixing a match

Every title's page has an **Identify** action for fixing a wrong or missing match by hand: search
again by title and year, or paste an exact IMDb, TMDB or TVDB id if you already know it. Confirming
re-fetches everything for that title in the background.

## Who can see what

By default, only administrators see every library. Give another user access to a specific library
from that library's **Users** tab, or from the user's own **Library access** field in **Settings >
Users**; either one fully replaces the previous list. Each user can also set their own library
order, and hide libraries they do have access to, from their own home settings, without affecting
what anyone else sees.

## File naming

**Settings > Naming** controls how files are renamed and organized when Fliks moves them into
place, with a live preview of the result:

| Setting | Default |
|---|---|
| Movie file format | `{Movie Title} ({Release Year}) {Quality Full}` |
| Series folder format | `{Series Title}` |
| Season folder format | `Season {season:00}` |
| Episode file format | `{Series Title} - S{season:00}E{episode:00} - {Episode Title} {Quality Full}` |

Tokens like `{Quality Full}`, `{Release Group}`, `{Original Title}`, `{TMDB Id}` and `{Air Date}` are
replaced with the matching value for that file; a token with nothing to fill it in is simply
removed. **Settings > General** also has a list of "companion" file extensions (subtitles, `.nfo`,
artwork) that move along with a video file whenever it does.

![A library grid with posters and filters](/img/library.webp)

## Quality and language profiles

Two kinds of profile decide what Fliks considers an acceptable copy of a title, and what to search
for if you're using the download plugin. You pick both explicitly for each title when you add or
request it, rather than once for the whole library.

**Quality profile** (**Settings > Quality profiles**): which qualities are acceptable, in what
order of preference, and a cutoff to stop looking once it's reached. Turning on **Allow upgrades**
keeps Fliks looking for a strictly better release up to that cutoff, even for a title you already
have; **Resolution upgrades only** limits that to actual resolution jumps rather than swapping one
source for another at the same resolution.

**Language profile** (**Settings > Language profiles**): which audio languages you want, and which
subtitle languages to search for automatically, each with its own forced and hearing-impaired
preference. See [Subtitles](/features/subtitles#how-automatic-search-works) for how this profile is
used.

## Browsing a library

A library's own page offers several views: the full grid, Suggestions, Genres, Collections and your
Likes, sortable by title, release date, date added or rating. **Filters** narrow it down further by
monitoring state, watched state, or status (downloaded, missing, or below your cutoff), and your
last-used filters are remembered per library. **Bulk edit** lets you change the quality profile or
monitoring state for several titles at once.

## See also

- [Metadata](/features/metadata) for how covers, cast and details are fetched and kept current.
- [Subtitles](/features/subtitles) for how a language profile drives automatic subtitle search.
- [Requests](/features/requests) for letting other users ask for a title instead of adding it
  themselves.
