## Overview
A party betting game for 3-6 friends who already gather to watch cringe/fail/reaction compilations. It turns the passive ritual of "let's watch cringe" into a live market on each other's faces — the funniest data in the room (who can't keep it together) finally gets scored.

## Problem
Watching reaction content together is pure passive consumption. The real entertainment isn't the clip — it's your friend biting their lip trying not to laugh — but that goes unmeasured. You already read the room instinctively. Make it pay, and add the delicious counter-layer of trying to defy the read.

## How it works
Each round the host TV loads a short (~20s) cringe clip, paused on frame 0. **Betting window (15s):** each phone PRIVATELY shows the opponent roster; for every opponent you drop chips on LAUGH / CRINGE / STONE. Chips are limited and payouts are parimutuel — a correct call pays more the fewer people bet that outcome for that person, so reading a non-obvious cracker is worth chasing. Simultaneously your phone privately reveals YOUR secret assignment for this clip: "Corpse — you must visibly laugh," "Deadpan — show nothing," or "Free." Lock in. **Clip plays**; everyone watches faces, not phones. **After:** each phone privately self-reports your actual reaction. Any player can hit a public CHALLENGE on someone whose report clashes with what the room saw; the challenged report goes to a 5s thumbs vote on the TV. Host resolves the pool: bets pay from reported reactions, plus a bonus if you nailed your secret dare.

Private per phone: your bets, your assignment, your self-report. Shared TV: the clip, challenge votes, payouts, and a "market recap" (who everyone expected to crack vs. who did).

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{id, phase, clipId, players[{id,name,chips,score}]}`, `Bets{roundId,bettorId,targetId,outcome,chips}`, `Assignments{roundId,playerId,type}`, `Reports{roundId,playerId,reaction}`. The host holds the authoritative phase clock; phones POST bets/reports over WS; server echoes only aggregate state to the host and per-player private state to each phone. Hard part: the parimutuel pool must stay fully hidden during betting (no leaking how many picked an outcome) yet resolve instantly — the server computes payouts only at reveal from locked bets. Clips preload on the host only; no per-phone video, so bandwidth stays trivial.

## v1 scope
- 3 players, one clip
- Three reaction buckets, fixed 10 chips each
- One secret-assignment type ("must laugh")
- Self-report + a single challenge that resolves via TV vote
- Parimutuel payout + leaderboard

## Out of scope
Camera-based auto-reaction detection; clip-curation UI; multi-round tournaments; custom decks; anti-cheat beyond the challenge vote.

## Risks & unknowns
Self-report honesty (mitigated by the room having watched + the challenge button); reaction ambiguity ("was that a laugh?"); clip taste/offense. Unknown: does contrarian payout create satisfying reads or just confusion at only 3 players.

## Done means
Three phones join via room code, place private per-target bets, receive a private assignment, watch one clip, self-report, resolve one challenge via TV vote, the server pays out a parimutuel pool, and the TV shows a leaderboard — with every bet, assignment, and report provably private until reveal.
