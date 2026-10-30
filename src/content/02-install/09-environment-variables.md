---
title: Environment variables
description: Every environment variable the Fliks server reads, with its default and what it controls.
---

## Before you reach for one

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

| Variable | Default | What it controls |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host. |
| `DB_PORT` | `5432` | PostgreSQL port. |
| `DB_USERNAME` | `fliks` | PostgreSQL user. |
| `DB_NAME` | `fliks` | Database name. |
| `DB_PASSWORD` | `fliks` | PostgreSQL password. |

## Network and access

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

## Paths and storage

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_DATA_DIR` | `<cwd>/data` (`/app/data` in Docker) | Artwork, uploaded avatars, and database backups. Not disposable. |
| `FLIKS_CACHE_DIR` | `<data dir>/cache` | Extracted subtitle tracks and seek-preview sprites. Fully regenerable; safe to point elsewhere to keep it out of your data backups. |
| `FLIKS_CONF_DIR` | `/app/conf` | Where the auto-generated JWT secret and engine token are stored. Falls back to a temp directory when that path isn't writable (typical outside Docker), and a lost JWT secret logs everyone out. |
| `FLIKS_TRANSCODE_DIR` | `/app/transcode` in the Docker image; else `FLIKS_CACHE_DIR`, else `fliks-transcode` in the system temp directory | The HLS segment cache. Outside Docker the temp directory is `tmpfs` on many hosts: point it at real disk if you have a large cache budget. |
| `FLIKS_RUNTIME_DIR` | `<data dir>/plugins` | Plugin import staging, the compiled-code cache, and each plugin's private data folder. The installed plugin archives themselves are stored in the database, not here. |
| `FLIKS_IMAGES_DIR` | *(none)* | Deprecated alias for `FLIKS_DATA_DIR`. Rename it if you still have it set. |

## Engine

The server runs behind `fliks-engine`, which fronts the HTTP API and does the media work. The
Docker image, the TrueNAS app and the Windows and macOS apps start both and wire them together:
you don't set these.

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_ENGINE_TOKEN` | generated | The shared secret that protects the engine's control API. Left unset, the engine generates one at first start and writes it (mode `0600`) to `.engine-token` in `FLIKS_CONF_DIR`; the server reads the same file, so the two always agree and a restart keeps it. A value set here wins over the file. Set it only to run the engine and the server separately with a fixed token. |

Keep the `/app/conf` volume: it holds the token as well as the JWT secret.

## Metadata providers

| Variable | Default | What it controls |
|---|---|---|
| `TMDB_API_KEY` | baked into the published image | Only set this if you build the image yourself; the published image already carries a working key. |
| `TVDB_API_KEY` | baked into the published image | Same. |
| `METADATA_STALE_AFTER_MONTHS` | `3` | Age after which the scheduled metadata refresh re-fetches a title's metadata. |

A source build has no baked-in keys: set your own, or titles won't be matched and no artwork is
fetched.

## Update check

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_DISABLE_UPDATE_CHECK` | off | Set to `1`, `true` or `yes` to stop the server from asking GitHub for the latest release (it only asks when the web client requests the update status, cached 6 h). See [Updating](/install/updating). |
| `FLIKS_GITHUB_REPO` | `fliks-app/fliks` | Which repository the update check queries; only relevant if you run a fork. |

## Streaming session tuning

These rarely need touching; the defaults match the docker-compose example. Cache **budget**
(size and retention) is a **Settings > Streaming** value, not an environment variable.

| Variable | Default | What it controls |
|---|---|---|
| `STREAM_LIVE_SESSION_TTL_MS` | `30000` | How long a viewer session survives without a heartbeat before it's considered gone. |
| `STREAM_LIVE_SESSION_GC_INTERVAL_MS` | `5000` | How often expired viewer sessions are swept. |
| `STREAM_SESSION_REVIVE_TTL_MS` | `900000` | How long an expired session can still be resumed (after a device wakes from sleep, for instance) without starting playback over. |
| `STREAM_JOB_GRACE_MS` | `60000` | How long an encoder process is kept alive after its last viewer disconnects, in case they come back. |
| `STREAM_JOB_FALLBACK_TIMEOUT_MS` | `1800000` | Hard idle timeout that kills a transcoding session nobody is watching. |
| `STREAM_MAX_SESSIONS_PER_USER` | `10` | Caps concurrent playback sessions for a single account. |
| `TRANSCODE_CACHE_GC_INTERVAL_MS` | `300000` | How often the transcode cache is swept against its size and age budget. |

## Plugins

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_PLUGINS_DISABLED` | off | Set to `1` to start the server without loading any plugin: the way out when a plugin crashes the server on boot. |

## Hardware

See [Hardware acceleration](/install/hardware-acceleration) for context.

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_OPENCL_DEVICE` | auto | Pins the OpenCL `platform.device` selector used for HDR tone-mapping, for a mixed-GPU host where auto-detection picks the wrong vendor. |

## See also

- [Docker](/install/docker) for the annotated example Compose file these variables come from.
- [Settings](/administration/settings) for everything that's an admin-UI value instead.
