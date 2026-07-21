## Overview
A seeded-race roguelike for 3–4 players. Everyone plays the *identical* procedurally-generated descent privately on their own phone, in parallel and in real time, racing to survive the deepest. The single point of interaction: when you find a **Hex** relic, you can fling it into a rival's run, where it materializes on their next floor. For anyone who's watched a roguelike "seeded race" and wished it were a party sport.

## Problem
Roguelikes are gloriously solo; the daily-seed race scene proves people love comparing runs of the same seed, but that comparison happens on separate machines, async, over leaderboards. The itch: make the same-seed race *live and social* in one room, with just enough sabotage to make your neighbor's groan of despair audible.

## How it works
Every player gets the same seed, so the sequence of floors, doors, and loot is identical for all — skill and nerve, not luck, separate you.

- **Privately, each phone shows:** your own descent — current floor card, your HP, your relics, and a choice (Fight / Sneak / Loot). It's a lean push-your-luck crawl: each floor reveals a threat; Fight risks HP for reward, Sneak is safe but forfeits loot, Loot gambles for relics. Your board is yours alone — nobody sees your HP or how deep you are except via the TV summary.
- **The shared TV shows:** a live **depth-o-meter** — one column per player sinking floor by floor — plus a scrolling **hex feed** ("Ana hexed Sam: Rusted Idol → floor 6") and a skull when someone dies. It's the shared drama board; it never shows anyone's HP or hand.
- **Hex flinging:** find a Hex relic and you get a one-time choice to keep it (a gamble — it's cursed) or fling it at a named rival, where it ambushes their next floor. The same-seed guarantee means you *know* what floor they're about to hit, so a well-timed hex on a known-nasty floor is devastating.

Deepest survivor when the timer or floor cap hits wins.

## Technical approach
- **Server:** authoritative WebSocket room holding the shared `seed`, `players[]` (`floor`, `hp`, `relics`, `alive`), and a `hexQueue` per player.
- **Data model:** floors are generated deterministically from `seed + floorIndex` via a shared PRNG, so the server never ships a full map — each client derives its own identical sequence. Only `hp/floor/choices/hexes` sync.
- **Sync strategy:** clients advance at their own pace; each floor resolution is sent to the server for validation (HP math authoritative server-side to prevent cheating). Hexes are server-routed into the target's queue and injected at their next `floor+1`.
- **Genuinely hard part:** keeping runs provably identical across phones from one seed while allowing asynchronous pacing — the PRNG and floor-gen must be pure and versioned so no two clients diverge, and the server must be the sole authority on HP and death.

## v1 scope
- 3–4 players, one seed, ~10 floors, three floor archetypes.
- One relic type that's a Hex; keep-or-fling as the only interaction.
- Depth-o-meter + hex feed + skull on the TV; deepest-survivor wins.

## Out of scope
- Real dungeon grid, movement, monsters with AI, item synergies beyond one hex.
- Multiple seeds, dailies, persistence, character classes.
- Reconnection/resume mid-run.

## Risks & unknowns
- Push-your-luck floors may be too shallow to feel roguelike — needs a real risk curve.
- One hex may be too weak or too swingy for interaction; tuning needed.
- Players racing head-down at phones may ignore the room; the TV feed must pull eyes up.

## Done means
4 phones join one seed, each privately crawls the same 10-floor descent in parallel, one player successfully flings a hex that provably lands on a rival's next floor, and the TV crowns the deepest survivor.
