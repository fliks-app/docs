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

- Docker and Docker Compose.
- A folder with your video files, reachable from wherever Docker runs.

## Set it up

Download the example Compose file and rename it:

```bash
curl -LO https://raw.githubusercontent.com/fliks-app/fliks/main/docker-compose.example.yml
mv docker-compose.example.yml docker-compose.yml
```

Open `docker-compose.yml` and set three things:

1. `POSTGRES_PASSWORD` and `DB_PASSWORD`: the same real password in both places.
2. The media volume: `/path/to/your/media:/medias` on the left of the colon is your folder, the
   right side (`/medias`) is what you'll type when adding a library in the UI.
3. `PORT`: only if `4848` is already taken on the host.

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
| `/medias` | Your library root(s), mounted read-only is fine unless you want Fliks to write there. |
| `/downloads` | Only needed if you install the download plugin; use the same path here and in your download client. |
| `/app/conf` | The JWT signing key. Lose it and every session is invalidated. |
| `/app/data` | Artwork, uploaded avatars, and database backups. Not disposable: avatars can't be re-fetched. |
| `/app/transcode` | The HLS segment cache. Ephemeral, safe to drop. |

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

mDNS (how Chromecast finds a cast target on the network) doesn't cross Docker's default bridge
network. If you cast to a Chromecast, run the container on the host network instead:

```yaml
services:
  fliks:
    network_mode: host
    # remove `ports:` when using network_mode: host
```

With `network_mode: host`, set `DB_HOST` to `127.0.0.1` (or wherever Postgres actually listens)
since the container no longer resolves the `postgres` service name through Compose's network.

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
variables each vendor needs (Intel QSV/VAAPI, NVIDIA NVENC, AMD). The Intel and NVIDIA stacks are
`amd64`-only; on `arm64` (a Raspberry Pi 5, an ARM NAS) transcodes fall back to CPU.

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://<host>:4848`, log in
with the default account, and add your first library.
