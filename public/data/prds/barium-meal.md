## Overview
Barium Meal is a phone-passed / same-room digital party game (5–10 players) built on the real espionage technique of the same name: feeding each suspect a subtly different version of a document so the leak identifies the leaker. It's inverse-Werewolf — instead of hunting a hidden identity by behavior, you hunt them by the textual fingerprint they left in a leak.

## Problem
Social-deduction games (Werewolf, Among Us) all deduce from behavior and voting — great, but a decade deep and same-y. There's an untapped mechanic hiding in the news cycle: canary traps and leaked private videos. Nobody has turned steganographic watermarking into a party mechanic where the *evidence itself*, not the vibes, unmasks the traitor.

## How it works
1. Host opens a room on a TV/laptop; players join on phones. 2. The app deals every player a private 'CLASSIFIED BRIEFING' — the same story, but each copy is uniquely watermarked: swapped synonyms ('crimson' vs 'scarlet'), reordered clauses, different filler codenames, a specific em-dash vs comma. 3. One player is secretly the **Mole**, whose objective is to leak. During a timed round the Mole submits a 'leak' — they retype or dictate a sentence or two from their briefing to the public feed. 4. The watermark travels with the words. Loyalists then accuse; the app scores accusations. 5. Reveal: the app highlights exactly which tells in the leak map to which player's copy — instant, satisfying forensic payoff. Mole scores by leaking without being fingered; loyalists score by correct accusation.

## Technical approach
Stack: plain web app — Node + WebSocket (or Supabase Realtime), one shared React screen + phone clients, no install. Core engine: a **watermark generator** that takes a base briefing template with tagged variation slots `{color:crimson|scarlet|vermilion}` and assigns each player an orthogonal bit-vector across ~12 slots (a small error-correcting code so a partial leak still resolves to one player). Attribution: on leak submission, tokenize, match observed variant tokens to the codebook, Hamming-distance to nearest player vector. Hard part: making watermarks *invisible in a single copy* yet *decisive across copies*, and robust to the Mole paraphrasing to cover tracks — tune variation density so a 2-sentence leak still carries enough bits, and reward partial-leak play.

## v1 scope
- 3 hand-authored briefing templates with tagged variation slots.
- Room create/join, role deal, one leak round, accusation, scored reveal with tell-highlighting.
- 5–8 players, single room.

## Out of scope
- Matchmaking, accounts, multi-round campaigns, LLM-generated briefings, voice-leak transcription (type-only for v1), cosmetics.

## Risks & unknowns
- If watermarks are too obvious, players just diff copies out-of-band; too subtle and short leaks are unresolvable — narrow tuning window.
- Reading a paragraph is more friction than a role card; needs to stay short and funny.
- Mole meta may collapse to 'paraphrase everything' — needs a leak-fidelity scoring incentive.

## Done means
Eight people in a room play a full round on their phones, the Mole leaks two sentences, and the reveal screen correctly attributes the leak to the right player ≥90% of the time while no single player could have spotted their own watermark beforehand.
