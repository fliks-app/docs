---
title: Updating
description: How to move the server to a newer release on each install method, and what happens to the database when you do.
---

## The update check

Any admin sees an update button in the web client's top bar when a newer server release
exists; it opens the release notes. It only checks; it never installs anything by itself, on
any install method. There is no background polling: the server asks the project's public
GitHub releases only when the web client asks it, and caches the answer for six hours, so it
costs nothing per page load. Set the `FLIKS_DISABLE_UPDATE_CHECK=1` environment variable (on
Docker or a source install) to turn off the outbound request entirely,
if you'd rather update on your own schedule without Fliks phoning out for it. The TrueNAS app
sets it for you.

## Database migrations

You never run a migration by hand. In production, pending migrations run automatically the
moment the new backend starts up, before it accepts any request. This is true on every install
method, since they all run the same backend. Take a [backup](/administration/backups) first
anyway: a migration that changes the schema can't be rolled back by starting the old version
again.

## Docker

```bash
docker compose pull
docker compose up -d
```

This pulls the new image (whatever tag your `docker-compose.yml` points at, `:latest` unless you
pinned a version) and recreates the container. The database container is untouched unless you
also changed its image tag.

## Windows and macOS

Neither the Windows tray app nor the macOS menu-bar app updates itself. Download the newer
installer or `.dmg` from the [latest release](https://github.com/fliks-app/fliks/releases) and
run it the same way you did the first time:

- **Windows**: the installer replaces the app under `%LOCALAPPDATA%\Programs\Fliks`; your data
  under `%LOCALAPPDATA%\Fliks` is untouched.
- **macOS**: quit Fliks, drag **Fliks Server** from the new `.dmg` over the one in
  Applications, and relaunch; your data under `~/Library/Application Support/Fliks` is untouched.

## From source

Pull the new tag or commit, then rebuild and restart both halves:

```bash
cd client && npm ci && npx ng build --configuration=production
cd ../backend && npm ci && npm run build
```

Restart `node dist/main` with the same environment as before (including `NODE_ENV=production`);
migrations run as part of that startup.

## TrueNAS

Updates surface through TrueNAS SCALE's own app-update mechanism (**Apps > Installed** shows an
available update); it pulls the new image the same way the plain Docker install does.

## See also

- [Backups](/administration/backups) to take a database backup before a major update.
- [Environment variables](/install/environment-variables) for `FLIKS_DISABLE_UPDATE_CHECK` and
  every other variable.
