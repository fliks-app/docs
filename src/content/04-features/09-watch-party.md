---
title: Watch party
description: Watch the same title in sync with other people, with chat, voice, a shared programme and votes on what to play.
---

## What a watch party is

A watch party is a room on your server where several users watch the same title together.
Playback is shared: when the film plays, pauses or seeks, everyone follows. The room also has a
chat, reactions, optional voice chat and a programme (the ordered list of titles to play).

Parties need Fliks 5.2 or later. Clients connected to an older server hide them.

## Who can use it

Three permissions, set per role under **Settings > Roles** (see
[Users and permissions](/administration/users-and-permissions#roles-and-permissions)):

| Permission | Allows |
|---|---|
| Create a party | Start a party and become its host |
| See public parties | See and join parties marked public |
| Manage parties | See every open party, and edit or end any party. Includes the two above |

**Admin** has all three, **User** the first two, **Readonly** only the second. Joining a party you
were added to or sent a link for needs no permission, only an account.

## Creating a party

Choose **Watch together** on a movie, an episode or a playlist, or **New party** on the **Watch
parties** row of the home page (a section you can hide in **App settings > Home**). The dialog asks
for:

- **A programme.** Add titles with the library picker (search, then pick a movie or episodes: one,
  from here on, a whole season or several). Or leave it empty and choose later, on the party page.
  A party made from a playlist copies its rows at that moment and does not follow later changes.
- **A name.**
- **A cover**: automatic (the first title's poster), one title, a mosaic of two to four titles, or an
  uploaded image.
- **When**: **Now**, or **Schedule** with a date and time.
- **Participants.** You can only add people you follow (see [Sharing and
  social](/features/sharing-and-social)).
- **Settings**: who controls playback (everyone, or only the host), reactions, chat, invite link
  sharing, and whether the party is public. Your last choices are remembered, except public, which
  starts off.

Every title in the programme must be one all participants can open. If one of them can't, Fliks
names who in the error.

## The party page

The party page opens as soon as the party exists, scheduled or not. It is the room: anyone who opens
it joins, so people can chat, talk and vote while waiting. It shows the cover, the host, the start
time with a countdown, the people present, the programme, the proposals, the voice channel and the
chat. Participants get a reminder 15 minutes before the start time. A scheduled party left empty
expires two hours after its start time.

Chat messages are kept with the party until it ends, so late arrivals see the recent history.

## Joining

- **Added by the host.** The party shows on your home page, with a notification for a scheduled
  one. There is nothing to accept: open it and join. **Leave the party** on its page removes you
  for good, until the host adds you again.
- **Invite link.** Any signed-in user of the server who opens the link joins. The host can regenerate
  the link, which locks out everyone who joined with the old one and cancels exclusions. With
  **Invite link sharing** off, only the host sees the link.
- **Public party.** A **Public** badge marks it. Anyone allowed to see public parties finds it on
  their home page and can join.

The host can exclude someone from the page. An excluded user can't rejoin until the link changes
or the host adds them again.

## Roles

- **Host**: the creator. Starts and ends the party, edits the programme, accepts proposals, changes
  settings, adds and excludes people. While the party is live the host can hand the role to a
  connected member from the people list. The role never moves on its own.
- **Participants**: everyone else. They propose and vote, chat, react, talk, and control playback
  unless the host reserved it. Whoever joined by link or public party is a participant too.

## Programme, proposals and votes

Each party has one programme, edited by the host on the party page: add, remove, reorder (drag, or
arrows on TV). It can be edited before and during the party. Titles a participant can't open are
shown as unavailable to them and skipped when the party moves on.

While the party is scheduled, any participant can **Suggest a film** from the library, and everyone
votes up or down. A tap on the count shows who voted. The author or the host removes a proposal.
The host presses **Accept** to move a proposal to the end of the programme (**Back to proposals**
reverses it).

If the programme is empty at the start, the most voted proposal plays: most votes for, then fewest
against. On a tie the host accepts one or **Draws lots** among the tied.

## Starting and synced playback

When the lobby is ready, each participant presses **I'm ready**. The host presses **Start** (Fliks
warns if some people aren't ready). The first title plays as soon as everyone has loaded it, after
10 seconds at most. People who were not ready stay on the page and use **Join** to enter the live
party later.

During playback, small drifts are corrected quietly and **Resync** realigns you with the group. With
**Everyone controls playback**, anyone can pause, seek or change title. When a title ends, the party
moves to the next programme item. A live party with nobody connected ends after 10 minutes.

## Chat, reactions and voice

- **Chat** has a panel beside or under the video and the same chat on the party page. Messages are
  limited to 500 characters. System lines record joins, votes, programme edits and setting changes.
  The host can turn chat off.
- **Reactions** are one-tap emojis that float over the video. Each device chooses which emojis are
  in its bar. The host can turn reactions off for the party.
- **Voice chat** is opt-in: **Join voice** from the party page or the player (up to 8 people). Your
  mic starts muted. Tap the mic button to toggle it, or hold it to talk only while pressed
  (press-to-talk). The film volume lowers when someone speaks, which you can turn off. On a
  device without a microphone you listen only.

## Casting, sharing and the calendar

A member can cast the party to a Chromecast: the receiver stays in sync, with reactions and chat
floating over it (see [Chromecast](/clients/chromecast)). **Share link** opens the system share
sheet, or copies the link where there is none. **Add to calendar** adds a scheduled party to your
calendar (native on phones, an `.ics` file elsewhere).

## Ending and leaving

- The host chooses **End the party** (**Cancel the party** before it starts) and confirms. It ends
  for everyone.
- On a live party, **Leave the party** in the player settings removes you from the room and the
  party goes on. For the host, the same action asks to confirm and ends the party for everyone.

## Which clients support it

| Client | Support |
|---|---|
| Web, mobile (iOS, Android), desktop | Full |
| Android TV, Samsung (Tizen), LG (webOS) | Full, with TV differences below |
| Apple TV | Lobby, programme, proposals, votes, chat, reactions. No voice, cover, public toggle or calendar |

On Android TV, Samsung and LG there is no **Share link** or **Add to calendar** button, voice is
listen only, and chat offers quick phrases (**Pause?**, **5 min**, **Wait for me**) beside the text
field. On Samsung and LG, drift is corrected by seeking only. Apple TV also lacks **Draw lots**.

## See also

- [Sharing and social](/features/sharing-and-social) for following people, who you can add.
- [Playlists](/features/playlists) to start a party from a playlist.
- [Clients overview](/clients/overview) and [Chromecast](/clients/chromecast).
