## Overview

A 4-player, ~5-minute party game where matching another player's answer is the worst thing that can happen to you. The punishment isn't a zero — it's a merge. Collide with someone and your two phones become one entity: one shared draft field, one submit button, one score split two ways. For groups who have played every "say the same thing as your friend" game and want the inverse.

## Problem

Games that punish matching (dispersion games, Nobody's-Favorite variants) resolve collisions with a null: both players score nothing, the round ends, the sting evaporates. There's no ongoing consequence and no comedy in the failure state. Meanwhile matching games (Family Feud, Quiplash-adjacent) make agreement the goal, so all the social energy goes into reading the room instead of dodging it. Nobody has made the collision itself into a persistent, escalating, physically annoying condition.

## How it works

Six ticks, 20 seconds each. The host TV shows a deliberately narrow category — "a Beatle", "a primary color", "a thing in a hospital room". Talking is loud and legal: claim your territory out loud, then betray it.

Privately, each phone shows a text field, your current score, and your account roster (initially: you). Everyone types blind and submits before the timer. On reveal the TV shows every answer at once with normalized collisions highlighted in red.

Any two players who submitted the same normalized string are **merged**. On the TV they collapse into one fused nameplate (`ALBERT/JEN`). On both phones, the private text field is replaced by a **shared** one: both people type into the same server-authoritative string, last keystroke wins, with a ghost cursor labeled `JEN IS TYPING`. There is one submit button between them; if both press within 300ms the second gets a `YOU WERE OVERRULED` flash. Accounts that collide again absorb the third player, and so on.

Scoring: a solo player earns 2 points per tick survived; an account earns 1 point total, split among its members. Highest per-person score after six ticks wins — so the pristine soloist usually wins and the four-person blob loses together, having spent the last two ticks fighting over one keyboard.

The TV never shows in-progress typing. Merged phones are the only place the contention is visible, which is exactly why one phone passed around the room cannot run this game.

## Technical approach

PartyKit Durable Object per room, or Socket.IO over Tailscale Serve.

Data model: `Room { phase, tick, prompt, entities: [{ id, memberIds[], score, draftText, rev, lastEditorId }], players: { id, name, entityId } }`.

Phones send `draft_edit { entityId, text, rev }` debounced at 100ms. The server accepts if `rev` matches and rebroadcasts; on mismatch it replies with authoritative text and the winning rev, and the losing client snaps.

The genuinely hard part is the shared field. There is no CRDT here on purpose — the jank is the joke — but it must read as *contention*, not as *broken*. That needs: server-authoritative text with a monotonic rev, 150ms echo suppression on the originating client so your own keystrokes never stutter, and a visible attribution ghost so players blame each other rather than the app.

Second hard part: collision matching. v1 uses exact match after lowercase, trim, strip leading articles, naive singularize — and shows the normalized form on reveal so disputes die instantly. Fuzzy (Levenshtein ≤1) is a trap.

## v1 scope

- Exactly 4 players, 6 ticks, one game, no lobby options
- 12 hand-written prompts, ordered narrow-to-narrower
- Merge, shared field, shared submit, blob growth to 3 and 4
- Per-person leaderboard at the end
- Names typed on join, no avatars

## Out of scope

Fuzzy matching, a token to split back out of an account, reconnection, spectators, sound design, multiple rounds, mobile keyboard polish beyond "it works".

## Risks & unknowns

A disciplined room may verbally partition the answer space and never collide — mitigated by shrinking the answer space per tick until it's smaller than the player count, which forces a collision by tick 5. Shared typing may land as unusable rather than funny; the ghost cursor and overrule flash are the load-bearing mitigations. A two-person account may turn out to be strategically acceptable, which would defuse the whole game — verify the 2-vs-1 point split actually stings.

## Done means

Four phones join a room. On tick 1, two identical answers fuse those players: the TV shows a single fused nameplate, both phones show the same live text with visible contention and one submit button, and the account scores half. The blob grows at least once more. After tick 6 the TV shows a per-person leaderboard where the largest account is last.
