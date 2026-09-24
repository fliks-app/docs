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
enabled, and search for **fliks**. On the install form:

- **Database Password**: set one. The PostgreSQL container the app creates uses it.
- **WebUI Port**: `30485` by default. This is the port you'll open in a browser.
- **Storage Configuration**: config, data and transcode storage are created for you. Add your
  media under **Additional Storage**: pick the dataset or host path holding your videos and give
  it a **Mount Path** such as `/medias`. That mount path is what you'll type when adding a
  library in Fliks.

> [!NOTE]
> The exact fields on that form belong to the TrueNAS app catalog itself (a separate repository
> from Fliks), and can change between TrueNAS SCALE versions. Check the current form in your
> TrueNAS instance rather than assuming it matches an older screenshot.

## Container user

The app runs Fliks as the TrueNAS `apps` user (uid and gid `568`, changeable under **User and
Group Configuration**). A permissions step at install time makes the storage it creates writable
for that user. For a host path you add under **Additional Storage**, make sure that user can read
it (and write it, if you want downloads or saved subtitles there).

## Hardware transcoding

If your TrueNAS box has a GPU, select it under **GPU Configuration** in the app's resources
section; the app exposes TrueNAS' own GPU selection rather than a raw Compose `devices:` block.
See [Hardware acceleration](/install/hardware-acceleration) for what each vendor path does.

## First run

Continue with the [Quick start](/getting-started/quick-start): open
`http://<truenas-host>:30485` (or the port you chose), log in with the default account, and add
your first library, pointing it at the mount path you configured in the app.

## See also

- [Docker](/install/docker) for the volumes behind the app's storage entries. Extra
  [environment variables](/install/environment-variables) go under **Additional Environment
  Variables** on the install form.
- [Updating](/install/updating) for how TrueNAS SCALE surfaces new app versions. The catalog
  app turns off Fliks' own update check, so the TrueNAS apps page is where updates show.
