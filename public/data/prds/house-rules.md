## Overview
House Rules is a 4-6 player hidden-role micro card game where each phone privately shows your hand **and** the rulebook. One player — the imposter — has a single rule silently inverted. Nobody lies; the imposter simply optimizes hard for the wrong objective, and their earnest reasoning gives them away. It's for groups who love bluffing games but where the twist is that *nobody is bluffing*.

## Problem
Most social-deduction games require active deception, which is stressful for some players and rewards the loudest liar. The itch here: what if the traitor doesn't *know* they're the traitor? The corrupted private view is the **rules**, not the facts — so tells emerge naturally from sincere, confident play running in reverse. That's a genuinely fresh angle on "subtly-different private view."

## How it works
The host runs a shallow micro-game, "Sudden Value." Each player is dealt three number cards (1-9), visible only on their own phone. Every phone also shows a RULES panel — e.g. *"GOAL: the LOWEST hand total wins."* The imposter's panel instead reads *"HIGHEST hand total wins."* Over one round, each player makes exactly ONE public swap: discard a card face-up to the shared pot and draw the top pot card, **announcing their reasoning aloud** ("dumping my 9, too risky"). Honest players shed high cards; the imposter sincerely hoards or grabs high cards and says so. Everyone hears the logic. After the swap phase, players privately vote for who was playing a different rulebook, then the host reveals every rulebook and total.

**Phone (PRIVATE):** your 3 cards, your rules panel (true or inverted), your swap choice, your vote. **Host screen (SHARED):** the face-up pot, whose turn it is, countdown, and the final reveal of everyone's rules and totals.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Room{ deck[], hands: player→cards[], pot[], rules: player→ruleVariant, imposterId, swaps[], votes[] }`. The server deals cards, assigns the inverted rule to one socket, sequences swap turns, broadcasts pot mutations to all, and keeps hands + rules panels private per-connection. Sync is trivially low-rate (turn-based). The genuinely hard part is **balance tuning**: the inverted rule must be discoverable through one or two observable swaps yet not instantly obvious, and the micro-game must be graspable in 15 seconds while still making "wrong-way" play legible.

## v1 scope
- 4 players, one round
- 3-card hands, one inverted rule (high vs. low total)
- One public swap per player
- Tap-to-vote, hardcoded deck

## Out of scope
- Multiple rule variants or difficulty tiers
- Scoring across a series, animations
- More than 6 players, richer card mechanics

## Risks & unknowns
A sharp imposter may notice everyone dumping high and reverse-engineer their own corruption, then hide. With only 4 players, variance is high — one round may not yield enough signal. The inverted rule must invert *cleanly* (no ambiguous middle strategies).

## Done means
Four phones join; each shows a hand plus a rules panel (exactly one inverted); players each make one swap visible in the shared pot; everyone votes; the reveal shows both rulebooks. Testable: seed hands, force the imposter seat, and confirm the imposter's on-screen optimal-play hint points opposite the honest players'.
