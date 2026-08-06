## Overview
A three-player fair-division game about petty real-world stakes: who gets the aux cord, who does the dishes, who gets the last slice. It is the classic "I cut, you choose" procedure — but generalized past two people, where doing it with actual objects on an actual table is unbearable. Each phone holds a private valuation, so the room never argues about points; it only watches the split happen and reads the hesitation.

## Problem
Cake-cutting is a beautiful mechanic and a miserable tabletop experience. Real valuations have to be spoken aloud (which destroys them), written on slips (which is slow and cheatable), or negotiated (which is just the loudest person winning). Meanwhile the actual drama — *the cutter's split leaks what the cutter wants* — gets buried under bookkeeping.

## How it works
1. **TV** shows six lots: absurd, free, real-life privileges ("first shower tomorrow", "one free interruption", "skip one turn of dishes").
2. **Phase 1 — Valuation.** Every phone privately spends exactly 100 points across the six lots via sliders. Nobody sees anyone's numbers, ever, until the end. TV shows only three green "locked" pips.
3. **Phase 2 — The Cut.** The server names one Cutter. The Cutter's phone shows the six lots *annotated with their own private point values* and lets them drag lots into three bundles. The TV mirrors the bundles live — lot names only, no numbers — so the room watches items get moved, moved back, and hovered over. That hesitation is the tell.
4. **Phase 3 — The Claim.** The two non-Cutters privately, simultaneously tap one bundle. The Cutter takes whatever is unclaimed.
5. **Collision rule.** If both non-Cutters claim the same bundle, neither gets it — the Cutter takes it and the two split the remains. This turns "pick the best bundle" into "pick the bundle the other person is scared to take."
6. **Reveal.** TV animates every private valuation at once as a heatmap, scores each player against what they actually received, and prints the envy line: "Priya would have paid 40 more for bundle C."

## Technical approach
Host browser tab + phone PWAs + one PartyKit Durable Object per room code (fallback: Socket.IO over Tailscale Serve). State: `{roomCode, phase, lots[6], valuations: Map<playerId, number[6]>, cutterId, bundles: number[6] (lotIndex→bundleId), claims: Map<playerId, bundleId>}`. The server is authoritative and *view-filtered*: the valuation map is never serialized to any socket except its owner until `phase === 'reveal'`, so a curious player opening devtools sees nothing. The Cutter's drag stream is throttled to ~10 Hz and broadcast to the TV as `{lotIndex, bundleId}` deltas only — the annotation numbers are rendered client-side on the Cutter's device and never leave it. Claims are commit-only: writes accepted while `phase==='claim'`, then a server-side barrier flips to reveal when both land or a 20s shot clock expires (timeout = claim the lowest-index bundle). The genuinely hard part is leak-proofing without killing liveness: the TV must feel like it is watching the Cutter think, while the payload carrying that feeling contains zero valuation data.

## v1 scope
- Exactly 3 players, 1 Cutter, 1 round, no rematch flow.
- 6 hardcoded lots from a static list of ~20.
- Sliders that hard-clamp to a 100-point total.
- Collision rule + final heatmap reveal.

## Out of scope
- 4+ players (needs last-diminisher, not one cut).
- Multi-round scoring, rotating Cutter, envy-free guarantees.
- Photographing real objects as lots; accounts; reconnect recovery.

## Risks & unknowns
- Sliders summing to 100 may feel like homework — test a 5-tap ranking fallback.
- With 3 players the collision game may collapse to "always take the biggest bundle"; may need to hide bundle sizes.
- Cutter role may be strictly more fun than claimer, which is bad for a one-round v1.

## Done means
Three phones in one room complete a round in under four minutes with no spoken numbers; the reveal screen correctly shows each player's own point total for what they received; and a player inspecting their WebSocket frames before reveal cannot find another player's valuation array.
