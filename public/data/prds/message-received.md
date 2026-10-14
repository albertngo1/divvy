## Overview
Message Received is a silent party game for 3-5 people that turns the Two Generals problem and Rubinstein's electronic mail game into something you play with your thumbs. The whole room has to attack at the same moment, but only if the hidden signal is CLEAR. Knowledge spreads through a lossy relay, and each phone privately shows how deep *its own* chain of confirmations goes. Players secretly converge on a shared "that's enough certainty" threshold.

## Problem
Most synchrony games ask "can we tap together?" The more interesting question is "how sure do I need to be that *you* are sure?" Common knowledge is the invisible glue of coordination. This game makes its absence something you can feel.

## How it works
- **Setup:** 4 phones in a ring. The server secretly rolls CLEAR (60%) or STORM. Only the **scout's** phone sees the roll.
- **Phone (private):** a big RELAY button and a big hold-to-ATTACK button. A counter reads **"Depth you've heard: N"**. RELAY sends `N+1` to the next phone in the ring. Each message is silently dropped with 25% probability, and the sender is never told. Your depth only goes up when a message from your upstream neighbor arrives. The scout starts at depth 1 on CLEAR. On STORM the scout's relay sends nothing (the button still animates, so it can't be read as a tell).
- **Host screen (shared):** a 60 s timer, a count of **messages in flight** (no content and no sender), and at the end a timeline of every ATTACK press.
- **Resolution:** if everyone's ATTACK presses fall inside one 2 s window and the signal was CLEAR, it's a big win. One or more people attacking alone loses badly. Nobody attacking is a small loss. Attacking on STORM is a disaster.
- No talking. The only coordination is guessing what depth the others have reached and when they'll fire.

## Technical approach
- **Server:** an authoritative room (Socket.IO over Tailscale Serve, or PartyKit). State: `signal`, `ring[]`, `depth[playerId]`, `inFlight[] {from, to, value, dropped, arriveAt}`, `attacks[] {playerId, t}`.
- Message delivery has a random latency of 400-900 ms so drops can't be told apart from slowness. The drop decision is made server-side when the message is sent.
- ATTACK timestamps are taken by the server on receipt. Each client's RTT is measured and the timestamps are corrected by half of it, so a laggy phone isn't punished in the 2 s window.
- **Hard part:** fairness of the timing window across phones with different latency, and making sure no client payload leaks `signal` or drop flags.

## v1 scope (humiliatingly small)
- 4 players, fixed ring, one scout.
- One 60 s round, one roll.
- RELAY, depth counter, hold-to-ATTACK, end timeline.
- Fixed 25% drop rate.

## Out of scope (for now)
- Multiple rounds or reputation, variable drop rates, a traitor who relays false depths, broadcast instead of ring topology.

## Risks & unknowns
- Players may just spam RELAY until depth 10 and fire at a fixed second (e.g. "at 0:05 left"). The countdown timer creates its own focal point. v1 might have to hide the timer from phones.
- The scout role may feel more fun than the others.
- The paradox may not land without the end timeline explaining it.

## Done means
Four phones and a host play one 60 s round. The end screen shows each player's final depth, every dropped message, the true signal, and all ATTACK times with the 2 s window drawn. Logs confirm no client ever received `signal` (except the scout) or drop flags. Over 6 playtest rounds, at least one ends in a lone attacker and at least one in a successful synchronized strike.
