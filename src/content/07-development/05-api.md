---
title: API
description: The REST API's base path, authentication, main resource groups, the realtime event stream, and a few curl examples.
---

## Base path

Every route is prefixed with `/api` (`app.setGlobalPrefix('api')` in
`backend/src/main.ts`). The server listens on `PORT`, `4848` when unset,
so against a local server that means `http://localhost:4848/api/...`. The
dev setups override it: `3001` with `backend/.env.example`, `3000` in the
Docker dev stack (see [Dev environment](/development/dev-environment)).

Request bodies are validated against their DTO class by a global
`ValidationPipe` with `whitelist` and `forbidNonWhitelisted`: a property
the DTO doesn't declare is rejected with a `400`, not silently dropped. So
don't send back a whole object you fetched (with its `id`, `createdAt`,
`updatedAt`) as the body of an update; send only the fields you change.

> [!NOTE]
> There is no OpenAPI/Swagger UI exposed by the backend. The controller
> and its DTOs, under `backend/src/modules/<name>/`, are the source of
> truth for a request or response shape.

## Authentication

- `POST /api/auth/register` creates an account with the default role.
  (Only the very first account in an empty database would become an
  admin, and the server already creates a default `admin` account at
  first start, so in practice a registered account never is.)
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
header (`EventSource`, media URLs). It checks the cookie first, then the
header, then the query parameter.

`GET /api/system/liveness` needs no token at all; it is meant for
container health checks.

> [!NOTE]
> There is no API-key authentication today:
> `auth/strategies/api-key.strategy.ts` only holds a commented-out
> reference implementation, and `JwtOrApiKeyGuard` checks the JWT
> strategy alone. A login-issued token is the only way to authenticate.

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
can't set headers: a browser authenticates with the access token cookie,
and a native client appends its access token as `?token=`. The
long-lived, read-only stream tokens baked into media URLs are refused
here (`SessionTokenGuard`). It carries background task
progress, subtitle sync/download/translation results, remote-control
target announcements, and library-change notifications. Fliks has no
WebSocket or socket.io endpoint; this is the entire realtime transport.

## Examples

```bash
# Log in, keep the session cookie
curl -c cookies.txt -X POST http://localhost:4848/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'

# Reuse the cookie for anything else
curl -b cookies.txt http://localhost:4848/api/libraries

# A script or native client: send the access token directly
curl http://localhost:4848/api/media \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
