## Overview

A 4-player hidden-role deduction game for a living room with a TV and four phones. The room is jointly reconstructing a small logic puzzle from private fragments. Three players hold true fragments. One holds a phone that *looks identical* — same three fact cards, same layout — except the cards are regenerated after every public claim so they remain consistent with everything said so far. The imposter can never be caught in a contradiction. That is the whole design problem the innocents must solve.

## Problem

Every hidden-role game where the imposter sees a wrong view degenerates into contradiction-hunting: say enough things, wait for the odd one out. It's a waiting game and the imposter's job is just to talk less. This flips it. The imposter is *guaranteed* consistent, so contradiction-hunting is worthless, and deduction becomes about coverage: which claims have zero public constraint on them, and who's willing to spend their own private fragment to bait.

## How it works

Hidden truth: 5 guests, each with one drink and one seat (5!×5! = 14,400 possible worlds; the server picks one).

Each innocent phone privately shows 3 true facts ("Priya is drinking gin", "seat 4 is not Marcus"). The imposter's phone shows 3 fact cards drawn from a *random world still consistent with every public claim, including their own*.

On your turn you build a claim on your phone with three taps (subject / relation / value) and it appears on the shared TV, attributed. The TV shows only the public claim log and a "worlds remaining" counter that ticks down as the space narrows. It never shows anyone's fragment.

After each public claim the server re-solves and quietly reissues the imposter's unspoken cards. No animation, no flicker — the imposter watches their own hand change and must not react.

The crack: the regenerator only knows *public* claims. If the imposter speaks into a region nobody has constrained, it may hand them a fact that flatly contradicts a card an innocent is still holding back. So the innocent play is to sit on your best fragment, steer talk toward it, and spring it. Spending it as bait also spends it as information.

After 8 claims everyone votes on one phone, simultaneously. Innocents win on a majority; the imposter wins otherwise.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. State: `{world, fragments: {playerId: Fact[]}, publicClaims: Claim[], imposterId}`. Claims are structured (enum subject × relation × value), never free text, so the solver can consume them.

Solver: enumerate all 14,400 worlds once at room start, filter by public claims after each turn (a few ms in JS). Imposter cards = 3 facts sampled from one surviving world, pinned so any fact they already spoke stays fixed.

Hard part: reissue must be *silent and stable*. Cards that are still true in the new world must keep identical DOM position and text; only genuinely dead cards swap, and they swap on the same frame the TV renders the new claim, so the imposter's screen change is masked by the room looking at the TV.

## v1 scope

- Exactly 4 players, 1 round, 8 claims, one puzzle domain (guests/drinks/seats)
- 5×5×5 hardcoded generator, brute-force solver
- Tap-to-build claim UI, 6 buttons total
- Simultaneous vote, single reveal screen
- No lobby: room code, no accounts, no reconnect

## Out of scope

More than 4 players, multiple rounds, scoring across games, extra puzzle domains, free-text claims, spectators, the imposter's own accusation power.

## Risks & unknowns

The regenerator may be *too* strong — if it always finds a surviving world, the imposter is unfalsifiable and innocents lose 100%. Mitigation lever: cap the imposter to 2 cards, or force a claim every turn so they must speak into thin constraint. Second risk: the silent rewrite is noticeable and creates a physical tell (imposter double-taking); playtest whether that's a bug or the best part.

## Done means

Four phones join by code; three see stable true fragments and one sees cards that provably differ from the seed world; a claim entered on any phone updates the TV and the worlds counter within 300ms; the imposter's cards can be shown post-game to have been rewritten at least twice while never contradicting the public log; the vote resolves and the reveal screen replays the imposter's card history.
