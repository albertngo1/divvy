## Overview
Understudy is a live-performance social-deduction party game for 4–6 people in a room, on a shared host screen with everyone holding their own phone. The group acts out a short scripted scene aloud, each player reading only their own lines. One player — the Understudy — has been handed a script where a few facts were quietly rewritten. Everyone else is trying to spot whose lines keep contradicting the story the scene is telling.

## Problem
Fake-Artist-style games run on a single missing secret: the imposter simply lacks a word and hopes to blend. That's a thin bluff. The richer, unmined itch is an imposter working from information that *looks* completely legitimate to them — a private view that is internally consistent but subtly wrong — so the tells emerge only in the friction between people, live and out loud, not from a scoreboard.

## How it works
The host screen (TV) shows only stage-setting: the scene title ("The Broken Vase"), a cast list, and a turn cursor that walks A→B→C→D→A for ~8 lines. It never shows any script text.

Each **phone shows PRIVATELY only that player's own lines**, revealed one at a time when the turn cursor lands on them. Honest players' lines collectively establish shared facts — *the vase broke at midnight in the kitchen*. The Understudy's phone contains lines that assert altered facts — *the lamp broke at dawn in the study* — but their phone looks identical and never flags which facts changed; they only know "your script may be unreliable."

The rule is **perform the gist, don't read verbatim** — so the Understudy, hearing the room converge on vase/kitchen/midnight, can try to ad-lib toward consensus and hide their bad script. After the read-through, every phone privately casts one vote for the Understudy; host reveals the tally and the real answer.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], scriptId, turnCursor, phase}`; server holds the canonical `Script{lines:[{speaker, honestText, imposterText?}]}` and an `imposterId`. Each phone is pushed ONLY its own line objects, and the imposter is silently sent `imposterText`. Sync is a single-writer turn cursor broadcast on "next line" taps; there is little real-time contention. The genuinely hard part is **content, not code**: authoring scenes whose altered facts are subtle enough to bluff yet catchable in one pass — this needs a hand-tuned scene bank and playtesting, not engineering.

## v1 scope
- 4 players, one fixed 8-line scene, exactly one Understudy
- One round, one private vote, host reveal
- 3 pre-authored fact swaps in the imposter script

## Out of scope
- Scoring across rounds, scene selection, custom scripts
- Timers, voice capture, any AI generation

## Risks & unknowns
- Alterations too obvious (imposter instantly caught) or too subtle (nobody notices) — pure playtest tuning
- Shy players who mumble lines starve the deduction of signal

## Done means
4 phones join a room code, each sees only its own lines, one phone silently gets the altered script, the group performs turn-by-turn, all vote, and the host correctly reveals whether the Understudy was caught.
