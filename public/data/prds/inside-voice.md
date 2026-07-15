## Overview
Inside Voice is a phone-native riff on *Insider* (Oink Games) for 4–6 players. The room collaboratively guesses a secret word via live yes/no questions before a timer runs out — a shared goal. But one hidden player, the Insider, already knows the answer and is covertly nudging the group there. If the group wins, a second job begins: privately vote out whoever was steering.

## Problem
*Insider*'s whole tension is that one voice in a cooperative huddle is secretly a knower. That only works if role assignment and the Insider's private knowledge are truly per-person hidden — a single passed device can't keep the secret word visible to two specific players while blank for the rest, nor collect simultaneous unseen votes. The paranoia ("who's rushing us?") is manufactured entirely by asymmetric private state.

## How it works
1. **Setup (private):** Server picks a secret word and assigns one **Oracle** (answers honestly) and secretly one **Insider**. The Oracle's phone privately shows the word + a Yes / No / Close panel. The Insider's phone privately shows the same word + "You're the Insider — help them win, but don't get caught." Everyone else's phone shows only "Ask questions."
2. **Question phase (voice, natural):** Players ask yes/no questions *aloud* — no audio infra needed. The Oracle taps Yes/No/Close; each tap appends to a running log on the **shared TV** with a countdown (default 4 min).
3. **Guess:** When someone says the word aloud, the Oracle taps "Correct," stopping the clock. If time expires first, everyone loses — Insider included.
4. **Hunt phase (private, simultaneous):** Every phone privately votes for who the Insider was. Votes reveal together on the TV. If the majority fingers the Insider, the commoners win; if not, the Insider wins.

Privately per phone: the Oracle sees word+panel, the Insider sees word+role, commoners see nothing, and votes are cast blind and simultaneous. The TV shows only the answer log, timer, and final reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room{ phase, word, oracleId, insiderId, answerLog[], timerEndsAt, votes:{voter→target}, result }`. Sync: only Oracle taps mutate the log (broadcast to TV + all phones); word visibility is gated server-side to `oracleId` + `insiderId` sockets. The genuinely hard part is a **trustworthy simultaneous vote reveal** — collect all ballots server-side, withhold any tally until every phone has submitted, then flip the TV at once so nobody vote-follows. Timer is server-authoritative to avoid client drift.

## v1 scope
- Exactly 4 players; one word from a 40-word deck; one Oracle, one Insider.
- 4-minute server timer; Yes/No/Close panel; TV answer log.
- One private vote round; win/lose + Insider-reveal card.

## Out of scope
- Speech recognition (questions/guesses stay verbal + human-adjudicated by Oracle taps); multi-round scoring; more than one Insider; role rotation; reconnect handling.

## Risks & unknowns
- With 4 players deduction is thin — Insider may be too easy or too hard to catch; tune deck difficulty and timer.
- Oracle mis-taps corrupt the log; add an undo.
- A cautious Insider who does nothing is invisible; consider a soft rule that failing to guess in time also loses the Insider (already baked in).

## Done means
Four phones join; exactly two phones privately show the word (Oracle + Insider); verbal questions get logged to the TV via Oracle taps under a live server timer; on a correct guess all four cast hidden votes that reveal simultaneously, and the TV declares commoners-or-Insider correctly.
