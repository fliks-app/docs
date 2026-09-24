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
| PostgreSQL | A version recent enough to support the `pg_trgm` extension (used for search). The database user needs privilege to `CREATE EXTENSION`, since the backend creates it itself on boot. |
| FFmpeg + FFprobe | On `PATH`. Hardware transcoding is only as good as what your FFmpeg build exposes; the packaged builds all use a bundled FFmpeg build with QSV/VAAPI/NVENC support compiled in. |

Optional, only needed for specific subtitle features: `mkvtoolnix` (subtitle extraction from
Matroska), `tesseract-ocr` plus the `subtile-ocr` binary (image-based subtitle OCR), `ffsubsync`
and `alass` (automatic subtitle sync). Without them, the corresponding feature degrades instead
of failing the rest of the server.

## Build the client

```bash
cd client
npm ci
npx ng build --configuration=production
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
SERVE_STATIC_PATH=../client/dist/client/browser \
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=fliks DB_PASSWORD=changeme DB_NAME=fliks \
PORT=4848 \
node dist/main
```

`SERVE_STATIC_PATH` tells the backend where the built client lives, so it can serve it as static
assets on the same port as the API; without it, the backend runs but there's no web UI to load.
Database migrations run automatically on startup in production mode, so the schema is created on
first launch. See [Environment variables](/install/environment-variables) for every other
variable (data directories, the JWT secret, CORS, streaming timeouts).

> [!TIP]
> `FLIKS_DATA_DIR`, `FLIKS_CACHE_DIR` and `FLIKS_CONF_DIR` all default to paths under the
> process's current working directory. Set them explicitly if you don't run `node dist/main`
> from inside `backend/`, or they'll write wherever you happened to launch it from.

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://localhost:4848`, log
in with the default account, and add your first library.

## See also

- [Environment variables](/install/environment-variables) for the full reference.
- [Hardware acceleration](/install/hardware-acceleration) for what your own FFmpeg needs to
  support hardware transcoding.
