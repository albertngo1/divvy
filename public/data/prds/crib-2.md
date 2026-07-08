## Overview
Crib is a phone-native riff on **Decrypto** for two small teams (2v2) sharing a living room. Each team owns four secret keywords; an encryptor gives coded clues to their own team while the opposing team eavesdrops and tries to reverse-engineer which keyword is which. It's for groups who like the slow-burn cryptographic bluffing of Decrypto but hate that the paper keyword cards are one careless glance away from being blown.

## Problem
Decrypto's central tension is that your team's four keywords must stay secret from opponents *seated at the same table* for the whole game. In person this means keyword cards behind a screen, cramped seating, and constant fear of an accidental peek. The bookkeeping (clue history, interception/miscue tokens, code generation) is also fiddly. Phones make the secret trivially enforceable and the tracking automatic.

## How it works
Each team is dealt four keywords in slots 1–4. **Privately on each phone:** you see only *your* team's four keywords; opponents' phones never receive them. Each round one teammate is Encryptor and their phone *also* privately shows a 3-digit code (e.g. 4·2·1, digits 1–4, no repeats). They type three clues, one hinting each keyword in code order.

The clues go public — shown on the **host TV** clue log and readable by everyone. Then **both teams simultaneously and privately** submit a guess for the code: the Encryptor's own team decodes using keywords they know; the opposing team *intercepts* using only accumulated clue history. Simultaneous private submission stops either team anchoring on the other. Host TV reveals: correct code, whether the intercept landed (interception token to opponents) and whether the owning team botched their own code (miscue token). Keywords never appear on the TV.

Per-phone privacy is the whole game: with one shared screen the opposing team would simply read your keywords and the game evaporates.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{teams:[{players, keywords[4], tokens}], round, encryptorId, code, clueLog[], guesses{}}`. Sync: server holds all secret state and does **per-connection redaction** — a client only ever receives its own team's keywords and, if Encryptor, the code. Clue submissions broadcast to all; guesses are buffered server-side and revealed only once both teams have locked in (barrier). The genuinely hard part is the two-team state machine with a simultaneous-reveal barrier plus airtight redaction so no keyword or code ever crosses to the wrong client — verifiable via network inspection.

## v1 scope
- 2v2, curated 40-word keyword pool
- Exactly ONE encryption round (not a full game to token thresholds)
- Encryptor types 3 clues; both teams submit one code guess each
- Host TV shows clue log, the reveal, and who scored intercept/miscue

## Out of scope
- Full match to 2 intercepts / 2 miscues; multiple rounds; role rotation
- 3+ teams, tie-breaks, keyword re-draws, chat

## Risks & unknowns
- Is a single round satisfying, or does interception need clue *history* to bite? (v1 may feel thin)
- Clue-quality policing (no proper nouns / obvious leaks) is manual
- 2v2 minimum means you need four people

## Done means
Four phones across two teams each privately see only their own keywords; the Encryptor privately sees the code; three clues post to the TV; both teams' guesses stay hidden until both lock; the TV reveals the true code and awards the correct token — and a network trace confirms no client received the other team's keywords.
