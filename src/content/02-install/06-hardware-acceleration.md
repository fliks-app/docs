---
title: Hardware acceleration
description: Which GPU paths Fliks supports, how it picks one automatically, and how to give it access on each platform.
---

## How detection works

Fliks probes for hardware acceleration once, at server startup, by actually running a one-frame
encode through FFmpeg for each candidate and seeing which one succeeds. It never assumes a GPU
path works just because a device file exists; whichever probe passes first wins, and if none do,
it falls back to CPU (software) encoding. The probe order is fixed per platform:

| Platform | Probe order |
|---|---|
| Linux | Intel QSV → VAAPI → NVIDIA NVENC → CPU |
| Windows | Intel QSV → AMD AMF → NVIDIA NVENC → CPU |
| macOS | Apple VideoToolbox → CPU |

You don't choose a path yourself; you give the server access to a device (see below) and it
takes care of the rest. The [Transcoding dashboard](/administration/transcoding-dashboard) shows
which path an active stream is actually using.

## Codec support by path

| Codec | CPU | Intel QSV | VAAPI | NVIDIA NVENC | AMD AMF | VideoToolbox |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| H.264 | Yes | Yes | Yes | Yes | Yes | Yes |
| HEVC | Yes | Yes | Yes | Yes | Yes | Yes |
| AV1 | Yes | Yes | Yes | Yes | Yes | No |

HDR10, HLG and Dolby Vision are tone-mapped to SDR automatically when the receiving device can't
render HDR itself, on whichever path is active (including CPU).

## Docker: Intel QSV / VAAPI

Pass the render node through as a device:

```yaml
services:
  fliks:
    devices:
      - /dev/dri:/dev/dri
```

## Docker: NVIDIA NVENC

Needs the NVIDIA Container Toolkit installed on the host:

```yaml
services:
  fliks:
    runtime: nvidia
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      # video = NVENC/NVDEC, compute = the CUDA filters (scale_cuda),
      # utility = nvidia-smi
      NVIDIA_DRIVER_CAPABILITIES: compute,video,utility
```

## Docker: architecture note

The Intel and NVIDIA stacks are `amd64`-only. On `arm64` (a Raspberry Pi 5, an ARM NAS), the
image still pulls and runs fine, but every transcode falls back to CPU.

## Windows and macOS

Both native builds detect hardware automatically at launch: QSV, AMF or NVENC on Windows
(NVENC needs an NVIDIA driver `570` or newer), VideoToolbox on macOS. Nothing to configure; see
[Windows](/install/windows) and [macOS](/install/macos).

## Multi-GPU hosts

On a host with more than one GPU, **Settings > Streaming** shows a GPU device picker (hidden
automatically when only one GPU is detected) listing every render node Fliks found, so you can
pin transcoding to a specific adapter instead of letting it auto-pick. This is the admin-facing
equivalent of the `streaming_gpu_render_node` setting.

Two related low-level knobs, only worth touching when the automatic pick lands on the wrong
device:

| Variable | What it does |
|---|---|
| `FLIKS_OPENCL_DEVICE` | Pins the `platform.device` OpenCL selector (e.g. `0.0`) used for HDR tone-mapping on the NVENC/CPU path, when auto-pick chooses the wrong vendor on a mixed Intel+NVIDIA host. |
| `THUMB_HWACCEL_DEVICE` | Which render node generates thumbnails during a scan: `off` to force software, or a specific render node. |

## Subtitle burn-in and cropping

Two situations force a step down from the detected hardware path, by design rather than as a
bug:

- Burning subtitles into the video needs the frame in regular CPU memory (the library that draws
  them can't reach GPU surfaces), so any stream that burns in subtitles runs on CPU, except on
  VideoToolbox, whose decode already lands in CPU-accessible buffers.
- Cropping black bars on Intel QSV sometimes requires a detour through VAAPI on Linux, because
  QSV's own frame pool can't take the variably-sized output crop produces in every situation.

Both fall back automatically; you won't see an error, just a different path in the streaming
dashboard than you might expect.

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for how Fliks decides between
  Direct Play, remux and transcode in the first place.
- [Transcoding dashboard](/administration/transcoding-dashboard) to see which path each active
  stream is actually using.
- [Environment variables](/install/environment-variables) for the full list, including the
  streaming tunables that live in **Settings > Streaming** instead.
