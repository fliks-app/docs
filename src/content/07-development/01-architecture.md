---
title: Architecture
description: How the Fliks repository is organized, the backend module map, and how the streaming, realtime, and auth pieces fit together.
---

## Repository layout

Fliks is a monorepo. The server and the web client are the core; everything
else is a client shell built on top of the same backend.

| Path | What it is |
|---|---|
| `backend/` | The API server: NestJS + TypeORM + PostgreSQL. |
| `client/` | The Angular web app. It is also the source for the Capacitor Android and iOS apps, and for the Samsung Tizen and LG webOS TV builds (same codebase, different build configurations). |
| `desktop/` | The desktop client: an Electron shell with a native compositor addon that embeds libmpv for video (macOS, Windows, Linux). It is a thin client, it connects to a remote Fliks server like the mobile apps do. |
| `appletv/` | The native tvOS app, written in SwiftUI. tvOS has no WebView, so this is a separate UI talking to the same backend. |
| `cast-receiver/` | The Chromecast custom receiver: plain HTML/CSS/JS, no framework. |
| `windows/` | A native Windows tray app that runs the server itself (bundles Node, PostgreSQL and FFmpeg, hardware transcoding auto-detected at startup). |
| `macos/` | A native macOS menu-bar app, the macOS counterpart of `windows/`: it also runs the server itself, with VideoToolbox hardware acceleration. |
| `store/` | Store listing assets (screenshots, metadata) for the various app stores. |
| `docs/` | In-repo runbooks for two specific features: live TV and plugins. |
| `examples/` | `plugin-scaffold`, a starting point for writing a new plugin. |
| `plan/` | Internal planning notes. Not shipped, not user-facing documentation. |
| `tools/` | Scripts that regenerate the brand assets (icons, favicons, splash screens) from the source SVGs. |

`windows/` and `macos/` run the server; `desktop/` only ever talks to one.
Don't confuse the two: a bug in the desktop client's playback code is not a
bug in the Windows or macOS server host, and vice versa.

## Backend module map

Every module below lives under `backend/src/modules/`. The list follows
`AppModule`'s import order (`backend/src/app.module.ts`). `EventsModule`,
imported first, is the SSE event bus described under [Realtime](#realtime);
its code sits in the `scheduler` directory.

| Module | Responsibility |
|---|---|
| `auth` | Login/register, JWT access + refresh tokens, CASL permission guards, quick-connect pairing (a TV asks to sign in as a user, and that user approves from a device already signed in). |
| `users` | User accounts and admin user management. |
| `media` | Movies, shows, seasons, episodes and media files: the core library entities, browsing, and the acquisition pipeline that turns a request into an automatic grab. |
| `persons` | Cast and crew pages, aggregated across the libraries. |
| `profiles` | Quality profiles, quality definitions and custom formats used when matching and grabbing a release. |
| `metadata-providers` | TMDB / TVDB integration, plus per-library metadata language and region settings. |
| `requests` | User media requests, comments, and auto-approval rules. |
| `scheduler` | Cron jobs (`@nestjs/schedule`), the SSE event bus, system health and activity log, backups. |
| `libraries` | Library CRUD and per-user library access. |
| `playlists` | User and shared playlists, autoplay queue. |
| `social` | Follows, recommendations sent between users, public profiles. |
| `remote` | Remote control ("play on this device"): a phone drives playback on another signed-in TV or desktop session. |
| `notifications` | Registered notification connections for a user's devices. |
| `settings` | A key/value store for admin-tunable settings, backing the various Settings pages. |
| `subtitles` | Subtitle search/download providers, audio-based re-sync, OCR, and translation providers. |
| `media-servers` | Connecting to another compatible media server to import existing watch history when migrating. |
| `roles` | CASL-based roles and permissions for users. |
| `streaming` | The playback decision, FFmpeg sessions, HLS packaging, thumbnails: see below. |
| `images` | Downloads and caches provider artwork locally. |
| `markers` | Chapter, intro and credits markers used for skip-intro / next-episode. |
| `imports` | The library scan pipeline: files on disk to media entities with matched metadata. |
| `filesystem` | A server-side folder browser, used when pointing a library at a path. |
| `setup-checklist` | The first-run checklist shown to admins. |
| `counts` | Aggregate badge counts for the app shell (requests, downloads, and so on). |
| `plugins` | Plugin catalog, install/update, signed-archive verification, and the process-plugin host (its own child process, uid and PostgreSQL schema). |
| `livetv` | IPTV (M3U / Xtream) channels, EPG parsing, live sessions with a rewind buffer. |

## The streaming pipeline

Playback goes through a decision step before anything is transcoded.
`POST /api/stream/:mediaFileId/playback-info` (`streaming.controller.ts` /
`stream-builder.service.ts`) compares the source file (codec, resolution,
HDR format, audio layout) against the requesting device's declared profile
and picks a play method: Direct Play, Direct Stream (remux), or Transcode, at a specific
quality rung. HDR10, HLG and Dolby Vision are tone-mapped to SDR when the
target device can't render them.

When a transcode is needed, `live-session.service.ts` spawns a session of
the bundled FFmpeg build, using whichever hardware path the server probed
at startup (Intel QSV, VAAPI, NVIDIA NVENC, AMD AMF or Apple VideoToolbox),
falling back to the CPU. Sessions are tracked by `ActiveStreamTracker` so a
client switching quality mid-playback reuses or replaces the right one
instead of leaking processes.

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
device opens one `EventSource` connection; `EventsService` (a single RxJS
`Subject`, filtered per connection down to the events that user may
receive) pushes background task progress, subtitle
sync/download/translation results, remote-control target announcements,
and library-change notifications down that one channel.

## Authentication

Login issues a short-lived JWT access token and a longer-lived refresh
token. Browsers get the access token as an httpOnly cookie; native clients
send it as `Authorization: Bearer <token>`, or as a `?token=` query
parameter where a header can't be set (the SSE stream, media URLs). Refresh tokens rotate on every
use, and replaying an already-rotated one revokes every refresh token on
the account, forcing every device to log back in. Roles and per-action
permissions are enforced with CASL, an authorization library
(`auth/casl`); the `roles` module owns what each role can do. A TV can
sign in through quick-connect pairing: it asks to log in as a user picked
from a public list, and that user approves the request from a phone that
is already signed in.

> [!NOTE]
> There is no API-key authentication today. `auth/strategies/api-key.strategy.ts`
> only holds a commented-out reference implementation, and `JwtOrApiKeyGuard`
> checks the JWT strategy alone. A login-issued token is the only way in.

## Images

Provider artwork (posters, fanart, stills) is downloaded once, resized with
`sharp`, and cached to local disk by the `images` module. The client only
ever requests `/api/images/...`, so a browser never hotlinks TMDB/TVDB
directly.

## Jobs and scheduling

There is no external job queue. Recurring work runs as `@nestjs/schedule`
cron jobs: `scheduler.service.ts` holds the daily backup, the metadata
refresh, command-history pruning and the plugin catalog refresh; other
services declare their own (the subtitle scheduler, live TV source and
guide refreshes, expired pairing cleanup), and plugins register theirs
through `SchedulerRegistry`. Longer
one-off tasks report their progress over the same SSE channel described
above. Concurrency-heavy work such as image downloads or FFmpeg sessions is
capped with in-process semaphores rather than a queue.

For the plugin architecture in more detail, see
[Plugins overview](/plugins/overview).
