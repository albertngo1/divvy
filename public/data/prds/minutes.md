## Overview
Minutes is a 4-player hidden-role game for a shared TV and four private phones. The room witnesses a short public record being created, then each phone privately shows "the official minutes" of what just happened — and exactly one phone's copy has two entries altered. Nobody is told whether they are the altered one. The round is an argument about a shared memory in which one sincere person is confidently, provably wrong.

## Problem
Social deduction almost always hands the imposter secret knowledge and asks them to lie. That's a performance skill, and it excludes bad liars. The itch here is the opposite feeling: the vertigo of not knowing whether *you* are the one reading the wrong page. Nobody has to bluff; the imposter argues in complete good faith, which is funnier and more accessible than acting.

## How it works
**Phase 1 — Witness (~60s).** The TV shows four either/or prompts one at a time ("cash or card?", "window or aisle?"). Every phone shows only two big buttons; everyone taps simultaneously. After each prompt the TV publicly reveals the full row — who chose what — for four seconds, then clears it. Phones display a "look up" screen during the reveal, so the TV is the only record and no phone can be used as a notepad.

**Phase 2 — Minutes (10s).** Each phone privately renders a 4×4 table of the whole round. Three phones show the truth. One phone, chosen at random, shows a table with exactly two cells flipped — never in the reader's own row, and always on the two prompts whose vote split was closest to even.

**Phase 3 — Deliberation (3 min).** Players talk. Tapping a cell on your phone CITEs it: the TV logs "P2 cites Q3 / P4" with no value, forcing you to assert the contents out loud. The TV shows nothing but the citation log and a timer.

**Phase 4 — Verdict.** Each phone privately votes for a suspect and optionally presses I'M DOCTORED, naming the row and column it believes was altered. The TV animates the true table beside the doctored one.

The doctored player wins outright by self-declaring at least one correct altered cell while drawing fewer than half the votes. The room wins on a correct majority vote.

## Technical approach
PartyKit Durable Object per room. State: `{players[], prompts[], truth[pid][q], doctoredPid, edits:[{pid,q}], phase, citations[], votes}`. The server owns truth and sends the minutes as a **per-socket projection** — the doctored table is never broadcast. Phase transitions are server-driven with a monotonic phase sequence; the four-second reveal is the only broadcast of truth.

The genuinely hard part is leak-proofing: one bug that ships the wrong projection ends the game silently. Ship a server-side assertion plus a fuzz test that dumps every socket's frame log and diffs the payloads. Second hard part is edit selection — an edit contradicting something a player said out loud during Phase 1 is dead on arrival, so edits are chosen only on near-50/50 prompts and never on the reader's own row.

## v1 scope
- 4 players, one round, four hardcoded prompts
- Exactly one doctored player, exactly two flipped cells
- Fixed 3-minute deliberation timer
- TV is one HTML page; phone is one page with three states
- No lobby, no avatars, no rematch

## Out of scope
Multi-round play, roles beyond doctored/clean, text chat, custom prompt packs, PWA install polish, persistent scores.

## Risks & unknowns
Group memory may be so bad that everyone doubts everything — mitigated by only four prompts and a large, slow TV reveal. Players can photograph the reveal (house rule). If the doctored cell lands on someone who announced their answer aloud, deduction collapses.

## Done means
Four phones complete a round unattended; the doctored player argues sincerely for a false cell for 60+ seconds; and a replay of the server socket log confirms each phone rendered exactly the table it was sent, with the doctored projection never appearing on any other connection.
