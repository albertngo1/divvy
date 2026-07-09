## Overview
Needle Drop turns a passive group listening session — the playlist at a kitchen party — into a live betting parlor. The host speaker plays 20-second snippets; each phone is a private betting book with a hidden bankroll. It's for 3–8 people who'd otherwise just half-listen to whatever's queued.

## Problem
A shared playlist is the ultimate passive consume: it plays, people vaguely nod, nobody's *invested*. Meanwhile everyone has private opinions — "this drops hard," "this is older than they think" — that never get tested or scored. There's no reason to actually pay attention.

## How it works
The host plays snippet N and, before it ends, opens a prop bet on snippet N+1 (which is queued but unheard): e.g. "faster or slower BPM?", "released before or after 2010?", "will the table rate it 4+ stars?". Each **phone privately** shows the prop, your hidden bankroll, and a slider to wager. Bets are **pari-mutuel**: the pool splits among winners, so payout depends on how the (hidden) crowd bet — being right *and* contrarian pays huge. The **shared screen** shows only the now-playing snippet, the open prop, a "X players in" counter, and live public odds (derived from pool sizes, not individual bets). Snippet N+1 plays, the truth resolves (BPM/year from metadata; "banger" by a quick host-screen crowd vote), the pool pays out, and it rolls to the next. After 5 snippets, richest bankroll wins.

The private phone is load-bearing: simultaneous live wagering, a secret bankroll you protect or gamble, and the fact that odds must reflect *aggregate* hidden money — a single passed phone can't hold five people's concurrent bets or keep them secret.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit DO or Socket.IO over Tailscale Serve). Audio: preset local snippet files (or Spotify/Deezer preview URLs) with metadata `{bpm, year, id}` known only to the server. Data model: `Room { code, phase, currentSnippet, prop, pool: {sideA, sideB} }`; `Player { id, name, bankroll, bet: {side, amount} }`. Sync: phones emit `bet`; server aggregates into pool totals and broadcasts ONLY the totals (→ public odds), never individual bets. On `resolve`, server reads metadata truth, splits pool pari-mutuel, updates bankrolls, broadcasts results. Hard part: the betting window must close deterministically the instant snippet N+1 starts — clock skew between host audio and server can let a phone bet after hearing the answer. Server owns the close timestamp; phones show a synced countdown and reject late bets server-side.

## v1 scope
- 5 preset snippets with metadata, one lobby, 3–6 players.
- One prop type only: faster/slower BPM than current.
- Fixed starting bankroll, pari-mutuel split, final leaderboard.

## Out of scope
- Streaming-service auth, custom playlists, "banger" crowd-vote prop.
- Multiple concurrent props, side bets, persistent profiles.

## Risks & unknowns
- 20 seconds may be too short to form a real read; timing needs tuning.
- Metadata (BPM especially) can be unreliable — needs curated snippets in v1.
- Music licensing if it ever leaves preset local files.

## Done means
Six phones join, snippet 1 plays, a faster/slower prop opens with a synced countdown, all six privately wager from a hidden bankroll with no bet leaking before close, snippet 2 plays and resolves from server-held BPM, the pari-mutuel pool pays out correctly, and after 5 snippets a leaderboard names the richest player.
