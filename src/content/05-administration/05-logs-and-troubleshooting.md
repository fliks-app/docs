---
title: Logs and troubleshooting
description: Where to find logs on each platform, and how to read the warnings Fliks logs about its own setup.
---

## In-app log viewer

**Settings > System > Logs** shows the server's own recent log lines, filterable by level and by
a text search, refreshed every 5 seconds. It's a rolling buffer of the **last 2000 entries only**,
kept in memory: it's reset on every restart and doesn't reach further back than that. For
anything older, or to see what happened around a crash, go to the platform log below instead.

## Where logs live per platform

| Platform | Where |
|---|---|
| Docker | `docker compose logs fliks` (or `docker logs <container>`), same as any container: stdout/stderr, not written to a file inside the container by default. |
| Windows | `%LOCALAPPDATA%\Fliks\logs\backend-YYYY-MM-DD.log`, one file per day. The tray's **View Logs…** opens this folder directly. |
| macOS | `~/Library/Application Support/Fliks/logs/backend-YYYY-MM-DD.log`, one file per day, plus PostgreSQL's own logs alongside. Backend lines are also visible in Console.app (subsystem `app.fliks.macos`). The menu bar's **View Logs** opens this folder directly. |
| From source | Whatever the process's stdout/stderr is redirected to; Fliks doesn't write a log file itself outside of a packaged build. |

## Warnings worth recognizing

These are logged, not surfaced as errors in the UI, so they're easy to miss unless you're
already looking at the log:

| Message (start of line) | What it means | Fix |
|---|---|---|
| `No users found` | First boot, no accounts exist yet; Fliks created `admin`/`password`. | Log in and change the password immediately; see [Quick start](/getting-started/quick-start). |
| `Cannot write to the data directory` | `FLIKS_DATA_DIR` isn't writable by the process; Fliks fell back to a temp directory. Artwork and avatars won't survive a restart. | Fix the mount/permission, or set `FLIKS_DATA_DIR` to a writable path. |
| `Cannot write to the cache directory` | Same, for `FLIKS_CACHE_DIR`. Nothing is lost permanently (it's regenerable), just slower after every restart. | Fix the mount/permission, or set `FLIKS_CACHE_DIR`. |
| `Cannot write to the plugins runtime directory` | Installed plugin files won't survive a restart (the archives themselves are safe in the database; only the unpacked runtime files are affected). | Fix the mount/permission, or set `FLIKS_RUNTIME_DIR`. |
| `HW accel test failed: <type>` | The hardware probe tried that path at startup and it didn't work; the tail of FFmpeg's own error follows on the same line. | See [Hardware acceleration](/install/hardware-acceleration) for what each path needs (a device, a driver version, a container capability). |
| `GitHub release lookup failed: HTTP …` | The update check couldn't reach GitHub; harmless, retried on the next check. | Ignore, or set `FLIKS_DISABLE_UPDATE_CHECK=1` if the server has no outbound internet access at all. |

## Common startup failure: the database extension

On every boot, Fliks runs `CREATE EXTENSION IF NOT EXISTS pg_trgm` (used for search) against the
configured database, and waits for it to succeed before starting anything else. With the example
Compose file this works out of the box, because the `fliks` Postgres role owns its own database.
Pointing Fliks at a database on a shared or externally managed PostgreSQL server can fail here if
that role isn't allowed to create extensions; have a superuser run
`CREATE EXTENSION IF NOT EXISTS pg_trgm;` once on that database, or grant the role the
`CREATEDB`/extension privilege it needs.

## Health check endpoint

`GET /api/system/liveness` is what Docker's own `HEALTHCHECK` polls (every 30 seconds, a generous
60-second grace period on startup, since a library scan can otherwise saturate a low-power CPU
and make an orchestrator think the container is unhealthy mid-scan). It's a plain liveness check,
not a deep dependency check; use the **System > Status** page's health cards for database and
plugin status instead.

## Backup and restore failures

`pg_dump`/`psql` errors on the [Backups](/administration/backups) page surface the tool's own
last error line. The most common one on a from-source or self-managed install is a client/server
version mismatch: PostgreSQL's `pg_dump` refuses to dump a server newer than itself. Keep the
`postgresql-client` package on the machine running Fliks at the same major version as the
database server (this is a non-issue on Docker, Windows and macOS, which all bundle matching
versions).

## See also

- [Backups](/administration/backups) for how to take and restore a database backup.
- [Environment variables](/install/environment-variables) for every path that can be redirected.
- [FAQ](/administration/faq) for the more common one-off questions.
