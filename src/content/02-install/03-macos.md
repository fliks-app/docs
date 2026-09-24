---
title: macOS
description: Run Fliks as a native macOS menu-bar app, with VideoToolbox hardware acceleration and no separate dependencies to install.
---

## What you get

A lightweight menu-bar app that runs the Fliks server natively on macOS, with hardware
transcoding through Apple's VideoToolbox, auto-detected at startup. It bundles PostgreSQL,
FFmpeg and Node.js: there is nothing else to install. Requires Apple Silicon and macOS 13
(Ventura) or newer.

## Install

Download the `Fliks-Server-<version>-arm64.dmg` asset from the
[latest release](https://github.com/fliks-app/fliks/releases), open it and drag **Fliks Server**
to Applications. A film icon appears in the menu bar once it runs. Official builds are signed
with a Developer ID certificate and notarized, so Gatekeeper opens them without a warning.

## What happens on launch

1. PostgreSQL 18 initializes on first run and starts on port `5433`.
2. Node.js starts the backend on port `4848`.
3. On the very first launch only, your browser opens `http://localhost:4848`.
4. VideoToolbox hardware acceleration is auto-detected.

## Menu bar

| Action | What it does |
|---|---|
| Open Fliks | Opens the web UI in your default browser. |
| Start at Login | Toggles auto-start on macOS login. |
| Restart Server | Stops and restarts PostgreSQL and Node.js. |
| View Logs... | Opens the log directory in Finder. |
| Quit Fliks | Gracefully shuts down every process. |

## Data locations

| Path | Contents |
|---|---|
| `~/Library/Application Support/Fliks/postgresql/` | The database cluster. |
| `~/Library/Application Support/Fliks/conf/` | The auto-generated JWT secret. |
| `~/Library/Application Support/Fliks/data/` | Backend working directory: artwork, avatars, backups. |
| `~/Library/Application Support/Fliks/logs/` | Backend and PostgreSQL logs. |
| `/tmp/transcode/` | The HLS transcode cache, ephemeral. |

> [!NOTE]
> On versions up to 4.1.x, in-app [backups](/administration/backups) need `pg_dump`, which the app
> doesn't bundle. They only work if a PostgreSQL client of the same major version (or newer) is
> installed in `/opt/homebrew/bin` or `/usr/local/bin`.

## Clean reset

To wipe everything and start over, quit Fliks first, then in Terminal:

```bash
rm -rf ~/Library/Application\ Support/Fliks
```

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://localhost:4848`, log
in with the default account, and add your first library. Point it at any folder on disk; there's
no container mount to think about on this install method.

## See also

- [Hardware acceleration](/install/hardware-acceleration) for what VideoToolbox actually
  accelerates.
- [Updating](/install/updating) for how to move to a newer release.
