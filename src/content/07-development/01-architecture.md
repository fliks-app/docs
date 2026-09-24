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

`windows/` and `macos/` run the server; `desktop/` only ever talks to one.
Don't confuse the two: a bug in the desktop client's playback code is not a
bug in the Windows or macOS server host, and vice versa.

## Backend module map

Every module below lives under `backend/src/modules/`. The list follows
`AppModule`'s import order.

| Module | Responsibility |
|---|---|
| `auth` | Login/register, JWT access + refresh tokens, CASL permission guards, QR/short-code device pairing. |
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
| `remote` | Remote-control pairing ("play on this device") between a phone and a TV/desktop session. |
| `notifications` | Registered notification connections for a user's devices. |
| `settings` | A key/value store for admin-tunable settings, backing the various Settings pages. |
| `subtitles` | Subtitle search/download providers, audio-based re-sync, OCR, and translation providers. |
| `media-servers` | Connecting to another compatible media server to import existing watch history when migrating. |
| `roles` | CASL-based roles and permissions for users. |
| `streaming` | The playback decision, FFmpeg sessions, HLS packaging, thumbnails: see below. |
| `markers` | Chapter, intro and credits markers used for skip-intro / next-episode. |
| `images` | Downloads and caches provider artwork locally. |
| `imports` | The library scan pipeline: files on disk to media entities with matched metadata. |
| `filesystem` | A server-side folder browser, used when pointing a library at a path. |
| `setup-checklist` | The first-run checklist shown to admins. |
| `counts` | Aggregate badge counts for the app shell (requests, downloads, and so on). |
| `plugins` | Plugin catalog, install/update, signed-archive verification, and the process-plugin host (its own child process, uid and PostgreSQL schema). |
| `livetv` | IPTV (M3U / Xtream) channels, EPG parsing, live sessions with a rewind buffer. |

## The streaming pipeline

Playback goes through a decision step before anything is transcoded.
`POST /api/stream/:mediaFileId/playback-info` (`playback.controller.ts` /
`stream-builder.service.ts`) compares the source file (codec, resolution,
HDR format, audio layout) against the requesting device's declared profile
and picks a play method: direct play, remux, or transcode, at a specific
quality rung. HDR10, HLG and Dolby Vision are tone-mapped to SDR when the
target device can't render them.

When a transcode is needed, `live-session.service.ts` spawns a session of
the bundled FFmpeg build, using whichever hardware path the server probed
at startup (Intel QSV, VAAPI, NVIDIA NVENC, AMD AMF or Apple VideoToolbox),
falling back to the CPU. Sessions are tracked by `ActiveStreamTracker` so a
client switching quality mid-playback reuses or replaces the right one
instead of leaking processes.

Output is packaged as HLS: a `master.m3u8`, one `index.m3u8` per quality
rung serving fMP4 segments, a separate index for each alternate audio
rendition and for embedded/external subtitles, and an I-frame-only playlist
for trick play (scrubbing). Segments and thumbnail sprites are cached to
disk so a second client, or the same client switching quality, doesn't pay
for the same work twice. See
[Streaming and transcoding](/features/streaming-and-transcoding) for the
user-facing side of this.

## Realtime

Fliks does not use WebSockets or socket.io. Realtime updates go over a
single server-sent events stream: `GET /api/system/events`. Each signed-in
device opens one `EventSource` connection; `EventsService` (an RxJS
`Subject` per user) pushes background task progress, subtitle
sync/download/translation results, remote-control target announcements,
and library-change notifications down that one channel.

## Authentication

Login issues a short-lived JWT access token and a longer-lived refresh
token. Browsers get the access token as an httpOnly cookie; native clients
send it as `Authorization: Bearer <token>`. Refresh tokens rotate on every
use, and replaying an already-rotated one revokes every refresh token on
the account, forcing every device to log back in. Roles and per-action
permissions are enforced with CASL (`auth/casl`); the `roles` module owns
what each role can do. A QR code or short code pairs a phone with a TV or
desktop session for remote control.

> [!NOTE]
> An API-key authentication strategy exists in the code (`ApiKeyStrategy`)
> but is currently inactive: the guard that would accept it only checks the
> JWT strategy. A login-issued token is the only way in today.

## Images

Provider artwork (posters, fanart, stills) is downloaded once, resized with
`sharp`, and cached to local disk by the `images` module. The client only
ever requests `/api/images/...`, so a browser never hotlinks TMDB/TVDB
directly.

## Jobs and scheduling

There is no external job queue. Recurring work (library scans, the
subtitle scheduler, plugin catalog refresh, daily backups) runs as
`@nestjs/schedule` cron jobs registered in `scheduler.service.ts`. Longer
one-off tasks report their progress over the same SSE channel described
above. Concurrency-heavy work such as image downloads or FFmpeg sessions is
capped with in-process semaphores rather than a queue.

For the plugin architecture in more detail, see
[Plugins overview](/plugins/overview).
