## Overview
Carry is a 3-4 player cooperative voice game (host TV + phone PWA controllers). The host issues a target ("make 12 using exactly three players") and the room must verbally figure out whose hidden numbers add up — then get precisely those players, and only those players, to commit together within a timing window.

## Problem
Group arithmetic is trivial when everyone sees the numbers; it becomes a real-time coordination scramble when each number is private and must be spoken. The itch is the double bind: solving the sum out loud AND executing a clean simultaneous commit with the correct subset, while excited players who aren't in the answer keep their fingers off the button.

## How it works
Each phone privately shows a hand of 2-3 number tiles (e.g. `[3, 5, 9]`) and a big COMMIT button. The host screen shows the target and the required player count: "TOTAL 12 — THREE VOICES." Nobody can see anyone else's numbers, so players must call them out ("I've got a 3 and a 9!") and negotiate a valid subset aloud.

When the room agrees, exactly the chosen players press-and-hold COMMIT. The server waits for a stable set of held buttons within a ~700ms window, then checks two things: (1) the number of committers equals the required voice count, and (2) their contributed tiles sum to the target. If a non-solution player also commits, or someone in the solution hangs back, or the sum is wrong → RESET buzzer. Correct → the vault opens. Because multiple valid subsets can exist, a second group half-committing causes collision, so the room must settle on one answer verbally before anyone touches the button.

PRIVATE per phone: your number tiles, your COMMIT state. SHARED on host: the target, the required voice count, a live count of "hands down / hands raised," the timer, and the win/RESET verdict.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room) over Tailscale Serve. Data model: `Room{target, requiredCount, hands{phoneId→[int]}, committed{phoneId→{tileChoice, tHold}}, phase}`. Hands are pre-generated so at least one valid subset of the required size exists for the target (optionally a second, as intentional bait). Each committing phone sends which of its tiles it's contributing plus a hold timestamp. The hard part is the fair simultaneous-commit arbitration: normalize hold timestamps against server-measured RTT so a laggy phone isn't unfairly ruled "late," and define the ~700ms settle window as the interval after the FIRST commit during which the held-set must stabilize — resolving to exactly one verdict rather than flickering partial states.

## v1 scope
- 3-4 players, one round, one target, fixed required count of THREE.
- Pre-generated hands guaranteeing exactly one valid 3-player subset.
- Hardcoded 700ms settle window, single vault, 60s timer.
- Host shows target, hands-raised count, verdict.

## Out of scope
- Multiple simultaneous targets, subtraction/multiplication, scoring.
- Speech verification; number-calling is honesty-based.
- Reconnect handling, >4 players, difficulty ramps.

## Risks & unknowns
- Arithmetic may feel dry vs. wordier voice games; flavor (naming tiles as cargo weights?) may be needed.
- Settle-window tuning is delicate — too tight punishes slow phones, too loose lets stragglers sneak in.
- With only 3-4 players and small hands, the puzzle may be too easy; decoy subsets needed for tension.

## Done means
Four phones join, each shows a private number hand, and the room can solve a called target by shouting numbers and get exactly three correct players to COMMIT within the window; a fourth player also committing, or a wrong sum, reliably triggers a single RESET verdict, and a clean correct commit opens the vault on the host screen.
