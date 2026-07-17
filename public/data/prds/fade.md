## Overview
Fade is a 3-6 player party game that turns a suspense clip — a lizard sprinting from a nest of snakes, a soufflé in the oven, a Jenga tower mid-wobble — into a live parimutuel betting market. It's for a group that would otherwise just yell "he's not gonna make it!" at the TV. Fade gives that yelling stakes, secrecy, and a payout curve that rewards nerve.

## Problem
Watching a "will it happen?" moment together is pure passive consumption. Everyone has an opinion, but opinions are free — there's no cost to being loud and wrong, and no reward for a quiet correct read. The tension the clip manufactures evaporates the instant it resolves. Fade converts that manufactured suspense into a market you can actually win.

## How it works
The host TV plays a curated ~40s clip that pauses 2s before the reveal. The outcome is binary: YES (it escapes / it holds / it rises) or NO. Each player starts with 10 chips. As the clip plays, each phone PRIVATELY shows two piles — YES and NO — and you drag chips between them in real time, reacting to the drama. The host TV shows a live tote board: total chips stacked on each side and the implied parimutuel odds, updating ~4x/second — but AGGREGATE ONLY, never who bet what.

Payout is parimutuel: the winning side splits the entire pot proportionally to stake. So if the whole room piles onto YES and you're the lone soul on NO, a correct NO pays enormous. The public tote is bait — the game is reading the crowd's money and deciding whether to ride it or fade it, secretly, while the clip messes with everyone's nerve. Betting hard-closes 2s before reveal; the host resumes, reveals, and animates payouts.

Private per phone: your chip allocation and your live potential payout. Public: only the aggregate pot and odds.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room {clipId, phase, closeAt}`, `player {id, chips:{yes,no}}`; server derives pot totals. Phones emit debounced allocation deltas; the server holds canonical pot and broadcasts aggregate totals to the HOST only at ~4Hz — player identities never travel with amounts.

The genuinely hard part is a tote that feels live without (a) leaking identity or (b) letting the last mover snipe after seeing final odds. Solve with a server-authoritative hard close 2s pre-reveal (server timestamp, not client) and by never sending the outcome to phones — the host tab alone holds it, so devtools can't cheat.

## v1 scope
- 3 players, one bundled clip, binary outcome
- 10 chips, drag between YES/NO piles live
- Aggregate tote + odds on host, hard close, parimutuel payout
- One round, no persistence

## Out of scope
- Multiple rounds / leaderboard, cash-out mid-clip, >2 outcomes, custom or user-uploaded clips, real video CDN.

## Risks & unknowns
- Clip library must be genuinely uncertain suspense (a boring clip kills it); sourcing/licensing.
- Does parimutuel-minority-pays-more read as intuitive to non-gamblers on the fly?
- Fairness feel at the betting close.

## Done means
Three phones move chips live during one clip, the host tote updates within ~300ms, betting closes cleanly, the outcome reveals, and payouts compute correctly with the minority side visibly paying more.
