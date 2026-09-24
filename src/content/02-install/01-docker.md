---
title: Docker
description: Run the Fliks server and its database with Docker Compose, the recommended way to self-host it.
---

## What you get

The published image is a single container: the NestJS backend, the built Angular web client
served as static assets, and a self-contained FFmpeg build with hardware-acceleration support
baked in. A separate PostgreSQL container holds the database. It runs on `linux/amd64` and
`linux/arm64`.

## Prerequisites

- Docker with the Compose plugin (the `docker compose` command).
- A folder with your video files, reachable from wherever Docker runs.

## Set it up

Download the example Compose file and rename it:

```bash
curl -LO https://raw.githubusercontent.com/fliks-app/fliks/main/docker-compose.example.yml
mv docker-compose.example.yml docker-compose.yml
```

Open `docker-compose.yml` and set three things:

1. `POSTGRES_PASSWORD` and `DB_PASSWORD`: replace `changeme` with the same real password in both
   places.
2. The media volume: `/path/to/your/media:/medias` on the left of the colon is your folder, the
   right side (`/medias`) is what you'll type when adding a library in the UI.
3. The host port, only if `4848` is already taken: change the left side of `'4848:4848'` under
   `ports:` (for example `'8080:4848'`). Leave `PORT` alone; it's the port inside the container.

Then start it:

```bash
docker compose up -d
```

> [!TIP]
> Pin a specific release instead of `:latest` by editing the image tag; see the
> [package page](https://github.com/fliks-app/fliks/pkgs/container/fliks) for available tags.
> `docker compose up -d` after changing it pulls the new image and recreates the container.

## Volumes

| Volume | Contents |
|---|---|
| `/medias` | Your library root(s). Read-only is enough to browse and play; downloads, deleting media and saving subtitles next to a video need write access. |
| `/downloads` | Only needed if you install the download plugin; use the same path here and in your download client. |
| `/app/conf` | The JWT signing key. Lose it and every session is invalidated. |
| `/app/data` | Artwork, uploaded avatars, database backups, and a regenerable `cache/` subfolder. Not disposable: avatars can't be re-fetched. |
| `/app/transcode` | The HLS segment cache. Regenerable, safe to wipe. Paired with `FLIKS_TRANSCODE_DIR`; drop both and the cache lands in the container's `/tmp`. |

## Running as a specific user

Some platforms pin the container to a non-root uid: the TrueNAS catalog uses `568`, Unraid uses
`99:100`, Kubernetes' `runAsNonRoot` and OpenShift's arbitrary uid policy pick their own. The
image's `/app/conf`, `/app/data` and `/app/transcode` are group-writable by root (`g=u`), so any
uid works as long as group `0` is in its group list:

```yaml
services:
  fliks:
    user: '568:568'
    group_add: ['0']
```

## Chromecast on a bridge network

The default bridge network works for casting. The device you cast from (a browser, the phone
app, the desktop app) finds the Chromecast itself; the server takes no part in discovery. What
the Chromecast does need is to reach the server directly, at the address Fliks hands it: set
**Public address** under **Settings > General** if that address isn't the one the Chromecast
can reach (see [Reverse proxy](/install/reverse-proxy#tell-fliks-its-public-address)).

## Memory on a small box

Node sizes its heap from the container's cgroup memory limit; with no limit set, it assumes the
whole host and reserves around 4 GB, leaving little for the FFmpeg processes a library scan runs
alongside. On a small NAS or single-board computer, set a limit:

```yaml
services:
  fliks:
    mem_limit: 4g
```

## Hardware transcoding

See [Hardware acceleration](/install/hardware-acceleration) for the devices and environment
variables each vendor needs (Intel QSV/VAAPI, NVIDIA NVENC, AMD through VAAPI). The Intel and
NVIDIA stacks are `amd64`-only; on `arm64` (a Raspberry Pi 5, an ARM NAS) transcodes fall back
to CPU.

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://<host>:4848`, log in
with the default account, and add your first library.
