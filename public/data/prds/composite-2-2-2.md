## Overview
Composite is a 3–5 player hidden-role party game about unreliable eyewitnesses. Everyone privately studies the same busy illustrated scene on their phone — except the imposter, whose copy has exactly one detail changed. It's for amateur social-deduction groups who love spotting the liar but want the lie anchored to a concrete fact instead of pure improv.

## Problem
Werewolf-style games ask you to bluff about nothing — there's no shared fact underneath, so suspicion collapses into whoever talks with the most confidence. Composite hands the imposter a real perceptual handicap: they genuinely saw a red door where everyone else saw blue, they never saw the true version, and they must hide the gap while answering pointed questions about it.

## How it works
Setup: the host TV shows a lobby. Every phone privately displays the same detailed scene (a diner, a park bench, a messy desk) for 25 seconds, then it vanishes. One random phone — the imposter — received the altered variant: a swapped color, an added object, a changed count. That phone is privately told it's the imposter; honest players are told nothing.
Interrogation: the host asks 6 rapid forced-choice questions ("The door was: RED / BLUE"). All phones answer simultaneously and privately. The TV shows only aggregate tallies ("4 RED · 1 BLUE") — never who picked what. Most questions touch unaltered parts, where everyone agrees; 2–3 touch the altered detail, where the imposter is the lone minority — unless they bluff the value they never actually saw. Honest players also misremember, injecting noise the imposter can hide inside.
Vote: each phone privately names one suspect. Majority on the imposter = honest win; imposter survives = imposter win. Reveal shows both image variants side by side.
Private per phone: your image variant, your answers, your secret role. Shared: the tally bars and the vote.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, phase, players[], imposterId, sceneId, answers:{qId:{pid:choice}}, votes:{pid:pid}}. Content: authored scene pairs (base + one-detail variant) each with 6 forced-choice questions and precomputed options. Sync: the server drives phase transitions and pushes them to all clients; phones POST answers; the server reduces to counts and pushes ONLY aggregate tallies to the host — per-player choices never leave the server, so nothing leaks. The genuinely hard part is content authoring, not sync: each altered detail must be noticeable-but-deniable, and each question needs plausible wrong options so honest noise exists. Anti-cheat is social (no showing screens) plus an image lockout after the study timer.

## v1 scope
- 3 players, exactly one round, one hardcoded scene pair
- 6 fixed forced-choice questions
- Aggregate tally view + one vote + side-by-side reveal

## Out of scope
- Multiple rounds or cross-round scoring
- Procedural or user-uploaded scenes
- More than one altered detail; more than one imposter

## Risks & unknowns
- Balance: too-obvious a detail kills the imposter on question one; too-subtle and nobody notices.
- Honest-noise calibration — deduction needs real ambiguity.
- 3 players may be swingy; 4–5 likely plays better.

## Done means
Three phones join, one privately receives the altered scene plus an imposter flag, all six questions collect simultaneous private answers, the TV shows correct aggregate tallies without leaking identities, a majority vote resolves, and the reveal displays both variants — proving the different-private-view lever produces a real read.
