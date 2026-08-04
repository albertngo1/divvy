## Overview

A 4-player game about the scarcity of attention, for anyone who has watched a sports multiview or four TikToks at once and absorbed nothing. The TV shows four small, muted clips playing simultaneously. Comprehension is a purchasable good, and you're bidding against your friends for it.

## Problem

Group viewing is a single shared channel — everyone sees the same thing, so any quiz about it is pure recall trivia and the loudest recaller wins. There's no *allocation* decision. Meanwhile the actual modern experience of consuming media is choosing what to ignore, and no party game has made ignoring things the play.

## How it works

**Setup:** four 90-second clips, laid out as a quad box on the host screen. All four are muted and small. From the couch you can tell roughly what each one *is* — a cooking video, an interview, a nature doc, a local news segment — but not what happens in it.

**Buy phase (20s, sealed):** each phone privately shows the four quadrant labels and 5 chips. You allocate chips across quadrants. This is a sealed bid; the host screen shows only "locked in" pips.

**Watch phase (90s):** every phone privately renders the quadrants you bought — full-bleed, zoomed, with audio through that phone's speaker (or earbuds). Buy one quadrant with 5 chips and you get it huge and loud; spread across three and each is small and you're switching audio manually with a tab bar. Players who bought nothing see the same tiny mute grid the TV shows. Room audio is a mess of three phones playing different things, which is the point.

**Quiz:** four questions, one per quadrant, in random order. Each is answered privately on every phone. A correct answer splits a 12-point pot among everyone who got it right — so if three people all bought quadrant 2 and all answer correctly, they each get 4. Guessing from the mute grid occasionally lands and steals a share.

The tension: covering an unbought quadrant is worth the most and is the loneliest bet. The room can feel a hole opening — everyone can see nobody's watching #4 — but saying so out loud invites a rival to cover it, and you can't verify anyone's claim about what they bought.

## Technical approach

Host tab + phone PWAs, Socket.IO server behind Tailscale Serve.

Data model: `Room { clips[4], phase, masterClockMs }`, `Player { chips, allocation:number[4], answers[] }`. Bids never leave the server until the buy phase closes.

Sync: the host tab is the clock master and broadcasts `masterClockMs` at 5Hz. Each phone plays its own `<video>` elements of the same source files and corrects drift by nudging `playbackRate` between 0.97 and 1.03 rather than seeking, so audio never clicks. Phones only instantiate video elements for quadrants they bought — decoder pressure and bandwidth stay bounded.

Hard part: four independent devices, up to three decoders each, staying within ~200ms of the TV so the room's cross-talk feels like one shared moment. Mobile Safari's autoplay-with-audio gesture requirement means every phone must arm playback with a tap during the buy phase or the watch phase starts silent.

## v1 scope

- Four hardcoded 90-second clips, self-hosted mp4
- 4 players, 5 chips, one buy phase, one watch phase
- Four multiple-choice questions, one per quadrant
- Pot-splitting scoreboard, allocations revealed at the end

## Out of scope

- Rebuying mid-clip, chip carryover, multiple rounds
- Auto-generated questions
- More or fewer than four quadrants

## Risks & unknowns

- Three phones playing different audio in one room may be genuinely unpleasant rather than funny; may need headphones as a hard requirement.
- Drift correction across four devices on home wifi is unproven at 200ms.
- Multiple-choice may make mute-grid guessing too strong.

## Done means

Four phones stay within 200ms of the host through a 90-second quad playback, at least one quadrant goes unbought and its question is missed by everyone, and the reveal screen shows at least two players having doubled up on the same quadrant and split a pot they both regret.
