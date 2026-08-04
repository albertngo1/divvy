## Overview

A **Wavelength** riff for 3 players that deletes the psychic. The TV shows one spectrum ("cold ← a shower → scalding") and nothing else. Each phone privately shows a narrow **target zone** on that spectrum — different per player, sometimes overlapping, sometimes disjoint. The room talks, then all three lock a dial at once. The committed needle is the **median** of the three locks. You score only if the median lands in *your* zone.

## Problem

Wavelength's tension is one person straining to encode a number in a word. It's brilliant and it's also a spotlight: one player works, three players wait, and the guessers converge on whoever talks loudest. The itch is a version where every player is simultaneously encoding, and the disagreement is *structural* rather than a matter of who's better at reading the psychic.

## How it works

1. TV: one spectrum with two endpoint labels, a blank 0–100 track, and a shared subject ("a shower").
2. Each phone privately shows a 14-wide target zone. Nobody knows anyone else's, and nobody knows how much they overlap.
3. **Speech rule, enforced socially and stated on the TV:** you may only advocate by naming example items and asserting where they sit. "A hotel shower." "Tea you'd sip." No numbers, no left/right, no "more", no "less".
4. ~90 seconds of talking. Then every phone shows the dial at once; all three drag privately, and all three lock simultaneously. No phone shows anyone else's position, live or otherwise.
5. TV animates the three locks landing, then the median needle. Each player scores 2 if the median is in their zone, 1 if within 8 of it. Zones are revealed last, together, so the argument's whole geometry lands at once.

The reason phones are load-bearing: three private zones, three simultaneous hidden dials, and a median that nobody can compute because nobody knows two of the three inputs. Passing one phone around collapses every one of those.

## Technical approach

Host tab + phone PWAs + authoritative WebSocket room (PartyKit Durable Object; Socket.IO over Tailscale Serve for a self-hosted build).

Data model: `Round {subject, axis:{leftLabel, rightLabel}, zones: {playerId → [lo,hi]}, locks: {playerId → int}, phase}`. Zones are generated server-side with a controlled overlap parameter and are never broadcast until reveal.

Sync: the dial value lives only on the phone until lock; the server receives one integer per player. Phase transitions (`talk → dial → locked → reveal`) are server-driven with a countdown, and the host renders from server state only.

The hard part isn't throughput — it's **simultaneity of commitment**. If lock order leaks, the last locker plays a different game (they can't see values, but a visible "2 of 3 locked" badge is still information about hesitation). Fix: the host shows a single aggregate "waiting…" with no count, phones get no confirmation of others, and the server holds all locks until the last arrives or the timer expires. Late/disconnected players auto-lock at their last dragged value.

## v1 scope

- Exactly 3 players, one host tab, room code join.
- **One round.** One spectrum, one subject, hardcoded from a list of 20.
- Fixed 14-wide zones, server-picked with guaranteed pairwise overlap on at least one pair.
- Median scoring, one reveal animation, then game over.
- Speech rule is text on the TV. No enforcement.

## Out of scope

Teams, 4+ players, multiple rounds, custom spectrums, any audio, mic-based rule enforcement, persistent scores, reconnect.

## Risks & unknowns

- Median may be too forgiving: if two zones overlap, the third player is structurally doomed and knows it by round two. May need zone sizes to vary or scoring to reward being the median-mover specifically.
- The example-only speech rule is the whole flavor and is entirely unenforced; if the room drifts into "a bit hotter" the game becomes ordinary.
- 90 seconds may be far too long for one dial.

## Done means

Three phones join, each shows a different hidden zone on the same TV spectrum, all three dial and lock with no leaked information about the others, and the TV reveals three locks, the median needle, and all three zones in one animation with correct scores.
