---
title: Updating
description: How to move the server to a newer release on each install method, and what happens to the database when you do.
---

## The update check

Any admin sees an update button in the web client's top bar when a newer server release
exists; it opens the release notes. It only checks; it never installs anything. The Windows and
macOS apps have their own updater, described [below](/install/updating#windows-and-macos). There is no background polling: the server asks the project's public
GitHub releases only when the web client asks it, and caches the answer for six hours, so it
costs nothing per page load. Set the `FLIKS_DISABLE_UPDATE_CHECK=1` environment variable (on
Docker or a source install) to turn off the outbound request entirely,
if you'd rather update on your own schedule without Fliks phoning out for it. The TrueNAS app
sets it for you.

## Pre-release versions

A version with a suffix, such as `5.1.0-beta.1`, is published as a GitHub **pre-release** so it
can be tried before it ships. It is built for every platform, but the app stores and the stable
update feeds skip it, so no stable install picks one up by itself. On Docker, a stable release
`5.1.0` is published as `5.1.0`, `5.1`, `5` and `latest`. A pre-release is published under its
exact tag only (`ghcr.io/fliks-app/fliks:5.1.0-beta.1`), so `latest`, `5.1` and `5` never move to
it. To try one, pin that tag or download it from the
[releases page](https://github.com/fliks-app/fliks/releases).

The update check asks GitHub for the latest stable release, which never is a pre-release. A server
running a pre-release is offered the final release (`5.1.0` is newer than `5.1.0-beta.1`), but not
the next beta: install that one by hand. Take a [backup](/administration/backups) before moving
to a pre-release, since a migration can't be rolled back.

## Database migrations

You never run a migration by hand. Pending migrations run automatically the moment the new
server starts up, before it accepts any request. This is true on every install method, since they
all run the same server. Take a [backup](/administration/backups) first anyway: a migration that
changes the schema can't be rolled back by starting the old version again.

## Upgrading to 6.0.0

6.0.0 changes the database layout (libraries now hold folders) and the plugin contract. Read this
before pulling the image.

**Back up first, and keep free disk.** Take a [backup](/administration/backups) yourself, and
copy it off the server. On top of that, when migrations are pending the server writes a database
dump before applying them, to `<data dir>/backups/pre-migration` (`/app/data/backups/pre-migration`
in Docker), and keeps the 3 most recent. The dump is as large as a manual backup, so leave room for
it. If the dump fails, the server stops before touching the database and the log says why. On a
source install that means `pg_dump` must be on the `PATH`, at least as recent as the PostgreSQL
server's major version, and `<data dir>/backups` must be writable (the Docker image and the
Windows and macOS apps handle this). To restore a dump, run it with `psql` against the database,
as you would a manual [backup](/administration/backups#managing-them-by-hand). Setting
`FLIKS_SKIP_PRE_MIGRATION_BACKUP=1` skips it; see
[Environment variables](/install/environment-variables#update-check).

**The server may refuse to start.** The first 6.0.0 migration checks that your library data can
move into folders. It fixes what it can on its own and refuses the rest, with an explicit message
in the log. A refusal changes nothing: the database stays as 5.2.1 left it, so rolling back to the 5.x image
still works while you fix the data. Open a SQL shell, run what the message asks for, and restart.
The user and database are the `POSTGRES_USER` and `POSTGRES_DB` of your compose file (`fliks` in
the example):

```bash
docker compose exec postgres psql -U <user> <db>
```

| The log says | Why | What to do |
|---|---|---|
| media file(s) belong to no media | A file row points at no title. | Run the `UPDATE media_files SET "mediaId" = ...` it prints for each id, or delete the rows with the `DELETE` it prints (this also drops their watch progress and subtitle rows; the files on disk are untouched). |
| directory(ies) belong to several libraries | Two libraries share one path; a folder now belongs to exactly one library. | Run the printed `UPDATE libraries SET path = ...` statements, giving each library its own directory. |
| media own files but belong to no library | A title with files sits outside every library, and no single library takes its type. | Run the printed `UPDATE media SET "libraryId" = ...` with the library that should hold them. |
| library(ies) hold files but have no path | A library with titles but no directory. | Run the printed `UPDATE libraries SET path = ...` for each. |
| media have a folderName that is absolute, or holds a `.`, `..` or empty segment | A stored folder name is not a clean relative path. | Run the printed `UPDATE media SET "folderName" = ...` with the directory name under the library path. |
| media file(s) have a relativePath that is empty, outside its library, or holds a `.`, `..` or empty segment | A stored file path cannot be placed under its folder. | Run the printed `UPDATE media_files SET "relativePath" = ...` with the path relative to the media folder. |
| media file(s) would share one path in their folder with a lower-id file | Two rows describe one file. | Run the printed statements: they re-point the playback and subtitle rows to the file that stays, then delete the duplicate row (the file on disk is untouched). |

Each message lists the first 100 rows it found, with `<placeholders>` for the values only you know.
Run the statements, restart, and repeat until the server starts.

**If you ran a `:main` image early in November.** The `1789000000050` migration was edited on
2026-11-04 (#2400) before 6.0.0 shipped. A database that applied the earlier version fails to
start with a checksum mismatch on that migration. Set its stored checksum to the new file's
(SHA-384, the checksum sqlx records) in `psql`, then restart:

```sql
UPDATE _sqlx_migrations
   SET checksum = decode('cfb713c350aafb2f089d45bd5b63fa7689891aa7882311141dd02fd93082a2b776904b4cadfec86291eb8e9910e3cad4', 'hex')
 WHERE version = 1789000000050;
```

Databases that went from 5.x straight to a release are not affected.

**Update the plugins.** The server accepts `pluginApi` 3 only. A plugin built for `pluginApi` 2
stays installed but shows as **failed** in **Settings > Plugins**, with a status telling you to
install a `pluginApi` 3 build, and its data is kept. Update each one from the plugin catalog. The
download plugin must be **2.4.0 or newer** to pick releases per season and episode.

**Provider keys and URLs.** The TMDB and TVDB API keys now live in the settings of their provider
plugins. `TMDB_API_KEY` and `TVDB_API_KEY` are imported once on the first boot (an existing plugin
key wins), then ignored. `FLIKS_TMDB_API_URL`, `FLIKS_TVDB_API_URL` and `FLIKS_TMDB_IMAGE_URL` are
gone and their values are not imported: a mirror or proxy you pointed them at is no longer used, so
the providers reach the upstream services directly. The server logs nothing when it ignores them,
so check your compose file for these three variables yourself.

**Webhooks and notifications.** `media.imported`, `media.removed`, `request.created` and
`request.approved` no longer carry `tmdbId`. They carry `externalIds`, a list of
`{ "provider": "tmdb", "value": "603" }` entries, one per id the title has. Update what reads them
(n8n, Home Assistant, a script behind a webhook) to look the id up by `provider`.

**Update the apps.** Quick Connect now uses a code (see [Pairing and remote
control](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect)): the old
approve-by-tap request is gone, so TV and mobile apps that don't show the code can't use Quick
Connect until you update them. Password login is unaffected. Apps still on 5.x also lose the
plugin release picker. Update the TV and mobile apps when you update the server.

## Docker

```bash
docker compose pull
docker compose up -d
```

This pulls the new image (whatever tag your `docker-compose.yml` points at, `:latest` unless you
pinned a version) and recreates the container. The database container is untouched unless you
also changed its image tag.

## Windows and macOS

Both apps update themselves from the [latest release](https://github.com/fliks-app/fliks/releases),
which never is a pre-release. Your data stays where it is.

- **Windows**: the tray app checks for a release 30 seconds after it starts, then every 6 hours.
  When one is found, a notification appears and the tray menu gains `Update to <version>`. Click
  it: the app downloads the update, stops PostgreSQL and the server, installs it under
  `%LOCALAPPDATA%\FliksServer` and restarts. Your data under `%LOCALAPPDATA%\Fliks Server` is
  untouched.
- **macOS**: the menu-bar app checks automatically, and **Check for Updates...** in its menu asks
  right away. When a release is found it offers to install it, then replaces the app in place; the
  server stops cleanly first and starts again on the new version. Your data under
  `~/Library/Application Support/Fliks Server` is untouched.

To update by hand instead, download the newer installer or `.dmg` and run it the way you did the
first time.

## From source

Pull the new tag or commit, then rebuild the client and the server:

```bash
cd client && npm ci && npx ng build --configuration=production
cd ../server && SQLX_OFFLINE=true cargo build --release --locked -p fliks-server
```

If `engine.lock` changed, download the engine release it names again (see [From
source](/install/from-source#get-the-engine)). Restart the engine with the same command and
environment as before; migrations run as part of that startup.

## TrueNAS

Updates surface through TrueNAS SCALE's own app-update mechanism (**Apps > Installed** shows an
available update); it pulls the new image the same way the plain Docker install does.

## See also

- [Backups](/administration/backups) to take a database backup before a major update, and for the
  automatic one taken before migrations.
- [Environment variables](/install/environment-variables) for `FLIKS_DISABLE_UPDATE_CHECK` and
  every other variable.
