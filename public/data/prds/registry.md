## Overview
A blind gift-draft party game for 3–4 players. It keeps classic simultaneous booster-draft mechanics but inverts the target: every card you draft goes into your *neighbor's* hidden tableau, guided only by a private hint — and you can't see your own incoming gifts until the end. Host TV plus a phone per player.

## Problem
Drafting in person is slow — packs wheel around the table, everyone waits on the slowest picker, and the signal-reading that makes it interesting is invisible. And "build a hand for someone else" is flat-out impossible face-to-face, because you'd see the cards landing in front of you. Private phones make the blindness enforceable and the picking simultaneous.

## How it works
Setup: each player secretly receives an **objective** ("a cohesive dinner menu", "the most chaotic outfit", themed card sets). Each objective generates a one-line **hint** shown privately to that player's left-neighbor — the person who will draft *for* them. Draft: everyone simultaneously holds a private pack of 6 theme cards. Each tick you tap one card → it drops **face-down into your right-neighbor's Registry** (their tableau, which THEY cannot see), guided only by their hint on your screen. Pass the pack, repeat until packs are empty. The host TV shows only pack-count progress and whose pick-timer is live. Privately, each phone holds: your current pack, your neighbor's hint, and your own accumulating Registry — hidden from you until reveal. Reveal: the host flips each Registry one at a time; the owner reads their secret objective aloud and the table judges how well their blind gifter nailed it, with an optional vote for best-fulfilled Registry.

Load-bearing privacy: simultaneous packs (a single passed phone can't do this), a hint visible only to the giver, and — crucially — the recipient must never see their own incoming cards, which a shared device can't cleanly enforce.

## Technical approach
Host tab + phone PWAs + authoritative WS server. Data model: `Player{seat, objective, hint, pack:[cards], registryReceived:[cards]}`; deck seeded server-side. Sync: on each pick the server validates the card is from that player's current pack, moves it to `(seat+1)%N`'s registry, and rotates packs once all players have picked (a per-tick barrier). The authoritative server never sends a registry's contents to its owner until reveal. The hard part is the **simultaneous-pick barrier with slow players** (timeout auto-picks) plus guaranteeing no client ever receives its own registry payload early.

## v1 scope
- 3 players; one pack of 6 cards each
- One objective + one hint each; 6 synchronized picks
- Reveal + clap-o-meter (no formal scoring engine)
- Curated card set of ~30

## Out of scope
Multiple packs/rounds, real scoring, reconnection, large card pools, procedurally generated objectives.

## Risks & unknowns
Hints too vague → random, unsatisfying gifts; too specific → trivial. Fun leans heavily on card-set writing. A 3-seat ring is thin (everyone gives+receives exactly once) — may want 4 for richer dynamics.

## Done means
Three phones each show a distinct private pack + neighbor hint; six synchronized picks route each card face-down to the correct neighbor's Registry with no phone ever seeing its own incoming cards; the reveal flips all three Registries on the host and owners read their objectives aloud.
