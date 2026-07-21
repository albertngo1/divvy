## Overview
Librarian is a 4–6 player hidden-role silence game. The group must keep a single collective noise-floor meter under a red line for 90 seconds. But one secret Whisperer is trying to make it breach — not by talking (that busts them too) but by silently baiting everyone else into gasping, laughing, or blurting. At the end the room votes on who the Whisperer was.

## Problem
'Don't laugh' games bust everyone off one contagious cascade and have no arc beyond attrition. Nothing rewards keeping a whole ROOM quiet, and nothing puts a saboteur inside that silence whose only weapon is provocation they can't voice either.

## How it works
Each phone PRIVATELY shows a role card. Quiet Keepers just try to stay silent and read the room. The single Whisperer additionally gets a private, scrolling list of silent provocations — 'lock eyes with someone and slowly raise one eyebrow,' 'mime unzipping your face' — designed to crack a neighbor without the Whisperer making a sound.

The HOST TV shows exactly one thing during play: a collective noise-floor meter (max across all phones' live RMS) with a red line, plus a breach counter and countdown. Crucially, each phone judges ONLY its own owner's voice: when you vocalize, YOUR phone reports it and the meter spikes attributed to you — a neighbor's laugh bleeding into your mic must not register as yours. Phones privately track their own strike count. After 90s (or 3 breaches) everyone privately votes who the Whisperer was. Keepers win if they vote correctly OR survive breach-free; the Whisperer wins on breaches while staying unidentified.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `player {id, role, strikes, ballot}`. Each phone runs local voice-activity detection and streams a boolean 'I am vocalizing' + onset timestamps; the host aggregates into the shared meter and breach events. Server owns role assignment and the private provocation feed. Hard part: per-phone VAD robust to a room full of crosstalk — near-field RMS gating + onset-timing correlation so player B's loud laugh never fires player A's phone. False attribution destroys both the silence-challenge and the whodunit.

## v1 scope
- Exactly 4 players, exactly 1 Whisperer
- One 90s round, breach = meter over line for 0.5s
- 5 canned silent-provocation prompts
- Simple-majority end vote

## Out of scope
- Multiple Whisperers, multi-round scoring, spectators, adaptive prompts

## Risks & unknowns
- Mic bleed misattributing breaches to the wrong player
- Provocations may not reliably land
- Deduction thin at only 4 players

## Done means
Four phones, one secretly the Whisperer, the host meter rises only when the actually-vocalizing owner's phone fires, and a majority vote correctly reveals and scores the round.
