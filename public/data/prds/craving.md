## Overview
Craving is a simultaneous-visibility snake-draft party game for 3–5 people. A shared pool of ingredient cards sits on the TV; players take turns drafting, but each phone secretly holds a different "craving" — a private scoring rubric they're trying to satisfy. It's for groups who love hidden-objective drafting games but hate shuffling packs and hiding objective cards under coasters.

## Problem
Hidden-objective drafts — everyone pulls from a common market but scores by secret goals — are great but fiddly in person: you juggle face-down objective cards, physically track a shared market, and can't privately confirm your own score mid-draft. The core tension is hate-drafting: denying a rival a card because you suspect their goal, which you can only GUESS from their picks. That collapses if objectives are visible, and a single shared board or passed phone leaks your plan or forces you to announce your score. Private, per-phone objectives are the whole point.

## How it works
The TV shows a shared market of ~9–12 ingredient cards (colors/types, e.g. "🌶 spicy", "🧀 dairy"). Snake draft order; the TV highlights whose pick it is. Each phone PRIVATELY shows: your secret craving ("collect the most spicy," "one of every color," "avoid dairy entirely"), your drafted pile, and a live private score. You tap a market card to draft it; the server validates and it leaves the pool for everyone. Public info = who took what. Private info = WHY. So you watch rivals' picks, try to deduce their craving, and deny it — all without exposing your own. When the market empties, the TV reveals every craving and every final score.

Private (phone): your craving, your pile, your running score. Shared (TV): the market, draft order, taken-card log, final reveal.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale). Data model: Room{code, players[], market[cardIds], turnIdx, direction, phase}; Card{id, color, type}; Player{id, name, cravingId, pile[]}. The server holds the full deck plus hidden cravings; each phone receives ONLY its own craving on join. Sync is turn-based, so there's little real-time pressure — the server validates "is it your turn, is the card still available," applies the pick, broadcasts the updated market + taken-log to all, and pushes the new private score only to the drafting player. The genuinely hard part is integrity, not latency: all secret state (cravings, scores) stays server-side and no phone ever receives another player's craving; plus clean snake-order enforcement and disconnect handling (skip or auto-pick on timeout).

## v1 scope
- One draft, 3 players
- 9-card market, 3 picks each, single snake pass
- Three hardcoded craving types
- Live private score, final public reveal
- Text-only cards

## Out of scope
Multiple packs/rounds, card art, negotiation or trading, more than a handful of craving types, reconnect/timeout auto-pick, tie-break ceremony.

## Risks & unknowns
Whether 3 picks give enough signal to deduce and deny; craving balance so no rubric dominates; whether deduction is fun with only 3 players; keeping cravings hidden while scores stay legible to their owner.

## Done means
Three phones join; each privately sees a different craving; players alternate drafting from the shared TV market in correct snake order; taken cards vanish from all screens; at reveal the TV shows each hidden craving and a correct final score per player.
