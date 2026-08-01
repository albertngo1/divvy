## Overview

Shoulder Surf is a 4–6 player Chameleon riff built for a TV plus a phone per person. Everyone types a one-word clue simultaneously; the hidden Chameleon's phone shows every other player's clue *as it is being typed*, delayed by exactly two seconds — deletions and all. For groups who already like Chameleon, Codenames or Spyfall and are tired of turn order deciding the round.

## Problem

Chameleon's imposter is starved of information and then handed a jackpot: clues arrive one at a time, so the first speaker is guessing blind and the last speaker is basically told the answer. Turn order, not cunning, decides the round. Worse, once you learn you're the Chameleon there is no *act* of bluffing — just a wait, then one sentence. The honest players, meanwhile, have nothing to do but be vague.

## How it works

**Host screen:** a 4×4 grid of 16 related words (e.g. 16 breakfast foods).

**Phones (private):** every non-Chameleon sees that same grid with one cell lit — the secret. The Chameleon sees the grid unlit, plus a *surveillance pane*.

**Typing window (45s):** each player types one clue (≤12 chars) on their own phone. Every keystroke, including backspaces, streams to the server. The Chameleon's surveillance pane replays each other player's live text buffer 2000 ms of event time behind — including their deletions, replayed as they happened.

**Host screen, publicly:** a content-free *activity trace* per player — keystroke-rate sparkline, a red tick per backspace, a green lock on submit. No letters ever reach the TV. The room sees "Dana typed nine characters and deleted all of them" and has to decide what that means.

Because everyone knows a Chameleon may be watching, the honest players' real move is deliberate garbage: type WAFFLE, hold it, backspace it, submit CEREAL. But decoying costs you backspace ticks on the public trace — and looking like you're decoying is exactly what a Chameleon fishing for cover looks like.

At the deadline all clues reveal at once. 60s of talk, then a private simultaneous vote on phones, revealed together. If caught, the Chameleon gets one tap-a-cell guess at the secret.

## Technical approach

PartyKit / Cloudflare Durable Object, one DO per room, authoritative. State: `{phase, grid[16], secretIdx, chameleonId, players: {id, name, buffer, submitted, vote}}`. Keystrokes are events `{playerId, seq, op: 'ins'|'del', ch}` stamped with a *server* monotonic timestamp on receipt — client clocks are never trusted.

The Chameleon feed is a server-side delay queue: events flush to the Chameleon's socket only when `now - t_server >= 2000`. The host socket receives 200 ms aggregates containing counts only. Clue content is filtered at the DO per-socket authorization boundary, not in the client — a non-Chameleon's WebSocket must never carry a character someone else typed.

The genuinely hard part is making the 2 s delay *feel* like exactly 2 s under jitter: a player on 400 ms RTT would otherwise see 2.4 s. Fix with a server-scheduled flush plus a client render clock anchored by ping offset, buffering (never fast-forwarding) on a hiccup. Second hard part is the obvious exploit — type your whole clue in the last 300 ms and the Chameleon sees nothing. The public trace turns that into a tell: "submitted, 6 keystrokes, at 0:44" is loudly visible on the TV.

## v1 scope

- One round. Exactly 4 players. Five hardcoded 4×4 grids.
- Room-code join, no accounts, no reconnect, no lobby.
- 45s type → simultaneous reveal → 60s talk → one private vote → results screen.
- Delay fixed at 2000 ms, not configurable.
- Custom on-screen A–Z keypad (see Risks), 12-char cap.
- Scoring printed as plain text: Chameleon +3 uncaught, +2 if caught but names the secret, +1 each to the others if caught.

## Out of scope

Multi-round series and running scores; custom word packs; spectators; reconnect/resume; audio; animation beyond the trace; >6 players; i18n; any anti-cheat against players physically looking at each other's screens.

## Risks & unknowns

Mobile keyboards are the big one: swipe typing and autocorrect emit whole words at once, which destroys both the drip-feed and the trace texture — hence the custom keypad in v1, which costs some typing comfort. Unknown whether 2 s is generous or stingy. The Chameleon may be cognitively swamped reading three live feeds while composing their own clue. And first-time honest players may not think to type decoys; a single line of on-screen prompting may be needed to teach the counterplay.

## Done means

Four phones and a TV run one round start to finish. The Chameleon can read a rival's clue aloud at least 1.5 s before the public reveal. Backspaces appear on the host trace within 300 ms. Inspecting the raw WebSocket frames on a non-Chameleon client shows zero characters of anyone else's clue. And in a live playtest, at least one honest player types a decoy and deletes it without having been told to.
