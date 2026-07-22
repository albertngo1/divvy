## Overview
Overtone is a 3–4 player cooperative singing game. The TV shows a target chord as a row of blank pillars. Each phone privately assigns one player a single note of that chord and listens — via its own mic — to only that player's voice. The group must hum together until every note lands in tune simultaneously, forming the chord. It's for anyone who's ever tried to harmonize badly and wants a game that turns that flailing into a win state.

## Problem
Pitch is invisible and social. You can't easily tell whether *you're* the one who's flat or the person next to you is. Voice party games lean on words; almost none use the actual acoustics of the room. A game where each phone is a private, per-singer tuner turns "who's off?" into the whole puzzle.

## How it works
At round start each phone privately shows ONE note name (e.g. "YOUR NOTE: E4") and nothing else — no sharp/flat feedback. Its mic runs continuous pitch detection on its own holder. The TV (shared) shows the target chord as, say, three pillars that fill toward locked as each detected pitch nears its target — but the pillars are ANONYMOUS: the TV never labels which pillar is whose. So players must claim aloud ("I'm the top note, I think I'm sharp — someone below me hold steady") and tune by ear against each other. Two players assigned neighboring notes (E and G) will confuse whose pillar is whose, forcing negotiation. Win: all notes within ±40 cents at the same instant, held for 2 seconds — the chord "locks" and the TV rings it out.

The private-per-phone architecture is load-bearing twice over: (1) each mic isolates one singer so the system knows *individually* who's flat, which a single shared room mic could never disentangle; (2) the secret note assignment requires a private screen per player.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. On-device pitch detection (YIN / autocorrelation via Web Audio `AnalyserNode`) runs ~30–60Hz; each phone streams a smoothed f0 estimate + confidence to the server. Data model: `Player{id, targetMidi}`, `Round{targetChord:[midi], lockHeldMs}`. Server maps each f0 to cents-error vs that phone's target, drives the TV pillars, and detects the simultaneous-in-tune 2s hold. The genuinely hard part: each phone hears its neighbors too, so per-phone detection must reject cross-talk — gate on input level, prefer the loudest stable partial, and require a confidence threshold so a phone tracks its OWN singer, not the person leaning over their shoulder. Latency tolerance is generous (pitch is continuous, not event-timed), which makes this forgiving where Spaceteam-style games are brutal.

## v1 scope
- 3 players, one fixed target chord (C-major triad), one round.
- Private note assignment + continuous per-phone pitch → cents error.
- Anonymous pillars on TV; ±40 cents, 2s simultaneous hold to win.

## Out of scope
- Chord libraries, difficulty, key changes, scoring streaks.
- Rhythm/timing requirements (this is pitch-only).
- Recording/keepsake export.

## Risks & unknowns
- Cross-talk rejection on cheap phone mics is the make-or-break.
- Non-singers may find humming a target note genuinely hard — needs an audible reference cue on each phone.
- Distinct enough from prior in-tune/duet games via secret note assignment + anonymous-pillar claiming.

## Done means
Three phones in one room drive three anonymous pillars, and a round ends in a locked C-major chord held 2s — with each phone provably tracking its own holder (swapping two singers' seats does not swap which pillar responds).
