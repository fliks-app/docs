---
title: Live TV
description: Turn an existing IPTV subscription into another row of channels, with a program guide and the ability to pause and rewind live playback.
---

## What it does

Live TV turns an IPTV subscription you already pay for into another row of channels inside Fliks.
A provider playlist or panel becomes a lineup with its own program guide, and pausing or rewinding
a few minutes on a live channel works the same way it does on the rest of the library.

> [!IMPORTANT]
> Fliks does not sell or supply any channels itself. You need a subscription from an IPTV provider
> before any of this is useful.

Everything below lives under **Settings > Live TV**, admin-only, across six tabs: **Sources**,
**Channels**, **Guide**, **Settings**, **Access** and **Health**. The **Live TV** entry only
appears in the main navigation once at least one channel is enabled and visible to the signed-in
account.

## Adding a source

Go to **Settings > Live TV > Sources > New source**. A source is one provider connection: add one
per subscription. Fliks supports two kinds:

- **M3U playlist**: either a playlist URL (re-fetched on every refresh) or an uploaded `.m3u`/
  `.m3u8` file for a provider that emails a file instead of a link. An uploaded file never updates
  itself; if the connection test detects it can be replaced by a self-refreshing link rebuilt from
  the file's own entries, it offers to swap it.
- **Xtream account**: a server URL (the panel address alone, nothing after the host), plus a
  username and password. Leaving the password blank while editing an existing source keeps the
  current one.

Optional on either kind: a user agent and a referer header, for providers that check them.

| Field | What it controls |
|---|---|
| Max simultaneous streams (0 = unlimited) | How many upstream connections *this source* may hold open at once, not how many people can watch: several viewers on the same channel share one upstream connection. The connection test or the first sync usually reads this from the account itself and locks the field; click **Override** to set your own number. |
| Refresh interval (hours) | How often the lineup is re-fetched. Default 12. |
| Include groups matching / Exclude groups matching | Regular expressions that filter which channel groups are kept. See below. |
| Source active | An inactive source is skipped by playback and the scheduler, but its channels and history stay. |

Fliks only ever keeps live channels from a playlist: any entry that looks like on-demand content
(the provider's own `/movie/` or `/series/` URL path) is dropped automatically, before any group
pattern is applied.

### Test before you save

**Test connection** probes the URL or the Xtream login without saving anything. On success it
reports the channel count, the number of groups found, whether a program guide was found, and (for
Xtream) how many simultaneous connections the account allows. If a pasted M3U link is actually an
Xtream panel in disguise, the result offers a one-click switch to the richer Xtream API.

On failure, the test only says it failed. The real reason (wrong credentials, an unreachable host,
a timeout) shows up once you save, as the source's own sync error.

### Group filters

A provider bouquet usually mixes channels for dozens of countries and genres under one playlist.
**Exclude groups matching** drops any channel whose group name matches the pattern:

```
adult|xxx|ppv|18\+
```

**Include groups matching** does the opposite: only matching groups are kept. To keep just two
groups out of a large bouquet:

```
^(News|Sport)$
```

Both fields are case-insensitive regular expressions tested as a substring against the provider's
group name, not an exact match (`sport` also matches "Sports HD"; anchor it with `^Sport$` for an
exact match). When both are set, exclude always wins. These filters only apply to live channel
groups: they play no part in dropping on-demand content, which Fliks already excludes on its own.

## Program guide (EPG)

**Settings > Live TV > Guide > New guide source.** Two kinds:

- **XMLTV feed**: a URL to an XMLTV document (a gzip-compressed one works too).
- **From a Live TV source**: pick one of the sources already added. Fliks reads whichever guide URL
  that provider publishes on its own (captured from the playlist's `x-tvg-url`/`url-tvg` header, or
  from the Xtream panel's guide endpoint) the last time that source was synced. If the source
  doesn't publish one, this fails; check with **Test connection** on the source itself.

Also on the form: refresh interval in hours (12 by default), a timezone offset in minutes (shifts
every program in the feed, for a feed whose clock differs from the channels' own timezone), and a
source-active switch.

### Automatic matching

Every feed's channels are matched against the lineup automatically, in three passes, weakest last:

1. **By ID**: the channel's own guide channel ID, if already set, matched exactly against the
   feed's channel id.
2. **By name**: both names normalized (case, accents, punctuation and quality noise like "HD" or
   "1080p" stripped), then compared.
3. **Fuzzy**: a similarity score over what's left of the name. Below a threshold, the channel is
   left unmatched rather than guessed at.

A channel matched by hand is never touched again by a later automatic pass.

The **Match report** on the Guide page shows how many channels landed in each bucket, plus every
unmatched channel with a search box: type part of the real channel name, pick the guide entry from
the suggestions, and save. That match is permanent for that channel. A guide channel ID can also be
typed directly into a channel's own edit form on the Channels tab.

## Managing channels

**Settings > Live TV > Channels.** Filter by group, source, active state, or search by name.

- The **Active** switch on each row: an inactive channel is invisible to every viewer and skipped
  by guide matching, but keeps its number, group and history.
- Editing a channel: name, number, group, guide channel ID (manual guide match) and a guide time
  shift in minutes (a per-channel version of the guide source's own timezone offset, for the one
  channel that airs shifted from the rest of its feed).
- **Bulk actions**: select rows, or "bulk-edit all matching channels" to act on everything the
  current filters match (only when the active/inactive filter is cleared). Enable, disable, set a
  group, or renumber from a starting number. Anything touching more than 50 channels asks for
  confirmation first.
- **Find duplicate channels** groups channels whose names normalize to the same thing (typically
  the same channel synced from two different sources) and offers **Merge**: pick which one stays,
  and the others become its backup streams, used for failover if the one that stays goes down.
- Favorites and hiding a channel are each viewer's own preference, set from the Live TV page itself.
  Hiding only changes what that one viewer sees, and is reversible any time; it is not the access
  control described next.

## Access control by channel group

**Settings > Live TV > Access** lists channel groups that are invisible by default and which users
have been granted access to each restricted group.

- A user who wasn't granted a restricted group never sees its channels at all, in any list, unlike
  hiding a channel yourself, which only affects that one viewer and is reversible.
- An empty restricted list means no filtering happens for anyone.
- Whoever administers Live TV always sees every group, regardless of grants.

**Adult groups are restricted automatically.** Every sync checks each live group's name against a
built-in pattern covering Fliks' six interface languages (whole-word matches such as `xxx`,
`sex`/`sexo`/`sexe`, `porn*`, `erotic`/`erotique`/`erotik`, `x-rated`, `adult*` other than "Adult
Swim", `18+`/`+18`) and adds a newly seen match to the restricted list. Unchecking one by hand keeps
it exempt from then on: the next sync won't restrict it again unless you recheck it yourself.

## Timeshift: pause and rewind live

A live channel behaves like a recording that keeps growing: pause it and resume from the same
spot, or jump back a few minutes to catch something you missed. How far back the buffer reaches is
an admin setting (`livetv_timeshift_minutes`, 15 minutes by default) described below.

## Settings

**Settings > Live TV > Settings** exposes tuning values as plain settings keys:

| Setting | Default | What it does |
|---|---|---|
| Guide retention (past / future) | 2 / 7 days | The guide window kept around "now". Programs outside it are dropped on ingest and pruned nightly. Widening the future window keeps more rows, re-ingested on every refresh. |
| Live segment length | 2 seconds | Length of each live HLS segment Fliks packages when it isn't serving the provider's stream byte-for-byte. |
| Timeshift buffer | 15 minutes | How far back the pause/rewind buffer reaches. Costs disk per open channel (roughly 528 KB per segment on a 2 Mbps channel). |
| Channel idle keep-warm | 30 seconds | How long a channel session with no viewer left is kept warm, so switching back to it is instant. |
| Stream probe window | 3 seconds | How long FFmpeg gets to probe a new stream before Fliks gives up on it. Raise it for a slow provider or a wide GOP. |
| Stale stream cleanup | 7 days | A stream absent from a sync for longer than this is deleted, along with anything only it fed. |
| Slot release delay | 15 seconds | How long a just-closed upstream connection still counts against the source's max simultaneous streams limit. |

> [!NOTE]
> These are also readable and writable through the generic settings API (`GET`/`PUT
> /api/settings/<key>`), except the restricted-groups list, which must go through the dedicated
> access endpoints so grant cleanup happens correctly.

## Troubleshooting

| Symptom | Why |
|---|---|
| Test connection just says it failed | It never gives a detailed reason. Save the source (or wait for the scheduled sync) and check the source's own sync error: an Xtream login reports "authentication refused by the provider" on a bad username or password, a playlist URL reports a plain connection or timeout error. |
| An expired or suspended provider account | Fliks doesn't check this proactively. Once a sync has read the account's status and expiry date, they're shown next to the source as information only; nothing is enforced. |
| Zero channels on a source's first sync | Not an error; the provider's playlist is genuinely empty. Confirmed by **Test connection**. |
| A sync suddenly returns under half the channels it had before | Refused outright; the previous lineup is kept untouched. Treated as a provider rate limit or an error page mistaken for the real playlist. The sync error explains why nothing changed. |
| "has reached its limit of N simultaneous streams" | The source's max simultaneous streams cap is fully used, including connections that closed in the last few seconds (the slot release delay). Wait, close another stream from that source, or raise the limit. |
| "Unable to start this channel" | Either every source feeding it was removed, or every stream it has failed to open. Check the **Health** tab: consecutive-failure count per channel, and per stream, when it last worked and its last error. |

## See also

- [Streaming and transcoding](/features/streaming-and-transcoding) for how a live stream is decided
  between a byte-exact copy and a transcode.
- [Playback](/features/playback) for how resume and track switching work outside of Live TV.
