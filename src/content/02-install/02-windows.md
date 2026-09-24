---
title: Windows
description: Run Fliks as a native Windows system-tray app, with hardware transcoding and no separate dependencies to install.
---

## What you get

A lightweight system-tray app that runs the Fliks server natively on Windows, with hardware
transcoding through Intel QSV, AMD AMF or NVIDIA NVENC, auto-detected at startup. It bundles its
own Node.js, PostgreSQL and FFmpeg: there is nothing else to install. The tray app itself is a
C#/.NET 8 WinForms application; the server underneath it is the same backend as every other
install method.

## Install

Download the installer from the
[latest release](https://github.com/fliks-app/fliks/releases) (the
`Fliks-Server-<version>-x64.exe` asset) and run it. It needs 64-bit Windows 10 or 11. It
installs per-user, with no administrator prompt, into `%LOCALAPPDATA%\Programs\Fliks`.

> [!NOTE]
> Releases are only Authenticode-signed when the project's signing certificate is configured in
> CI. An unsigned installer makes Windows SmartScreen warn that the app is unrecognized; choose
> **More info > Run anyway** to continue.

## What happens on launch

1. PostgreSQL 18 initializes on first run and starts on port `5433`.
2. Node.js starts the backend on port `4848`.
3. On the very first launch only, your browser opens `http://localhost:4848`.
4. Hardware transcoding is auto-detected, in this order: **QSV > AMF > NVENC > CPU**. NVENC needs
   an NVIDIA driver `570` or newer; on an older driver it's skipped and NVIDIA hardware falls back
   to CPU. AMD runs a full GPU pipeline (D3D11 decode, scale, AMF encode) on the bundled FFmpeg.

## Tray menu

| Action | What it does |
|---|---|
| Open Fliks | Opens the web UI in your default browser. |
| Start at Login | Toggles auto-start, stored in the per-user `Run` registry key. |
| Restart Server | Stops and restarts PostgreSQL and Node.js. |
| View Logs… | Opens the log folder in Explorer. |
| Quit Fliks | Gracefully shuts down every process. |

## Data locations

| Path | Contents |
|---|---|
| `%LOCALAPPDATA%\Fliks\postgresql\` | The database cluster. |
| `%LOCALAPPDATA%\Fliks\conf\` | The JWT secret and `tray-settings.json`, which holds the web port (`Port`, default `4848`) and the database port (`PgPort`, default `5433`). |
| `%LOCALAPPDATA%\Fliks\data\` | Backend working directory: images, thumbnails, backups. |
| `%LOCALAPPDATA%\Fliks\logs\` | Backend and PostgreSQL logs. |
| `%LOCALAPPDATA%\Fliks\transcode\` | The HLS transcode cache, ephemeral. |

Uninstalling the app through Windows' own uninstaller leaves this data in place; the app itself
is removed from `%LOCALAPPDATA%\Programs\Fliks`.

> [!NOTE]
> On versions up to 4.1.x, in-app [backups](/administration/backups) need `pg_dump`, which the app
> doesn't put on the server's `PATH`. They only work if a PostgreSQL client of the same major
> version (or newer) is installed and on the system `PATH`.

## Clean reset

To wipe everything and start over, close Fliks first, then in PowerShell:

```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Fliks"
```

## First run

Continue with the [Quick start](/getting-started/quick-start): open `http://localhost:4848`, log
in with the default account, and add your first library. Point it at any folder on disk; there's
no container mount to think about on this install method.

## See also

- [Hardware acceleration](/install/hardware-acceleration) for what each detected GPU path
  actually does.
- [Updating](/install/updating) for how to move to a newer release.
