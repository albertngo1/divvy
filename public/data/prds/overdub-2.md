## Overview
Overdub is a 4-player hidden-role deduction game where the clue isn't written or drawn — it's *heard*. Everyone privately listens to the same short audio clip through their own earbuds. One player (the imposter) gets a version with a single detail altered, and the round is a two-minute conversation in which everyone recounts what they heard while the group tries to sniff out the person working from a corrupted memory. For friend groups who like Werewolf but are bored of pure bluffing with no shared evidence.

## Problem
Social-deduction games usually give the imposter *no* information (Fake Artist) or *inverted* information they can reason around. Audio is an untapped channel: memory of a spoken detail is fuzzy, so an imposter who heard 'the green door' can't be sure whether they misremember or were sabotaged — and neither can anyone accusing them. That doubt is the fun, and it only exists when each phone plays its own private stream.

## How it works
Host TV shows a lobby, a 'NOW LISTENING' state with a countdown, then a bare discussion timer and a vote grid. Nothing incriminating ever appears on the shared screen.

Each phone PRIVATELY: (1) a big press-and-hold PLAY button that streams a ~20s clip — a voicemail or gossipy anecdote — to that player's earbuds, playable up to twice; (2) after listening, a role card. Three players hear the canonical clip ('...meet at the blue door at nine'). One player's file is identical except one swapped detail ('green door') and their card reads: 'You're the Overdub. Your version differs somewhere. Blend in — don't get caught.'

Discussion (2:00): players verbally reconstruct the message. The imposter must decide to parrot the majority (risking a slip) or trust their own ears (and expose themselves). Then everyone privately votes a suspect on their phone; the TV reveals the tally and the real Overdub.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, timerEnds}`, `Player{id, role, clipVariant, vote}`, `ClipPack{canonicalUrl, variants[{swapUrl, alteredDetail}]}`. Clips are PRE-BAKED TTS pairs shipped as static audio — no realtime generation. Server assigns roles, hands each phone a signed audio URL (real vs. altered), enforces the play-count cap, runs the timer, and tallies votes. Sync is light: playback is local; only phase, timer, and votes cross the wire. The genuinely hard part is *private* audio — on speakers everyone hears everyone's stream and the trick collapses — so earbuds (or cupping the phone to your ear) are a hard requirement surfaced in the lobby.

## v1 scope
- 4 players, exactly 1 Overdub
- One pre-baked clip pair, one swapped word
- Two listens max, 2:00 discussion, one vote
- Earbud check gate before the round starts

## Out of scope
- Realtime/user-generated clips, TTS on the fly
- Multiple imposters, scoring across rounds, mobile mic recording
- Accessibility captions (defeats the audio-only premise; revisit later)

## Risks & unknowns
- No earbuds = broken game; need a firm gate and fallback (staggered solo listening).
- The swapped detail must be salient but not obvious; requires clip tuning.
- Players may barely remember 20s of audio, muddying signal — test clip length.

## Done means
Four phones join, each plays its private clip (three identical, one altered), a 2-minute timer runs, all four cast a private vote, and the host screen reveals both the tally and the true Overdub with the swapped word highlighted.
