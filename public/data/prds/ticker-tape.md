## Overview
Ticker Tape turns the passive act of watching a clip together into a live prediction market with a mole. 3–5 players watch a short suspenseful video on the host screen while a real-time price for a single proposition ('does the skater land the trick?') ticks on the TV. Each player privately trades shares from their own phone. One player has secretly been shown the ending — the fun is riding the market while everyone hunts the insider by how the price moves. For groups who find regular movie night too quiet.

## Problem
Watching something together is the ultimate passive consumption — you sit, you react, that's it. The latent tension (will it happen?) is never wagered on, and the one time it'd be electric — someone in the room already knows — never gets weaponized. The itch is a market where private information leaks through price, not words.

## How it works
Before playback, the server secretly designates one **Insider** and privately reveals the clip's outcome to that phone only. The host screen plays the clip (paused at a cliffhanger frame for a 20s trading window) alongside an anonymous price line for 'YES it happens', currently at 50¢.

Each PHONE privately shows: your cash, your share position, and BUY/SELL buttons. Trades run through an automated market maker (LMSR), so every buy nudges the public price up and every sell nudges it down — the host shows only the moving line, never who traded. The Insider wants to buy quietly enough not to be obvious; everyone else reads the tape for suspicious conviction. After the window, the host plays the ending: YES shares settle at 100¢, NO at 0¢. Then each phone privately votes 'who was the Insider'; correctly fingering them claws back a bonus. Per-phone privacy is load-bearing twice over — hidden positions AND one hidden spoiler — so a single shared phone destroys both the market and the deduction.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Market { b (LMSR liquidity), qYes, qNo, phase }`, `Player { cash, shares, isInsider }`. Server is the sole market maker: on each trade it computes LMSR cost `C = b·ln(e^(qYes/b)+e^(qNo/b))`, debits the trader, updates quantities, and broadcasts the new price to all (host + phones) with no trader identity attached. The hard part is **real-time fairness under latency**: trades must be serialized server-side so price is consistent for everyone, and the tick broadcast has to feel instant (<150ms) or the market feels rigged — batch-and-flush ticks at ~10Hz rather than per-trade.

## v1 scope
- 3 players, one clip, one binary proposition, one 20s trading window.
- Fixed starting cash, single LMSR market, flat settlement.
- One Insider, one insider-vote at the end.

## Out of scope
- Multiple markets / a playlist / running bankroll.
- Short-selling limits, order books, or shorting mechanics beyond sell.
- Auto-sourced clips or spoiler detection — clip + outcome are hand-authored.

## Risks & unknowns
- With 3 players and 20s, can the price carry enough signal to out the Insider, or is it noise? May need a longer window or a bigger position cap.
- LMSR tuning: too much liquidity and the price barely moves; too little and one trade pins it.

## Done means
Three phones join, one is privately shown the ending, a 20s window runs with each phone buying/selling against a server-side LMSR that pushes an anonymous live price to the TV, the clip resolves and shares settle, and phones privately vote the Insider — with no position or spoiler ever visible to anyone but its owner.
