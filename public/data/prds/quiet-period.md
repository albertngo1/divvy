## Overview
A 4–5 player living-room game for anyone who has ever yelled at a TV. One short clip plays on the shared screen. A single binary contract trades on it — "DOES SHE OPEN THE BOX?" — quoted 0 to 100. Every phone is a private trading desk. One phone, secretly, has seen the ending.

## Problem
Watching something together is the lowest-stakes thing a group does. Existing "bet on the show" formats are trivia in disguise: everyone has the same information, so the only variable is who guesses better. Nothing is at stake between the people in the room. The itch is a market where the information is genuinely unequal and the inequality is *visible in the price* before it is visible in anyone's face.

## How it works
Host screen (public to all): the clip, plus one contract with a live price, a 12-tick price tape, and an anonymous volume bar. Never any names, never any positions, never who traded.

Each phone (private): your cash (10), your position (shares, can go negative to −3), and two buttons — BUY 1 / SELL 1. Each fill moves the public price by a fixed impact (±3), so conviction is spendable but loud.

One phone, chosen at random, also gets the SPOILER: a single still frame captured from 40 seconds ahead in the clip, viewable once for four seconds, then gone. Its header reads *You are wall-crossed. Anything you say is on the record.*

Every player gets one ANONYMOUS NOTE — 12 typed characters-limited words pushed to the TV with no attribution. That is the entire cheap-talk channel, and the insider's best lie lives there.

When the clip reaches the annotated resolution moment, trading halts 1.5s early, the contract settles at 0 or 100, and payouts land. Then every phone privately names the insider. Anyone correct takes 25% of the insider's profit; if the majority misses, the insider keeps it all.

## Technical approach
PartyKit Durable Object per room, one room = one clip. State: `{phase, price, tape[], players{id, cash, qty}, insiderId, clip{src, settleAtMediaMs, outcome}}`. Host tab owns the `<video>` element and is the clock authority, heartbeating `mediaTimeMs` every 250ms; phones estimate offset with a three-ping handshake.

Orders are applied strictly sequentially inside the DO against a linear market maker, so no double-fills and price is always derivable from the order log.

The genuinely hard part is the settle race. The answer becomes visible on the TV before any "stop trading" message can reach five phones. Fix: the halt is scheduled server-side against host media time (`settleAtMediaMs − 1500ms`), phones pre-render the halt locally from their measured offset, and the server rejects any order stamped past it. Late clicks must feel rejected, not stolen.

## v1 scope
- 4 players, one 100-second clip, ONE binary contract
- BUY 1 / SELL 1 only, position clamped to [−3, +3]
- One spoiler frame, four seconds, one viewer
- One anonymous note per player
- One accusation round, then a final chip table

## Out of scope
- Limit orders, order books, multiple simultaneous contracts
- Clip library, uploads, licensing, rejoin-after-disconnect
- Multi-round series, persistent bankrolls, lobby art

## Risks & unknowns
- If price impact is too small, the insider maxes out invisibly and the deduction layer dies; if too large, one click ends the game. Impact tuning is the whole balance problem.
- Market UI comprehension for non-finance players — the price tape may need to read as a thermometer, not a chart.
- Clip sourcing and rights for anything shippable.

## Done means
Four phones and one TV run a 100-second clip end to end: the tape visibly jumps, the contract settles, payouts resolve, and in playtest at least one non-insider says "somebody knows something" out loud *before* the reveal — and is right more than chance.
