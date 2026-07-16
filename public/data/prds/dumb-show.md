## Overview
Dumb Show is a 3-6 player physical hidden-role game. On a countdown, everyone stands and silently mimes what they believe is the same word shown privately on their phone — but the imposter received a near-synonym ('shaving' instead of 'brushing teeth'; 'casting a net' instead of 'fishing'). Nobody speaks. Players glance around the circle hunting for the gesture that's *almost* right, while the imposter, certain they're on-theme, tries to blend.

## Problem
Most 'subtly different private view' deduction is read off a screen — a swapped label, a tweaked chart. Dumb Show moves the divergence into the *body*: the tell is a gesture that's adjacent-but-wrong, and the imposter can't spot their own error because their word feels perfectly normal. It's charades inverted — simultaneous, silent, and about *finding* the odd performer, not guessing a word.

## How it works
The host TV shows a big 'GET READY' card and a 3-2-1 countdown — never the word. Each phone privately displays a single prompt word: honest players all get the same word; the one imposter gets a hand-paired near-synonym. On zero, the TV flips to a 20s 'MIME' timer and everyone acts simultaneously, standing in a loose circle. Phones are pocketed during the mime (the word is memorized in the 3s before). When the timer ends, each PHONE privately collects a one-tap 'who was off?' vote. TV reveal: if the group catches the imposter, honest team wins; the imposter steals the win if they're *not* the top vote OR if, in a private follow-up, they correctly guess what the group's real word was.

What's private (phone): your prompt word, your vote, the imposter's word-guess. What's shared (TV): the countdown, the mime timer, the reveal. The simultaneity is essential — because everyone performs at once, you can only sample the room in glances, so a subtle divergence survives long enough to be a real read.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{wordPairId, imposterId, phase}`, `Player{id, word, vote, imposterGuess}`. A curated table of `{base, synonym}` word pairs; server picks one, assigns `base` to all but the imposter. Sync: server broadcasts `REVEAL_WORD` then `START_MIME(serverTs)` and `END_MIME`; phones just render text and a shared timer, so timing tolerance is loose (~half a second is fine — the humans are the slow part). Hard part is content, not networking: hand-tuning pairs so the mime is *distinguishable but deniable* — too far apart and the imposter self-detects, too close and no gesture reads differently. Anti-leak: never render the word on the TV; keep prompt payloads per-socket so a shoulder-surfer can't compare screens.

## v1 scope
- 3-5 players, one round, ~15 hand-authored word pairs.
- Single 20s simultaneous mime, phones pocketed.
- One private vote + one private imposter word-guess.
- Plain TV reveal, no persistence.

## Out of scope
- Scoreboards, multi-round matches.
- Recording/replay of mimes.
- Procedural or LLM-generated word pairs.

## Risks & unknowns
- Watching everyone at once is genuinely hard with 6+; may cap at 5.
- Some players mime badly regardless of role, creating false positives (could be a feature).
- Pair tuning is the whole game and needs real playtesting.

## Done means
Five phones each show a privately assigned word (four identical, one paired synonym); on the host countdown all reveal simultaneously, players mime for 20s, then cast private votes; the TV reveals the imposter and whether their private guess of the group word was correct — with no word ever shown on the shared screen and no phone exposing another's prompt.
