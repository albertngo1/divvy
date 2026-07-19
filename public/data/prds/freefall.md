## Overview
Freefall is a 3-6 player real-time Dutch (descending-price) auction party game. Multiple items' prices fall simultaneously on the shared screen; each player races to grab bargains using private, asymmetric appraisals only their phone can see. For a group that wants 90 seconds of frantic nerve — grab now and leave money on the table, or wait and risk a rival's thumb.

## Problem
Live descending-price auctions are the tensest format and the most miserable in person: the auctioneer chants prices down, three people shout 'MINE' at once, nobody agrees who called first, and there's zero privacy for your true max. Sealed bids fix the chaos but kill the real-time thrill. And tracking each player's shrinking budget by hand is pure bookkeeping. Private phones let the tension survive without the fistfights.

## How it works
The TV shows 3 item cards, each with its own price ticking *down* every second, plus a stock indicator. **Privately, each phone shows:** your secret appraisal of what each item is truly worth to *you* (values differ per player — you each got a peek the others didn't) and your hidden remaining budget. Tap **BUY** on an item to claim it at its current displayed price; the first tap wins, the price is deducted from your budget, and that clock stops. Because appraisals are asymmetric and hidden, you never know whether a rival also knows item 2 is a steal — so sniping early wastes money, waiting risks the grab. When every item is sold or hits its price floor, the round ends. Score = total private appraised value acquired minus total paid; appraisals are revealed on the TV so everyone sees who overpaid.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve). The **host clock is authoritative** — the server decrements each item's price on a fixed tick and broadcasts prices; phones only render. Data model: `room{items:[{id,price,floor,winner}], phase}`, `player{id, budget, appraisals:Map<itemId,int>, won:[]}`. A BUY tap sends `{itemId, clientTs}`; the server resolves per-item with a single-writer lock — first message to arrive wins, later taps on a closed item are rejected with haptic 'too late.' The genuinely hard part is fairness under network latency: 'first tap' must be adjudicated by server arrival order with a small lockout window, and price broadcasts must stay within ~100ms so the number you tapped is the number you pay.

## v1 scope
- 3 players, 3 items, one descending round
- Fixed equal budgets, pre-seeded distinct private appraisals
- First-tap-wins resolution, TV reveal of appraisals and scores

## Out of scope
- Multiple rounds, reserve prices, content packs, reconnection, spectators, dynamic appraisal generation.

## Risks & unknowns
- Latency could make 'first tap' feel unjust; needs a tuned lockout.
- Sniping may be too swingy or too solvable; appraisal spread must be big enough to matter.
- Runaway-leader / one-grab-decides worries with only 3 items.

## Done means
Three phones each show distinct private appraisals and budgets, three price clocks tick down live on the TV, the first BUY tap wins each item authoritatively (late taps rejected), and final scores plus revealed appraisals render correctly.
