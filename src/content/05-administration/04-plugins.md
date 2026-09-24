---
title: Plugins
description: Install, trust and manage the plugins that extend what Fliks can do, from the admin side.
---

## Why plugins exist

Fliks ships with no way to acquire media on its own. Everything that adds one, most notably the
download plugin (torrent indexer search, download-client management, the grab pipeline), is
installed separately from **Settings > Plugins**. This page covers installing and managing them;
writing one is covered in the separate developer documentation.

## Installing from the catalog

**Search for a plugin** opens the catalog browser: every plugin your configured sources publish,
searchable, with what's already installed and its available versions. Installing shows a consent
step first (see below) before anything is written to disk.

## Importing a plugin by hand

The **⋮** menu next to the catalog button has **Import a plugin**, for a `.fkplugin` (or `.zip`)
archive you have locally rather than from a catalog, useful for a plugin still in development or
one shared outside the official catalog.

## Data vs. process plugins

Every plugin is one of two tiers, shown as a badge in the plugin list:

- **Data**: ships no program code at all (a static catalog, for instance). It cannot run
  anything on your server.
- **Process**: runs in its own child process, under its own restricted file access. It can reach
  your network and add files to your library, but it cannot read your server's secrets, and it
  cannot reach another plugin's data or yours beyond what it's explicitly granted (see
  [Users and permissions](/administration/users-and-permissions) for how a plugin's own
  permissions show up in roles). A process plugin's row has an expandable metrics panel showing
  its resource use.

## Trust

Every plugin shows one of three trust badges:

| Badge | Meaning |
|---|---|
| **Official** | Signed by the source's own key: this exact archive is the one the catalog published. |
| **Unverified** | No signature Fliks can attribute, or one from a key it doesn't recognize. |
| **Imported manually** | Installed from a local file rather than a catalog; not signature-checked the same way. |

A signature confirms who published the archive; it says nothing about whether the code itself is
safe. Installing anything other than an Official plugin requires ticking an explicit
acknowledgement of that before the install goes through. The consent screen also lists exactly
what a process plugin is asking to be able to do, so you know before you install rather than
after.

## Sources

**Manage sources** lists every plugin catalog Fliks checks: the official one is configured out of
the box, and you can add others by URL. A source can pin its own signing key (shown as "Pinned
key" instead of "Official key") if it isn't the official catalog but you still want its archives
signature-checked against a known key rather than treated as unverified.

## Plugin settings

The **⋮** menu's **Settings** covers how installation and updates behave overall:

| Setting | Default | What it does |
|---|---|---|
| Update plugins automatically | On | Once a day, after sources refresh, installs the newest version each source offers for a plugin you already have, but only when that version is signed by the source's own catalogue. Anything else still waits for you to acknowledge it by hand. |
| Ignore the required Fliks version | Off | Installs and loads a plugin version even when it doesn't declare support for your Fliks version. The plugin API compatibility check still applies regardless. |
| Allow installing older versions | Off | Adds a version picker next to the catalog's install/update buttons, instead of always taking the newest. |
| Allow unsigned plugins | Off | Lets you install a plugin with no signature at all, mainly for developing your own. Turning it back off doesn't remove one already installed this way. |

## Enabling, disabling, uninstalling

Each installed plugin has its own enabled toggle (stops it without removing it) and an uninstall
action in the plugin list.

## See also

- [Users and permissions](/administration/users-and-permissions) for how a plugin's declared
  permissions integrate with roles.
- [Settings](/administration/settings) for where the Plugins page sits among the rest of the
  admin area.
