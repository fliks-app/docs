---
title: Plugins
description: Install, trust and manage the plugins that extend what Fliks can do, from the admin side.
---

## Why plugins exist

Fliks ships with no way to acquire media on its own. Everything that adds one, most notably the
download plugin (torrent indexer search, download-client management, the grab pipeline), is
installed separately from **Settings > Advanced > Plugins**. This page covers installing and
managing them; writing one is covered in the separate developer documentation.

## Installing from the catalog

**Search for a plugin** opens the catalog: every plugin your configured sources offer, marked
**Installed** or **Update available** where it applies. A plugin with no version your server can
install shows **No installable version**. Installing shows a consent step first (see below) before
anything is installed. Updating keeps the plugin's settings.

![The plugin catalogue, with one plugin installed and another listed with no installable version](/img/plugins-catalog.webp)

## Importing a plugin by hand

The **⋮** menu next to the catalog button has **Import a plugin**, for a `.fkplugin` (or `.zip`)
archive you have locally rather than from a catalog, useful for a plugin still in development or
one shared outside the official catalog. It goes through the same signature check and consent
step as a catalog install.

## Data vs. process plugins

Every plugin is one of two tiers, shown as a badge in the plugin list:

- **Data**: ships no program code at all (a settings page and a webhook, for instance). It cannot
  run anything on your server.
- **Process**: runs code, as a sandboxed WebAssembly component inside the Fliks server. It can make
  network requests (core refuses private and reserved addresses unless you consented to them at
  install) and add files to your library, but it has no access to your server's files beyond its
  own data folder, cannot read your server's secrets, and cannot reach another plugin's data or
  yours beyond what it's explicitly granted (see
  [Users and permissions](/administration/users-and-permissions) for how a plugin's own
  permissions show up in roles). A process plugin's **Metrics** panel shows its host calls,
  p95 latency, restarts, dropped events and memory use.

## Trust

Every plugin shows one of three trust badges, based on the archive's signature:

| Badge | Meaning |
|---|---|
| **Official** | Signed by the official Fliks release key, which is built into the server. |
| **Unverified** | Signed, but by a key Fliks doesn't recognize. |
| **Imported manually** | Not signed at all. Despite the name, this is about the missing signature, not where the file came from: a signed archive you import by hand still shows Official or Unverified. |

A signature confirms who published the archive; it says nothing about whether the code itself is
safe. A source's pinned key only vouches for that source's catalog, never for the archives in it, so
a plugin from your own catalog shows Unverified or Imported manually whatever you sign it with.
Installing anything other than an Official plugin requires ticking an explicit acknowledgement of
that before the install goes through. A process plugin that is not Official, signed or not, is
refused outright unless **Allow unsigned plugins** is on (see [Plugin settings](#plugin-settings)).
The consent screen also lists exactly what a plugin is asking to be able to do (its settings pages,
scheduled jobs, the parts of Fliks it can read or change, the folders it can add files under), so
you know before you install rather than after.

## Sources

**Manage sources** (in the **⋮** menu) lists every plugin catalog Fliks checks: the official one
is configured out of the box, and you can add others by URL, refresh one by hand, disable or
remove it. Sources also refresh on their own through the scheduled task. When adding a source you
can pin its signing key (a base64 public key, shown as "Pinned key" instead of "Official key"),
so the catalog document is checked against that key rather than refused as unverified. The pinned
key vouches for the catalog only; the archives it lists keep their own trust level.

## Plugin settings

The **⋮** menu's **Settings** covers how installation and updates behave overall:

| Setting | Default | What it does |
|---|---|---|
| Update plugins automatically | On | Once a day, after sources refresh, installs the newest version each source offers for a plugin you already have, but only when that version is signed by the official key. Anything else still waits for you to acknowledge it by hand. |
| Ignore the required Fliks version | Off | Installs and loads a plugin version even when it doesn't declare support for your Fliks version. The plugin API compatibility check still applies regardless. |
| Allow installing older versions | Off | Adds a version picker next to the catalog's install/update buttons, instead of always taking the newest. |
| Allow unsigned plugins | Off | Lets you install a process plugin that is not signed by the official key, mainly for developing your own. Turning it back off doesn't remove one already installed this way. |

An automatic update that asks for new permissions, or that fails to start, is not left half
applied. A version that asks for new permissions is held: the plugin keeps running its current
version and the list shows an **Update 1.2.0 held** badge (with the held version) until you install it by hand from the catalog
and review what it asks for. A version that fails to start is rolled back to the version that was
running, and held until you install it by hand.

## Enabling, disabling, uninstalling

Each row in the plugin list has an **Enabled** switch (stops the plugin without removing it) and
an **Uninstall** action. Disabling keeps everything. Uninstalling asks for confirmation, deletes
the plugin's settings, and **keeps its stored data** (its database tables and its data folder), so
installing it again picks up where it left off. The dialog lists the kept tables with their row
counts, and an **Also delete this plugin's data** box removes them for good. A plugin's kept data
is handed back only to a reinstall signed by the same publisher.

## Export

The **Export** action on a plugin's row downloads its settings and the contents of its database
tables as one JSON file, which you can restore into the same version of the plugin later. API keys
and passwords are left out unless you tick **Include secrets**, which writes them in clear: keep
that file private.

![The installed plugins list, showing the version, tier, trust badge and status of a plugin](/img/plugins-installed.webp)

## See also

- [Users and permissions](/administration/users-and-permissions) for how a plugin's declared
  permissions integrate with roles.
- [Settings](/administration/settings) for where the Plugins page sits among the rest of the
  admin area.
- [Backups](/administration/backups) for what a server backup includes of your plugins.
