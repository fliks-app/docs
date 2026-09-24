---
title: API
description: The REST API's base path, authentication, main resource groups, the realtime event stream, and a few curl examples.
---

## Base path

Every route is prefixed with `/api` (`app.setGlobalPrefix('api')` in
`backend/src/main.ts`). Against a local server that means
`http://localhost:4848/api/...` by default.

> [!NOTE]
> There is no OpenAPI/Swagger UI exposed by the backend. The controller
> and its DTOs, under `backend/src/modules/<name>/`, are the source of
> truth for a request or response shape.

## Authentication

- `POST /api/auth/register` creates an account. The very first account
  ever created becomes an admin automatically; every account after that
  gets the default role.
- `POST /api/auth/login`, body `{ "username": "...", "password": "..." }`,
  returns an access token and a refresh token, and also sets the access
  token as an httpOnly cookie for browser clients.
- `POST /api/auth/refresh`, body `{ "refreshToken": "..." }`, rotates both
  tokens. Replaying an already-rotated refresh token revokes every refresh
  token on the account, every device then has to log back in.
- `POST /api/auth/logout` clears the cookie and revokes the given refresh
  token.

A browser gets the access token from its cookie automatically. Any other
client sends it as `Authorization: Bearer <accessToken>`.

> [!NOTE]
> An API-key strategy exists in the codebase (`ApiKeyStrategy`) but the
> guard that would accept it currently only checks the JWT strategy, so a
> login-issued token is the only way to authenticate today.

See [Users and permissions](/administration/users-and-permissions) for
what a role can be granted.

## Resource groups

| Area | Base path(s) |
|---|---|
| Auth & pairing | `/api/auth`, `/api/auth/pairing` |
| Users, roles, remote control | `/api/users`, `/api/roles`, `/api/remote` |
| Libraries & media | `/api/libraries`, `/api/media`, `/api/persons`, `/api/markers`, `/api/counts` |
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
| System | `/api/system` (health, backups, the event stream below) |

See [Streaming and transcoding](/features/streaming-and-transcoding) and
[Plugins overview](/plugins/overview) for what those two areas do.

## Realtime: server-sent events

```
GET /api/system/events?device=<id>&ff=<formFactor>&tvPlatform=<platform>&name=<deviceName>
```

A single [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
stream per signed-in device (opened as a plain `EventSource`, so it needs
the access token cookie, not a Bearer header). It carries background task
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
