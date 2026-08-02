## Overview

A 90-second physical scavenge for 3–4 people in one room, played with a host TV and a phone each. Every phone privately holds one procurement spec. The room is the warehouse, and most specs can be satisfied by the same three obvious objects — so the game is not "can you find it" but "can you get to it without anyone else naming it too."

## Problem

Scavenger party games are races, and races reward the fastest hand. Nobody talks, nobody schemes, and the person nearest the kitchen wins. There's no reason to negotiate, because there's no cost to two people wanting the same thing. We want the room's shared inventory to be genuinely scarce and the collision to be loud and public.

## How it works

Each phone privately shows a **spec**: a predicate like *something with a battery*, *something that came into the room in a pocket*, *something that makes noise when shaken*. Specs are secretly drawn so that at least two of them can be satisfied by the same likely household objects.

To claim, you **type the object's name into your phone** ("salt shaker", "tv remote") and hit CLAIM — then physically fetch it and put it in front of you. Typing is private; nobody sees your text or your spec.

The server normalizes and fuzzy-matches every claim string. If two claims match within the round, the object is **burned**: the host TV announces the object's name in huge red type, plays a klaxon, and both claimants score zero for it and may not re-claim. It does *not* say who collided — only what died. So the room learns which objects are hot and immediately panics toward the remaining ones.

Talking is the only way to avoid a burn ("don't take the remote, I need it"), but saying that leaks your spec, and the round ends with a 20-second **guess phase**: each phone privately names one rival and picks their spec from a 5-option list. A correct guess steals that rival's points.

Host TV shows: timer, a live burn ledger of dead object names, and final scoring. Phones show: your spec, your claim box, your burn/success status, and the guess ballot.

## Technical approach

PartyKit Durable Object per room. State: `{players: {id, spec, claim: {raw, normalized, tMs}, burned}, burnedObjects[], phase}`. Phones are a PWA over WebSocket; the host tab is a read-only subscriber rendering room state.

The hard part is **matching**: normalize (lowercase, strip articles/plurals), then Levenshtein ≤2 plus a tiny synonym table (`remote|clicker|tv remote`). Too loose and "cup" burns "cup holder"; too tight and two people both take the remote and nothing happens. Near-miss burns are a feature, but they must feel fair, so the TV always shows both raw strings on burn. Claims resolve server-side in arrival order; simultaneous arrivals are ordered by server receipt, not client clock.

## v1 scope

- 3 players, one 90-second round
- 12 hand-written specs, drawn with guaranteed overlap
- Type-to-claim, one claim per player, no re-claims
- Burn detection + klaxon + red name on TV
- Guess phase, then a flat score screen

## Out of scope

Photos, object verification, multiple rounds, spectator voting on whether an object really matches, spec difficulty tiers, remote play.

## Risks & unknowns

Fuzzy matching may feel arbitrary; specs may be unsatisfiable in a sparse room; players might just shout everything and defeat the secrecy layer (the guess phase is the counterweight and may be too weak).

## Done means

Three phones join by room code, each shows a different secret spec, two players type names that fuzzy-match, the TV burns the object by name within 300ms, both score zero, and the guess phase resolves into a final scoreboard.
