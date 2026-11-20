---
title: Comics
description: Add a comics library, browse volumes and issues, edit their details, and read in pages, manga or webtoon mode.
---

## Creating a comics library

In **Settings > Libraries > Add a library**, switch on **Comics** under **Media types**, then set
the folders and scan as described in [Libraries](/features/libraries#creating-a-library).

- Fliks reads `.cbz`, `.cb7`, `.cbr` and `.pdf` files, and the `ComicInfo.xml` inside them.
  Your own edits are kept across rescans.
- Details come from comic metadata providers, such as Metron and Comic Vine. They are plugins to
  install from **Settings > Plugins**, with your own API key. See [Plugins](/plugins/overview).

## Volumes and issues

Click the library in the left sidebar to browse volumes. A volume's page shows its cover, the
volume number and how many issues you have read ("3 of 12 issues read"). A **Read** button opens
the first issue, or **Continue** where you left off.

The list below is split into **Issues**, **Annuals** and **Specials**. Each row has its number,
page count, a **Read** badge when finished, a progress bar, a **No file** badge for a missing
issue, a pencil button to edit it and a three-dot menu.

## Editing a volume or an issue

Fliks fills these from the files and providers. You can correct them by hand:

- **Edit details** in the volume's three-dot menu opens **Edit volume**: **Title**,
  **Publisher**, **Start year**, **Volume number**, **Overview**.
- The pencil on an issue opens **Edit issue**: **Number**, **Sort position**, **Type**
  (**Issue**, **Annual** or **Special**), **Title**, **Release date**, **Overview**.
- **Reset to automatic** drops your edit and goes back to the file and provider values.

The other entries of the three-dot menu (**Metadata > Identify**, **Refresh metadata**,
**Advanced** ...) are the ones described in [Libraries](/features/libraries#the-title-page-and-its-actions).

## Reading

**Read** opens the reader, shared with [books](/features/books-and-audiobooks#reading). The
comic-specific options are in the **Appearance** panel:

| Setting | Choices |
|---|---|
| **Reading mode** | **Pages**, **Manga** (right to left) or **Webtoon** (continuous vertical scroll) |
| **Double page** | Show two pages side by side |

You can zoom in and out. Position is saved like any playback. The same keyboard shortcuts as
the book reader apply (arrows or Page keys to turn pages, Esc to close).

> [!NOTE]
> This page was written from the app's source and release notes. It has no screenshots yet: the
> demo server has no comics.

## See also

- [Books and audiobooks](/features/books-and-audiobooks) for the shared reader.
