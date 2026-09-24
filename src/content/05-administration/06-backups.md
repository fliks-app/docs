---
title: Backups
description: What a Fliks backup actually contains, how it's taken automatically, and how to restore one.
---

## What's backed up

A Fliks backup is a plain SQL dump of the database, taken with `pg_dump`. It covers your
libraries, media, users, roles, settings and history, everything that lives in PostgreSQL. It
does **not** include:

- Artwork, cached images or uploaded avatars (`FLIKS_DATA_DIR`).
- The JWT signing key (`FLIKS_CONF_DIR`); restoring a backup onto a fresh install with a
  different key logs everyone out, since existing sessions were signed with the old one.
- Installed plugin archives (these live in the database and are included) or their unpacked
  runtime files (`FLIKS_RUNTIME_DIR`, which aren't; a plugin reinstalls its runtime files
  automatically after a restore).
- The transcode cache; it's disposable by design.

If you want a full disaster-recovery copy rather than just the database, back up the data and
conf directories yourself alongside this (a filesystem snapshot, or a plain `cp -r`, works fine
since nothing in them is a live database).

## Automatic backups

Fliks takes one every day at 2 AM server time, and keeps the 7 most recent, deleting older ones
automatically. Nothing to configure; it just runs.

## Where they're stored

Under `<data dir>/backups` (`/app/data/backups` in Docker), as
`fliks-backup-<timestamp>.sql` files. Being under the data directory, they survive an image
or app update, and they're included if you back up that directory yourself.

## Managing them by hand

**Settings > System > Backups** lists every backup with its size and date, and lets you:

- **Create a backup** on demand, outside the daily schedule.
- **Download** one, to keep a copy outside the server entirely.
- **Restore** one. This runs `psql` against the current database with the dump's contents, which
  overwrites what's there now; Fliks asks for confirmation before doing it, and you should
  restart the server afterward.
- **Delete** one, permanently.

> [!WARNING]
> Restoring overwrites the current database. Take a fresh backup first if you want any way back
> from whatever state you're restoring away from.

## See also

- [Logs and troubleshooting](/administration/logs-and-troubleshooting) for what a failed backup
  or restore usually means (most often a PostgreSQL client/server version mismatch).
- [Updating](/install/updating) for why taking a backup before a version bump is worth the extra
  minute.
