## Overview
A 5-player, 6-minute hidden-role game for a living room with a TV and five phones. The thing the imposter secretly reads differently is not the evidence — it's the payoff function. Everyone answers the same public question from the same public information. One person is quietly being paid to be the persuasive outsider.

## Problem
Hidden-role games almost always hide *facts*: a different word, a missing panel, an extra clue. That makes deduction into a cross-checking chore, and it makes the imposter's job "avoid saying the wrong noun." Hiding the *objective* instead means the imposter never has to lie about anything — they lie only in what they're optimizing — and the tell has to be read out of behavior, which is the part of social deduction people actually enjoy.

## How it works
The host screen shows one question with six options ("Most overrated food," "Who in this room would last longest without their phone"). A 3-minute clock runs. Talk is open and unstructured.

**Every phone privately shows** the same layout: a scoring card at the top, six tappable options, and a live payoff meter. Four cards read *"You score 1 point for every player whose final answer matches yours."* One card reads *"You score 1 point for every PAIR of other players whose final answers match each other. You score 0 if your answer matches any of them."* The imposter's phone adds one line: *"Your rule may not be the same as everyone else's."* Nobody may read their card aloud.

**The host screen privately shows nothing** — it shows a live, anonymous histogram of the room's current picks, one unlabeled block per player, updating the instant anyone taps. Blocks move as people change their minds. At 0:00 everything locks, and the room gets 60 seconds and one vote each: who was playing a different game?

The tension is entirely in the histogram. An innocent's optimal late move is *toward* the tallest bar. The imposter's optimal move is away from it — and a block jumping off the mode at 0:04 is visible to everyone without naming anyone. So the imposter must either defect early and keep advocating loudly for a bloc they've abandoned, or manufacture a 3–2 split so a departure reads as ordinary indecision. Innocents win by majority-voting the imposter; the imposter wins by surviving.

## Technical approach
PartyKit Durable Object per room, one object owning all authoritative state:

```
Room { code, phase, deadlineTs, questionId, options[6],
       players: { id, name, connId, pick|null, cardType, hasVoted },
       roleSeed }
```

Phones are PWA clients over WebSocket; the host tab is just another client with `role=host`. Card assignment happens server-side at start; `cardType` is never broadcast — each connection receives only its own card text and its own computed meter value. The server recomputes meters on every pick change and pushes per-connection diffs, so two players sitting side by side genuinely cannot see the same number.

Sync strategy: server-authoritative, last-write-wins on `pick`, with a monotonic `seq` on every state push so out-of-order phone messages are dropped rather than merged. The host histogram is a derived projection (`counts[6]`) broadcast to all, plus per-player block identity that is *deliberately shuffled* each render so blocks can't be tracked to people by position.

The genuinely hard part is the buzzer. The whole game hinges on whether a defection at 0:03 is visible, so lock time must be identical across five phones on flaky wifi. Fix: server sets `deadlineTs` in server time, phones estimate clock offset with a ping/pong handshake at join, and any `pick` message whose server arrival time is past the deadline is rejected and surfaced to that player as "too late" rather than silently dropped.

## v1 scope
- Exactly 5 players, one round, one hard-coded question deck of 10.
- Two card types only; one imposter, assigned randomly.
- Live anonymous histogram on TV; live private meter on phone.
- One simultaneous vote, win/lose screen, no scoring across rounds.
- No accounts, no reconnect, no spectators.

## Out of scope
Multiple rounds, more than one imposter, card types beyond the two, player-authored questions, chat, mid-round abilities, mobile-native anything, persistence.

## Risks & unknowns
The imposter may be trivially catchable if innocents just watch the histogram at the buzzer — needs playtesting; the escape hatch (manufacture a split) may be too hard to execute in 3 minutes. Conversely, a room that never converges makes the imposter invisible, since there's no mode to defect from. Question quality is load-bearing: questions with an obvious right answer collapse to a unanimous bar instantly.

## Done means
Five phones join a code, one gets the alternate card, a pick tapped on any phone moves a block on the TV within 250 ms, picks hard-lock at the shared deadline, and a full round ends with a vote screen naming the imposter — played end-to-end by five people in one room with no operator intervention.
