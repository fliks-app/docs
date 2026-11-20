---
title: Libraries
description: Create libraries, scan folders, fix a wrong match, and find every action on a library grid and a title page.
---

> [!SUMMARY]
> Create a library in **Settings > Libraries > Add a library**: name it, pick who sees it, set the folder and scan. New files are picked up by **Scan the folder** on the library's **Medias** tab. Fix a wrong match from the title's **More** menu > **Metadata** > **Identify**.

## Creating a library

Open **Administration** from your user menu, then **Settings > Libraries > Add a library**. The
wizard has three steps: **Information**, **Users** and **Media**. This walks through the whole
path; nothing is created until the last click.

:::steps
![Open the user menu (your avatar, top right) and choose **Administration**](/img/libraries-path-1-user-menu.webp)
![In the Administration sidebar, click **Libraries** under **SETTINGS**](/img/libraries-path-2-admin-sidebar.webp)
![Click **Add a library**](/img/libraries-path-3-libraries.webp)
![Step **Information**: type a name, pick an icon, a color and the media types](/img/libraries-path-4-information.webp)
![Leave the metadata fields on their defaults, then click **Next**](/img/libraries-path-4b-information-next.webp)
![Step **Users**: tick who can see the library (administrators always can), then click **Next**](/img/libraries-path-5-users.webp)
![Step **Media**: type the root path, or click **Browse...** to pick the folder](/img/libraries-path-6-media-browse.webp)
![Click **Scan the folder** to review what Fliks finds before creating the library](/img/libraries-path-7-scan.webp)
:::

:::details Every field of the library form
| Field | What it's for |
|---|---|
| Name | Shown everywhere the library appears; must be unique |
| Icon and color | How the library's card looks on the home page |
| Media types | **Movies**, **Series**, **Books and audiobooks**, **Comics** or **Albums**. At least one is required. |
| Metadata provider | TMDB, TVDB, or automatic (TMDB by default) |
| Metadata language / region | Overrides the server-wide default for this library only; leave it on "Inherit from the global setting" to use the server default |
| Default quality / language profile | Stored with the library; the add screen still asks you to pick both for each title |
| Root path | The folder on the server where this library's files live |
| Additional folders | Optional extra folders for the same library (see [Folders](#folders)) |
:::

### What the scan review shows

Each file found gets a pre-selected candidate from the metadata provider. Check it before you confirm.

![A scan review row whose pre-selected candidate does not match the file: pick the right one](/img/libraries-scan-review-spring.webp)

Nothing fits? Choose **No match: add as is**: the title is added with its file name and a **No metadata** badge,
and you can [identify it later](#fixing-a-wrong-or-missing-match).

![A file with no match, to be added as is](/img/libraries-scan-review-no-match.webp)

A folder can only belong to one library at a time, and a folder can't contain or sit inside
another library folder.

The last step (**Media**) has a **Scan the folder** button. It scans the root folder before the
library is actually created, so you can review what Fliks found (and fix any wrong matches)
before anything is saved. Once you confirm with **Create the library**, the import runs in the
background and you're free to keep using the app while it works.

Deleting a library (**Delete**, top right of its page) removes its titles from Fliks, never the files on disk.

## Change a library's settings

**Settings > Libraries** lists every library. Click **View** on one to open its page, which has
four tabs.

![The Medias tab of a library page in Settings > Libraries](/img/libraries-admin-medias.webp)

:::details What each tab of the library page holds
| Tab | What it holds |
|---|---|
| **General** | Name, icon, color, media types, metadata provider, language and region, default profiles. A library with books also gets the audiobook merge options. Click **Save** to apply. |
| **Users** | Who can see this library. Administrators always see every library. |
| **Optimization** | The optimization profile applied to new files of this library, and the **Allow renaming** switch for it. Existing files are never processed on their own. |
| **Medias** | The folders of the library, the **Scan the folder** button and the list of every title in it, with a search box. |
:::

### Folders

The **Medias** tab starts with **Location**. Each folder shows its free space and how many titles
it holds. New media go to the first folder, tagged **Default**. Drag the folders (or use the
arrows) to change the order, use the pencil to change a path, the trash to remove one, and type a
path (or **Browse...**) and click **Add a folder** to add one.

Removing a folder that still holds media asks what to do with them. Removing titles from Fliks
never deletes files on disk, but their progress, history and playlist entries are lost.

### Unidentified titles

When some titles of the library have no match, an **Unidentified** button with a counter appears
above the title list. It filters the list down to them. Open one to
[fix its match](#fixing-a-wrong-or-missing-match).

## Finding media in the folder

Fliks doesn't watch a library's folder continuously in the background. To pick up new titles you've
added since the last scan, open **Settings > Libraries**, pick the library, and click **Scan the
folder** on its **Medias** tab.

:::details What the scan looks for
- Walks the root folder and up to three levels of subfolders for video files (`.mkv`, `.mp4`,
  `.avi`, `.mov`, `.ts`, `.m2ts`, `.wmv`, `.flv`, `.webm`, `.m4v`, `.mpg`, `.mpeg`, `.ogm`,
  `.mts`). `.vob` is left out: every part of a DVD folder would become its own item.
- Treats a file whose name carries an episode number (`S01E02`, `1x02` and similar) as an episode,
  and groups every episode under the same top-level folder into one series. An episode file sitting
  directly in the root folder is skipped: a series needs its own folder. Looser forms count too
  (`Episode 3`, `Part 2`), so a movie file named like `Movie Title Part 2` is taken for an episode:
  rename it before scanning.
- Gives every other file its own group, as a movie.
- Reads an `.nfo` file next to a video, if one exists, for a title, year and provider id
  hint.
- Picks up a matching poster, fanart or logo image already sitting next to the files, for anything
  you choose to add without an online metadata match.
:::

For each group found, you can **Link** it to a search result, or **Add without metadata** if you'd
rather not wait, with **Link all** and **Import all automatically** to handle everything at once.

![The Folder scan dialog of the Medias tab, with the naming toggle at the top](/img/libraries-admin-scan.webp)

> [!WARNING]
> **Move / rename according to the naming rules** is **on by default**. While it is on, linking a
> group to a match moves and renames its files on disk, inside the library, into the layout set in
> [File naming](#file-naming): a movie goes into its own `Title (Year)` folder, episodes into
> `Series/Season 01/`. Subtitles and other companion files travel with the video. If another tool
> follows these files by their path, or you want to keep your own folder layout, **turn the
> toggle off before you click Link or Import all automatically**. It only applies to identified
> titles that already sit in a folder of their own: a movie file lying directly in the root folder
> is never moved. The toggle is in the scan dialog of the **Medias** tab and on the **Media**
> step of the new-library wizard.

**Rescan files** (a title's **Analyze** dialog, or **Settings > System** for every title) re-reads the files
of titles Fliks already knows, for example after replacing a file. To find new titles, scan the folder again.

## Fixing a wrong or missing match

A file with no usable match shows a placeholder poster and its file name as title. A wrong match
shows the wrong poster. In both cases an administrator fixes it from the title's page. This
walks through it with a file named `bbb sunflower 1080p 30fps normal`.

:::steps
![The unidentified file shows a placeholder poster and its file name in the library grid. Click it.](/img/library-fix-1-unidentified.webp)
![On the title's page, open the three-dot menu next to **Play**](/img/library-fix-2-menu.webp)
![Open **Metadata**](/img/library-fix-3-metadata.webp)
![Choose **Identify**](/img/library-fix-3b-identify.webp)
![Fix the **Title** (and the **Year** if you know it), then click **Search**](/img/library-fix-4-identify.webp)
![Click the right result. There is no confirmation step: the match is applied at once.](/img/library-fix-5-results.webp)
![After a few seconds the poster, synopsis, genres and cast are those of Big Buck Bunny](/img/library-fix-6-result.webp)
:::

Instead of a title you can fill **IMDb ID**, **TheMovieDb ID** or **TheTVDB ID** and click
**Use these IDs**. **Provider** limits the search to TMDB or TVDB. Removing a criterion widens the
results. A confirmed match re-fetches everything for that title in the background.

**Identify** changes the metadata only, never the file.

See [Metadata](/features/metadata) for what a title page shows once it is matched, and
[the detail page actions](#the-title-page-and-its-actions) for the other entries of that menu.

## Choose who can see a library

By default, only administrators see every library. Give another user access to a specific library
from that library's **Users** tab, or from the user's own **Library access** field in **Settings >
Users** (open the user); either one fully replaces the previous list. Each user can also set their
own library order, and hide libraries they do have access to, from **App settings > Home** (the
gear on the **Libraries** row, see [Discovery and search](/features/discovery-and-search#the-home-page)),
without affecting what anyone else sees.

## File naming

**Settings > Naming** controls how files are renamed and organized when Fliks moves them into
place, with a preview of the result:

:::details Default formats and tokens
| Setting | Default |
|---|---|
| Movie file format | `{Movie Title} ({Release Year}) {Quality Full}` |
| Series folder format | `{Series Title}` |
| Season folder format | `Season {season:00}` |
| Episode file format | `{Series Title} - S{season:00}E{episode:00} - {Episode Title} {Quality Full}` |

A movie always goes into its own `{Movie Title} ({Release Year})` folder; that folder name isn't
editable from the page. The page also has **Books** (folder `{Title}`, file `{Title} ({Year})`) and
**Albums** (artist folder `{Artist Name}`, album folder `{Album Title} ({Release Year})`, track
file `{track:00} - {Track Title}`, and `{medium:00}-{track:00} - {Track Title}` for several discs).
Tokens like `{Quality Full}`, `{Release Group}`, `{Original Title}`, `{TMDB Id}` and `{Air Date}`
are replaced with the matching value for that file (click a token on
the page to insert it); a token with nothing to fill it in is simply removed. **Settings > General**
also has a **Companion file extensions** list (subtitles, `.nfo`, artwork) for files that are
carried along with a video file whenever it moves.
:::

![The Settings > Naming page, with a preview under each format](/img/libraries-admin-naming.webp)

## Quality and language profiles

A **quality profile** (**Settings > Quality profiles**) and a **language profile** (**Settings > Language profiles**) decide which copy of a title is acceptable and which subtitle languages to search for. You pick both for each title when you add or request it, not once per library. See [Quality profiles](/downloads/quality-profiles) and [how automatic subtitle search uses the language profile](/features/subtitles#how-automatic-search-works).

## Browse and filter a library

Click a library in the left sidebar (under **LIBRARY**) to open its grid.

![A library grid with posters and filters](/img/library.webp)

- **Tabs** along the top switch the view: the full grid, **Suggestions**, **Genres**,
  **Collections** (TMDB collections found in the library) and **Likes**. A library with books adds
  **Series** and **Authors**; one with albums adds **Artists**, **Tracks** and **Composers**.
- The sort menu next to the item count orders the grid by title, release date, date added or TMDB
  rating, and the arrow beside it flips ascending and descending. A book library sorts by author,
  series, publication date or progress instead.
- The search box filters the grid by title.
- The **Filters** button (the sliders icon, right of the search box) narrows the grid.
- The A to Z strip at the right edge jumps to a letter when the grid is sorted by title.
- A bottom line totals titles, files and monitored titles.

![The Filters panel of a library](/img/library-filters.webp)

:::details Available filters
| Filter | Choices |
|---|---|
| Monitoring | Monitored, Not monitored |
| Watched | Watched, Not watched |
| Status | Downloaded, Missing, Cutoff unmet |
:::

Your last-used filters are remembered per library. Each card has a check mark (mark as watched)
and, on hover, an **Actions** button.

![The Actions menu of a card in the library grid](/img/library-card-actions.webp)

The card menu has **Play**, **Open**, **Recommend**, **Like**, **Add to list**, **Mark as
watched**, and the **Metadata** and **Files** submenus. The full set is on the title's page.

## The title page and its actions

Click a card to open the title's page: poster, rating, synopsis, audio and subtitle pickers, then
**Details**, similar titles, cast and **File information**. On a phone the page is the same, and
the menu moves to the three dots in the top bar.

![A title page on a phone, with the quick action row under the Play button](/img/media-detail-phone.webp)

The row under **Play** has the quick actions, left to right: mark as watched, download, like,
add to a playlist, and the three-dot **More** menu.

![The quick action row of a title page](/img/media-detail-actions.webp)

The **More** menu holds everything else.

![The More menu of a title page](/img/media-detail-menu.webp)

:::details Every entry of the More menu
| Entry | What it does |
|---|---|
| **Recommend** | Send the title to another member, see [Sharing and social](/features/sharing-and-social) |
| **Watch together** | Start a [watch party](/features/watch-party) on this title |
| **Like** | Add it to your favorites |
| **Download** | Save it for [offline](/features/offline-downloads) playback |
| **Add to list** | Add it to a [playlist](/features/playlists), or create one on the spot |
| **Mark as watched** | Flip the watched state (it reads **Mark as unwatched** once watched) |
| **Edit subtitles** | Open the subtitle manager, see [Subtitles](/features/subtitles) |
| **Metadata** | **Identify** and **Refresh metadata** (administrators) |
| **Files** | Entries added by plugins, such as **View tracking status** |
| **Advanced** | **Analyze**, **Profiles**, **Library**, monitoring and **Delete from library** |
:::

![The Metadata submenu](/img/media-detail-menu-metadata.webp)

**Identify** is covered [above](#fixing-a-wrong-or-missing-match). **Refresh metadata** re-reads
the title from its provider right away.

![The Advanced submenu](/img/media-detail-menu-advanced.webp)

:::details What the Advanced entries do
| Advanced entry | What it does |
|---|---|
| **Analyze** | Re-run work on every file of the title: **Rescan files** (full re-scan, includes the other three), **Regenerate sprites** (seek thumbnails), **Recompute crop** (black bars), **Rebuild subtitle cache** |
| **Profiles** | Set this title's quality profile and language profile |
| **Library** | Move the title to another library and override the metadata provider for this title |
| **Stop monitoring** / **Monitor** | Whether the download plugin keeps looking for a better copy |
| **Delete from library** | Remove the title, see the warning below |
:::

![The Analyze dialog](/img/media-analyze-dialog.webp)

At the bottom of the page, **File information** lists path, quality, size, bitrate and every
video and audio stream. Two buttons sit under it: **View companion files** (subtitles, `.nfo`,
artwork and other files that travel with the video; you can import or delete them there) and
**Delete file**.

![The File information section](/img/media-file-information.webp)

> [!CAUTION]
> **Delete from library** removes the title **and**, when the title has a folder of its own, the
> files in it from disk, permanently. The confirmation text tells which case applies: "The
> associated files will also be deleted from disk" or, for a file lying directly in the library
> root, "only the library entry will be removed, the file stays on disk". **Delete file** asks
> "Delete this file from disk?". Both are irreversible. Deleting a whole *library* is different:
> it never touches files.

![The confirmation shown by Delete from library](/img/media-delete-confirm.webp)

Which entries you see depends on your permissions: **Identify**, **Refresh metadata**,
**Analyze** and monitoring are for administrators, **Profiles** and **Library** need the edit
permission, **Delete from library** needs the delete permission. A user who can only
[request](/downloads/requests) titles sees **Request** instead.

## See also

- [Metadata](/features/metadata) for how covers, cast and details are fetched and kept current.
- [Subtitles](/features/subtitles) for how a language profile drives automatic subtitle search.
- [Requests](/downloads/requests) for letting other users ask for a title instead of adding it
  themselves.
