## Overview
Venn is a cooperative voice party game for 3–5 people in one room, played on a shared TV/laptop (the host) plus a phone per player (a private controller). It's for friend groups who like the frantic cross-talk of Spaceteam but want a wordy, deductive core instead of button-mashing.

## Problem
Most deduction games (Codenames, Wavelength) are quiet and turn-based — one person thinks while everyone waits. Party games that ARE loud (Quiplash) are creative-writing, not coordination. Nothing makes a whole room *merge private information out loud, simultaneously, against a clock*. The itch: the exact moment three people realize "wait — do we ALL have GLOVE?" and confirm it by yelling over each other.

## How it works
Each phone privately shows a hand of four words, e.g. ANCHOR · RIVER · GLOVE · MOTH. The server builds the hands so exactly one word appears on every single phone — the common ground — while other words overlap on *some but not all* phones to bait false consensus. No phone can see anyone else's hand. The host screen shows only a countdown and three empty, overlapping Venn rings.

To find the shared word, players must read their lists aloud and cross-check by voice: "I've got ANCHOR—" "no anchor here, I've got RIVER, MOTH—" "MOTH! I have MOTH." When a player believes they've found the universal word, they tap it on their phone. When every phone has tapped the *same* word, the rings snap together and the host counts 3-2-1; everyone shouts the word at once for a loudness-sync bonus.

Private (phone): your secret four-word hand, your current tap. Shared (host): timer, ring animation, and the final reveal of who held what.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object). State: `{ players: { id: { hand[4], guess } }, phase, deadline }`. Hands are dealt from a curated pool that guarantees one universal word plus tuned partial overlaps. Taps broadcast to the server, which checks unanimity. The unison shout: each phone streams mic RMS levels; the server flags peaks landing inside a ~400ms window. The genuinely hard part is **set generation** — producing hands with exactly one full-intersection word and enough near-miss partial overlaps to stay hard-but-solvable in ~60s — plus tolerance tuning so the unison-peak check survives phone-mic variance and room bleed.

## v1 scope
- 3 players, one round, one hand-set
- Fixed 90s deduction timer
- Win = all three tap the same correct word; the shout is a cosmetic bonus only
- ~20 hand-crafted three-hand sets

## Out of scope
- Speech recognition of the shout, scoring ladders, 4–5 players, "trap" rounds with no common word, decoy/lie mechanics

## Risks & unknowns
- Word sets too easy or unsolvable; unison peak false-positives from one loud player; players simply showing each other their phones (mitigate v1 with a face-up-is-cheating house rule; hide later)

## Done means
Three phones each receive a distinct four-word hand sharing exactly one word; players talk it out, all three independently tap that word, the host declares a win, and a simultaneous shout lights the bonus meter.
