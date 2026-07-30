## Overview

A 4-player riff on **Wavelength**. One Clue-Giver sees the hidden target band; the other three are Setters who don't get their own dials — they all grip *the same* needle, continuously, from three phones at once. The TV shows only the aggregate. For groups who like Wavelength's arguing but find the single-dial-plus-committee-shouting phase limp.

## Problem

In Wavelength the physical dial is held by one person, so the negotiation is purely verbal and the loudest player wins by default. Everyone else's conviction is invisible and costless. There's no way to *feel* dissent, and no private information for anyone but the psychic.

## How it works

TV shows a spectrum ("Overrated ← → Underrated") and one needle at 50.

The **Clue-Giver's phone** privately shows the target band (width 8 on 0–100). They type one word; it posts to the TV. Then they're silent.

Each **Setter's phone** becomes a full-screen vertical drag surface. Where their thumb sits *is* their desired needle position, streamed at 20Hz. The **TV needle is the median of the three live positions** — the room sees the resultant only. Nobody knows who is pulling, or how hard.

Each Setter's phone also privately holds one **exclusion band** (width 15), guaranteed not to contain the target. Bands differ per player and are never shown — not even to their owner. All the phone does: when the *live needle* enters your band, the screen floods red and buzzes, continuously, until it leaves. That's your entire private channel.

So you feel the needle drifting somewhere you know is dead, you haul against it, and the room watches the needle stall and shudder with no idea whose hand it is. "Someone's fighting me." You can talk — but that's the only way to convert private certainty into group action.

**Lock:** needle stays within ±2 for 2.5s. **Score:** 4/2/0 by distance to the target band, **minus 2** if the locked position sits inside *any* Setter's exclusion band. Silent knowledge is punished, so being outvoted without speaking costs the whole room.

## Technical approach

PartyKit / Socket.IO Durable Object per room. Setters send `{pos, seq}` on rAF-throttled pointermove at ~20Hz. Server keeps last-known position per setter, freezes a value stale >500ms, computes the median at 30Hz, and emits two stream types: a public `needle` to the host, and a private per-socket frame `{needle, inMyBand:boolean}`. Band bounds are **never sent to the client** before reveal — devtools must show nothing exploitable.

Hard part: making a shared needle feel physical over living-room wifi. Server-side one-euro filter on each input, host renders from a ~100ms interpolation buffer so a dropped packet doesn't jitter, and lock detection runs on the smoothed server value, never raw. Median (not mean) so one troll can't drag the room.

Model: `{spectrum, targetCenter, clue, setters:{id,pos,bandLo,bandHi}, needle, lockMs}`.

## v1 scope

- Exactly 4 players: 1 Giver, 3 Setters.
- One spectrum from a list of 12, one clue word, one round.
- Bands generated non-overlapping with the target.
- Lock → reveal → single score. No rotation, no rounds.

## Out of scope

Rotating the Giver, multi-round, teams, custom spectra, spectators, mid-drag reconnect, iOS haptics parity.

## Risks & unknowns

iOS Safari has no `navigator.vibrate` — the red flood must carry it alone. A phone that sleeps mid-round silently changes the median; the staleness policy has to feel fair, not arbitrary. Is a 3-way median too mushy to steer? Does the exclusion band produce real argument or just "guys, not there"? Pure playtest questions.

## Done means

Three phones drag one TV needle at <150ms perceived latency. Frame inspection confirms each phone's red alert fires only for its own band and no band bounds cross the wire. A round locks, reveals, and scores including the exclusion penalty. Sleeping one phone mid-round does not freeze or crash the needle.
