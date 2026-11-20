---
title: Architecture
description: How the Fliks repository is organized, the server's module map, and how the engine, streaming, realtime, and auth pieces fit together.
---

## Repository layout

Fliks is a monorepo. The server and the web client are the core; everything
else is a client shell built on top of the same server.

| Path | What it is |
|---|---|
| `server/` | The Rust workspace behind the whole HTTP API: the `fliks-server` binary (axum + sqlx + PostgreSQL), a pure-logic crate (`fliks_domain`), the plugin SDK and the plugin route crate. |
| `client/` | The Angular web app. It is also the source for the Capacitor Android and iOS apps, and for the Samsung Tizen and LG webOS TV builds (same codebase, different build configurations). |
| `desktop/` | The desktop client: an Electron shell with a native compositor addon that embeds libmpv for video (macOS, Windows, Linux). It is a thin client, it connects to a remote Fliks server like the mobile apps do. |
| `appletv/` | The native tvOS app, written in SwiftUI. tvOS has no WebView, so this is a separate UI talking to the same server. |
| `cast-receiver/` | The Chromecast custom receiver: plain HTML/CSS/JS, no framework. |
| `windows/` | A native Windows tray app that runs the server itself (bundles PostgreSQL, FFmpeg, the engine and the server, hardware transcoding auto-detected at startup). |
| `macos/` | A native macOS menu-bar app, the macOS counterpart of `windows/`: it also runs the server itself, with VideoToolbox hardware acceleration. |
| `store/` | Store listing assets (screenshots, metadata) for the various app stores. |
| `docs/` | In-repo runbooks for live TV, plugins and library cleanup rules. |
| `plan/` | Internal planning notes. Not shipped, not user-facing documentation. |
| `tools/` | Scripts that regenerate the brand assets (icons, favicons, splash screens) from the source SVGs. |
| `scripts/` | Repository scripts: `bump-engine.sh`, `with-test-postgres.sh`, the embedded PostgreSQL config. |

The video engine is not in this repository: `fliks-engine` lives in
[fliks-app/engine](https://github.com/fliks-app/engine), and `engine.lock` pins the release this
version uses.

`windows/` and `macos/` run the server; `desktop/` only ever talks to one.
Don't confuse the two: a bug in the desktop client's playback code is not a
bug in the Windows or macOS server host, and vice versa.

## Two processes: engine and server

Fliks runs as two cooperating processes. `fliks-engine` is the front door: it listens on the
public port (`4848`), serves the media bytes (HLS playlists, segments, thumbnails) itself, and
forwards every other request to `fliks-server`, which serves the whole HTTP API and owns the
database. The server listens on loopback only (`4849` by default). In the Docker image and the
Windows and macOS apps the engine starts the server as its child (`--supervise`), restarts it if
it exits, and hands it the engine's address and token.

The engine does the media work: probing files, deciding how to play them, running FFmpeg
sessions, and background jobs (seek sprites, keyframe scans, intro fingerprints, subtitle
extraction and OCR). The server asks it through an HTTP control API (`server/crates/server/src/engine/`)
and decides who may see what: the engine has no database, users or tokens, and asks the server to
authorise each media request. The protocol is `PROTOCOL.md` in the engine repository.

## Server module map

The server crate's modules live under `server/crates/server/src/`; each has a spec under
`server/docs/spec/`. Spec first: a behaviour change updates its spec before the code.

| Module | Responsibility |
|---|---|
| `auth` | First-admin setup, login, JWT access + refresh tokens, stream tokens, quick-connect pairing (a TV asks to sign in as a user, and that user approves from a device already signed in). |
| `users`, `roles` | User accounts and admin user management; roles and their permissions. |
| `media`, `libraries`, `persons`, `markers` | The library entities (movies, shows, seasons, episodes, files), browsing, per-user library access, cast and crew pages, and chapter, intro and credits markers. |
| `ingest`, `importers`, `fs`, `cleanup` | The library scan and write pipeline (files on disk to media entities), imports from other tools, the server-side folder browser, and library cleanup rules. |
| `metadata`, `images` | TMDB / TVDB integration, and downloaded artwork cached locally and served from `/api/images`. |
| `profiles`, `requests` | Quality and language profiles, custom formats, user media requests and auto-approval rules. |
| `playback`, `stream`, `presence`, `qoe` | Playback state and history; the playback decision and session control plane over the engine; live sessions reported by the engine; playback quality tracking. |
| `subtitles` | Subtitle search/download providers, audio-based re-sync, OCR, and translation providers. |
| `livetv` | IPTV (M3U / Xtream) channels, EPG parsing, live sessions with a rewind buffer. |
| `playlists`, `social`, `party`, `remote` | Playlists and the autoplay queue, follows and recommendations, watch parties, and remote control ("play on this device"). |
| `events`, `jobs`, `notifications` | The SSE event bus and activity registry, scheduled jobs and the commands history, and notification connections. |
| `settings`, `system` | The key/value store behind the admin Settings pages and the setup checklist; health, version and update check, backups, logs. |
| `plugins` | Plugin catalog, install/update, signed-archive verification, and the host that runs process plugins as sandboxed WebAssembly components. |
| `media_servers` | Connecting to another compatible media server to import existing watch history when migrating. |
| `db` | Connection pool and the sqlx migrations runner. |

`fliks_domain` holds the pure logic (naming, release parsing, ACL, quality scoring, and so on)
with no I/O, so it is tested without a database.

## The streaming pipeline

Playback goes through a decision step before anything is transcoded.
`POST /api/stream/:mediaFileId/playback-info` (the `stream` module) hands the source file
(codec, resolution, HDR format, audio layout) and the requesting device's declared profile to the
engine, which picks a play method: Direct Play, Direct Stream (remux), or Transcode, at a specific
quality rung. A source with a field order (interlaced) always goes to the transcode path, which
deinterlaces it. HDR10, HLG and Dolby Vision are tone-mapped to SDR when the target device can't
render them.

When a transcode is needed, the engine spawns a session of the bundled FFmpeg build, using
whichever hardware path it probed at startup (Intel QSV, VAAPI, NVIDIA NVENC, AMD AMF or Apple
VideoToolbox), falling back to the CPU. The server mirrors the engine's sessions (`presence`), and
a client switching quality asks to retire its previous session instead of leaking processes.

Output is packaged as HLS (HTTP Live Streaming: playlists pointing at short
video segments): a `master.m3u8`, one `index.m3u8` per quality rung serving
fMP4 segments (MPEG-TS for the Tizen player), a separate index for each alternate audio
rendition and for embedded/external subtitles, and an I-frame-only playlist
for trick play (scrubbing). Segments and thumbnail sprites are cached to
disk so a second client, or the same client switching quality, doesn't pay
for the same work twice. See
[Streaming and transcoding](/features/streaming-and-transcoding) for the
user-facing side of this.

## Realtime

Fliks does not use WebSockets or socket.io. Realtime updates go over a
single server-sent events stream: `GET /api/system/events`. Each signed-in
device opens one `EventSource` connection; the `events` hub filters what
it sends per connection down to the events that user may
receive: background task progress, subtitle
sync/download/translation results, remote-control target announcements,
and library-change notifications.

## Authentication

A server with no account has none to log in with: the first administrator is created from a
setup page (`POST /api/auth/setup`, accepted only while the users table is empty). Login then
issues a short-lived JWT access token and a longer-lived refresh
token. Browsers get the access token as an httpOnly cookie; native clients
send it as `Authorization: Bearer <token>`, or as a `?token=` query
parameter where a header can't be set (media URLs). Refresh tokens rotate on every
use, and replaying an already-rotated one revokes every refresh token on
the account, forcing every device to log back in. The signing key and the engine token are
generated at first start into `FLIKS_CONF_DIR`. Roles and per-action
permissions are enforced from the user's role (`fliks_domain::acl`); the `roles` module owns what
each role can do. A TV can sign in through quick-connect pairing: it asks to log in as a user
picked from the login user list, which an admin can limit or hide, and that user approves the
request from a phone that is already signed in.

> [!NOTE]
> There is no API-key authentication: `X-Api-Key` is not accepted. A login-issued token is the
> only way in.

## Images

Provider artwork (posters, fanart, stills) is downloaded once, resized,
and cached to local disk by the `images` module. The client only
ever requests `/api/images/...`, so a browser never hotlinks TMDB/TVDB
directly.

## Jobs and scheduling

There is no external job queue. Recurring work runs from a cron runner in the `jobs` module,
which records every run in a commands history: the daily backup, the metadata
refresh, the plugin catalog refresh, subtitle search and upgrade, library cleanup, and the live
TV source and guide refreshes. Other recurring work (expired pairing cleanup, the QoE purge)
runs on its own timers, and plugins schedule their own jobs. Longer
one-off tasks report their progress over the same SSE channel described
above. Media jobs (sprites, keyframe scans, fingerprints) run in the engine.

For the plugin architecture in more detail, see
[Plugins overview](/plugins/overview).
