## Overview
Read the Room is a 4–6 player concurrent-room game where the thing that's been tampered with is not the puzzle — it's the *social feedback*. Every phone shows a private opinion slider and a private live needle reporting the room's current average. Exactly one phone's needle is mirrored around the midpoint. That player argues in complete good faith and steers the group away from consensus. Nobody, including them, is told who it is.

## Problem
Hidden-role games mostly hand the imposter a corrupted *fact* — a swapped word, a wrong tile. The imposter then knows they're weird and performs. That's a lying game. Nobody has built the version where the corruption is in the feed of *what everyone else thinks*, so the imposter is sincere, unimpeachable under interrogation, and the most interesting question in the room becomes "…is it me?"

## How it works
The TV shows one spectrum prompt and nothing else: "Texting back a day later — totally fine (0) … unforgivable (100)." Ninety-second timer. The cooperative goal: get all sliders inside a 12-point band before time runs out.

PRIVATE per phone: your own draggable slider, plus a fat needle labeled ROOM that updates ~4×/sec as anyone moves. One randomly chosen phone receives `100 − trueMean` instead. Everyone is told up front that exactly one needle is mirrored and it might be theirs.

SHARED TV: the prompt, the countdown, the current band width as an unlabeled bar (are we converging?), and a live who's-talking indicator — never any individual position, never the true mean.

Speaking numbers aloud is banned (the TV flashes a foul if the host taps the penalty button), so the only channel is qualitative: "we're way too harsh, come down." The mirrored player says exactly that while everyone else is already low.

At 0:00 or on band-close, everyone privately votes for the mirrored phone. Any player may instead hit SELF-REPORT at any moment before the vote. Scoring: room closed the band + majority named the mirrored player = full points; a correct self-report before the vote scores the mirrored player *more* than anyone else and half-points to the room; band never closes = nobody scores.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object as authority. State: `{ prompt, mirroredId, positions: {playerId: 0..100}, phase, deadline, selfReport }`. Phones send throttled `pos` deltas (max 10/s, coalesced). The DO recomputes `mean` and fans out a per-connection payload — this is the load-bearing bit: **the broadcast is not identical**, each socket gets `needle = (id === mirroredId) ? 100 - mean : mean`. The client never receives the raw mean, so a curious player can't open devtools and win.

Hard part: the mirrored feed must stay *plausible*. If the true mean sits near 50 the mirror is invisible; if it sits at 5 the mirrored player sees 95 and screams instantly. Fix: seed each player's slider at a randomized start spread across the range, and pick prompts pre-tested to pull the room off-center. Second hard part is fairness of latency — a 400ms lag reads exactly like a mirrored needle, so smooth needle motion client-side and cap update rate for everyone equally.

## v1 scope
- One round, one hardcoded prompt, 4 players, 90s
- Slider + needle + band-width bar; no avatars, no chat
- Single vote screen, one self-report button, plain-text scoring on the TV
- Numbers-aloud rule enforced socially, not by mic

## Out of scope
Multiple rounds, prompt packs, 2D spectrums, mic-based number detection, reconnect handling beyond a rejoin-by-name.

## Risks & unknowns
The mirror may be trivially detectable once players learn to yank their slider to an extreme and watch the needle move the wrong way — likely needs a countermeasure (needle updates only every 2s, or a small deadband). Prompts that everyone agrees on kill the game.

## Done means
Four phones on a Tailscale URL; one phone provably receives an inverted needle in the network log; a real group plays once, argues, and at least one table produces the intended moment — somebody says "wait, is it me?" out loud before the vote.
