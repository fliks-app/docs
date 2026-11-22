---
title: Logs and troubleshooting
description: Where to find logs on each platform, and how to read the warnings Fliks logs about its own setup.
---

> [!SUMMARY]
> Read the server's recent log in **Settings > System > Logs**, or the platform log for anything older: `docker compose logs fliks` on Docker. The warnings table below explains the messages Fliks logs about its own setup.

## Read the logs

**Settings > System > Logs** shows recent log lines, newest first, filterable by level and text. It holds only the last 2000 lines (reset on restart): for anything older, or around a crash, use the platform log below.

![The in-app log viewer, with log and warn lines from scheduled plugin jobs](/img/logs.webp)

## Where logs live per platform

| Platform | Where |
|---|---|
| Docker | `docker compose logs fliks` (or `docker logs <container>`), same as any container: stdout/stderr, not written to a file inside the container by default. |
| Windows | `%LOCALAPPDATA%\Fliks Server\logs\server-YYYY-MM-DD.log`, one file per day, plus PostgreSQL's own logs alongside. The tray's **View Logs…** opens this folder directly. |
| macOS | `~/Library/Application Support/Fliks Server/logs/server-YYYY-MM-DD.log`, one file per day, plus PostgreSQL's own logs alongside. Server lines are also visible in Console.app (subsystem `app.fliks.macos`). The menu bar's **View Logs...** opens this folder directly. |
| From source | Whatever the process's stdout/stderr is redirected to; Fliks doesn't write a log file itself outside of a packaged build. |

## Warnings worth recognizing

These are logged, not shown as errors in the UI: search for the text in the viewer.

:::details Every warning, what it means and the fix
| Message (start of line) | What it means | Fix |
|---|---|---|
| `data directory not writable: using …` | `FLIKS_DATA_DIR` isn't writable by the process; Fliks fell back to a temp directory. Artwork and avatars won't survive a restart. | Fix the mount/permission, or set `FLIKS_DATA_DIR` to a writable path. |
| `cache directory not writable: using …` | Same, for `FLIKS_CACHE_DIR`. Nothing is lost permanently (it's regenerable), just slower after every restart. | Fix the mount/permission, or set `FLIKS_CACHE_DIR`. |
| `no usable conf dir for .jwt-secret: using a process-local value` | `FLIKS_CONF_DIR` (`/app/conf` in Docker) and the temp directory are both unusable, so a new signing key is generated on every restart and everyone is logged out each time. The same line appears for `.push-identity.json` and `.engine-token`. | Fix the mount/permission, or set `JWT_SECRET` (and `FLIKS_ENGINE_TOKEN`). |
| `<dir> is not usable: .jwt-secret is kept in …/fliks-conf, lost when the container is recreated` | `FLIKS_CONF_DIR` is refused (look for the error line just above it), so the secrets live in the container's `/tmp`. Every recreate loses the signing key, the Subsonic app passwords and the push identity. **Settings > System > Status** shows a red line too. | Apply the `chown` the error line names, or mount a volume the server's user can write. Before an update, [copy the secrets across](/install/updating#non-root-installs-move-the-secrets-first). |
| `<file>: not a regular file with one link owned by uid …` | A secret file in the conf directory is a symlink, a hard link, or owned by another uid (typically root, after a switch to `user: 568`). | Run the `chown` the line names, or delete the file to generate a new one. |
| `<file> was open to group or others, now 0600` | A secret file had loose permissions (a NAS copy tool, a restore); Fliks closed it and kept using it. When the line adds that other users may have read it, delete the file to rotate the secret. | Nothing, unless the line says the file was readable. |
| `<dir> is world-writable: run chmod o-w on it` | The conf directory is yours but open to every local user. It still works. | `chmod o-w` on the directory. |
| `hardware run failed, CPU fallback` | A transcode that started on a hardware path (`from=` names it) failed, so Fliks restarted it on the CPU. The line comes from the transcoding engine, so it is in the [platform log](#where-logs-live-per-platform), not in the in-app viewer. The server's `Hardware acceleration: …` line, logged when it detects the machine's capabilities, names the path it found. | See [Hardware acceleration](/install/hardware-acceleration) for what each path needs (a device, a driver version, a container capability). |
| `GitHub release lookup failed: HTTP …` | The update check got an error answer from GitHub; harmless, retried on the next check. | Ignore, or set `FLIKS_DISABLE_UPDATE_CHECK=1` if the server has no outbound internet access at all. |
:::

## Common startup failure: the database extension

:::details Startup stops on the database extension (pg_trgm)
Fliks creates the `pg_trgm` extension (used for search) with `CREATE EXTENSION IF NOT EXISTS` in
one of its database migrations, which run on boot, and stops with an error if it fails, before the
web server starts. With the example Compose file this works out of the box, because the `fliks`
Postgres role owns its own database. Pointing Fliks at a database on a shared or externally managed PostgreSQL server can
fail here if that role isn't allowed to create extensions. Either have a superuser run
`CREATE EXTENSION IF NOT EXISTS pg_trgm;` once on that database, or grant the role the `CREATE`
privilege on it (`pg_trgm` is a trusted extension, so that is enough).
:::

:::details Boot message: the database role is missing something
Fliks never refuses to start over its database role. At boot it logs `the database role is
missing: …` and **Settings > System > Status** shows the same list:

| Item | Meaning |
|---|---|
| `create_role` | The role cannot create roles. |
| `create_database` | The role lacks `CREATE` or `TEMPORARY` on the database. |
| `public_owner` | The role does not own the `public` schema. |
| `foreign_objects` | Some objects belong to another role. |
| `advisory_locks` | The role cannot take advisory locks, or others can. |
| `plugin_roles` | Plugin roles are missing or not administered by the role. |

The fix is `fliks-server db-role`, run as the administrator (see
[db-role](/install/environment-variables#db-role)). A line saying the application connects as a
superuser is only a note, and so is the one about PostgreSQL 15: use 16 or newer for the role's
isolation.
:::

## Health check endpoint

:::details Health check endpoint for Docker and orchestrators
`GET /api/system/liveness` is what Docker's own `HEALTHCHECK` polls (every 30 seconds, a generous
60-second grace period on startup, since a library scan can otherwise saturate a low-power CPU
and make an orchestrator think the container is unhealthy mid-scan). It needs no login and only
answers `{"ok":true}`: it's a plain liveness check, not a deep dependency check. Use the health
cards on **Settings > System** (Status tab) for database and plugin status instead.
:::

## Backup and restore failures

`pg_dump`/`psql` errors on the [Backups](/administration/backups) page surface the tool's own
last error line. The two common ones:

- `pg_dump is not available on this server`: the PostgreSQL client tools aren't on the server's
  `PATH`. The Docker image ships them. From source, install your distribution's
  `postgresql-client` package. The Windows and macOS apps don't put a `pg_dump` on the server's
  `PATH`, so in-app backups there only work if a PostgreSQL client of a matching version is
  installed and on the system `PATH` (on macOS, in `/opt/homebrew/bin` or `/usr/local/bin`).
- A version mismatch: `pg_dump` refuses to dump a server newer than itself. Keep the client tools
  at the same major version as the database server, or newer. The Docker image installs the
  current client from the PostgreSQL project's own repository, which covers the Postgres 18
  server in the example Compose file.

## See also

- [Playback quality](/administration/playback-quality) when playback stutters: a verdict and a
  cause for every stall, per client.
- [Backups](/administration/backups) for how to take and restore a database backup.
- [Environment variables](/install/environment-variables) for every path that can be redirected.
- [FAQ](/administration/faq) for the more common one-off questions.
