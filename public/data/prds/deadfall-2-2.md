## Overview
Deadfall is a Taboo/Trapwords riff for 3-6 players. One Speaker tries to lead the room to say a target word out loud; everyone else secretly plants forbidden "trap" words the Speaker must dance around without knowing where they are. The Speaker's job is to be evocative but never obvious.

## Problem
Taboo prints the forbidden words on the card the giver holds — so the giver knows exactly what to dodge and there's zero hidden-information tension. Trapwords fixes this in a box but demands two teams, tokens, and honest self-policing. Neither can personalize traps per person, and neither survives being run off one shared screen without leaking.

## How it works
The host TV shows the target word to everyone EXCEPT the Speaker, whose phone shows only "You're the Speaker — get them to say it out loud." Before the Speaker talks, every other phone PRIVATELY submits 1-2 trap words they predict the Speaker will lean on (target VOLCANO → "lava", "erupt"). The host shows the Speaker only a bloodless count: "🩸 5 traps armed." The Speaker then gives a live spoken clue-monologue. The instant any player hears a word matching a trap they personally planted, they slam their phone's big red SNAP button — the host plays a snap sting and reveals THAT trap on the TV. Guessers shout answers; the Speaker confirms silently via a thumbs tap. Score = speed-to-correct-guess minus a penalty per sprung trap.

Private per phone: the Speaker cannot see the traps (the entire game), and each trapper cannot see other trappers' picks — so you're rewarded for planting the sneaky landmine only YOU foresaw, not piling onto "lava."

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: `Room { targetWord, speakerId, players:[{id, traps:[string], snapsFired:[trapId]}], phase, clock }`. No speech recognition needed — the SNAP is a human tap, so the server only records snap events plus which trap fired and logs the armed word so the reveal proves it was genuinely pre-planted. Sync strategy: phases (submit → speak → resolve) broadcast to all; snaps are append-only events ordered by server timestamp. Genuinely hard part: making snap timing feel fair and discouraging phantom snaps — solved by only allowing a player to fire a trap they actually armed, and showing the word on reveal.

## v1 scope
- 3 players, one target word, one Speaker
- Private simultaneous trap submission (1 trap each)
- Manual SNAP button, one shared timer
- Single round, final score on TV

## Out of scope
- Teams, ASR auto-detection of traps
- Multiple rounds, trap categories, penalty tuning

## Risks & unknowns
- Traps may be too predictable (everyone guesses "lava") → reward unique traps that actually spring
- Manual-snap honesty; Speaker sneaking a look at the TV

## Done means
Three phones join, one is Speaker and provably cannot see the word or traps, the others submit private traps, the Speaker talks, a SNAP reveals a real armed trap on the TV, and the round ends on a correct guess with a computed score.
