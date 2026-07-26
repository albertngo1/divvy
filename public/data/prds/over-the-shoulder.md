## Overview

*Over the Shoulder* is a 4-player cooperative word game for a TV plus phones: a riff on **Just One** (everyone writes one clue for a hidden word; duplicate clues are destroyed) with one addition — a hidden, directed peeking ring. Each clue-giver's phone continuously mirrors the live, unfinished draft of exactly one other clue-giver, anonymously. Nobody is told who watches them.

## Problem

Just One's comedy is the cancellation, but the cancellation is pure luck: you write blind, then groan. Meanwhile most phone party games treat the phone as a submission box — the only private state is "my answer before reveal." A one-way visibility graph is impossible with paper and impossible with one phone passed around; it needs a private screen per person, live.

## How it works

Four players: one Guesser, three Clue-Givers. The host TV shows a face-down card, a 45s countdown, and three avatar tiles that pulse while their owner is typing.

Each Clue-Giver's phone shows PRIVATELY: the secret word (never on the TV), a one-word text field, and a **MARK** panel — the letter-by-letter live draft of one other Clue-Giver, labelled only "your mark," no name, no avatar. The server assigns a single directed 3-cycle (A→B→C→A), so everyone watches one person and is watched by one person, and identities stay hidden.

The Guesser's phone shows only a "look away" screen.

So you type "stripes," glance at your mark's field, watch "stripe" appear, and now you must dodge — because dedup deletes both. Then **LOCK**: the instant your mark locks, your mirror goes black and stays black. Lock early and you're safe from your unknown watcher but blind; lock late and you steal one more dodge while giving your watcher a free look. At reveal the server strips clues that stem-match each other or the target, the survivors appear on the TV, and the Guesser types one guess. One point, or nothing.

## Technical approach

Host tab + phone PWAs + one authoritative Durable Object per room (PartyKit-style), Socket.IO fallback over Tailscale Serve. State: `{ phase, targetWord, roleByPid, watchGraph: {watcherPid: targetPid}, drafts: {pid: {text, seq, locked, lockedAtSeq}}, survivors[] }`.

Sync: each phone sends throttled `draft{text,seq}` at ~10/s. The DO fans a draft out to exactly one connection — its watcher — after checking `locked === false`. Per-connection filtering lives in the DO, not the client.

The hard part is the lock race. Lock must be a server-ordered event: any draft whose `seq` arrives after `lockedAtSeq` is dropped, so the frozen ghost text a watcher sees is exactly the last relayed frame, and no post-lock character ever leaks. Second hard part is mobile layout — the software keyboard eats half the screen, so the MARK panel must live above the field and stay visible while typing.

## v1 scope

- Exactly 4 players, one hidden word, one round, 45s
- 20-word hardcoded deck
- Fixed 3-cycle watch graph, anonymous mark
- Dedup: lowercase + Porter stem, exact collision only; clue sharing a stem with the target is voided
- Room code join, no accounts, no reconnect

## Out of scope

Multiple rounds, 5+ players, two-way peeking, buying/paying for a peek, scoring history, fuzzy semantic dedup, sound.

## Risks & unknowns

Copying your mark is self-punishing (both clues die), which is elegant — but players may not grasp it in round one without a one-line TV hint. Typing while reading a live draft may simply be too much on a phone. With only three Clue-Givers the cycle is structurally determined, so a sharp player deduces who watches them; anonymity is a UI courtesy, not a proof.

## Done means

Four phones join by code; each Clue-Giver's draft relays to exactly one correct watcher within 200ms; locking freezes and blanks that watcher's panel with no trailing characters; dedup runs; survivors render on the TV; the Guesser scores or misses; and a captured WS log shows no phone ever received a non-mark's draft.
