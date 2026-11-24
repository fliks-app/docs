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

1. Replace `changeme` with a password, the same in `POSTGRES_PASSWORD` and `DB_ADMIN_PASSWORD`.
   Replace `change-me-too` in `DB_PASSWORD` with a different one: Fliks connects with that
   password, not the administrator's.
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

## Database role

:::details The database role Fliks connects as
The example file starts a one-shot `fliks-db-role` service before `fliks`. It runs
[`fliks-server db-role`](/install/environment-variables#db-role) with the PostgreSQL administrator
and gives the `fliks_app` role the database. `fliks` then connects as `fliks_app`, which is not a
superuser. The administrator password stays in the `postgres` and `fliks-db-role` services, never
in `fliks`. A second Fliks on the same PostgreSQL cluster needs its own `DB_USERNAME`: the role
belongs to the cluster, not to the database.

The `postgres` health check is now `pg_isready -h 127.0.0.1 -U fliks`.
:::

:::details Switch an existing install to the database role
An upgrade does not change an existing install: it keeps connecting as its current PostgreSQL
user. To opt in:

1. Back up in **Settings > Backup**.
2. In your `docker-compose.yml`, add the `fliks-db-role` service and the `DB_USERNAME` and
   `DB_PASSWORD` lines of the new example file, and make `fliks` depend on the service as the
   example does.
3. Check that the administrator password in the file is the real one. PostgreSQL ignores
   `POSTGRES_PASSWORD` once the data directory exists, so the file may hold an outdated value.
4. Run `docker compose up -d`.

To go back, set `DB_USERNAME` and `DB_PASSWORD` to the administrator's again and remove the
service. Nothing moves back: a superuser ignores ownership, and `fliks_app` and what it owns stay,
harmlessly. To give the objects back, run `REASSIGN OWNED BY fliks_app TO fliks`.

With an external PostgreSQL server, see [`db-role`](/install/environment-variables#db-role).
:::

## Volumes

:::details What each volume holds
| Volume | Contents |
|---|---|
| `/medias` | Your library root(s). Read-only is enough to browse and play; downloads, deleting media and saving subtitles next to a video need write access. |
| `/downloads` | Only needed if you install the download plugin; use the same path here and in your download client. |
| `/app/conf` | The JWT signing key and the push identity (`.push-identity.json`: the web push key and the relay identity), both generated at first start. The Subsonic app passwords and the job grants are sealed with keys derived from the signing key. Lose the volume and every session is invalidated, every Subsonic app needs a new app password and every push registration is made again. |
| `/app/data` | Artwork, uploaded avatars, database backups, plugin data (`plugins/`), and a regenerable `cache/` subfolder. Not disposable: avatars can't be re-fetched. |
| `/app/transcode` | The HLS segment cache. Regenerable, safe to wipe. The image sets `FLIKS_TRANSCODE_DIR` to this path. |
:::

## Running as a specific user

:::details Run as a specific user (NAS, Kubernetes)
The image runs as `568:0`, and a new volume inherits that ownership. Some platforms pin another
uid: Unraid uses `99:100`, Kubernetes' `runAsNonRoot` and OpenShift's arbitrary uid policy pick
their own. The image's `/app/conf`, `/app/data` and `/app/transcode` are group-writable by root
(`g=u`), so any uid works as long as group `0` is in its group list:

```yaml
services:
  fliks:
    user: '99:100'
    group_add: ['0']
```

A volume that another uid already owns (a host path, or a volume first used as root) is refused
with an error line naming the file and the `chown` to run, for example `chown -R 568:0 <path>`.
When `/app/conf` cannot be used, the secrets are kept in the container's `/tmp`, lost at every
recreate, and **Settings > System > Status** shows a red line saying so.
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

