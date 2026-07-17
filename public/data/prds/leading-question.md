## Overview
A phone-native riff on *Insider*, for 4-6 players. The room collaboratively guesses a hidden word via yes/no questions against a timer — but a secret **Insider** already knows the word and is nudging the group to succeed fast without being spotted. If the group guesses in time, they then hunt the Insider. The private, divergent knowledge is the entire engine.

## Problem
*Insider* is a brilliant, underplayed party game whose whole tension is that some players secretly share the Master's knowledge — but on cardboard it needs face-down role cards, an honest word-holder, a human timer, and a fiddly vote. It's begging to be a phone game, and no Jackbox-shaped riff exists.

## How it works
1. **Roles (private, per phone).** Server secretly assigns one **Master**, one **Insider**, and the rest **Commoners**. Master and Insider phones privately display the secret word (e.g. "LIGHTHOUSE"). Commoner phones show only "Ask yes/no questions aloud." This split view is load-bearing — the Insider knowing what Commoners don't is the game, and it can never be a single passed phone.
2. **Interrogation (90s).** Players ask yes/no questions *aloud*. The Master taps **Yes / No / Sort of** on their phone; each ruling posts to the host TV as a running numbered log. The Insider blends in — asking innocuous questions, subtly herding toward the word — racing the clock because a *failed* guess means the group loses and the Insider loses too.
3. **Guess.** When someone shouts the exact word, the Master taps **Correct**, freezing the timer.
4. **The hunt (private vote).** If solved in time, every phone privately votes for who they think the Insider was. Simultaneous, hidden. Host reveals the tally.
   - Group solved **and** correctly fingers the Insider → group wins.
   - Solved but Insider escapes the vote → Insider wins.
   - Timer expires unsolved → everyone loses (the Insider failed to steer).

Private per phone: your role, the word (Master/Insider only), and your Insider vote. Public on host: the answer log, timer, and final reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

**Data model:** `Room { word, phase, timerEndsAt, log: [{q?, ruling}] }`; `Player { id, name, role }`; `Vote { voterId, accusedId }`. Server is sole holder of `word` and `role` and pushes each only to the entitled phone.

**Sync:** Master's ruling taps append to a shared log broadcast to all; a single authoritative countdown drives every screen. Light real-time load.

**Genuinely hard part:** the **timer must be server-authoritative and identical on every screen** — drift or a laggy phone showing 4s left while the TV shows 0 breaks the climax and the win condition. Clock sync + a clean freeze-on-correct is the real engineering. Secret-word leakage (never send word to Commoner sockets) is the security requirement.

## v1 scope
- 4-6 players, one round, one word from a ~40-word list.
- Voice questions; Master taps rulings; fixed 90s timer.
- Private role/word delivery, running TV log, private Insider vote, three-way outcome.

## Out of scope
- Typed/routed questions, multiple Insiders, scoring across rounds.
- Custom word packs, spectators, reconnect-mid-round recovery.

## Risks & unknowns
- Needs a confident Master to adjudicate fairly and fast.
- With 4 players the Insider is easy to catch; 5-6 is likely the real floor.
- Insider incentive balance (help vs. hide) may need timer tuning.

## Done means
Six phones join; server privately hands one Master and one Insider the word and everyone else nothing; the room asks questions, the Master's Yes/No taps stream to the TV under a synchronized countdown, and on a correct guess the timer freezes and every phone casts a private Insider vote that resolves to the correct three-way outcome — with no Commoner phone ever receiving the word over the wire.
