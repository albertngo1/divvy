## Overview

A 4-player game played over an 8-minute clip. You don't place bets — you're **dealt** them, mostly bad ones, and the game is offloading them onto your friends before the credits. For groups who like a little cruelty with their movie night.

## Problem

Prop-betting games let you wager only on things you already like the odds of, so everyone plays comfortable and nothing happens between bet and reveal. The live, funny emotion is being *stuck* with something toxic and having ninety seconds to talk a friend into eating it — while the thing you're both watching keeps ticking toward settlement.

## How it works

1. **The session.** TV plays an 8-minute segment with a session clock. Credits = the close.
2. **The deal (private).** Each phone gets 3 contracts, visible only to its holder. Each is a prop about the segment with a direction you're stuck with and a face value: *"PAYS −60 if anyone on screen cries."* Most are liabilities; two in the deck are gifts.
3. **The offer (private, targeted).** Any time, you pick one of your contracts, pick a player, and attach a sweetener in chips. Their phone buzzes and shows **only**: who offered, the sweetener, and the contract's one-word tag — `PEOPLE`, `SOUND`, `PLOT`. Not the text. 15 seconds to accept or decline. Accept and the full contract transfers.
4. **The only channel is price.** A blind buyer has your number, your tag, and your face. Table talk is legal and unverifiable — "honestly this one's fine, I just need the room" costs nothing to say.
5. **The ticker (shared).** The TV posts every completed trade as `Dana → Sam · 40 · SOUND`. Everyone watches prices for tags rise, building a folk consensus about what's radioactive without anyone seeing a single contract.
6. **Close.** Each contract is revealed, resolved against the segment, and settled to whoever holds it. Anything still in your hands settles at **double** face — the overnight penalty. Being flat is the goal; being right is a bonus.

Private per phone: contract texts, your holdings, your bank. Shared: clock, trade ticker, settlement walkthrough, standings.

## Technical approach

Host tab + phone PWAs on an authoritative room server (PartyKit / Durable Object).

`Contract{id, text, tag, face, holderId, history[]}`, `Offer{id, contractId, fromId, toId, sweetener, expiresAt, status}`. A contract's `text` is sent only to its current holder's socket; on transfer the server pushes the text to the buyer and revokes it from the seller's next projection.

Hard part is concurrency, not bandwidth. Offers race: you can be offered two contracts at once, you can spam-offer the same contract to three people, and a contract must transfer **exactly once**. Solve with a per-contract lock — at most one live offer per contract, reserved on creation, released on decline/expiry — with every transition serialized inside the DO's single-threaded loop. Second hard part is clock trust: the 15-second accept window and the session close are server-timed, with each client interpolating from a `serverNow` offset it syncs on connect, or a laggy phone gets robbed at the buzzer.

## v1 scope

- 4 players, one hardcoded 8-minute clip
- 3 contracts each, dealt from a 20-card hand-written deck
- One tag per contract, fixed 15s offer window
- Double-face penalty on unsold contracts
- Host taps YES/NO per contract at settlement

## Out of scope

Splitting or partially transferring a contract; taking the opposite side to hedge; broadcast auctions to the whole room; auto-resolution from the video; multiple sessions; anything persisted between parties.

## Risks & unknowns

Cold start: in the first minutes nobody knows what a tag is worth, so prices are noise — mitigate by showing three sample resolutions on the TV pre-session. Twelve settlements may outrun attention; cap the walkthrough at 3 minutes. If the room stays quiet, blind buying reads as arbitrary rather than social — the tag plus eye contact has to carry it. Host-as-judge invites disputes.

## Done means

Four phones, one 8-minute clip, at least six successful transfers with no contract ever held by two players and none lost. No client receives the text of a contract it doesn't hold (checked in devtools). The ticker shows every trade's price and tag. At least one player eats a double penalty at close, and final chip totals reconcile to zero-sum against the deck.
