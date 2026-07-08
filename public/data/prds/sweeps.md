## Overview
Sweeps turns passively watching a show into insider trading. The host TV plays a short auto-generated mini-"episode" — a soap/whodunit told in acts — while 3-6 players privately bet on how it ends, each armed with a different genuine spoiler. For groups who like poker faces and prediction markets.

## Problem
Watching a show together is passive: everyone consumes the same content with nothing at stake and no asymmetry. Sweeps injects an edge — you *know* something the others don't — and the drama becomes about hiding and reading that edge.

## How it works
The host TV reveals an episode in ~4 acts (text/scene cards on a beat). Several open markets sit alongside: "Who dies?", "Does the heist succeed?", "Is there a betrayal?". At the start each phone is privately dealt 1-2 **insider tips** — spoiler fragments that are each individually TRUE but per-player different (e.g. you know "the butler survives"; someone else knows "there is a betrayal"). Between acts a betting window opens: each phone privately allocates chips across outcomes. Bets are hidden; the host shows only a **parimutuel odds board** that shifts as money moves — so you can read the crowd, but not who moved it. Betting hard on your secret shifts the odds and quietly leaks your tip; others infer and counter. At the finale the episode resolves and the pot pays out parimutuel. Most chips wins.

**Private per phone:** your insider tip(s), chip allocation, bankroll. **Host screen:** the unfolding episode, live odds board, final resolution + leaderboard.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `Room{players, episodeSeed, markets[], phase}`, `Player{bankroll, tips[], bets{marketId->{outcome->chips}}}`. The server picks the episode's true resolution up front, then derives per-player tips that are each true but jointly leave real uncertainty. Sync: server owns the act clock, closes each betting window on a barrier, then recomputes and broadcasts odds. The genuinely hard part is authoring episode templates whose tip fragments are each true, non-redundant, and still leave the ending under-determined — plus computing live parimutuel odds without leaking identity at small player counts.

## v1 scope
- 3 players, one pre-authored episode
- 2 markets, 2 betting windows, one round
- Fixed insider tips, flat starting bankroll

## Out of scope
- LLM/generative episodes, an episode library
- Chat, reconnection polish, animation

## Risks & unknowns
- Episode authoring IS the game; weak templates = no fun
- 3-player odds board may leak who bet what
- Balancing insider edge against noise so tips matter but don't dictate

## Done means
Three phones join, each sees a different true tip, place hidden bets across two acts, the host resolves the episode and computes a parimutuel payout, the leaderboard names a winner — and a player who correctly acts on their private tip can demonstrably win the pot.
