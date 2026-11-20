---
title: API
description: The REST API's base path, authentication, main resource groups, the realtime event stream, and a few curl examples.
---

## Base path

Every route is prefixed with `/api`. `fliks-server` answers them all, behind
`fliks-engine`, which owns the public port: `4848` by default, so against a
local server that means `http://localhost:4848/api/...`. The dev setups use
other ports: `3000` for the engine in the Docker dev stack, `3001` for
the server on its own (see [Dev environment](/development/dev-environment)).

Request bodies are validated: a property a route doesn't declare is rejected
with a `400`, not silently dropped, and JSON types aren't coerced. So
don't send back a whole object you fetched (with its `id`, `createdAt`,
`updatedAt`) as the body of an update; send only the fields you change.

> [!NOTE]
> The server doesn't serve an OpenAPI/Swagger UI, but it generates the
> OpenAPI document: `fliks-server openapi` prints it, and the repository
> keeps the current one in `server/openapi.json`. Per-domain behaviour is
> specified in `server/docs/spec/`.

## Authentication

- `GET /api/auth/setup` answers `{ "required": true }` while the server has no
  user. `POST /api/auth/setup`, body `{ "username": "...", "password": "..." }`
  (password of at least 8 characters), then creates the first administrator
  and answers `201`. Once any user exists it answers `409`.
- `POST /api/auth/register` creates an account with the default role. It
  needs a signed-in user who can manage users: there is no open sign-up.
- `POST /api/auth/login`, body `{ "username": "...", "password": "..." }`,
  returns an access token and a refresh token, and also sets the access
  token as an httpOnly cookie for browser clients.
- `POST /api/auth/refresh`, body `{ "refreshToken": "..." }`, rotates both
  tokens. Replaying an already-rotated refresh token revokes every refresh
  token on the account, every device then has to log back in.
- `POST /api/auth/logout` clears the cookie and revokes the given refresh
  token.

A browser gets the access token from its cookie automatically. Any other
client sends it as `Authorization: Bearer <accessToken>`. The server also
reads it from a `?token=` query parameter, for requests that can't carry a
header (media URLs; the event stream has its own ticket, below). It checks the cookie first, then the
header, then the query parameter.

`GET /api/system/liveness` needs no token at all; it is meant for
container health checks.

> [!NOTE]
> There is no API-key authentication: `X-Api-Key` is not accepted. A
> login-issued token is the only way to authenticate.

See [Users and permissions](/administration/users-and-permissions) for
what a role can be granted.

## Resource groups

| Area | Base path(s) |
|---|---|
| Auth & pairing | `/api/auth`, `/api/auth/pairing` |
| Users, roles, remote control | `/api/users`, `/api/roles`, `/api/remote` |
| Libraries & media | `/api/libraries`, `/api/media`, `/api/persons`, `/api/markers`, `/api/counts` |
| Metadata search (TMDB/TVDB, trending) | `/api/metadata` |
| Playback state & recommendations | `/api/playback` |
| Streaming | `/api/stream/:mediaFileId/...` |
| Subtitles | `/api/subtitles`, `/api/subtitles/providers`, `/api/subtitles/translation-providers` |
| Requests & profiles | `/api/requests`, `/api/auto-approval-rules`, `/api/profiles`, `/api/quality-definitions`, `/api/custom-formats` |
| Playlists & social | `/api/playlists`, `/api/social`, `/api/likes` |
| Live TV | `/api/livetv`, `/api/livetv/admin`, `/api/livetv/admin/access` |
| Plugins | `/api/plugins`, `/api/plugins/sources`, `/api/plugins/import` |
| Imports & filesystem | `/api/imports`, `/api/fs` |
| Images | `/api/images` |
| Media server migration | `/api/media-servers` |
| Library cleanup | `/api/cleanup` |
| Watch parties | `/api/parties` |
| Settings, setup, notifications | `/api/settings`, `/api/setup-checklist`, `/api/notifications` |
| System | `/api/system` (health, backups, the event stream below), `/api/commands` (background task history and triggers) |

See [Streaming and transcoding](/features/streaming-and-transcoding) and
[Plugins overview](/plugins/overview) for what those two areas do.

## Realtime: server-sent events

```
GET /api/system/events?device=<id>&ff=<formFactor>&tvPlatform=<platform>&name=<deviceName>
```

A single [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
stream per signed-in device. It is opened as a plain `EventSource`, which
can't set headers: a browser authenticates with the access token cookie.
A native client first calls `POST /api/system/events/ticket` with its
access token, which returns a single-use ticket valid for 30 seconds
(`{ "ticket": "...", "expiresIn": 30 }`), and opens the stream with
`?ticket=<ticket>`. The long-lived, read-only stream tokens baked into
media URLs are refused here. It carries background task
progress, subtitle sync/download/translation results, remote-control
target announcements, and library-change notifications. Fliks has no
WebSocket or socket.io endpoint; this is the entire realtime transport.

## Examples

```bash
# Log in, keep the session cookie
curl -c cookies.txt -X POST http://localhost:4848/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<username>","password":"<password>"}'

# Reuse the cookie for anything else
curl -b cookies.txt http://localhost:4848/api/libraries

# A script or native client: send the access token directly
curl http://localhost:4848/api/media \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
