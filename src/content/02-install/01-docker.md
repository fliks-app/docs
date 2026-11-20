---
title: Docker
description: Run the Fliks server and its database with Docker Compose, the recommended way to self-host it.
---

> [!SUMMARY]
> Download the example Compose file, set a database password and your media folder, then run `docker compose up -d` and open `http://<host>:4848`.

## Run Fliks

You need Docker with the Compose plugin and a folder with your videos.

```bash
curl -LO https://raw.githubusercontent.com/fliks-app/fliks/main/docker-compose.example.yml
mv docker-compose.example.yml docker-compose.yml
```

Edit `docker-compose.yml`:

1. Replace `changeme` with the same password in `POSTGRES_PASSWORD` and `DB_PASSWORD`.
2. Set your media folder: `/path/to/your/media:/medias`. You'll type `/medias` when adding a library.

```bash
docker compose up -d
```

Open `http://<host>:4848` and follow the [Quick start](/getting-started/quick-start) from step 2.

:::details Port 4848 is taken, or pin a version
Change the left side of `'4848:4848'` under `ports:` (for example `'8080:4848'`); leave `PORT` alone.
To pin a release instead of `:latest`, edit the image tag (tags are on the
[package page](https://github.com/fliks-app/fliks/pkgs/container/fliks)), then run
`docker compose up -d` again.
:::

## Reference

You don't need any of this for a first install.

## Volumes

:::details What each volume holds
| Volume | Contents |
|---|---|
| `/medias` | Your library root(s). Read-only is enough to browse and play; downloads, deleting media and saving subtitles next to a video need write access. |
| `/downloads` | Only needed if you install the download plugin; use the same path here and in your download client. |
| `/app/conf` | The JWT signing key and the engine token, both generated at first start. Lose the key and every session is invalidated. |
| `/app/data` | Artwork, uploaded avatars, database backups, plugin data (`plugins/`), and a regenerable `cache/` subfolder. Not disposable: avatars can't be re-fetched. |
| `/app/transcode` | The HLS segment cache. Regenerable, safe to wipe. The image sets `FLIKS_TRANSCODE_DIR` to this path. |
:::

## Running as a specific user

:::details Run as a specific user (NAS, Kubernetes)
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
:::

## Chromecast on a bridge network

:::details Casting from a bridge network
The default bridge network works for casting. The device you cast from (a browser, the phone
app, the desktop app) finds the Chromecast itself; the server takes no part in discovery. What
the Chromecast does need is to reach the server directly, at the address Fliks hands it: set
**Public address** under **Settings > General** if that address isn't the one the Chromecast
can reach (see [Reverse proxy](/install/reverse-proxy#tell-fliks-its-public-address)).
:::

:::details Limit CPU and memory on a small box
On a shared NAS or single-board computer, cap the container so transcodes don't starve the rest of
the box. A 4K HDR transcode takes about 700 MB of RAM. The engine sizes itself on the CPUs of the
limit: software transcodes share them (each gets at least 2 threads), so more simultaneous
transcodes run slower, and none is refused or queued. Background jobs (scans, thumbnails, marker
detection) run on the CPUs minus one (at least one) and wait or pause while a transcode needs the
CPU. Hardware encodes don't use that budget. The **Concurrent background jobs** setting overrides
it (see [Streaming and transcoding](/features/streaming-and-transcoding#admin-settings)).

```yaml
services:
  fliks:
    mem_limit: 4g
    cpus: '4'
```
:::

## Hardware transcoding

See [Hardware acceleration](/install/hardware-acceleration) for the devices and environment
variables each vendor needs (Intel QSV/VAAPI, NVIDIA NVENC, AMD through VAAPI). The Intel and
NVIDIA stacks are `amd64`-only; on `arm64` (a Raspberry Pi 5, an ARM NAS) transcodes fall back
to CPU.

## What is in the image

The published image is a single container: the Rust server (`fliks-server`) behind `fliks-engine`,
the streaming engine that owns port `4848` and forwards the API to the server, the built Angular
web client served as static assets, and a self-contained FFmpeg build with hardware-acceleration
support baked in. A separate PostgreSQL container holds the database. It runs on `linux/amd64` and
`linux/arm64`.

