---
title: Dev environment
description: Run the backend, the client and PostgreSQL locally, apply migrations, run the test suites, and build the mobile, TV and desktop clients.
---

## Prerequisites

- **Node.js** 24, the version the Docker images and most CI jobs use.
  There is no `.nvmrc`; the Angular CLI accepts `^22.22.3`, `^24.15.0` or
  `>=26`, so odd-numbered releases such as 23 or 25 won't work for the
  client. TypeScript, the Nest CLI and the Angular CLI come with `npm ci`,
  nothing needs a global install.
- Any editor with TypeScript support.
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
   write a migration to try out a schema change locally. (`synchronize` is
   on whenever `NODE_ENV` is not `production`.)

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
migrations are the only sanctioned way to change the schema; a production
boot (`NODE_ENV=production`) applies pending migrations by itself. From
`backend/`:

```bash
npm run db:migration:generate -- src/migrations/<descriptive-name>
npm run db:migration:run
npm run db:migration:revert
npm run db:migration:show
```

`db:migration:generate` diffs the entities against the database it
connects to (`src/data-source.ts`, reading `backend/.env`). A dev database
that `synchronize` already updated has no diff left, so the generated
migration comes out empty or missing: generate against a database that
only ever had `db:migration:run` applied.

A CI job (`.github/workflows/db-migrations.yml`) applies every committed
migration to a fresh PostgreSQL on each PR touching `backend/`, then runs
`migration:generate` against it, to catch a schema change that was made
through `synchronize` locally but never turned into a migration.

## Tests

The backend uses [Jest](https://jestjs.io/); unit tests are the
`*.spec.ts` files next to the code in `backend/src/`. From `backend/`:

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

The client uses [Vitest](https://vitest.dev/) (with jsdom) through the
Angular CLI's `unit-test` builder. From `client/`:

```bash
npm test                    # ng test, watches for changes in a terminal
npm test -- --watch=false   # a single run
```

The desktop package has its own tests on Node's built-in runner: `npm test`
from `desktop/`.

> [!NOTE]
> No workflow under `.github/workflows/` currently runs these test suites
> or a lint check automatically on a pull request. Run them yourself
> before pushing; see [Contributing](/development/contributing) for the
> checks that CI *does* run.

## Building the other clients

From `client/`, the same build a target ships is one npm script away:

| Target | Command | Notes |
|---|---|---|
| Android (Capacitor) | `npm run cap:build` | Builds the Angular app, then `npx cap sync android`. Open the project in Android Studio with `npm run cap:open`. |
| iOS (Capacitor) | `npm run cap:build:ios` | Same, opened with `npm run cap:open:ios`. Needs a Mac with Xcode. |
| Samsung TV (Tizen) | `npm run tizen:build` | Builds against a Chromium 85 browserslist target, then packages an unsigned `.wgt`. Signing it and installing it on a TV go through the Tizen Studio CLI (`tizen package`, `tizen install`), see `client/tizen/README.md`. |
| LG TV (webOS) | `npm run webos:build` | Same Chromium 85 target, packages an `.ipk`. Install it with the webOS CLI (`ares-install`). |

From `desktop/` (first-time setup, the native addon and the vendored
libmpv, is in `desktop/README.md`):

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
