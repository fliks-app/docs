---
title: Books and audiobooks
description: Add a books library, browse works, series and authors, read in the built-in reader, listen to audiobooks, and send books to an e-reader.
---

> [!SUMMARY]
> Switch on **Books and audiobooks** when adding a library, then open a book and press **Read** or **Listen**. Send books to an e-reader from **Send to...**.

## Add a books library

In **Settings > Libraries > Add a library**, switch on **Books and audiobooks** under **Media
types**. A library can hold books alone or mix them with other types. Folders and the **General**
tab work as described in [Libraries](/features/libraries#creating-a-library).

Two things differ from video:

- Metadata comes from book providers: **OpenLibrary**, **BnF** and **Google Books** for ebooks,
  **Audible** and **Audnexus** for audiobooks. See [Metadata](/features/metadata). Free ebooks
  and audiobooks can be added with the Project Gutenberg and LibriVox plugins from the plugin
  catalog.
- On the library's **General** tab, **Merge audiobook parts into one m4b** builds one chaptered
  file next to the parts of an audiobook split into many files. It is off by default. **Delete the
  parts once merged** then removes the original parts from disk after the m4b is verified.

> [!NOTE]
> **Settings > Naming** has a **Books** section for the folder and file names used when Fliks
> moves book files: the defaults are `{Title}` for the folder and `{Title} ({Year})` for the file.
> The same scan toggle as for video, **Move / rename according to the naming rules**, applies. See
> the [warning in Libraries](/features/libraries#finding-media-in-the-folder).

## Browse books, series and authors

Click the library in the left sidebar. A library of books alone has the tabs **Books**,
**Series**, **Authors**, **Genres** and **Likes**.

- The **Filters** button narrows the grid by **Format** (ebook or audiobook), **Language**,
  **Author**, **Narrator** and **In progress**.
- The sort menu orders by title, author, series, publication date or progress.
- **Series** shows how far you are in each series (for example "2 of 5"). A series page lists the
  missing volumes and the next one to read.
- **Authors** opens an author page with the whole bibliography.

## A book's page

A book is one work with several **editions**, for example an ebook and an audiobook. The page
shows the cover, series position ("Part of ..."), authors, narrators, a **Read** or **Listen**
button (**Continue reading** or **Continue listening** once started), the progress, an
**Editions** table (language, publisher, pages or length, narrators, whether a file is on disk)
and **Chapters** for an audiobook.

The three-dot menu has the usual entries (**Like**, **Add to list**, **Recommend** ...) plus, for
administrators, **Metadata > Identify**, **Metadata > Refresh metadata**, **Metadata > Sources**
(link or relink a provider identifier, which refreshes the metadata from that source) and
**Metadata > Edit series** (set the series and position by hand, or **Use the providers'
series**). **Advanced > Profiles** is called **Formats and languages** for a book.

The page also offers **Download**, **Share**, **Save offline** on clients that support it, and
**Send to...** to mail the book to an e-reader.

## Reading

**Read** opens the reader for EPUB (including fixed-layout), PDF and CBZ files. Your position is
saved like any playback, so you pick up where you stopped on another device.

:::details What the reader supports (EPUB and PDF)
| Feature | EPUB | PDF |
|---|---|---|
| **Contents**, **Search in book**, bookmarks | Yes | No |
| Highlights in four colors and notes, export as Markdown | Yes | No |
| **Appearance**: theme | Yes | Yes |
| **Appearance**: font, text size, line spacing, margins, columns, justify, **Pages** or **Scroll** layout | Yes | No |
| Zoom | No | Yes |
| **Listen** (when the book has an audiobook edition) | Yes | Yes |

Themes are **Original**, **Sepia**, **Calm**, **Slate**, **Night** and **Pure black**. Fonts are
the book's own, **Literata**, **Atkinson Hyperlegible** and a sans-serif. While reading, the
faint running head shows the chapter, and a line tells how many minutes are left in the chapter
and in the book. Select a passage to highlight it, add a note, copy it, search it or share the
quote.
:::

:::details Reader keyboard shortcuts
| Key | Action |
|---|---|
| Left / Right arrows | Turn toward that side of the screen |
| Page Down, Space / Page Up, Shift+Space | Next / previous page |
| Home / End | Start / end of the book |
| **T** | Contents |
| **S** | Reading settings |
| **N** | Notes panel |
| **F** | Search in book |
| **B** | Bookmark this page |
| Enter | Show or hide the bars |
| Esc | Close the reader |
:::

## Listen to audiobooks

**Listen** starts the audiobook player: a mini player that stays while you browse, and a
full-screen view. It offers play and pause, **Back** and **Forward** skip steps (10 to 60 seconds),
chapter navigation, **Playback speed** (0.5x to 3x), a **Sleep timer** that can stop at **End of
chapter**, a **Chapters** list and **Bookmarks**. Audiobooks resume from **Continue listening** on
the home page and stay out of **Continue watching**.

## E-readers and reading apps

- **Send to...** mails a book to a Kindle, a PocketBook or any address that accepts attachments.
  An administrator sets up outgoing mail in **Settings > Outgoing mail**, then each user adds
  their device in **Account settings > E-mail devices**. For a Kindle, first approve the server's
  sender address in your Amazon account.
- **Account settings > Devices** creates a token per e-reader or reading app. It enables Kobo
  sync (experimental), KOReader progress sync and an OPDS catalog for apps such as KOReader.

## See also

- [Libraries](/features/libraries) for scanning, naming and the actions common to every title.
- [Requests](/downloads/requests) for asking for a book in a language you want.
