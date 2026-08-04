## Overview

A phone-controller riff on **Anomia** for 3–5 people in a living room. The shared TV shows a deck and a scoreboard; every phone privately holds a category card. When two cards' symbols match, only those two phones buzz — the TV shows nothing. The room hears two people suddenly start blurting nouns at each other with no announced reason, and the spectators' job is to work out what the two of them were answering.

## Problem

Anomia's whole joy is the panic-blank: you know a brand of toothpaste and your mouth won't produce one. But in the physical game the match is public — everyone sees it coming, and the non-duelists are dead weight for eight seconds. Digital ports of it are just Anomia with a screen. The itch: keep the panic, and make the *watching* an active game too.

## How it works

1. Each phone privately shows one card: a **category** ("a brand of toothpaste", "a river") plus a colored **symbol**. Nobody sees anyone else's.
2. The TV shows only the flip rhythm: card backs, a beat, a scoreboard. No symbols, no categories.
3. When any two players' symbols match, the server buzzes **only those two phones**. Each duelist's phone now shows *the opponent's category* — never their own — plus a GOT IT button and a 6-second bar.
4. So each duelist simultaneously (a) shouts instances of a category they can see, and (b) judges the opponent's shouts against a category only they hold. Split attention is the comedy. First player judged correct by their opponent takes both cards.
5. Spectators' phones show a free-text field: **"what was Jo answering?"** A spectator who names either duelist's category from the blurting alone steals a point off the winner.
6. Reveal on the TV: both categories, both first words, who froze.

Private vs shared: phones hold every category, every match notification, every steal-guess. The TV holds only rhythm, scores, and the post-duel reveal.

## Technical approach

Host browser tab + phone PWAs + one authoritative WebSocket room (PartyKit Durable Object, or Socket.IO behind Tailscale Serve for the homelab build).

Data model: `Room {code, phase, deck[], scores}`; `Player {id, name, card:{categoryId, symbolId}, buzzed}`; `Duel {a, b, startedAtServerMs, judgeTaps[], steals[]}`. Categories live server-side; a phone only ever receives the string it is entitled to.

Sync: server-authoritative deck flips on a fixed tick. Match detection runs server-side on flip, and the duel-start event is emitted to both duelists in the same write, then to the host with a redacted payload.

The genuinely hard part is **fairness of the race under phone latency**. A duelist on flaky wifi getting their category 180 ms late is a real, felt disadvantage. Mitigation: per-client RTT probing at join, buffered start (server schedules `startAt = now + max(RTT)/2 + 150 ms`, each phone renders on its own local clock), and judge taps stamped with client time then latency-corrected server-side. Ties inside 120 ms are drawn and both cards discard.

## v1 scope

- 3 players, one host tab, no accounts, room code join.
- One 12-card deck, 6 symbols, ~30 categories hardcoded in JSON.
- Round ends at the **first duel**. That's it.
- Human judging only (GOT IT button). No answer validation.
- One spectator steal-guess, string-match scored generously.

## Out of scope

Wild cards, chained matches, category packs, reconnect, more than one round, audio capture, any scoring beyond +1/-1.

## Risks & unknowns

- Judging while racing may just be *too* much — playtest may show duelists forget to tap.
- Spectator steal may be trivially easy ("Crest, Colgate" gives it away instantly); may need a rule that only the *loser's* category is guessable.
- Silent duel start could confuse the room the first time; needs a 1-second TV "something happened" thud with no information in it.

## Done means

Three phones join by code, each shows a different private category, exactly two buzz on a symbol match, the TV reveals nothing until the duel ends, and a spectator who correctly types a duelist's category sees the scoreboard flip in their favor — end to end, on real phones over local wifi.
