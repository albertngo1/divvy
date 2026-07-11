## Overview
Mondegreen is a 3-5 player audio hidden-role party game — shared host TV plays the backing track and karaoke display; each phone is a private lyric teleprompter. Everyone sings the same short song together, but one player's phone (the imposter, unaware) has a single line swapped with a homophone-adjacent rewrite. When the whole room hits that line in unison, the imposter's mismatched words stick out. The group then votes who sang the odd line.

## Problem
Hidden-role games are almost all talk-and-lie. Mondegreen makes the tell PHYSICAL and simultaneous: you can't hide behind a poker face when your mouth is committed to singing 'the wolves came down' while everyone else sings 'the walls came down.' The imposter genuinely doesn't know their line was changed until the room reacts — that panic is the game.

## How it works
Host screen: backing track playback, a bouncing-ball karaoke line for spectacle, and phase control. It shows lyrics too FAINT/partial to sing from — you must rely on your phone.

Privately, each phone scrolls the full lyric line-by-line, highlighting the current line in time with the host's track. Four phones show canonical lyrics. One phone shows lyrics identical except ONE line (ideally the chorus's punch line) rewritten to a homophone or near-rhyme swap ('cross the room' → 'cross the ruin'; 'hold the line' → 'hold the lie'). Everyone sings aloud together, twice through the chorus. Then phones lock and each player privately taps a face to vote 'who sang the wrong words?' Majority-correct = group wins; imposter unspotted = imposter wins. Host reveals both lyric sheets with the swapped line highlighted.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {code, phase, songId, trackStartAt}, Player {id, role, lyricVariantId, voteFor}. Song asset = {audioUrl, lines[{text, startMs, endMs}], swapLineIndex, altLineText}. Server assigns one imposter at start and streams only their variant's lines to their phone.
Sync strategy: the ONLY tight-timing element is lyric-line highlighting matching the audio. Host broadcasts trackStartAt (server epoch) at play; phones compute current line from local audioContext clock offset — no per-frame server chatter, just a one-time clock sync + drift correction every few seconds. Voting/phases are event-based. Genuinely hard part: keeping all phones' line highlight within ~150ms of the shared audio so everyone actually sings in unison; solved with NTP-style offset estimation on join.

## v1 scope
- 3 players, one round, one hardcoded 20-second song with one swapped chorus line.
- Host plays backing track; phones scroll+highlight synced lyrics.
- Sing-along, lock, single private vote, reveal both variants.

## Out of scope
- Pitch/mic detection or scoring (this is a lyric divergence, not a singing-skill game).
- Song library, licensing, custom-song upload, multi-round scoring.

## Risks & unknowns
- Shy players won't sing loudly enough to expose the tell; needs an energetic host prompt and maybe a mandatory second chorus.
- Homophone swaps must be singable at the same syllable count/rhythm or the imposter self-detects.
- Lyric licensing → use original/public-domain-style tunes for v1.

## Done means
Three phones join; one silently receives the swapped-line variant; the host plays the track while all phones highlight lyrics within ~150ms of the audio; the room sings the chorus and the imposter's altered words are audible; a private vote resolves; host reveals both lyric sheets — and in playtests the wrong-line singer is correctly fingered a majority of the time.
