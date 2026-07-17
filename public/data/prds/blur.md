## Overview
Blur is a 4–6 player *cooperative anonymity* game. Everyone contributes one true-ish secret, then launders someone else's, and the group's shared artifact is an anonymized "secrets zine" page. For a room of people who know each other well enough that phrasing gives everyone away.

## Problem
There's a real itch — the PostSecret feeling — to say something true and unpopular in a room of friends, but your word choices, your pet phrases, the specific detail you can't resist, always out you. Every other secrets party game is a gotcha: *guess who said it*. Blur inverts that. It's cooperative — you win by protecting the stranger whose secret landed on your phone.

## How it works
**Round 1 (compose):** each phone privately types one short confession / unpopular opinion / petty grievance under a light prompt.

**Round 2 (launder):** the server deranges the pile so every confession lands on a *different* player. Your phone privately shows ONE stranger's raw text plus a client-side "tell-meter" that flags identifying specifics — names, numbers, telltale stylometry (function-word ratio vs the group mean). You rewrite the line to drop the meter while keeping the claim recognizably the same. The host TV shows only a laundering progress bar — never text.

**Round 3 (publish + guess):** all laundered lines appear anonymously on the TV as a zine page. Each phone privately attributes every line to an author. You "win" your laundered line if the room can't majority-attribute that confession to its true author. The group keepsake is the exported zine PNG plus an "N of 4 stayed hidden" summary.

**Private (phone):** your own confession, the single stranger's text you're laundering (unique per phone), your tell-meter, your guesses. **Shared (TV):** the progress bar, the final anonymized zine, the aggregate hidden count. A passed-around phone destroys both the secrecy and the simultaneity — the architecture is the game.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `confession { id, authorId, rawText, launderedText, launderId }`. The server performs the derangement (no one launders their own) and NEVER leaks `authorId` or `rawText` to any client — raw text lives server-side only; clients receive laundered text unlabeled. Phases are request/response, not latency-tight, so sync is easy. The tell-meter is pure client-side (regex for names/digits + function-word frequency vs a broadcast group mean) — cheap and needs no model. Genuinely hard part: a correct derangement for small N, and airtight server-side attribution tallying that never round-trips authorship to a phone.

## v1 scope
- 4 players, one confession each
- One launder pass, one guess pass
- Zine PNG export + "N of 4 stayed hidden" summary

## Out of scope
- Multiple rounds; varied prompt decks
- Real anonymity guarantees (it's a party game, not a threat model)
- Content moderation of dark confessions; editing after publish

## Risks & unknowns
- Content can get too heavy — needs a deliberately light prompt framing.
- Laundering may strip a line down to something boring.
- With only 4 players a derangement is small and attribution may be too easy.

## Done means
Four phones submit, the server deranges, each player launders a stranger's line, the TV shows the anonymized zine, the group sees how many confessions stayed un-attributed, and the zine exports as a PNG.
