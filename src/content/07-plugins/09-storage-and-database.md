---
title: Storage and database
description: The per-plugin Postgres role and schema, the db interface, migrations, the data directory, and the export/import backup format.
---

## What you get

A `process` plugin whose manifest declares `database.schema: true` gets, at install and
reconciled every time it registers:

- A dedicated Postgres **schema** named `plugin_<id>`, with every dot in your id replaced by an
  underscore (`fliks.download` becomes `plugin_fliks_download`), and a dedicated **role** that owns
  it, named `fp_<8 hex>_<id with dots as underscores>` after the database's OID, so two Fliks
  databases on one Postgres server never share a role.
- A **password rotated every time the plugin starts**, never persisted and never handed to the
  guest. Core holds one connection pool per plugin and logs in as that role itself; the plugin
  reaches the database only through the `db` interface.
- `USAGE` on the `public` schema, and **`REFERENCES`-only, column-level** grants on exactly the core
  tables your manifest's `database.coreRefs` names, and only their `id` column. You can put a
  foreign key into `public.media(id)`; you cannot `SELECT` from it.
- A connection whose `search_path` is your schema only. `public` is deliberately not on it, so an
  unqualified query can never accidentally hit a core table. Each query is one statement, and a
  connection is reset when it returns to the pool, so a `SET` in one call never leaks into the next.

Core **never uses your tables at runtime**: no core feature queries them. It provisions the role and
schema, checks your `coreRefs` exist as real tables with an `id` column before granting anything, and
otherwise touches your schema only when an admin explicitly exports, imports or uninstalls (see
below).

Provisioning needs the core database role to be a superuser or, on Postgres 16 and later, a
`CREATEROLE` role that is a member of each plugin role. Core also revokes `CREATE` on `public` from
`PUBLIC` when Postgres still grants it (the default before Postgres 15), so a plugin role can't
create objects among the core tables.

## `coreRefs`

Each name in `database.coreRefs` must:

- Match `^[a-z_][a-z0-9_]*$` and be at most 63 characters.
- Appear once.
- Actually exist as a `public` base table with an `id` column, checked at provision time; a table
  that doesn't exist yet fails provisioning with `db-provision-failed`.

Point a foreign key at it with `ON DELETE CASCADE` or `ON DELETE SET NULL`. Anything else (a
`RESTRICT` or `NO ACTION` FK from your schema into a core table) would block core from deleting the
referenced row. That is advised against, not enforced: after your first successful migration core
checks your schema for such keys and surfaces a warning on the plugin row and in its logs, rather
than refusing to run it.

## Talking to the database

The `db` interface has three functions, wrapped by `fliks_plugin_sdk::db`:

- `query(sql, params)` returns the column names and the rows.
- `execute(sql, params)` returns the number of affected rows.
- `migrate(migrations)` applies migrations (below).

```rust
use fliks_plugin_sdk::db::{self, DbError, Param};

fn insert(event: &str, host: &str) -> Result<i64, DbError> {
    let r = db::query(
        r#"INSERT INTO "deliveries" ("event", "targetHost") VALUES ($1, $2) RETURNING "id""#,
        &[event.into(), host.into()],
    )?;
    Ok(r.int(0, "id").unwrap_or(0))
}
```

- **Parameters** are a closed set: null, boolean, int, float, text, bytes, json, text list, int list.
  They are sent in text format and Postgres infers each parameter's type from the statement.
- **Result values** are decoded by column type: `int2`, `int4` and `int8` as ints; `float4` and
  `float8` as floats; `bool`; `text`, `varchar`, `bpchar`, `name`, `citext` and `uuid` as text;
  `numeric` as text; `date` as `YYYY-MM-DD`; `timestamptz` as RFC 3339 UTC with milliseconds;
  `timestamp` read as UTC; `json` and `jsonb` as JSON text; `bytea` as bytes; `void` as null. Any
  other type is an error naming the column. Cast in the query, or select it as text.
- **Deadlines.** `query` and `execute` are cancelled after 60 seconds, and the guest sees SQLSTATE
  `57014`. A result is capped at 32 MiB (`ERR_RESULT_TOO_LARGE`).
- **Errors.** `DbError.code` is the SQLSTATE, or `unavailable` when core could not reach Postgres.
- A plugin whose manifest declares no schema gets an error on every call.

## Running your own migrations

Core provisions the schema; it never runs anything inside it. Your plugin runs its own migrations
from `start`, so core never sees a plugin as `ready` with an unmigrated schema. The pattern both
real plugins use: numbered SQL files, included in the binary, handed to `db::migrate`.

```rust
const MIGRATIONS: [(&str, &str); 1] = [(
    "0001_deliveries",
    include_str!("../migrations/0001_deliveries.sql"),
)];

fn start() -> Result<(), String> {
    db::migrate(&MIGRATIONS).map_err(|e| format!("{}: {}", e.code, e.message))?;
    Ok(())
}
```

`migrate` applies the entries it has not recorded, in order. Each `up` runs as a multi-statement
script, with no parameters, inside its own transaction together with its ledger row, so a failure
partway through leaves neither. The ledger is the table `_migrations(name, "appliedAt")` in your own
schema, and a per-plugin lock stops two instances racing. Its deadline is 10 minutes, which is why
it belongs in `start` and not in `hello`. It returns the names it applied.

> [!TIP]
> **A table whose name starts with an underscore is yours, and core leaves it alone completely.**
> It is never exported, never restored, and never counted when core decides whether your schema is
> "empty" (see export/import below). A migration ledger is exactly the kind of table this is for:
> restoring an old export over a freshly-migrated schema shouldn't misstate which migrations have
> actually run.

See [Testing and debugging](/plugins/testing-and-debugging#component-tests) for how to exercise
this against a real Postgres, including the schema and grants themselves.

## What's not accessible

- No core feature queries your schema. The only core code that reads or writes it is the
  admin-triggered export, import and uninstall below.
- You cannot `SELECT` a `coreRefs` table, only reference its `id` in a foreign key. A query that
  tries fails with a permissions error from Postgres itself (`42501`).
- You have no path to another plugin's schema.
- Nothing outside `database.coreRefs` is visible to you at all; adding a new core dependency later
  means shipping a new manifest version.

## The data directory

Separately from the database, the plugin has one directory, `/data`, for files. It is private to
the plugin, kept across restarts, upgrades and disable/enable, and lives under the runtime
directory (`FLIKS_RUNTIME_DIR`, by default `plugins/` under the server's data directory), so it
survives a container upgrade. It is not part of a plugin export.

## Export and import

`GET /api/plugins/:id/export` (`Read Settings`) returns one JSON document:

```json
{
  "formatVersion": 1,
  "pluginId": "acme.tool",
  "pluginVersion": "1.4.0",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "maskedSettings": ["api_key"],
  "settings": { "plugin.acme.tool.endpoint": "https://example.com" },
  "tables": { "widgets": [ { "id": 1, "name": "..." } ] }
}
```

`tables` is `{}` for a `data` plugin, and for a `process` plugin whose manifest declares no schema.
Table and column names are read live from the database catalogue on every call, never trusted from
anywhere else, and the schema queried is always exactly `plugin_<id>`, never `public`, never another
plugin's. Every base table is exported except those whose name begins with an underscore. The
admin UI's **Export** button on the plugin row calls this route.

**Secrets are masked unless asked for.** A setting declared `secret: true` on a form page is left
out of `settings` and listed in `maskedSettings`. A value declared in the manifest's
`database.secrets` is exported as `null` (a whole column), or has its `jsonPath` removed from the
JSON value. Adding `?includeSecrets=true` includes them all and needs the `Manage Settings`
permission; the UI offers it as **Include secrets**. If a declared table or column doesn't exist,
the export fails with `PLUGIN_SECRETS_UNKNOWN_COLUMN` (500) rather than leak.

> [!CAUTION]
> **An export with secrets carries credentials.** Everything an operator typed into a `secret`
> field, and every table-stored secret the manifest declared, is written in clear. Handle it like
> any other credential dump. Restoring a masked export leaves the masked values null or absent, so
> a `NOT NULL` column that holds a secret should be declared with a `jsonPath`.

`POST /api/plugins/:id/import` (`Manage Settings`) restores that document and **refuses rather
than merges**:

| Guard | Code | Why |
|---|---|---|
| Version mismatch | `PLUGIN_EXPORT_VERSION_MISMATCH` (409) | The export's `pluginVersion` must equal the installed version. There's no migration-diff engine, replaying an old export onto a different version risks writing rows or setting keys that no longer match its current shape. |
| Schema not empty | `PLUGIN_SCHEMA_NOT_EMPTY` (409) | Any table already holding a row (underscore tables aside) refuses the import. A plugin that has only just migrated counts as empty; that's the state a restore is meant for. Uninstall with the data deleted and reinstall before importing into a plugin you've already used. |
| Not yet activated | `PLUGIN_NOT_READY` (409) | The installed plugin's last activation must have succeeded, since that's what proves its own migrations have already run. |
| Busy | `PLUGIN_BUSY` (409) | A server restore or another import of this plugin is running. |
| Malformed document | `PLUGIN_EXPORT_MALFORMED` (400) | Shape check failed, `formatVersion` isn't `1`, or a table or column isn't one of the plugin schema's. |
| Id mismatch | `PLUGIN_EXPORT_ID_MISMATCH` (400) | The document's `pluginId` doesn't match the plugin you're importing into. |
| No schema to hold tables | `PLUGIN_EXPORT_HAS_NO_SCHEMA` (409) | The document carries rows but this plugin declares no schema. |
| Setting out of scope | `PLUGIN_EXPORT_SETTING_OUT_OF_SCOPE` (400) | A settings key the plugin doesn't own; every key is checked before any is written. |

An import writes everything in one transaction, as the plugin's own role, so its triggers, checks
and defaults run. Tables are inserted in foreign-key order, parents first. Rows keep their
original ids, and every serial or identity sequence is moved past the highest restored value in the
same transaction, so the plugin's first insert afterwards doesn't collide on a duplicate key. A
failure anywhere keeps neither rows nor settings, and an import never touches a setting key that is
absent from the document. The document is capped at 64 MiB.

## Uninstall vs. disable

| | Postgres role and schema | `/data` directory | `plugin.<id>.*` settings | Scheduled calls and granted scopes | Live routes/UI/jobs |
|---|---|---|---|---|---|
| **Disable** | Kept | Kept | Kept | Kept | UI and jobs dropped; declared routes stay known and answer 503 (unavailable) rather than 403 |
| **Uninstall** | Kept, the role can no longer log in | Kept | **Deleted** | **Deleted** | Dropped |
| **Uninstall with "Also delete this plugin's data"** | Dropped | **Deleted** | **Deleted** | **Deleted** | Dropped |

A plain uninstall keeps the schema and the data directory, so uninstalling and reinstalling is a
safe recovery path: the reinstall provisions over the kept schema and finds its rows. The uninstall
dialog lists the tables and row counts that are kept (`GET /api/plugins/:id/data-usage`). Kept data
is bound to the key that signed the plugin that left it: a reinstall adopts it only when the new
package was verified by the same key, an unsigned record only by anything, and an orphaned schema
with no record only by an `official` package, else `PLUGIN_KEPT_DATA_SIGNER` (409). The settings
are deleted either way, so export first if you may want them back.
