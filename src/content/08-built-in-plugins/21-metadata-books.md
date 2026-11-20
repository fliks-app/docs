---
title: Books and audiobooks
description: OpenLibrary, BnF, Google Books, Audible, Audnexus, Project Gutenberg and LibriVox: what each provides and how they rank.
---

> [!SUMMARY]
> Five bundled providers identify books and audiobooks with no account or key, and two catalogue plugins (Project Gutenberg, LibriVox) add free ebooks and audiobooks. Nothing to configure; install a catalogue plugin only if you want the free content.

Bundled providers need no account or key, so they have no **Configure** link. Fliks asks **Books** providers in the order set on **Settings > Metadata** ([Metadata settings](/administration/metadata-settings)): Audible and Audnexus describe audio editions, so put OpenLibrary, BnF or Google Books first for an ebook-heavy library. Audnexus has no search (it needs an ASIN), and a provider that answers with a rate limit is skipped.

## OpenLibrary

Book search, works and their editions, and lookup by ISBN. Covers come from
`covers.openlibrary.org`. No key.

Limit: one request per second.

## BnF

The general catalogue of the Bibliotheque nationale de France. Search by ISBN, or title and
author, and editions by ISBN or notice id. Strong for French-language books. Records carry no
cover. No key.

Data is open data under the Licence Ouverte: credit "source: BnF, catalogue general".

Limit: one request per second. The BnF publishes no limit, so the pace is a safe guess.

## Google Books

Search by ISBN, title and author, and editions by ISBN or volume id. Covers come from
`books.google.com`. No key.

> [!WARNING]
> Google documents no quota for keyless use, and answered every keyless request with a rate-limit
> error when this was last checked (November 2026). When that happens Fliks skips the provider and
> uses the next one. Do not rely on it as your main source.

## Audible

Audiobook search by title, author or keywords, and editions by ASIN. The storefront follows your
**Metadata language** and **Metadata region** (`fr` gives the French store, `en-GB` the UK store,
the US store otherwise). A book exists under the same ASIN in several stores, but a store does not
return the books of another: an ASIN from a different store is read as not found. No key.

Audible's API is unofficial and has no published limit or terms. Covers and text belong to
Audible. Limit: one request per second, lowered when the service pushes back.

## Audnexus

A community mirror of Audible data. Gives an audiobook edition by ASIN, and its **chapters**. No
search. The region comes from the metadata language and region. No key.

The public instance allows 300 requests per minute. Fliks paces at one per second. The data is
Audible's and the instance publishes no terms.

## Project Gutenberg

Catalogue plugin. Install it from **Advanced > Plugins > Search for a plugin**. It does two things.

- It is a metadata provider for books, by Gutenberg id.
- It adds a **Free ebooks** entry to the **Downloads** section of the sidebar. Search by title or
  author, then click **Add to library** on a result. Fliks creates the book and downloads its EPUB
  in the background, preferring EPUB 3 with images.

Only books with an EPUB are listed. Adding needs the plugin's `books` permission, which administrators
have (see [Users and permissions](/administration/users-and-permissions)).

**Settings** (**Settings > Metadata > Configure** on its row):

| Field | Default | Notes |
|---|---|---|
| **Library id** | Empty | Only needed when several libraries accept books. With one, it is used. |

Limits: one request per second, downloads two seconds apart. A Gutenberg book is public domain in
the United States. Whether it is in your country is up to you.

## LibriVox

Catalogue plugin. Same idea for audiobooks: a metadata provider by LibriVox project id, and a
**Free audiobooks** entry in the **Downloads** section. The search is by title, then by author when
no title matches. **Add to library** downloads the recording section by section as MP3 and imports
it as one audio version. A long recording takes a while: sections are downloaded in the background.

**Settings**: **Library id**, as for Project Gutenberg.

Limits: one request per second, sections one second apart. LibriVox recordings are public domain.
The MP3 files are served by the Internet Archive.

## See also

- [Books and audiobooks](/features/books-and-audiobooks) for libraries, naming and the reader.
- [Metadata](/features/metadata).
