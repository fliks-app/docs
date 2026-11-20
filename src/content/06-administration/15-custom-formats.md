---
title: Custom formats
description: Add or subtract points on releases that match a pattern, such as a codec, a release group or a word in the name, and test them on a release title.
---

> [!NOTE]
> **Do you need this?** Only if you use [requests](/features/requests) or the download plugin, and only if you want
> to push the choice between releases of the same quality one way or the other. Quality profiles work without a
> single custom format. Playback never reads them.

## What it is for

Quality alone does not tell two releases apart: two 1080p WEB-DL files can be a good encode and a bad one.
A custom format is a named test with a score. When a release matches it, the score is added to that release.
Higher totals rank first among releases of the same quality, and a negative total can push a release
out altogether.

Typical uses:

- Prefer a codec (HEVC) or a release group you trust: give it a positive score.
- Avoid a flaw (hardcoded subtitles, a bad group): give it a negative score.
- Refuse a flaw outright: give it a very negative score and keep the profile's minimum at 0.

Custom formats are global. They are not attached to a profile. Every format scores every release, and each
[quality profile](/administration/quality-profiles) only sets the minimum total it accepts.

## Where to find it

**Settings > Custom formats**, in the **Media** section of the admin sidebar. You need the **Settings access**
permission. The page lists your formats (name, score, number of conditions) and, under them, the **Test a
release title** box.

## Create a format

:::steps
![Open **Settings > Custom formats**](/img/admin-cformat-1-sidebar.webp)
![Click **New format**. A fresh server has none](/img/admin-cformat-2-new.webp)
![Type a **Name** and a **Score**, then click **Add a condition**](/img/admin-cformat-3-add.webp)
![Pick the condition type, the operator and the value, then click **Save**](/img/admin-cformat-4-spec.webp)
![The format shows its score and its number of conditions](/img/admin-cformat-5-saved.webp)
![Type a release title in **Test a release title** and click **Test** to see which formats match and the points each adds](/img/admin-cformat-6-test.webp)
:::

To change a format, click its name. To remove it, click **Delete** and confirm. Deleting a format removes its
points from future searches at once.

## Every field

| Field | What it does |
|---|---|
| **Name** | A label, required. |
| **Score** | A whole number, positive or negative. Default 0. It is added to every release that matches the format. |
| **Conditions** | The tests. A format needs at least one. **Add a condition** adds a row; the cross on a row removes it. |

Each condition row has a type, an operator and a value.

| Type | Operator | Value | Matches |
|---|---|---|---|
| **Release name (regex)** | contains / does not contain | A regular expression | The release title, ignoring case. The pattern must compile, or the form refuses to save. |
| **Source** | is / is not | remux, bluray, web-dl, webrip, hdtv, dvd, sdtv, cam, ts, tc | The source read from the title. |
| **Resolution** | is / is not | 4320p, 2160p, 1080p, 720p, 576p, 480p, 360p | The resolution read from the title. |
| **Language** | is / is not | A language code from the list | A language read from the title. A title with no language tag counts as English. |
| **Release flag** | is / is not | freeleech, halfleech | A flag set by the indexer. |
| **Release group** | is / is not | Free text | The group at the end of the title, for example `GROUP` in `Movie.2024.1080p.WEB-DL-GROUP`. |
| **Edition** | is / is not | Director's Cut, Extended, Theatrical, Uncut, Remastered, Criterion, IMAX | The edition read from the title. |
| **Video codec** | is / is not | h265, h264, av1, vp9, xvid, mpeg2 | The codec read from the title. |
| **Audio codec** | is / is not | truehd, dts-hd, dts, eac3, ac3, flac, aac, opus, mp3 | The audio codec read from the title. |

Separators are ignored when comparing a value, so `web-dl`, `WEB.DL` and `webdl` are the same.

On a row, **Always required** appears once the format has two or more conditions of the same type.

## How conditions combine

Read the hint at the bottom of the form: conditions of the same type are alternatives, different types must all
hold.

- Two **Video codec** conditions (h265, av1): one match is enough.
- A **Video codec** and a **Source** condition: both groups must match.
- **Always required** on a condition: that one must hold on its own, even when the others of its type match.
- **is not** and **does not contain** invert the condition. A format whose only condition is negated matches
  every release that does not have the property.
- A pattern that does not compile matches nothing, so a negated one holds. The form prevents saving such a
  pattern.

## How scores are used

1. Every format that matches a release adds its score. The total is the release's custom format score, shown
   in the **CF** column of the manual release list.
2. If the total is under the profile's **Minimum custom format score**, the release is refused. With the default of 0,
   only a negative total refuses.
3. Among releases of the same quality, a higher total sorts first. The score never lifts a lower quality above a
   higher one: quality rank is compared first.

## Test a release title

Under the list, **Test a release title** shows exactly how your formats read a title. Paste a release name, tick
**Treat as freeleech** if you want to test a flag, and click **Test**. The table lists every format with **Yes** or
**No** and the points it adds. Use it before relying on a new format: it runs the same matcher as a real search.

## Worked example: prefer HEVC, avoid hardcoded subtitles

1. Create **Prefer HEVC** with score `50` and one condition: **Video codec** is `h265`.
2. Create **Avoid hardcoded subtitles** with score `-200` and one condition: **Release name (regex)** contains
   `\b(HC|hardsub|hardcoded)\b`.
3. Test `Movie.Name.2024.1080p.WEB-DL.x265.HC-GROUP`. Both match, for a total of -150.

With the minimum score left at 0, that release is refused. A plain `Movie.Name.2024.1080p.WEB-DL.x265-GROUP` totals
+50 and ranks above an equal release without HEVC.

## How it connects

- [Quality profiles](/administration/quality-profiles) set the minimum total a release must reach.
- [Quality definitions](/administration/quality-definitions) are checked separately, on size.
- [Downloads](/administration/downloads) runs the automatic searches that score releases.
