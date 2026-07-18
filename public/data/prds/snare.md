## Overview
Snare is a 2v2 hidden-minefield word game riffing on *Trapwords*. One player describes a secret word to their teammate — but the opposing team has secretly planted forbidden "trap" words the describer can't see. Say a trap aloud and the buzzer kills the turn. The fresh angle: trap-planters don't just defend, they **predict** — each privately bets which trap the describer will step on, scoring most when their specific snare is the one that snaps.

## Problem
*Trapwords* is deliciously tense but logistically clumsy at a table: the defending team has to huddle and write forbidden words on paper while hiding them from someone sitting three feet away, then act as honest buzzer-referees. The secrecy is constantly leaking. Phones make the hidden planting airtight and turn refereeing into an automatic, undisputed event — and the private prediction layer is impossible without per-phone secrecy.

## How it works
Team A has a Describer and a Partner; Team B are two Planters. Host TV shows the timer and a neutral "minefield" of blank slots. **Describer's phone privately** shows the secret word and a mic-live "speaking" indicator — nothing about traps. **Each Planter's phone privately** shows the same secret word and asks: plant one trap word (a likely association) AND tap the one trap you think the Describer will actually say first. The **Partner's phone** shows only a guess field.

The Describer talks; the app transcribes (or the Partner taps a "they said a trap!" challenge that the server verifies against the hidden trap list). Hitting any trap = buzz, turn over. The **host TV** then lights up which traps were laid and which one detonated. Scoring: Team A scores if the Partner guesses in time; Team B scores per trap hit, with a bonus to the Planter who *predicted* the detonating trap. Rotate.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Round{secret, describerId, partnerId, planterIds, phase}`, `Trap{planterId, word, predicted:bool, hit:bool}`, `GuessLog[]`. Sync: traps are written server-side during a `planting` phase and never sent to the Describer's socket — secrecy is enforced at the server, not the client. The **genuinely hard part** is *trap detection on live speech*: v1 sidesteps ML by using on-device Web Speech API transcription streamed to the server for fuzzy matching against the trap list, with the Partner's manual challenge as an authoritative fallback so a missed transcription never breaks fairness.

## v1 scope
- Exactly 4 players, 2v2, one secret word, one turn.
- Each Planter plants 1 trap + 1 prediction.
- 60s timer; Partner types the guess.
- Trap detection = Partner challenge button (transcription optional/experimental).
- TV reveal of traps, hit, and prediction bonus.

## Out of scope
- 3+ trap words per team, multi-round matches, rotating full rosters.
- Reliable automatic speech trap-catching as the primary mechanism.
- Larger/uneven teams, spectators, reconnect.

## Risks & unknowns
- Manual challenge relies on an honest Partner catching the word — feels less magical than auto-detection.
- Speech transcription accuracy/latency across accents and noisy rooms is unproven.
- 4-player minimum is rigid; tuning prediction bonus so it doesn't overshadow the base trap score.

## Done means
Four phones join; two Planters privately bury a trap word and secretly predict the Describer's slip while the Describer sees only the secret word; the Describer talks, the Partner challenges a spoken trap, the server confirms the hit and ends the turn; the TV reveals both traps, which detonated, and awards the prediction bonus to the Planter who called it.
