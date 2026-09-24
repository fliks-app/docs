---
title: Storage and database
description: The per-plugin Postgres role and schema, what's accessible and what isn't, migrations, and the export/import backup format.
---

## What you get

A `process` plugin whose manifest declares `database.schema: true` gets, on confirm and reconciled
on every start:

- A dedicated Postgres **role and schema**, both named `plugin_<id>` with every dot in your id
  replaced by an underscore (`fliks.download` becomes `plugin_fliks_download`).
- A **password rotated on every spawn**, never persisted, handed to your process as the
  `FLIKS_DB_URL` connection string. Don't cache it across a restart, there's nothing to cache.
- `USAGE` on the `public` schema, and **`REFERENCES`-only, column-level** grants on exactly the core
  tables your manifest's `database.coreRefs` names, and only their `id` column. You can put a
  foreign key into `public.media(id)`; you cannot `SELECT` from it.
- Your own connection string's `search_path` set to your schema only, `public` is deliberately not
  on it, so an unqualified query can never accidentally hit a core table.

Core **never uses your tables at runtime**: no core feature queries them. It provisions the role and
schema, checks your `coreRefs` exist as real tables with an `id` column before granting anything, and
otherwise touches your schema only when an admin explicitly exports, imports or uninstalls (see
below).

## `coreRefs`

Each name in `database.coreRefs` must:

- Match `^[a-z_][a-z0-9_]*$` and be at most 63 characters.
- Appear once.
- Actually exist as a `public` base table with an `id` column, checked at provision time; a table
  that doesn't exist yet (a core migration not yet applied) fails provisioning with
  `db-provision-failed`.

Point a foreign key at it with `ON DELETE CASCADE` or `ON DELETE SET NULL`. Anything else (a
`RESTRICT` or `NO ACTION` FK from your schema into a core table) would block core from deleting the
referenced row. That is advised against, not enforced: on every start core checks your schema for
such keys and surfaces a warning on the plugin row and in its logs, rather than refusing to run it.

## Running your own migrations

Core provisions the schema; it never runs anything inside it. Your plugin runs its own migrations,
against the same `FLIKS_DB_URL` it gets at spawn, before it answers `hello`. The pattern the
download plugin uses (`fk-plugin-download`, `migrations/` and `src/db/migrate.ts`; the notify plugin
declares no schema):

- A migration file per change, numbered (`0001_initial_schema.ts`, `0002_...`), each exporting
  `{ name, up, down }` as plain SQL strings.
- One tracking table **inside your own schema**, conventionally `_migrations` (name, appliedAt),
  never in `public`.
- Each migration applied in its own transaction, together with the tracking insert, so a failure
  partway through doesn't leave the ledger and the schema disagreeing.
- Run at boot, before the first `hello` reply, so core never sees a plugin as ready with an
  unmigrated schema.

> [!TIP]
> **A table whose name starts with an underscore is yours, and core leaves it alone completely.**
> It is never exported, never restored, and never counted when core decides whether your schema is
> "empty" (see export/import below). A migration ledger is exactly the kind of table this is for:
> restoring an old export over a freshly-migrated schema shouldn't misstate which migrations have
> actually run.

See [Testing and debugging](/plugins/testing-and-debugging#database-tests) for how to exercise this
against a real Postgres in CI, including the cross-schema grant behaviour itself (what you can and
can't do as the provisioned role), not just the migrations.

## What's not accessible

- No core feature queries your schema. The only core code that reads or writes it is the
  admin-triggered export and import below, which touch only your own schema's tables.
- You cannot `SELECT` a `coreRefs` table, only reference its `id` in a foreign key. A query that
  tries fails with a permissions error from Postgres itself (`42501`), not a Fliks-level error.
- You have no path to another plugin's schema.
- Nothing outside `database.coreRefs` is visible to you at all, adding a new core dependency later
  means shipping a new manifest version.

## Export and import

`GET /api/plugins/:id/export` (admin-only, same gate as the rest of the plugins API) returns one
JSON document:

```json
{
  "formatVersion": 1,
  "pluginId": "acme.tool",
  "pluginVersion": "1.4.0",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "settings": { "plugin.acme.tool.api_key": "..." },
  "tables": { "widgets": [ { "id": 1, "name": "..." } ] }
}
```

`tables` is `{}` for a `data` plugin, and for a `process` plugin whose manifest declares no schema.
Table and column names are read live from the database catalogue on every call, never trusted from
anywhere else, and the schema queried is always exactly `plugin_<id>`, never `public`, never another
plugin's.

> [!CAUTION]
> **This document carries credentials.** Anything an operator typed into a `secret` field lands in
> `settings` unmasked, nothing is stripped. Handle an export like any other credential dump.

`POST /api/plugins/:id/import` restores that document and **refuses rather than merges**:

| Guard | Code | Why |
|---|---|---|
| Version mismatch | `PLUGIN_EXPORT_VERSION_MISMATCH` (409) | The export's `pluginVersion` must equal the installed version. There's no migration-diff engine, replaying an old export onto a different version risks writing rows or setting keys that no longer match its current shape. |
| Schema not empty | `PLUGIN_SCHEMA_NOT_EMPTY` (409) | Any table already holding a row (bookkeeping tables aside) refuses the import. A plugin that has only just migrated counts as empty; that's the state a restore is meant for. Uninstall and reinstall (which wipes the schema) before importing into a plugin you've already used. |
| Not yet activated | `PLUGIN_NOT_READY` (409) | The installed plugin's last activation must have succeeded, since that's what proves its own migrations have already run. |
| Malformed document | `PLUGIN_EXPORT_MALFORMED` (400) | Shape check failed, or `formatVersion` isn't `1`. |
| Id mismatch | `PLUGIN_EXPORT_ID_MISMATCH` (400) | The document's `pluginId` doesn't match the plugin you're importing into. |
| No schema to hold tables | `PLUGIN_EXPORT_HAS_NO_SCHEMA` (409) | The document carries `tables` but this plugin declares none. |
| Setting out of scope | `PLUGIN_EXPORT_SETTING_OUT_OF_SCOPE` (400) | A settings key outside `plugin.<id>.*`; every key is checked before any is written. |

A restore writes rows carrying their original ids and moves every serial column's sequence past the
highest restored value, in the same transaction, so the plugin's first insert afterwards doesn't
collide on a duplicate key.

## Uninstall vs. disable

| | Postgres role and schema | Per-plugin data directory | `plugin.<id>.*` settings | Live routes/UI/jobs |
|---|---|---|---|---|
| **Disable** | Kept | Kept | Kept | UI and jobs dropped; declared routes stay known and answer 503 (unavailable) rather than 403 |
| **Uninstall** | Dropped | **Deleted** | **Deleted** | Dropped |

Uninstalling a plugin is destructive across the board, not only its database schema: its per-plugin
data directory (the one place other than the database meant to survive restarts) and every one of
its settings, secrets included, go with it, and so do the scopes and ingest roots the admin consented
to, so a reinstall asks for them again. Export first if you might want any of it back.
