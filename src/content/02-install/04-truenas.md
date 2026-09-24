---
title: TrueNAS
description: Install Fliks from the TrueNAS SCALE community app catalog.
---

## What you get

Fliks is published in the TrueNAS SCALE **community** train as the app **fliks**. Under the
hood it's the same Docker image described in [Docker](/install/docker), packaged as a TrueNAS
app: the catalog handles the Compose file, the volumes and the PostgreSQL sidecar for you.

## Install

In the TrueNAS SCALE UI, go to **Apps > Discover Apps**, make sure the **Community** train is
enabled, and search for **fliks**. Install it and fill in the app's own configuration screen:
the media path(s) you want to expose to it, and the port to publish (`4848` by default).

> [!NOTE]
> The exact fields on that configuration screen belong to the TrueNAS app catalog itself (a
> separate repository from Fliks), and can change between TrueNAS SCALE versions. Check the
> current form in your TrueNAS instance rather than assuming it matches an older screenshot.

## Container user

TrueNAS SCALE apps run containers under a fixed non-root uid. Fliks' image already accounts for
this: its `/app/conf`, `/app/data` and `/app/transcode` directories are group-writable by root,
so the catalog's `user: 568:568` plus `group_add: ['0']` (the same pattern documented in the
Docker guide) works without any extra permission setup on your dataset.

## Hardware transcoding

If your TrueNAS box has a GPU, pass it through in the app's resource configuration the same way
you would for any other GPU-using app. See [Hardware acceleration](/install/hardware-acceleration)
for which devices each vendor path needs (`/dev/dri` for Intel, the NVIDIA runtime for NVENC);
the catalog app exposes GPU passthrough through TrueNAS' own GPU selection UI rather than a raw
Compose `devices:` block.

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://<truenas-host>:4848`,
log in with the default account, and add your first library, pointing it at the path you
configured in the app.

## See also

- [Docker](/install/docker) for the volumes, environment variables and Chromecast networking
  notes that apply equally to the TrueNAS app underneath.
- [Updating](/install/updating) for how TrueNAS SCALE surfaces new app versions.
