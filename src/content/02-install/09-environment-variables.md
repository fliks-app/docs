---
title: Environment variables
description: Every environment variable the Fliks server reads, with its default and what it controls.
---

> [!SUMMARY]
> Most tuning lives in the admin UI. You only need an environment variable for what must be known before the app starts: the database, ports and folders. Find the group below, then open it.

## Check the admin UI first

Most day-to-day tuning lives in the admin UI, not in an environment variable: the transcode
cache budget, tone-mapping algorithm and curve, GPU selection, segment duration, subtitle
pre-warming and background FFmpeg job count are all in **Settings > Streaming**; metadata
language and the public address are in **Settings > General**. The variables below are for what has
to be known before the app can even start (the database, where to persist data) and for a
handful of low-level timeouts you'd only touch while debugging.

This reference applies to Docker, TrueNAS (under **Additional Environment Variables**) and
from-source installs. The Windows and macOS apps set the database, port and directory variables
themselves; the macOS app passes nothing else through, and on Windows the web and database ports
live in `%LOCALAPPDATA%\Fliks Server\conf\tray-settings.json`.

## Database

:::details All database variables
| Variable | Default | What it controls |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host. |
| `DB_PORT` | `5432` | PostgreSQL port. |
| `DB_USERNAME` | `fliks` | PostgreSQL user. The example Compose file sets `fliks_app`, see [db-role](#db-role). |
| `DB_NAME` | `fliks` | Database name. |
| `DB_PASSWORD` | `fliks` | PostgreSQL password. With `fliks_app`, it must be set, not `fliks`, and different from the administrator's. |
| `DB_ADMIN_USERNAME` | unset | PostgreSQL administrator, read only by `fliks-server db-role`, never by the server. |
| `DB_ADMIN_PASSWORD` | unset | Its password, same rule. |
:::

## db-role

`fliks-server db-role` gives Fliks a PostgreSQL role of its own, so the server doesn't run as a
superuser. The role is named by `DB_USERNAME` (`fliks_app` in the example Compose file) and its
password is `DB_PASSWORD`. The administrator comes from `DB_ADMIN_USERNAME` and
`DB_ADMIN_PASSWORD`.

The command first logs in as the app role and exits 0 without the administrator when everything is
in place. Otherwise it connects as the administrator, a superuser (it retries for 60 seconds while
PostgreSQL starts), and:

- creates or updates the role (`LOGIN NOSUPERUSER NOCREATEDB CREATEROLE NOREPLICATION NOBYPASSRLS`);
- grants it `CONNECT`, `CREATE` and `TEMPORARY` on the database and makes it the owner of `public` and of every
  core object, one `ALTER OWNER` at a time, each committed alone under a 10 second lock timeout:
  a busy table fails the run, and running it again finishes the job;
- lets it administer the plugin roles;
- makes the advisory lock functions usable by it only.

With the example Compose file the `fliks-db-role` service runs it on every `docker compose up`. On
an external PostgreSQL server, run it once:

```bash
docker run --rm \
  -e DB_HOST=db.example.com -e DB_PORT=5432 -e DB_NAME=fliks \
  -e DB_USERNAME=fliks_app -e DB_PASSWORD=<app password> \
  -e DB_ADMIN_USERNAME=<admin> -e DB_ADMIN_PASSWORD=<admin password> \
  ghcr.io/fliks-app/fliks fliks-server db-role
```

Then set `DB_USERNAME` and `DB_PASSWORD` on Fliks. If you can't hand the administrator password to
Fliks, add `--print`: the command writes the same SQL (with a SCRAM verifier, never the plain
password) for a database administrator to run statement by statement with `psql -f`, not
`psql -1`. On a managed server where the administrator isn't a superuser, one gap stays:
`advisory_locks`, which only the bootstrap superuser can revoke. **Settings > System > Status**
shows it.

Fliks never refuses to start over the role. It logs the missing items at boot and lists them on
the Status page (`create_role`, `create_database`, `public_owner`, `foreign_objects`,
`advisory_locks`, `plugin_roles`); the fix is `fliks-server db-role`. A role that is a superuser
gets a muted note.

> [!NOTE]
> On PostgreSQL 15, a role with `CREATEROLE` can reach the host (`GRANT pg_execute_server_program`).
> Use 16 or newer for the isolation; the Status page shows a muted line. 15 stays supported.

## Network and access

:::details All network and access variables
| Variable | Default | What it controls |
|---|---|---|
| `PORT` | `4848` | The public port, the one the engine listens on (the server itself sits behind it on `4849`). In Docker it's the port inside the container: change the host side of `ports:` instead. |
| `SERVE_STATIC_PATH` | `/app/client` in Docker, unset otherwise | Folder holding the built web client, served on the same port as the API. Unset, there's no web UI. |
| `CORS_ORIGIN` | the two local dev-server origins | Comma-separated list of web origins allowed to call the API; setting it replaces the dev defaults. Native app origins (`capacitor://localhost`, etc.) are always allowed regardless of this setting. |
| `JWT_SECRET` | auto-generated | The token-signing key. Left unset, Fliks generates one into the config directory on first boot and reuses it; set it yourself only if you need a fixed value across a manual multi-instance setup. |
| `JWT_EXPIRATION` | `1h` | How long an access token stays valid before it's silently renewed via the refresh token; you won't notice it as a logout. Use a number plus `d`, `h`, `m` or `s`: the same value also sets the access cookie's lifetime. |
| `REFRESH_TOKEN_TTL_DAYS` | `60` | How long a login stays valid without re-entering credentials. |
| `STREAM_TOKEN_TTL` | `6h` | How long a playback token (the one embedded in a stream URL) stays valid. |
| `TZ` | `UTC` in the Docker image | Timezone of the server process, used for scheduled tasks and log times. |
:::

## Paths and storage

:::details All paths and storage variables
| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_DATA_DIR` | `<cwd>/data` (`/app/data` in Docker) | Artwork, uploaded avatars, and database backups. Not disposable. |
| `FLIKS_CACHE_DIR` | `<data dir>/cache` | Extracted subtitle tracks and seek-preview sprites. Fully regenerable; safe to point elsewhere to keep it out of your data backups. |
| `FLIKS_CONF_DIR` | `/app/conf` | Where the auto-generated JWT secret and push identity are stored (and the engine token, when the engine runs apart from the image). The directory must be owned by the server's user or not world-writable. Falls back to a temp directory when that path isn't usable (typical outside Docker); a secret kept there is lost at the next restart or recreate, and **Settings > System > Status** says so. A lost JWT secret logs everyone out and invalidates the Subsonic app passwords. |
| `FLIKS_TRANSCODE_DIR` | `/app/transcode` in the Docker image; else `FLIKS_CACHE_DIR`, else `fliks-transcode` in the system temp directory | The HLS segment cache. Outside Docker the temp directory is `tmpfs` on many hosts: point it at real disk if you have a large cache budget. |
| `FLIKS_RUNTIME_DIR` | `<data dir>/plugins` | Plugin import staging, the compiled-code cache, and each plugin's private data folder. The installed plugin archives themselves are stored in the database, not here. |
| `FLIKS_IMAGES_DIR` | *(none)* | Deprecated alias for `FLIKS_DATA_DIR`. Rename it if you still have it set. |
:::

## Engine

The server runs behind `fliks-engine`, which fronts the HTTP API and does the media work. The
Docker image, the TrueNAS app and the Windows and macOS apps start both and wire them together:
you don't set these.

:::details All engine variables
| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_ENGINE_TOKEN` | generated | The shared secret that protects the engine's control API. Left unset, the engine generates one at first start and writes it (mode `0600`) to `.engine-token` in `FLIKS_CONF_DIR`. The image and the apps pass it to the server themselves; a server started apart from the engine reads the same file, so set it there to be sure the two agree. A value set here wins over the file. Set it only to run the engine and the server separately with a fixed token. |
:::

Keep the `/app/conf` volume: it holds the JWT secret and the push identity.

## Metadata providers

:::details All metadata providers variables
| Variable | Default | What it controls |
|---|---|---|
| `METADATA_STALE_AFTER_MONTHS` | `3` | Age after which the scheduled metadata refresh re-fetches a title's metadata. |
:::

Metadata comes from provider plugins bundled with the server. Their API keys are set per plugin in
**Settings > Plugins**, not in the environment. Official builds ship default keys; a source build
has none, so set your own there or titles won't be matched and no artwork is fetched.

> [!NOTE]
> Upgrading from 5.x: on the first 6.0.0 boot, `TMDB_API_KEY` and `TVDB_API_KEY` are imported once
> into the plugin settings (an existing plugin key is kept). Later boots ignore them, so you can
> remove both from your compose file.

## Update check

:::details All update check variables
| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_DISABLE_UPDATE_CHECK` | off | Set to `1`, `true` or `yes` to stop the server from asking GitHub for the latest release (it only asks when the web client requests the update status, cached 6 h). See [Updating](/install/updating). |
| `FLIKS_GITHUB_REPO` | `fliks-app/fliks` | Which repository the update check queries; only relevant if you run a fork. |
| `FLIKS_SKIP_PRE_MIGRATION_BACKUP` | off | Set to `1`, `true` or `yes` to skip the database dump the server writes before applying pending migrations (to `<data dir>/backups/pre-migration`, the 3 latest kept). Leave it off unless the disk is too small for the dump. See [Backups](/administration/backups#before-a-migration). |
:::

## Streaming session tuning

These rarely need touching; the defaults match the docker-compose example. Cache **budget**
(size and retention) is a **Settings > Streaming** value, not an environment variable.

:::details All streaming session tuning variables
| Variable | Default | What it controls |
|---|---|---|
| `STREAM_LIVE_SESSION_TTL_MS` | `30000` | How long a viewer session survives without a heartbeat before it's considered gone. |
| `STREAM_LIVE_SESSION_GC_INTERVAL_MS` | `5000` | How often expired viewer sessions are swept. |
| `STREAM_SESSION_REVIVE_TTL_MS` | `900000` | How long an expired session can still be resumed (after a device wakes from sleep, for instance) without starting playback over. |
| `STREAM_JOB_GRACE_MS` | `60000` | How long an encoder process is kept alive after its last viewer disconnects, in case they come back. |
| `STREAM_JOB_FALLBACK_TIMEOUT_MS` | `1800000` | Hard idle timeout that kills a transcoding session nobody is watching. |
| `STREAM_MAX_SESSIONS_PER_USER` | `10` | Caps concurrent playback sessions for a single account. |
| `TRANSCODE_CACHE_GC_INTERVAL_MS` | `300000` | How often the transcode cache is swept against its size and age budget. |
:::

## Plugins

:::details All plugins variables
| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_PUSH_RELAY_URL` | the official relay | The push relay the Fliks Relay connection registers at. For forks that build their own mobile apps and for development; the store apps only use the official relay. Changing it registers at the new relay at once and deletes the old registration in the background. See [Push notifications](/administration/push-notifications). |
| `FLIKS_PLUGINS_DISABLED` | off | Set to `1` to start the server without loading any plugin except the bundled metadata providers: the way out when a plugin crashes the server on boot. |
:::

## Hardware

See [Hardware acceleration](/install/hardware-acceleration) for context.

:::details All hardware variables
| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_OPENCL_DEVICE` | auto | Pins the OpenCL `platform.device` selector used for HDR tone-mapping, for a mixed-GPU host where auto-detection picks the wrong vendor. |
:::

## See also

- [Docker](/install/docker) for the annotated example Compose file these variables come from.
- [Settings](/administration/settings) for everything that's an admin-UI value instead.
