## Overview
Failsafe is a real-time cooperative "defuse" for 3-4 players — host screen plus a phone each. The bomb is split into modules: each phone privately owns one module you can operate but whose *rulebook* lives on someone else's phone. Nobody can solve their own module, so you must read rules aloud to each other — while the modules keep drifting underneath you.

## Problem
Keep Talking and Nobody Explodes puts one person on the bomb and everyone else in a manual — the manual-holders are passengers with nothing to touch. The itch: make *everyone* simultaneously hands-on AND indispensable, with continuous real-time pressure instead of one-shot lookups.

## How it works
Each phone privately shows one module — e.g. a dial you can rotate, three colored wires you can cut, a keypad. You also privately hold a *rule card* for a DIFFERENT player's module ("if the dial is in the red zone, cut the wire matching the blinking light"). To act, you must have your rulebook-holder narrate your rule while you describe what you see; then you do the same for them. The twist that keeps it real-time: modules *drift* on their own — the dial creeps, lights re-blink every few seconds — so a rule read ten seconds ago is stale and must be re-checked, forcing constant voice re-sync. The host screen shows shared global state some rules reference (master timer, strike counter, a pulsing core temperature); 3 strikes = boom.

Private per-phone: your module controls and your rule card are both yours alone and mismatched on purpose — one phone passed around collapses the whole interdependence. Shared host: timer, strikes, global gauges, win/lose.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Game {timer, strikes, globals{}, modules[]}; Module {ownerId, type, state, ruleHolderId, solved}. Phones send intents (rotate, cut, press) to the server; the server validates against each module's hidden solve condition, applies strikes, and drifts module state on a tick (every ~2-3s it mutates dials/lights and broadcasts). Sync strategy: server-authoritative state; phones render their own module + rule card from pushed diffs. Drift must land on all clients near-simultaneously so a rule stays true long enough to act on. Genuinely hard part: the drift-vs-latency balance — drift fast enough to force re-coordination, slow enough that a correctly-read rule isn't already stale by the time the player's tap arrives.

## v1 scope
- 3 players, 3 modules (dial, wires, keypad), one bomb, 3-minute timer.
- Each player owns one module + holds one rule card; drift on a 3s tick.
- Host shows timer + strikes; win on all solved, lose on 3 strikes.

## Out of scope
- Module variety beyond three, randomized rulebooks, difficulty tiers.
- Reconnect, >4 players, cross-round scoring.
- Any audio/voice sensing — voice is human-to-human, not detected.

## Risks & unknowns
- Drift timing is a knife-edge; wrong and it's either trivial or infuriating.
- Three module types may be too thin for replay.
- Teaching the read-your-neighbor's-rule loop fast enough at a party.

## Done means
Three phones each drive one drifting module using a rule only a teammate can read aloud, and the team defuses (or busts on 3 strikes) within 3 minutes — the "re-read mine, the dial moved!" tension lands on the first play.
