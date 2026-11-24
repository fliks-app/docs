---
title: Backups
description: What a Fliks backup actually contains, how it's taken automatically, and how to restore one.
---

> [!SUMMARY]
> Fliks backs up its database every night at 2 AM and keeps the 7 latest, with nothing to configure. Check **Settings > System > Backups** once, download a copy off the server now and then, and back up the data and conf directories yourself for a full recovery.

## Make, download or restore a backup

Open **Settings > System** and select the **Backups** tab, then click **Create a backup**.

![Opening System, the Backups tab and the Create a backup button](/img/admin-backup-2-done-anim.webp)

![The Backups list, with each backup size, date and the Download/Restore/Delete actions](/img/backups.webp)

**Settings > System > Backups** lists every backup with its size and date, and lets you:

- **Create a backup** on demand, outside the daily schedule.
- **Download** one, to keep a copy outside the server entirely.
- **Restore** one. This replaces the current database with the backup's contents. Fliks asks
  for confirmation first, and the core data goes back in one transaction that stops at the first
  error rather than leaving a half-restored database. Each plugin's data is restored separately,
  under that plugin's own database login: one that cannot be restored (a constraint its rows
  break, say) stays empty and disabled, and Fliks names it once the restore ends, while
  everything else is restored. When the server runs under a supervisor (Docker, systemd, the
  Windows and macOS apps) it restarts by itself afterward; otherwise restart it yourself (the
  **Restart server** button on **Settings > System**, when it's shown, or restart the container
  or app).
- **Delete** one, permanently.

> [!WARNING]
> Restoring overwrites the current database. Take a fresh backup first if you want any way back
> from whatever state you're restoring away from.

> [!NOTE]
> Restoring needs a PostgreSQL 17 or later server: the dump sets `transaction_timeout`, which
> older servers reject. On an older one, Fliks refuses the restore and says so; move the database
> to PostgreSQL 17 or later, then restore it there. This also applies to `fliks-server restore`.

## What a backup contains

:::details What a backup contains and does not contain
A Fliks backup is a `pg_dump` custom-format archive (`.dump`) of the database. It covers your
libraries, media, users, roles, settings and history, everything that lives in PostgreSQL,
including the installed plugin archives. It does **not** include:

- Artwork, cached images or uploaded avatars (`FLIKS_DATA_DIR`).
- The JWT signing key and the push identity (`FLIKS_CONF_DIR`). Restoring a backup onto a fresh
  install without them logs everyone out, invalidates the Subsonic app passwords (sealed with
  keys derived from the signing key) and drops every push registration.
- The plugins' runtime directory (`FLIKS_RUNTIME_DIR`, `plugins/` under the data directory by
  default). Fliks rebuilds the compiled code from the archives in the database, but each
  process plugin's private data folder lives there too.
- The transcode cache; it's disposable by design.
- Your media files themselves.
- The data of a plugin that PostgreSQL cannot read for the dump. On a server whose database
  role is neither a superuser nor allowed to bypass row-level security, a plugin table that
  forces row-level security is left out; Fliks says which plugin when you create the backup,
  and that plugin starts empty after a restore.

Backups made before this version are plain `.sql` files. They stay in the list, can be
downloaded and are pruned as before, but one that holds plugin data is refused on restore: it
would run the plugins' code with the database owner's rights. Restore a `.dump` instead.

A full recovery needs `FLIKS_CONF_DIR` (`/app/conf`) next to the dump. If you want a full
disaster-recovery copy rather than just the database, back up the data and
conf directories yourself alongside this (a filesystem snapshot, or a plain `cp -r`, works fine
since nothing in them is a live database).
:::

## Automatic backups

Fliks takes one every day at 2 AM server time, and keeps the 7 most recent, deleting older ones
automatically. There's nothing to configure: the time and the count are fixed. The job shows up
as **Create a backup** in **Settings > Scheduled tasks**, where you can also run it by hand.

## Where they're stored

:::details Where backups are stored
Under `<data dir>/backups` (`/app/data/backups` in Docker), as
`fliks-backup-<timestamp>.dump` files. Being under the data directory, they survive an image
or app update, and they're included if you back up that directory yourself. They sit on the same
disk as the server, though: download a copy now and then, or copy that folder elsewhere, so a
dead disk doesn't take the backups with it.

> [!NOTE]
> Backups need the PostgreSQL client tools (`pg_dump`, `pg_restore` and `psql`). The Docker image includes
> them. On versions up to 4.1.x, the Windows and macOS apps don't put a `pg_dump` on the server's
> `PATH`, so backups there only work if you install a matching PostgreSQL client yourself; a
> from-source install needs both tools on `PATH`. Check that **Create a backup** works before
> relying on it; see
> [Backup and restore failures](/administration/logs-and-troubleshooting#backup-and-restore-failures).
:::

## Before a migration

:::details Backups taken automatically before a migration
When a newer server starts with database migrations pending, it takes a dump first, before it
changes anything. It lands in `<data dir>/backups/pre-migration` (`/app/data/backups/pre-migration`
in Docker) as `fliks-pre-migration-v<version>-<timestamp>.dump` (a `pg_dump` custom-format archive), and only
the 3 most recent are kept, plus the first one of the pending version. These files are not listed
under **Settings > System > Backups**; copy them from the folder.
A start with nothing to migrate takes none.

To go back to one, stop the server and run `fliks-server restore <file>` (in Docker, a one-off
container with the same image and environment). It restores the core data and every plugin the
same way as the page above, and never migrates, so the older version you start afterward boots
on it.

If the dump fails (no room on the disk, no `pg_dump`), the server stops and says so instead of
migrating. Free the space or fix the tool, or set `FLIKS_SKIP_PRE_MIGRATION_BACKUP=1` to start
without it, see [Environment variables](/install/environment-variables#update-check). It is a
safety net, not a replacement for your own backup before a
[major update](/install/updating#upgrading-to-600).
:::


## See also

- [Logs and troubleshooting](/administration/logs-and-troubleshooting) for what a failed backup
  or restore usually means (most often a PostgreSQL client/server version mismatch).
- [Updating](/install/updating) for why taking a backup before a version bump is worth the extra
  minute.
