## Overview
A 4-player writing game for people who want to say something true to their friends without owning it out loud. The room produces one printed page — a short unsigned statement of what this group actually thinks — and the only way your line makes the page is if nobody can trace it back to you. It is Telephone inverted: Telephone destroys meaning by accident; here you destroy *voice* on purpose while keeping meaning intact.

## Problem
Group keepsakes are either sincere and awkward (everyone signs the card) or funny and disposable (Quiplash screenshots). Anonymity games usually make anonymity a scoring gimmick. Nobody has made the artifact itself the prize, with anonymity as the physical condition of getting on it.

## How it works
1. **Origin (90s).** The host TV shows one prompt ("one thing this room should stop pretending about"). Each phone privately writes one sentence. The TV shows four sealed envelopes, no text, no names.
2. **Hop 1 (90s).** The server routes each sentence to a phone that did not write it. Your phone privately shows exactly one incoming sentence and nothing else — no author, no context. You must rewrite it. Two hard rules, enforced by the server: the 3 most distinctive words in the incoming text (TF-IDF against the round's own pooled sentences, stemmed) are listed as **banned** and the SEND button stays dead until they're gone; and your rewrite must land within ±20% of the incoming character count so you can't collapse it into "yeah."
3. **Hop 2 (90s).** Same again, re-routed. At hop 2 you may be handed your own now-laundered sentence. You are not told.
4. **Reveal.** The TV shows four final statements, shuffled, unlabeled. Each phone privately does two things: confirms which statement descends from its own origin (server-verified, private), then casts one public attribution guess.
5. **Burn.** Any statement drawing ≥2 correct attributions is redacted — the TV drops a black bar over it. The host exports **Statement of the Room**: a dated page, survivors printed clean, burned lines struck through, footer reading *no author recorded*. The mutation chains stay sealed unless all four tap "open the chain."

## Technical approach
PartyKit Durable Object per room code, phone PWAs, host tab as pure display. State: `{players[], origins{pid:text}, hops[[edge, text]], phase, guesses}`. Text is *never* broadcast — the server unicasts one payload per socket, and the host receives text only at reveal. Banned-word extraction runs server-side (stoplist + Porter-lite stemmer); the client mirrors it live for feedback but the server re-validates.

The hard part is not throughput, it's the **timing side channel**: if Ana submits and Ben's phone unlocks 200ms later, the room has learned an edge. Fix: a hop barrier (nothing releases until every submit lands), a per-recipient randomized 0.5–2s stagger, and a TV that shows an aggregate "3 of 4 sealed" count with no per-player dots or avatars.

## v1 scope
- Exactly 4 players, one prompt, two hops.
- 3 banned words, ±20% length band, 90s timers.
- One attribution guess each; burn at ≥2 correct.
- PNG export shown as a QR on the TV.

## Out of scope
Variable player counts and general derangements, multiple rounds, chain-replay animation, LLM paraphrase assist, accounts, any leaderboard.

## Risks & unknowns
Meaning may turn to mush after two hops, which kills the artifact. Syntax and rhythm may leak authorship even with words banned. Burning may read as punishment rather than as the joke. Rewriters may lazily preserve sentence shape.

## Done means
A 4-phone session ends with a downloadable PNG in which at least one statement printed clean; no phone ever displayed a sentence next to an author's name; the host log shows all hop-1 payloads released within 100ms of each other; and a submit with a banned stem present is rejected server-side, not just greyed client-side.
