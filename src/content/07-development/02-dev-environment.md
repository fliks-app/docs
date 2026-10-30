---
title: Dev environment
description: Run the engine, the server, the client and PostgreSQL locally, work with sqlx migrations, run the test suites, and build the mobile, TV and desktop clients.
---

## Prerequisites

- **Docker and Docker Compose**, for the recommended local stack.
- A checkout of [fliks-engine](https://github.com/fliks-app/engine) next to this repository
  (`../fliks-engine`, or set `FLIKS_ENGINE_SRC`): the dev stack builds and runs the engine from it.
- **Rust**, the version pinned in `rust-toolchain.toml` (installed by `rustup` on first build), to
  build or test the server on the host.
- **Node.js** 24, the version the Docker images and most CI jobs use, for the client. There is no
  `.nvmrc`; the Angular CLI accepts `^22.22.3`, `^24.15.0` or `>=26`, so odd-numbered releases such
  as 23 or 25 won't work. TypeScript and the Angular CLI come with `npm ci`, nothing needs a
  global install.
- A local **PostgreSQL** if you'd rather not use Docker for the database.
- **git**.

## Quick start with Docker

`docker-compose.dev.example.yml`, at the repo root, runs the engine, the server and the client in
watch mode against a PostgreSQL container.

```bash
cp docker-compose.dev.example.yml docker-compose.yml
docker compose up
```

This starts four services, mirroring production:

- `postgres`: PostgreSQL 18, with a named volume.
- `engine`: `fliks-engine` built from `../fliks-engine` with `cargo watch`, the front door on
  port 3000. It forwards the whole HTTP API to `server`. The first build takes minutes.
- `server`: `fliks-server` rebuilt by `cargo watch` from `./server`, on port 3001 (no published
  port, it sits behind the engine).
- `client`: the Angular dev server on port 4500, bind-mounted from `./client`, proxying `/api` to
  the engine.

Open `http://localhost:4500`. A fresh database shows the setup page: create the administrator
there. Media, downloads and data live under `./.dev/` (`medias`, `downloads`, `data`); put test
media in `./.dev/medias`. Rebuild the client image (`docker compose build client`) whenever its
`package.json` changes, since dependencies live inside the image and not on the bind mount.

To pass through a GPU for hardware transcoding (Intel QSV/VAAPI), uncomment the `devices` and
`group_add` lines for the `engine` service and set `FLIKS_RENDER_GID` to your host's `render`
group id (`getent group render | cut -d: -f3`).

To build the server against a local engine checkout instead of the pinned release, run
`scripts/bump-engine.sh --local ../fliks-engine`. `scripts/bump-engine.sh <version>` moves the
pinned release: it rewrites `engine.lock`, the engine image in the `Dockerfile` and the engine tag
of `server/crates/server/Cargo.toml` together, and the `engine-lock.yml` check fails a pull request
where they disagree.

## Quick start without Docker

The server and the client run on the host; playback needs the engine, which the Docker stack
provides (without one, `playback-info` answers `503`).

1. Start a PostgreSQL with the credentials the server defaults to (`fliks` / `fliks`, database
   `fliks`). For example:

   ```bash
   docker run --name fliks-postgres -d \
     -e POSTGRES_USER=fliks -e POSTGRES_PASSWORD=fliks -e POSTGRES_DB=fliks \
     -p 5432:5432 postgres:18-alpine
   ```

2. Server, from `server/`:

   ```bash
   cd server
   PORT=3001 SQLX_OFFLINE=true cargo run -p fliks-server
   ```

   Pending migrations run at start. See [Environment variables](/install/environment-variables)
   for `DB_*`, `TMDB_API_KEY` and the rest.

3. Client, in another terminal:

   ```bash
   cd client
   npm ci
   npm start
   ```

   `npm start` is `ng serve` on `http://localhost:4200`; its dev proxy
   (`client/proxy.conf.json`) forwards `/api` to `http://localhost:3001`.

4. Open `http://localhost:4200`. On an empty database the client shows the setup page where you
   create the administrator.

## Migrations

The schema is owned by the sqlx migrations in `server/migrations/`, one `.sql` file per change
named `<timestamp>_<name>.sql`. The server applies the pending ones at every start;
`fliks-server migrate` applies them without serving, and refuses a database it can't adopt.
To change the schema, add a migration file, then refresh the query cache the build reads
(`server/.sqlx`, checked in CI) with `cargo sqlx prepare --workspace -- --all-targets`, with
`DATABASE_URL` pointing at the migrated database.

A 4.x database is adopted from its TypeORM migration ledger on first start. A dev database built
by the old TypeORM `synchronize` has an empty ledger and `fliks-server migrate` refuses it: re-baseline
it once, from the repo root (`dc` is `docker compose -f docker-compose.yml`):

```bash
dc stop server
dc exec -T postgres sh -c 'pg_dump -U $POSTGRES_USER -Fc -T migrations $POSTGRES_DB' > .dev/fliks.dump
dc exec postgres sh -c 'dropdb -U $POSTGRES_USER $POSTGRES_DB && createdb -U $POSTGRES_USER $POSTGRES_DB'
dc run --rm server cargo run -p fliks-server -- migrate
echo "SELECT 'TRUNCATE ' || string_agg(format('%I', tablename), ',') || ' CASCADE' FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_sqlx_migrations' \gexec" | dc exec -T postgres sh -c 'psql -U $POSTGRES_USER $POSTGRES_DB'
dc exec -T postgres sh -c 'pg_restore -U $POSTGRES_USER -d $POSTGRES_DB --data-only --disable-triggers -n public' < .dev/fliks.dump
dc exec -T postgres sh -c 'pg_restore -U $POSTGRES_USER -d $POSTGRES_DB -N public' < .dev/fliks.dump  # plugin schemas, schema and data
dc up -d
```

The `TRUNCATE` clears rows seeded by migrations. Expect `pg_restore` errors only for tables dropped
by later migrations and their sequences, plus `migrations_id_seq`.

## Tests

The server has unit tests in `fliks_domain` and integration tests in `fliks-server`
(`server/crates/server/tests/`). The database tests need PostgreSQL, so run them through
`scripts/with-test-postgres.sh`, which starts a throwaway PostgreSQL 18 container and removes it
on exit. From `server/`:

```bash
cargo test -p fliks_domain
../scripts/with-test-postgres.sh cargo test -p fliks-server
cargo fmt --all --check
cargo clippy --all-targets -- -D warnings
```

The plugin SDK (`server/crates/plugin-sdk`) is a separate workspace with its own tests. The HTTP
parity suite replays recorded scenarios through the front door and runs locally only; see
`server/parity/README.md`.

A behaviour change updates its spec in `server/docs/spec/`, the parity `expect`s and the golden
vectors in the same pull request. If you add or change a route, regenerate `server/openapi.json`
with `fliks-server openapi > openapi.json`: CI fails when it drifts.

The client uses [Vitest](https://vitest.dev/) (with jsdom) through the
Angular CLI's `unit-test` builder. From `client/`:

```bash
npm test                    # ng test, watches for changes in a terminal
npm test -- --watch=false   # a single run
```

The desktop package has its own tests on Node's built-in runner, plus a typecheck: `npm test` and
`npm run typecheck` from `desktop/`.

CI runs these suites on pull requests (`server.yml`, `client.yml`); see
[Contributing](/development/contributing) for everything CI checks.

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
