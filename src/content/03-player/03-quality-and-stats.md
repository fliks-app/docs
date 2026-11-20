---
title: Quality and playback stats
description: Choose a quality, understand Direct Play, Remux and transcoding in plain words, read the stats overlay, and what to try when playback stutters.
---

## Choose a quality

Show the controls and open **Settings** (the gear), choose **Quality**, then a row of the list. The check mark shows the current one.

![Settings, then Quality, then a row of the list](/img/player-menu-settings-anim.webp)

The list starts with **Auto**, then the resolutions the title can be sent at, from the original
down to 144p. A row marked **Low bandwidth** is a lighter version meant for a slow connection.
The entry only shows when the title offers more than one quality.

- **Auto** lets Fliks decide. Depending on an admin setting it plays the file as it is whenever it
  can, or adapts the quality to your connection while you watch.
- A resolution you pick yourself stays fixed for the rest of the playback. Fliks does not switch
  it behind your back.

The ladder, the low-bandwidth rows and what **Auto** does are explained in
[Streaming and transcoding](/features/streaming-and-transcoding#picking-a-quality).

## Direct play, remux and transcode

Each time you press play, Fliks checks what your device can handle and picks the lightest way to
send the video:

| What it is called | In plain words |
|---|---|
| **Direct Play** | The file is sent as it is. Nothing is converted. Best quality, no work for the server. |
| **Remux** | The picture is untouched but repackaged into a container your device understands. Almost no load on the server. |
| **Transcode** | The server converts the video (and sometimes the audio) to something your device can play. It uses the processor or the graphics card of the server. |

Audio is judged on its own. A video can be Direct Play while its audio is converted, for example
when the device cannot play AC3 sound.

The full rules, including what always forces a transcode, are in
[Streaming and transcoding](/features/streaming-and-transcoding#the-three-ways-a-file-can-be-sent).

## The stats overlay

**Settings**, then **Stats for nerds**, shows a panel at the top left of the picture. It stays
until you close it with the cross. On a phone, use **Settings** in the bar, then **Stats for nerds**.

![The stats overlay on top of the video: a remuxed container, a Direct Play video and a transcoded audio track, each with its reason](/img/player-stats.webp)

| Block | What it tells you |
|---|---|
| **Stream** | The container and bitrate of the file, and how it reaches you: **Direct Play**, **Remux** or **Transcode**. A **Reasons** line says why it was not Direct Play. |
| **Video** | Resolution, codec and bitrate, the profile and frame rate, what is done to the picture (**Direct Play**, or the transcode and its reason), and **Dropped frames**. |
| **Audio** | The track, its codec and channels, the bitrate, the sample rate, and what is done to the sound. |

In the screenshot, the container (MKV) is not supported by the browser, so the file is
repackaged (**Remux**). The picture is untouched. The AC3 sound is converted to AAC because the
browser cannot play AC3. Nothing is wrong: this is the normal, cheap path.

A live TV channel adds a **Live** block with how far behind live you are.

## When playback stutters

Try these in order. Each is quick.

1. **Pick a lower quality.** **Settings**, **Quality**, then a smaller resolution or a
   **Low bandwidth** row. If it plays smoothly, the connection or the server was the limit.
2. **Open the stats.** Look at the **Reasons** lines. A transcode that runs slowly points at the
   server. A high **Dropped frames** count points at the device, which struggles to decode the
   video.
3. **Check where you are.** On a remote connection, the upload speed of the server limits the
   quality. Stay on **Auto** or pick a lower one.
4. **Avoid image subtitles.** A PGS or VobSub track is burned into the video, which forces a
   transcode. A text subtitle costs nothing.
5. **Ask the admin.** Hardware acceleration, transcode slots and the playback quality dashboard
   are server settings. See [Playback quality](/administration/playback-quality) for the admin
   view of stalls and their causes, and
   [Hardware acceleration](/install/hardware-acceleration) for the server side.

A message in the player (**Playback failed**, **Network error during playback**, **Video decoding
error**, **Unsupported video format**) comes with **Technical details** and a **Copy info**
button. Include that text when you report a problem.

## Speed

The **Speed** button (`1x`) next to **Settings** sets the speed from 0.25x to 2x in steps of 0.25.

![The speed list, from 0.25x to 2x](/img/player-menu-speed.webp)

`<` and `>` on a keyboard slow down and speed up. The button is hidden during a
[watch party](/features/watch-party), where everyone must stay in step.
