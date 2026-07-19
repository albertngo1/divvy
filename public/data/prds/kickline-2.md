## Overview
A physical hidden-role game for 4-6 players. Everyone performs the same short clap/stomp/gesture routine in unison to a shared metronome. One player's routine is secretly one gesture off — and they don't know it. The host TV is just a metronome; each phone is a private choreography lane.

## Problem
Social deduction is nearly all talking, and "the imposter knows they're the imposter" throws away the best tension. Here the tell is your BODY in real time. And because no phone ever displays the 'true' routine, the imposter can't verify that theirs is the odd one — a genuinely subtly-different private view.

## How it works
- The server deals an 8-count routine: each beat is one gesture (clap, stomp, raise-L, raise-R, spin, freeze). Innocents get identical routines; the imposter's has exactly ONE beat swapped.
- Each phone PRIVATELY shows a scrolling lane — the next 2-3 beats of gestures with a moving playhead, synced to the metronome. You only ever see YOUR lane.
- The host TV shows only a big count-in and pulse (1-2-3-4-5-6-7-8), no gestures — so there is NO public ground truth to check against.
- Everyone performs the routine physically, in the room, looping ~4 times at a walkable tempo, watching each other's bodies. On the swapped beat the imposter does the wrong move — but so might a nervous innocent, and since nobody sees the master routine, a fumble looks as damning as a genuine mismatch.
- After the loops, each phone PRIVATELY shows a vote grid; secretly vote for who broke formation. The group wins if the majority tags the imposter. The imposter, following their own lane faithfully, votes too — often for an innocent who looked shaky.

Private phones are load-bearing: every player reads a DIFFERENT private lane and performs at the same instant — impossible with one shared or passed phone. The simultaneity and the privacy ARE the game.

## Technical approach
- Host tab + phone PWAs + authoritative WebSocket server (PartyKit).
- Sync is the hard real-time problem. The server broadcasts a start timestamp + BPM; each phone runs a local Web Audio scheduler seeded to server time and re-syncs drift every 8 beats via a lightweight ping/offset (NTP-ish). Phones must stay within ~50ms so playheads agree.
- Data model: Routine = [gesture x8]; per-player routineId; the imposter's is the canonical routine with one index mutated to a different gesture.
- Rendering: big glyph + label per beat in the scrolling lane, with a haptic tick on the beat.
- Hard part: cross-device beat alignment on cheap phones plus audio latency, and picking a tempo slow enough to perform yet fast enough that fumbles stay ambiguous.

## v1 scope
- 4 players, one imposter, one hand-authored 8-count routine + one 1-beat mutation.
- Fixed BPM (~90), 4 loops, 6 gesture types.
- Single private vote, binary reveal.

## Out of scope
- Multiple imposters, custom routines, any camera/pose detection (all judging is by human eye), streak scoring, backing tracks.

## Risks & unknowns
- Clock sync across devices is make-or-break; jitter could make everyone look off-beat.
- Swap too visible → imposter instantly caught; too subtle → no one notices.
- Physically-shy groups may under-perform; the tempo has to feel inviting, not intimidating.

## Done means
- 4 phones show synced private lanes (3 identical, 1 with one swapped beat) within a perceptible-but-tight beat window, players perform 4 loops, all cast a private vote, and the server reveals whether the group caught the mutated-routine dancer — in one standing playtest.
