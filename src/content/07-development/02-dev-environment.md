---
title: Dev environment
description: Run the backend, the client and PostgreSQL locally, apply migrations, run the test suites, and build the mobile, TV and desktop clients.
---

## Prerequisites

- **Node.js** 22 or newer (CI builds on Node 24; the desktop package
  requires at least Node 20).
- **Docker and Docker Compose**, for the recommended local stack.
- A local **PostgreSQL** if you'd rather not use Docker for the database.
- **git**.

## Quick start with Docker

`docker-compose.dev.example.yml`, at the repo root, runs the backend and
the client in watch mode against a PostgreSQL container.

```bash
cp docker-compose.dev.example.yml docker-compose.yml
docker compose up
```

This starts three services:

- `postgres`: PostgreSQL 18, with a named volume.
- `backend`: `npm run start:dev` (`nest start --watch`) on port 3000,
  bind-mounted from `./backend` so edits reload without a rebuild.
- `client`: the Angular dev server on port 4500, bind-mounted from
  `./client`.

Open `http://localhost:4500`. Rebuild the images (`docker compose build`)
whenever a `package.json` changes, since dependencies live inside the
image and not on the bind mount.

To pass through a GPU for hardware transcoding (Intel QSV/VAAPI), uncomment
the `devices` and `group_add` lines for the `backend` service and set
`FLIKS_RENDER_GID` to your host's `render` group id
(`getent group render | cut -d: -f3`).

## Quick start without Docker

1. Start a PostgreSQL reachable with the credentials in
   `backend/.env.example` (`fliks` / `fliks`, database `fliks`). For
   example:

   ```bash
   docker run --name fliks-postgres -d \
     -e POSTGRES_USER=fliks -e POSTGRES_PASSWORD=fliks -e POSTGRES_DB=fliks \
     -p 5434:5432 postgres:18-alpine
   ```

2. Backend:

   ```bash
   cd backend
   cp .env.example .env   # adjust DB_*, JWT_SECRET, TMDB/TVDB keys as needed
   npm ci
   npm run start:dev
   ```

   `start:dev` runs `nest start --watch`, so a saved file restarts the
   affected part of the app. In development `synchronize: true` keeps the
   database schema following the entities automatically: you don't need to
   write a migration to try out a schema change locally.

3. Client, in another terminal:

   ```bash
   cd client
   npm ci
   npm start
   ```

   `npm start` is `ng serve` on `http://localhost:4200`; its dev proxy
   (`client/proxy.conf.json`) forwards `/api` to `http://localhost:3001`,
   which is why `backend/.env.example` sets `PORT=3001`.

4. Open `http://localhost:4200`.

> [!NOTE]
> On an empty database, the backend creates a default `admin` / `password`
> account the first time it starts (`UsersService.onModuleInit`). Log in
> with it and change the password right away from the user menu, exactly
> as the [Docker install](/install/docker) instructions describe.

## Migrations

`synchronize: true` only applies locally. In production, and in CI,
migrations are the only sanctioned way to change the schema. From
`backend/`:

```bash
npm run db:migration:generate -- src/migrations/<descriptive-name>
npm run db:migration:run
npm run db:migration:revert
npm run db:migration:show
```

A CI job (`.github/workflows/db-migrations.yml`) applies every committed
migration to a fresh PostgreSQL on each PR touching `backend/`, to catch a
schema change that was made through `synchronize` locally but never turned
into a migration.

## Tests

Backend, from `backend/`:

```bash
npm test          # jest unit tests
npm run test:watch
npm run test:cov
npm run test:e2e  # boots the full Nest app; needs a reachable PostgreSQL
```

Unit tests don't need a database (each Jest worker gets its own temp
runtime directory). `test:e2e` builds the real `AppModule`, so it does need
the same PostgreSQL as the app itself, reachable through the same `DB_*`
environment variables.

Client, from `client/`:

```bash
npm test   # ng test, runs on Vitest
```

> [!NOTE]
> No workflow under `.github/workflows/` currently runs these test suites
> or a lint check automatically on a pull request. Run them yourself
> before pushing; see [Contributing](/development/contributing) for the
> checks that CI *does* run.

## Building the other clients

From `client/`, the same build a target ships is one npm script away:

| Target | Command | Notes |
|---|---|---|
| Android (Capacitor) | `npm run cap:build` | Builds the Angular app, then `npx cap sync android`. Open the project with `npm run cap:open`. |
| iOS (Capacitor) | `npm run cap:build:ios` | Same, opened with `npm run cap:open:ios`. Needs a Mac with Xcode. |
| Samsung TV (Tizen) | `npm run tizen:build` | Builds against a Chromium 85 browserslist target, then packages a `.wgt`. `npm run tizen:deploy` installs it over `sdb`. |
| LG TV (webOS) | `npm run webos:build` | Same Chromium 85 target, packages an `.ipk`. |

From `desktop/`:

```bash
npm run dev:linux     # dev run on Linux, the primary dev platform for this client
npm run dist:linux    # AppImage / .deb
npm run dist:mac      # .dmg / .zip
npm run dist:win      # NSIS installer
```

The native platform shells that run the *server* itself, the Windows tray
app and the macOS menu-bar app, and the native tvOS app, use their own
toolchains (`.NET`, Xcode/XcodeGen) instead of npm scripts. Their build
steps are documented in `windows/README.md`, `macos/README.md` and
`appletv/README.md`.
