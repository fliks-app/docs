---
title: Environment variables
description: Every environment variable the Fliks server reads, with its default and what it controls.
---

## Before you reach for one

Most day-to-day tuning lives in the admin UI, not in an environment variable: the transcode
cache budget, tone-mapping algorithm and curve, GPU selection, segment duration, subtitle
pre-warming and background FFmpeg job count are all in **Settings > Streaming**; metadata
language and the public URL are in **Settings > General**. The variables below are for what has
to be known before the app can even start (the database, where to persist data) and for a
handful of low-level timeouts you'd only touch while debugging.

This reference applies to Docker and from-source installs. The Windows and macOS native apps
don't read environment variables; the same values are exposed through their own config file or
UI where relevant.

## Database

| Variable | Default | What it controls |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host. |
| `DB_PORT` | `5432` | PostgreSQL port. |
| `DB_USERNAME` | `fliks` | PostgreSQL user. |
| `DB_NAME` | `fliks` | Database name. |
| `DB_PASSWORD` | *(none)* | PostgreSQL password. |

## Network and access

| Variable | Default | What it controls |
|---|---|---|
| `PORT` | `4848` | The port the server listens on. |
| `CORS_ORIGIN` | dev origins only | Comma-separated list of extra origins allowed to call the API. Native app origins (`capacitor://localhost`, etc.) are always allowed regardless of this setting. |
| `JWT_SECRET` | auto-generated | The token-signing key. Left unset, Fliks generates one into the config directory on first boot and reuses it; set it yourself only if you need a fixed value across a manual multi-instance setup. |
| `JWT_EXPIRATION` | `1h` | How long an access token stays valid before it's silently renewed via the refresh token; you won't notice it as a logout. |
| `REFRESH_TOKEN_TTL_DAYS` | `60` | How long a login stays valid without re-entering credentials. |
| `STREAM_TOKEN_TTL` | `12h` | How long a playback token (the one embedded in a stream URL) stays valid. |
| `TZ` | host default | Timezone used for scheduled tasks and displayed times. |

## Paths and storage

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_DATA_DIR` | `<cwd>/data` (`/app/data` in Docker) | Artwork, uploaded avatars, and database backups. Not disposable. |
| `FLIKS_CACHE_DIR` | `<data dir>/cache` | Extracted subtitle tracks and seek-preview sprites. Fully regenerable; safe to point elsewhere to keep it out of your data backups. |
| `FLIKS_CONF_DIR` | `/app/conf` in Docker | Where the auto-generated JWT secret is stored. |
| `FLIKS_TRANSCODE_DIR` | `/tmp/transcode` (Windows: `%TEMP%\fliks-transcode`) | The HLS segment cache. Without setting this in Docker, it lands in the container's `/tmp`, which is `tmpfs` on many hosts. |
| `FLIKS_RUNTIME_DIR` | a temp directory | Staged and running plugin files. Wiped on restart by design; installed plugin archives themselves are stored in the database, not here. |
| `FLIKS_IMAGES_DIR` | *(none)* | Deprecated alias for `FLIKS_DATA_DIR`. Rename it if you still have it set. |

## Metadata providers

| Variable | Default | What it controls |
|---|---|---|
| `TMDB_API_KEY` | baked into the published image | Only set this if you build the image yourself; the published image already carries a working key. |
| `TVDB_API_KEY` | baked into the published image | Same. |

## Update check

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_DISABLE_UPDATE_CHECK` | off | Set to `1`, `true` or `yes` to stop the server from polling GitHub for newer releases. See [Updating](/install/updating). |
| `FLIKS_GITHUB_REPO` | `fliks-app/fliks` | Which repository the update check polls; only relevant if you run a fork. |

## Streaming session tuning

These rarely need touching; the defaults match the docker-compose example. Cache **budget**
(size and retention) is a **Settings > Streaming** value, not an environment variable.

| Variable | Default | What it controls |
|---|---|---|
| `STREAM_LIVE_SESSION_TTL_MS` | `30000` | How long a viewer session survives without a heartbeat before it's considered gone. |
| `STREAM_JOB_GRACE_MS` | `60000` | How long an encoder process is kept alive after its last viewer disconnects, in case they come back. |
| `STREAM_JOB_FALLBACK_TIMEOUT_MS` | `1800000` | Hard idle timeout that kills a transcoding session nobody is watching. |
| `STREAM_MAX_SESSIONS_PER_USER` | `10` | Caps concurrent playback sessions for a single account. |
| `TRANSCODE_CACHE_GC_INTERVAL_MS` | `300000` | How often the transcode cache is swept against its size and age budget. |

## Hardware

See [Hardware acceleration](/install/hardware-acceleration) for context on both of these.

| Variable | Default | What it controls |
|---|---|---|
| `FLIKS_OPENCL_DEVICE` | auto | Pins the OpenCL `platform.device` selector used for HDR tone-mapping, for a mixed-GPU host where auto-detection picks the wrong vendor. |
| `THUMB_HWACCEL_DEVICE` | auto | `off` to force software thumbnail generation, or a specific render node. |

## See also

- [Docker](/install/docker) for the annotated example Compose file these variables come from.
- [Settings](/administration/settings) for everything that's an admin-UI value instead.
