---
title: TrueNAS
description: Install Fliks from the TrueNAS SCALE community app catalog.
---

> [!SUMMARY]
> Install the **fliks** app from the Community train, set a database password and add your media under **Additional Storage**, then open port `30485`.

:::details What the app is
Fliks is published in the TrueNAS SCALE **community** train as the app **fliks**. Under the
hood it's the same Docker image described in [Docker](/install/docker), packaged as a TrueNAS
app: the catalog handles the Compose file, the volumes and the PostgreSQL sidecar for you.
:::

## Install the TrueNAS app

In the TrueNAS SCALE UI, go to **Apps > Discover Apps**, make sure the **Community** train is
enabled, and search for **fliks**. On the install form:

- **Database Password**: set one. The PostgreSQL container the app creates uses it.
- **WebUI Port**: `30485` by default. This is the port you'll open in a browser.
- **Storage Configuration**: config, data and transcode storage are created for you. Add your
  media under **Additional Storage**: pick the dataset or host path holding your videos and give
  it a **Mount Path** such as `/medias`. That mount path is what you'll type when adding a
  library in Fliks.

:::details Permissions on your media dataset
The app runs Fliks as the TrueNAS `apps` user (uid and gid `568`, changeable under **User and
Group Configuration**). A permissions step at install time makes the storage it creates writable
for that user. For a host path you add under **Additional Storage**, make sure that user can read
it (and write it, if you want downloads or saved subtitles there).
:::

> [!NOTE]
> The dedicated database role does not apply here: the app connects through TrueNAS's shared
> PostgreSQL library with a single database user, and there is no second role. If you bring your
> own PostgreSQL, [`fliks-server db-role`](/install/environment-variables#db-role) stays available.

## Hardware transcoding

If your TrueNAS box has a GPU, select it under **GPU Configuration** in the app's resources
section; the app exposes TrueNAS' own GPU selection rather than a raw Compose `devices:` block.
See [Hardware acceleration](/install/hardware-acceleration) for what each vendor path does.

## First run

Open `http://<truenas-host>:30485` and continue with the [Quick start](/getting-started/quick-start)
from step 2. The library path is the mount path you set in the app.

## See also

- [Docker](/install/docker) for the volumes behind the app's storage entries. Extra
  [environment variables](/install/environment-variables) go under **Additional Environment
  Variables** on the install form.
- [Updating](/install/updating) for how TrueNAS SCALE surfaces new app versions. The catalog
  app turns off Fliks' own update check, so the TrueNAS apps page is where updates show.
