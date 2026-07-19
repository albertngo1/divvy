## Overview
Overheard is a 3-6 player hidden-role deduction game for a living room. Everyone privately listens to the same short 'overheard' audio clip on their own phone, then reports what they heard. One player — the imposter — was fed a version with a single detail swapped. They don't know they're the odd one out. The room must smoke them out from the way their story rubs against everyone else's.

## Problem
Most social-deduction games hand the imposter a blank (they don't know the word) so their tell is *silence and hedging*. That gets stale — good bluffers just parrot. The fresher itch: give the imposter a *confidently wrong* private truth. They'll assert the wrong detail with total sincerity, which reads completely differently and rewards listening, not just vibe-reading.

## How it works
Host TV frames a 'case': *"You all overheard the same voicemail. One of you heard it differently."* On a synchronized go, each phone privately plays a ~12-15s clip (a voicemail, a caught snippet of conversation). Players may replay it up to twice within a 40s window, then playback locks.

PRIVATE (each phone): the audio, a replay-count pip, and — for everyone including the imposter — the same instruction. The imposter's clip is byte-identical except ONE salient detail is re-dubbed: a place (PIER→PARK), a name, a time, an object. Nothing labels them.

SHARED (TV): a round timer and a round-robin turn pointer. In turn order each player says exactly ONE sentence reporting what they heard — enough to prove they listened, not so much they hand the imposter cover (Chameleon tension). After the go-around, free discussion, then every phone privately casts a vote for the imposter.

REVEAL (TV): the swapped detail is shown, the imposter named. Group wins by majority-voting the imposter; imposter wins by surviving.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room, reachable via Tailscale Serve). Data model: Room{code, phase, players[], clipSet, imposterId, votes{}}. Each clip ships as two pre-rendered audio files (canonical + swapped variant) bundled in the client; server tells each phone which key to fetch/play, revealing nothing about roles. Sync: server broadcasts a `play_at` timestamp offset ~300ms in the future; phones schedule playback against WebAudio's clock. Genuinely hard part: (1) authoring clips where the swap is *salient but not screaming* and phonetically plausible, and (2) making replay-limited private playback tamper-resistant so a curious player can't diff their file against a neighbor's mid-round.

## v1 scope
- 3 players, one round, one hand-authored clip pair
- Fixed roles: server randomly assigns one imposter
- Round-robin single sentence, then a single vote
- Binary win/lose reveal on TV

## Out of scope
- Multiple rounds, scoring across rounds, role rotation
- Player-generated audio, TTS clip generation
- Spectators, reconnection grace, >6 players

## Risks & unknowns
- Swap too subtle → imposter never noticed; too loud → instant catch. Needs playtest tuning of detail salience.
- Audio privacy in a loud room (need earbuds? speaker-to-ear?) — playtest the physical ritual.
- Cheating by phone-swapping mid-round.

## Done means
Three phones join a room, each plays its clip privately and synchronously, exactly one hears the swapped detail without any label, the group discusses and votes on their phones, and the TV correctly reveals the imposter and swapped word — all in one uninterrupted ~4-minute round.
