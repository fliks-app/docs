---
title: From source
description: Build and run the backend and web client directly with Node.js, without Docker.
---

## When to use this

Every other install method bundles its own Node.js, PostgreSQL and FFmpeg. Building from source
is for developing Fliks itself, or running it on a platform none of the packaged builds target.
You provide and manage every dependency yourself.

## Prerequisites

| Dependency | Notes |
|---|---|
| Node.js 24 | Same version the Docker image and the Windows/macOS builds use. |
| PostgreSQL | The Docker example runs 18. Create a user and a database for Fliks. The user needs privilege to `CREATE EXTENSION`, since the backend creates `pg_trgm` (used for search) itself on boot. |
| FFmpeg + FFprobe | On `PATH`. Hardware transcoding is only as good as what your FFmpeg build exposes; the packaged builds all use a bundled FFmpeg build with QSV/VAAPI/NVENC support compiled in. |

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

Check out a release tag (`git checkout v<version>`) unless you want the development branch. Run
the two builds below from this directory; the client build reads files from `backend/`, so it
needs the whole repository, not just `client/`.

## Build the client

```bash
cd client
npm ci
npx ng build --configuration=production
cd ..
```

This outputs to `client/dist/client/browser`.

## Build the backend

```bash
cd backend
npm ci
npm run build
```

This outputs to `backend/dist`.

## Run it

From the `backend` directory:

```bash
NODE_ENV=production \
SERVE_STATIC_PATH=../client/dist/client/browser \
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=fliks DB_PASSWORD=changeme DB_NAME=fliks \
FLIKS_CONF_DIR=$HOME/.local/share/fliks/conf \
TMDB_API_KEY=your-tmdb-key \
node dist/main
```

- `NODE_ENV=production` is required. Without it the backend runs in development mode: it skips
  the migrations and syncs the schema straight from the code instead.
- `SERVE_STATIC_PATH` tells the backend where the built client lives, so it can serve it on the
  same port as the API (`4848`, or `PORT`); without it there's no web UI to load.
- `FLIKS_CONF_DIR` holds the generated JWT signing key. Its default, `/app/conf`, usually isn't
  writable outside Docker, and the fallback is a temp directory: lose it and everyone is logged
  out.
- `TMDB_API_KEY` (and `TVDB_API_KEY` for TVDB): only the published Docker image and the
  packaged apps carry built-in keys. A source build has none, so without your own keys titles
  aren't matched and no artwork is fetched.

With `NODE_ENV=production`, pending database migrations run on every start, so the schema is
created on first launch. The backend also reads a `.env` file in its working directory, if you'd
rather keep these values there. See [Environment variables](/install/environment-variables) for
every other variable.

> [!TIP]
> `FLIKS_DATA_DIR` (artwork, avatars, backups) defaults to `data/` under the current working
> directory. Set it explicitly if you don't run `node dist/main` from inside `backend/`, or it
> will write wherever you happened to launch it from. The transcode cache defaults to
> `/tmp/transcode`; set `FLIKS_TRANSCODE_DIR` if `/tmp` is small or `tmpfs` on your system.

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://localhost:4848`, log
in with the default account, and add your first library.

## See also

- [Environment variables](/install/environment-variables) for the full reference.
- [Hardware acceleration](/install/hardware-acceleration) for what your own FFmpeg needs to
  support hardware transcoding.
