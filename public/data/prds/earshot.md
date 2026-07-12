## Overview
Earshot is a hidden-role audio deduction game for 4–6 players with a shared host screen and each phone as a private earpiece. Everyone listens simultaneously and privately to the same short voicemail; the Mole's clip has one word secretly swapped. The group reconstructs the message aloud and votes on who heard something different.

## Problem
Audio is almost absent from party games, yet mishearing is universally funny and social. No hidden-role game makes the corrupted channel be *what you heard* — where honest testimony from the odd player is what exposes them.

## How it works
Host TV: "Phone to your ear. Playing in 3…2…1." Each phone PRIVATELY plays the same 6–8s TTS message ("Hey — grab the red folder from the top drawer and meet me at noon"). The Mole's phone plays a version with one swapped word ("…blue folder… meet me at four"). Then the group openly rebuilds the message, one detail at a time, on the TV as a fill-in template. Disagreements surface: "wasn't it red?" "no, blue." The Mole heard blue and, if honest, exposes themselves; a sharp Mole hedges toward vagueness. After reconstruction, everyone privately votes for the Mole. One optional replay (to your ear only) raises the stakes.

Private (phone): YOUR audio clip, replayable to your ear. Shared (TV): the reconstruction template and the vote tally — never the true text until reveal.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Audio is pre-generated TTS (loyal + mole variants) shipped to clients; the server tells each phone which file to play and fires a synchronized play command (server timestamp + client-scheduled WebAudio start so the countdown lands together). Data model: Room{code, players[], moleId, clip:{loyalUrl, moleUrl, truth, swaps[]}, reconstruction, votes}. Genuinely hard parts: (1) private audio in a loud room — requires earpiece, not speaker; (2) making 'everyone press play together' feel simultaneous so no clip is conspicuously late. Preload + scheduled WebAudio start solves timing; volume leakage is the real UX risk.

## v1 scope
- 4 players, 1 Mole, one clip, exactly one swapped word.
- 3 pre-baked clip pairs.
- Host reads the reconstruction template aloud; players fill it verbally; one private vote; reveal.
- On-screen 'hold to your ear' instruction.

## Out of scope
- Live TTS generation, multi-swap difficulty tiers, scoring meta, reconnection polish, spectator audio.

## Risks & unknowns
- Audio leakage in a noisy party can break privacy (mitigate: short clip, earpiece prompt, low volume). Accessibility for hard-of-hearing players. A single swapped word may be too subtle or too obvious — needs tuning. TTS clarity matters.

## Done means
Four phones join by code; all play their clip privately and on cue (one differs by one word); the group reconstructs the message on the TV; everyone votes; the host reveals the Mole and the swapped word — playable end to end.
