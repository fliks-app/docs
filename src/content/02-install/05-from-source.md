---
title: From source
description: Build the Rust server, the engine and the web client yourself and run them without Docker.
---

## When to use this

Every other install method bundles its own PostgreSQL and FFmpeg. Building from source is for
developing Fliks itself, or running it on a platform none of the packaged builds target. You
provide and manage every dependency yourself. To work on the code with live reload, see the
[Dev environment](/development/dev-environment) instead.

## What runs

Two processes, started as one: `fliks-engine` owns the public port (`4848`) and starts
`fliks-server` (port `4849`, the whole HTTP API) as its child, restarting it if it exits. You
build `fliks-server` and the web client, and download `fliks-engine` as a release binary.

## Prerequisites

| Dependency | Notes |
|---|---|
| Rust | The version pinned in `rust-toolchain.toml` (installed by `rustup` on first build). It also adds the `wasm32-wasip2` target. |
| Node.js 24 | Only to build the web client. Same version the Docker image uses. |
| PostgreSQL | The Docker example runs 18. Create a user and a database for Fliks. The user needs privilege to `CREATE EXTENSION`, since a migration creates `pg_trgm` (used for search). |
| FFmpeg + FFprobe | On `PATH`, for the engine. Hardware transcoding is only as good as what your FFmpeg build exposes; the packaged builds all use a bundled build with QSV/VAAPI/NVENC support compiled in. |

Optional, each needed only by one feature: `pg_dump` and `psql` from the PostgreSQL client
tools, on `PATH` and at least as new as the server (database backups and restores);
`mkvtoolnix` (subtitle extraction from Matroska); `tesseract-ocr` plus the `subtile-ocr` binary and `pgsrip`
(image-based subtitle OCR); `ffsubsync` and `alass` (automatic subtitle sync); Chromaprint's
`fpcalc` (intro detection). Without them, the corresponding feature degrades instead of failing
the rest of the server.

## Get the code

```bash
git clone https://github.com/fliks-app/fliks.git
cd fliks
```

Check out a release tag (`git checkout v<version>`) unless you want the development branch.

## Build the client

```bash
cd client
npm ci
npx ng build --configuration=production
cd ..
```

This outputs to `client/dist/client/browser`.

## Build the server

```bash
cd server
SQLX_OFFLINE=true cargo build --release --locked -p fliks-server
cd ..
```

This outputs `server/target/release/fliks-server`. `SQLX_OFFLINE=true` makes the build use the
committed query cache instead of a live database.

## Get the engine

`engine.lock` names the engine release this version expects. Download that release's binary for
your platform (`linux-x64`, `linux-arm64`, `darwin-arm64` or `windows-x64`):

```bash
version=$(sed -n 's/^version=//p' engine.lock)
curl -Lo fliks-engine \
  "https://github.com/fliks-app/engine/releases/download/v$version/fliks-engine-linux-x64"
chmod +x fliks-engine
```

## Run it

From the repository root:

```bash
FLIKS_BIND=127.0.0.1 \
SERVE_STATIC_PATH=$PWD/client/dist/client/browser \
FLIKS_CAST_DIR=$PWD/server/public \
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=fliks DB_PASSWORD=changeme DB_NAME=fliks \
FLIKS_CONF_DIR=$HOME/.local/share/fliks/conf \
TMDB_API_KEY=your-tmdb-key \
./fliks-engine --supervise --upstream http://127.0.0.1:4849 --public-listen 0.0.0.0:4848 \
  -- server/target/release/fliks-server
```

- `FLIKS_BIND=127.0.0.1` keeps `fliks-server` reachable only through the engine, as in the Docker
  image.
- `SERVE_STATIC_PATH` tells the server where the built client lives, so it can serve it on the
  same port as the API; without it there's no web UI to load.
- `FLIKS_CAST_DIR` points at the folder holding the emoji assets (`server/public`).
- `FLIKS_CONF_DIR` holds the generated JWT signing key and engine token. Its default, `/app/conf`,
  usually isn't writable outside Docker, and the fallback is a temp directory: lose it and
  everyone is logged out.
- `TMDB_API_KEY` (and `TVDB_API_KEY` for TVDB): only the published Docker image and the
  packaged apps carry built-in keys. A source build has none, so without your own keys titles
  aren't matched and no artwork is fetched.

Pending database migrations run on every start, so the schema is created on first launch.
`fliks-server migrate` runs them on their own. See
[Environment variables](/install/environment-variables) for every other variable.

> [!TIP]
> `FLIKS_DATA_DIR` (artwork, avatars, backups) defaults to `data/` under the directory you launch
> from: set it explicitly. The transcode cache defaults to `fliks-transcode` in the system temp
> directory; set `FLIKS_TRANSCODE_DIR` if that is small or `tmpfs` on your system.

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://localhost:4848`,
create the administrator account on the setup page, and add your first library.

## See also

- [Environment variables](/install/environment-variables) for the full reference.
- [Hardware acceleration](/install/hardware-acceleration) for what your own FFmpeg needs to
  support hardware transcoding.
