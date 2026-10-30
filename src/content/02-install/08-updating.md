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
can be tried before it ships. It is built for every platform, but the Docker `latest` tag, the app
stores and the stable update feeds skip it, so no stable install picks one up by itself. To try
one, download it from the [releases page](https://github.com/fliks-app/fliks/releases) or, on
Docker, pin its exact image tag (`ghcr.io/fliks-app/fliks:5.1.0-beta.1`).

The update check asks GitHub for the latest stable release, which never is a pre-release. A server
running a pre-release is offered the final release (`5.1.0` is newer than `5.1.0-beta.1`), but not
the next beta: install that one by hand. Take a [backup](/administration/backups) before moving
to a pre-release, since a migration can't be rolled back.

## Database migrations

You never run a migration by hand. Pending migrations run automatically the moment the new
server starts up, before it accepts any request. This is true on every install method, since they
all run the same server. Take a [backup](/administration/backups) first anyway: a migration that
changes the schema can't be rolled back by starting the old version again.

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

- [Backups](/administration/backups) to take a database backup before a major update.
- [Environment variables](/install/environment-variables) for `FLIKS_DISABLE_UPDATE_CHECK` and
  every other variable.
