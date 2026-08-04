## Overview
Long Story is a 4-player game where the passively-consumed content is a person. One player is the Teller and gets three minutes on a prompt ("the worst job you ever had"). The other three are silently running a prop-bet book on the anecdote as it happens, each holding contracts nobody else can see.

## Problem
Every group has someone mid-anecdote and two people politely waiting for it to end. The listening is real but inert. Turning it into a market makes listening greedy: suddenly you are tracking whether they'll name a city, quote somebody in dialogue, or catch themselves and rewind. And unlike betting on a clip, the underlying asset can hear you — which makes steering it both possible and dangerous.

## How it works
1. Host screen: the prompt, a 3:00 clock, a public tally of each listener's remaining Question Tokens (2 each), and nothing else. It never shows contracts, claims, or scores mid-round.
2. Each listener's phone privately deals 3 contracts from a deck of structural props — "names a specific city," "quotes someone in dialogue," "says a number over ten," "corrects a detail mid-sentence," "a vehicle appears." The deck deliberately overlaps: two listeners can hold the same contract and never know.
3. The Teller's phone privately shows a Tell card — a personal objective like "get at least three questions asked" or "land a punchline before the clock." They are a player, not a prop.
4. Listeners tap CLAIM the moment a contract hits. Silent. 1–3 seconds later the TV plays a neutral chime and prints "a claim was filed" — no name, no content, and jittered so the Teller can't map it to the exact word that paid. They only learn they're being profitable.
5. Steering: to ask a question you first spend a token on your phone. The tally on the TV drops publicly, so the room sees who is steering hard, never toward what.
6. Settle: each claim is reviewed one at a time. The contract text appears, everyone but the claimer votes true/false privately. Good claims pay 3; overturned claims cost 3. On duplicate contracts the earlier claim pays full, the later pays half — revealed only now.

## Technical approach
Host tab + phone PWAs + a Socket.IO server behind Tailscale Serve. State: `Round {prompt, tEnd, tellerId, tellCard}`, `Listener {contracts[3], tokens, claims[]}`, `Claim {playerId, contractId, tClient, tServer, verdict}`. Contracts are dealt server-side; a phone never receives another phone's hand, so there is no client-side secret to leak.

Sync is light — the hard part is fairness and leakage, not throughput. Duplicate-contract priority must survive uneven phone latency, so claims carry a client stamp corrected by a ping/pong clock offset, with server arrival as tiebreak. The chime is emitted by the server on a randomized 1–3 s delay and must be decoupled from claim delivery, or a laggy phone becomes a tell. The voting phase must render the contract text without ever exposing the claimant's identity, including in the WebSocket payload — voters get an opaque `claimRef`.

## v1 scope
- 4 players, one Teller, one 3-minute story, one prompt.
- 12-card contract deck, 3 per listener, 2 question tokens each.
- One review pass with majority voting, flat 3-point scoring.
- Host screen: prompt, clock, token tally, chime.

## Out of scope
Rotating the Teller, transcription or auto-adjudication, multiple rounds, contract drafting or trading, scoring history, anything using the mic.

## Risks & unknowns
Adjudication drag: twelve claims reviewed one by one could take longer than the story. Cap review at the six highest-value claims if playtests run past two minutes. A shy Teller starves the market — the prompt must be near-impossible to answer in under a minute. Contracts that resolve on "they said the word X" can be trivially farmed by a listener who says X first; contracts must be Teller-only utterances, enforced by the review vote.

## Done means
Four people in a room: the Teller talks for three minutes without ever seeing a contract, at least four claims fire with jittered anonymous chimes, both question tokens get spent by at least one listener, one duplicate-contract collision resolves earlier-full/later-half at settle, and the review pass finishes in under 90 seconds with no player able to name who claimed what before the reveal.
