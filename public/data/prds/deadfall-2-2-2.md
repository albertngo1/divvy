## Overview
Deadfall is a team-vs-team concurrent-room party game for 4 players (two teams of two), riffing on *Trapwords*. One team races to communicate a target word; the opposing team has pre-seeded a hidden minefield of forbidden clue words. The novel angle: the trappers plant their mines **blind to their own teammate**, so overlap wastes ammunition. For groups who love Taboo but want the "banned words" to be an opponent's ambush instead of a printed list.

## Problem
Taboo's forbidden words are public and static. The itch Deadfall scratches is dread: the clue-giver must describe a word while stepping through a field they cannot see, and the trappers get the delicious asymmetry of watching someone walk toward a mine they buried. Per-phone privacy is the whole game — if the minefield were visible to the clue-giver, there's no game.

## How it works
**Setup (private, per phone):** The server gives both teams the same target word category and reveals the target only to Team A. Each of Team B's two players **privately** picks 3 mine words they expect Team A to lean on — and crucially neither Team-B phone shows the other's picks. The union becomes the hidden minefield (duplicates collapse, wasting a slot — the anti-coordination tension).

**Play:** Team A's clue-giver types clues on their phone; each word appears on the shared TV one at a time for their guesser to read and shout answers. The server auto-checks every typed word against the hidden minefield. Hit a mine → the TV detonates it (the mine word is publicly revealed, +1 strike). Team A wins if the guesser says the target before 3 strikes; Team B wins on the 3rd detonation or a timeout.

What each surface shows: **TV** = clue stream, strike counter, timer, detonated mines. **Clue-giver phone** = the target + a text box (never the mines). **Guesser phone** = a guess box. **Team-B phones** = their own private 3 mines during setup, then a spectator strike view.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `Round{target, category, mines:Set, strikes, phase}`, per-player role/visibility flags. Sync: barrier on mine submission (play starts only when both trappers commit); clue words stream via server, which does normalized matching (lowercase, stem, plural-fold) against the mine set and broadcasts detonations. Hard part: fair fuzzy mine-matching — "erupts" should probably trip the "erupt" mine but "erupt" shouldn't nuke everything; needs a transparent, agreed stemming rule shown at detonation.

## v1 scope
- 4 players, fixed 2v2, one target word, one round.
- Each trapper privately picks exactly 3 mines, blind to teammate.
- Typed-clue stream to TV, auto-detect, 3-strike loss.
- Simple stem/plural normalization shown on each detonation.

## Out of scope
- Multiple rounds, role rotation, score across games.
- Live speech capture (v1 is typed clues only).
- Human-judged synonym mines, difficulty tiers.

## Risks & unknowns
- Typed clues are slower/less fun than spoken Taboo — does it kill pace?
- Fuzzy matching disputes ("that shouldn't have counted").
- Blind double-picking may frustrate more than delight if overlap is common.

## Done means
Four phones join as 2v2; both trappers privately submit 3 mines each (unseen by teammate); Team A's clue-giver streams typed clues to the TV; the server correctly detonates on normalized mine matches, tracks 3 strikes, and declares the right winner on target-guess or 3rd detonation.
