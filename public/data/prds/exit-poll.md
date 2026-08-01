## Overview
Exit Poll is a one-round, 4-player deduction game for a shared TV plus phones. Everyone privately answers a four-option question. The true tally is never shown. Instead each phone receives a private *Slice* — two anonymous reports of how other players answered — and one player's slice contains a fabricated report of a vote nobody cast. The room must talk its way to the real tally and name the poisoned phone.

## Problem
The "one player sees something different" premise usually dies on arrival: if three innocents share one identical true view and one player's view is warped, the innocents agree instantly and out-vote the odd one 3-to-1. It's a gotcha, not a game. Exit Poll fixes it by making *everyone's* view partial. Honest disagreement is the normal state, so a corrupted view is genuinely camouflaged — and the poisoned player, who is never told, sincerely believes the room is gaslighting them.

## How it works
**Shared TV:** the question and four options ("Worst airport in America: A/B/C/D"), a discussion timer, and — critically — nothing else. No tally, ever, until reveal.

**Phase 1 (10s):** every phone privately locks an answer. The server records the true multiset of four answers.

**Phase 2:** each phone privately receives its Slice: two reports of the form *"someone in this room answered B"*, drawn from the other three players' actual answers, unattributed. One phone's slice has one report replaced by a fabricated answer nobody gave.

**Phase 3 (3 min):** open discussion. Phones may not be shown. Each player holds one hard fact (their own answer) plus two soft reports. Eight reports total, of which one is false — so if all reports were honest the answer counts would close cleanly against four players. They won't. The room can *prove* a fake exists and argue about who is over-claiming.

**Phase 4:** simultaneous private lock — each phone submits its reconstruction of the full tally, and a name: who holds the cooked slice, or **ME**. Reveal on TV shows the true tally, all four slices, and the fabricated report highlighted in red. Scoring: +3 exact tally, +2 correctly naming the cooked slice, +5 to the cooked-slice holder if nobody names them, +3 if they correctly name themselves.

## Technical approach
Host tab + phone PWAs, authoritative WebSocket server (PartyKit / Durable Object per room). State: `{question, answers: {playerId → option}, slices: {playerId → [report]}, poisonedPlayer, fabricatedIndex, phase, locks}`. Slices are computed server-side after all answers land and pushed only down each player's own socket — a phone never receives another phone's slice.

Sync is simple (four players, four phase transitions); the genuinely hard part is *slice generation*. The fabrication has to be deniable: if the fake report names an option nobody picked and the fake happens to be the only mention of that option, the room solves it in one pass. v1 constrains generation — reject any assignment where the fabricated option has zero true votes *and* zero other reports, and reject any where the honest reports alone already pin the tally uniquely. That's a rejection-sampling loop over a tiny space, cheap to run and easy to unit-test as a solver: enumerate all tallies consistent with the honest testimony and require ≥2 survivors.

## v1 scope
- Exactly 4 players, one round, ~4 minutes.
- One hand-written question with four options.
- Two reports per slice, one fabricated report, one poisoned player.
- Reveal screen with slices and the fake highlighted. Scores as plain text.

## Out of scope
- Multiple rounds, question packs, player-authored questions.
- Variable player counts (slice sizing math changes).
- Chat, timers per speaker, rejoin.

## Risks & unknowns
- Four players may be too few for the fog to hold; five with three-report slices may be the real minimum.
- Players may refuse to reason arithmetically and just vote on vibes, collapsing it to Werewolf.
- Question quality matters more than expected — an option nobody would ever pick makes the fabrication glaring.

## Done means
Four phones lock answers; each receives a distinct two-report slice; exactly one contains a fabricated report. The slice generator provably leaves ≥2 tallies consistent with honest testimony. In playtest, the room detects that a fake exists in at least 3 of 4 sessions, but correctly names the holder in fewer than half.
