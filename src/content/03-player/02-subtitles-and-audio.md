---
title: Audio and subtitles
description: Pick an audio or subtitle track in the player, fix subtitle timing with the synchronize panel, and set how subtitles look.
---

> [!SUMMARY]
> In the player, **Audio** and **Subtitles** pick a track; the gear in the subtitle list opens appearance and the synchronize panel for subtitles that are early or late. Defaults live in **App settings**.

## Pick an audio track

The **Audio** button (headphones) is in the bottom row of the bar. It appears only when the file
has more than one audio track.

![The audio track list of a file with two tracks, MP3 2.0 and AC3 5.1](/img/player-menu-audio.webp)

Pick a track and the sound changes without a restart. A track the device cannot play is greyed
out and says **Not supported on this device**. When the language is unknown the track is called
**Track 1**, **Track 2** and so on, with the codec and the channel layout under it.

You can also choose before pressing play: on the title page, the **Audio** list next to **Video**
sets the track the player starts with.

## Subtitles in the player

Everything below happens in the player's dropdowns: the **Subtitles** list and its settings. To
search, download, import or delete subtitle files, use the
[Edit subtitles dialog of the title page](/features/subtitles#managing-subtitles-from-the-title-page).

### Pick a subtitle track

The **Subtitles** button (a caption icon) is next to **Speed**. It appears only when the title
has at least one subtitle track.

![The subtitle list in the player: Off, German, English, Spanish, French, Italian, Dutch](/img/player-menu-subtitles.webp)

Choose **Off** or a language. Text subtitles switch on instantly. A track marked **image** is a
picture of the text: it forces the server to burn it into the video, which restarts the stream as
a transcode. Those tracks are hidden by default, see
[Burned-in subtitles](/features/subtitles#burned-in-subtitles).

Your choice is remembered on this device, and it carries over to the other episodes of a
series. To choose before pressing play, use the **Subtitles** list on the title page.

![The Subtitles list on a title page](/img/player-detail-subtitle-picker.webp)

### Subtitle settings

The small gear at the top right of the subtitle list opens the subtitle settings: the
[appearance options](#change-how-subtitles-look) and the
[synchronize panel](#fix-the-timing-while-you-watch).

Show the controls and open **Subtitles**, then the gear at the top right of the list. The settings hold the **Appearance** rows and **Open synchronize panel**.

![Subtitles menu, then the gear, then the synchronize panel](/img/player-menu-subtitles-anim.webp)

### Fix the timing while you watch

If a subtitle is early or late, you can slide it against the picture without leaving the player.

Pick the track, open the gear at the top right of the **Subtitles** list, then **Open synchronize panel**.
The example below fixes an imported English file that shows its lines about 2.5 seconds late.

:::steps
![Open **Subtitles**, choose the track (here the imported English file), then press the gear at the top right of the list](/img/player-sync-1.webp)
![Choose **Open synchronize panel**](/img/player-sync-2.webp)
![The cues are listed on a timeline. Drag the list, or scroll it, to move them against the picture](/img/player-sync-3.webp)
![The badge shows the shift (here -2.62 s) and **Save** is enabled. Press **Save**](/img/player-subtitle-sync.webp)
![A **Processing applied successfully** message confirms the file was rewritten](/img/player-sync-4.webp)
:::

This needs the **Manage subtitles** permission and a text track. It is not offered while casting.
If no subtitle is on, opening the panel picks the first text track.

:::details What the synchronize panel offers
The panel lists the cues on a timeline that follows the video, with a time ruler and a chevron on
each side marking the current moment. The subtitles on the picture update as you move them.

- **Move the timing.** Scroll the list, drag it with the mouse, or swipe on a touch screen. A badge
  shows the shift. With a keyboard or a TV remote, press Enter or OK on the timeline, then Up and
  Down shift by 100 ms (holding the key speeds it up). Esc or Back ends the adjustment.
- **Save** applies the shift to the file, like **Adjust timing** in the dialog. **Reset** drops it.
- **Synchronize on other track** runs the automatic sync against the audio, another subtitle track
  or a subtitle file. A running sync shows a spinner and can be cancelled from the panel or from
  the **Edit subtitles** dialog. How it works is in
  [Fixing out-of-sync subtitles](/features/subtitles#fixing-out-of-sync-subtitles).
- The track picker at the top switches to another text track. Switching or closing with an
  unsaved shift asks you to confirm.

An embedded track can be previewed here but not saved: the panel says so, and **Save** and
**Synchronize on other track** stay disabled. Download or import a separate file to save a shift.
**Save** is also disabled until the timeline has been moved. On a phone the panel opens as a sheet, with icon buttons instead of text.
:::

### Change how subtitles look

Size, color, shadow, background and position are settings of your device, not of the title.

Open the user menu (your avatar, top right), then **App settings**, then **Subtitles** in the left list.

![User menu, App settings, Subtitles](/img/player-user-menu-anim.webp)

Or change them while you watch: **Subtitles**, then the gear, then **Appearance** rows.

![The Appearance list in the player: text size, text color, drop shadow, background color, top and bottom position](/img/player-menu-subtitle-appearance.webp)

:::details Every subtitle setting of App settings
| Setting | Options |
|---|---|
| Preferred subtitle language | Any language |
| Subtitle mode | Off, forced only, smart (the default: a full track when the audio is in another language, only the forced track when it is already in your preferred language), always |
| Hearing-impaired subtitles (SDH) | Avoid (default), no preference, prefer |
| Remember subtitle selections | On (default) or off; remembered per show |
| Hide image subtitles | On by default: keeps PGS and VobSub tracks out of the picker on this device, and keeps styled ASS/SSA from being [burned in](/features/subtitles#burned-in-subtitles) |
| Show the file format | Adds SRT, VTT, ASS and so on next to each track in the picker |
| Text size | Very small to extra large |
| Text color | White, yellow, green, cyan |
| Drop shadow | None, drop shadow, outline, raised |
| Background color | Transparent, semi-transparent black, black |
| Subtitle position | Bottom edge and top edge positions |
:::

**Clear saved track selections**, at the bottom of **App settings > Subtitles**, forgets the
track you picked for each title.

> [!NOTE]
> None of this changes how an image-based track looks, or an ASS/SSA track that keeps its own
> styling: those keep their original appearance.

:::details Which tracks play first
When you open something new, Fliks picks the audio and subtitle track from your settings. The
audio rules are in **App settings > Playback**.

![The App settings > Playback page: audio selection rule and its related toggles](/img/app-settings-playback.webp)

| Setting | Options | Default |
|---|---|---|
| Preferred audio language | Any language | None |
| Audio selection | Preferred language, title's original language, file's default track, or first audio track | File's default track |
| Remember audio selections | On or off | On |

When the chosen rule finds no match, the first audio track plays. Your own pick in the player
always wins, and is remembered per device for that title.
:::
