## Overview

A phone-native riff on *Skull & Roses* for 3–5 people in one room. Everyone holds a private hand of three roses and one skull, places one face-down, then bids on how many roses they can flip without hitting bone. The twist that makes it a Divvy game rather than a port: **the physical tell is replaced by a measured one.** The host screen publishes each player's *commit latency* and *how many times they changed their mind* before locking — but never what they placed. Deception moves from your hands to your clock.

## Problem

Digital Skull is dead Skull. Take away the hands hovering over the mat and the game is pure math with no read. Meanwhile every online bluffing game accidentally leaks timing and pretends it doesn't. This one makes timing a first-class, honest, public statistic — so "slow-playing" (burning eight seconds on a disc you chose instantly) becomes a deliberate, costly lie.

## How it works

1. **Place (simultaneous).** Every phone privately shows your remaining inventory (🌹🌹🌹💀). You tap one, may re-tap to change, then LOCK. The TV shows only "3 of 3 committed."
2. **Tells drop.** Once the last player locks, the TV animates a bar per seat: seconds-to-commit and a small dot per mind-change. No disc faces.
3. **Bid.** Turn order, each phone privately offers "I can flip N roses" or PASS. Bid ladder is public on the TV; thinking time is metered here too.
4. **Flip.** The winning bidder must start with their **own** stack (their phone knows the truth; the room does not), then taps opponent stacks on their phone. Each flip is revealed on the TV one card at a time.
5. **Resolve.** N roses = win. A skull = the bidder loses a disc, chosen by the skull's owner on their own phone.

**Private per phone:** your inventory, your own stack contents, whether you just placed the skull, your pending bid before submission. **Public TV:** stack heights, hesitation bars, bid ladder, revealed discs.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object per room (Socket.IO over Tailscale Serve is a fine substitute).

State: `{phase: lobby|place|bid|flip|resolve, players: [{id, seat, inventory:{roses,skull}, stack:[{type,hidden}], commitMs, toggles}], bid:{high, leader, passed[]}, revealed:[]}`.

Sync: server-authoritative with **per-connection redaction** — every socket receives the full state with other players' stack entries rewritten to `{hidden:true}` before serialization. Never filter client-side; a devtools-open guest must see nothing.

The genuinely hard part is making the tell *fair*. Commit latency is measured server-side from the server's `place_start` broadcast to receipt of the `place` message, minus a per-client RTT estimate from a three-ping handshake at join. A phone on bad wifi must not read as an agonizing bluffer. Second hard part: commits are held in escrow and no bar renders until the last lock lands, so early lockers can't be counted by watching the TV live.

## v1 scope

- Exactly 3 players, QR join, no names beyond seat color
- One disc placed each, one bid round, one flip sequence, one outcome
- Discs are emoji, no art
- Hesitation bar + mind-change dots on TV
- No match play, no score carry-over

## Out of scope

Multiple placement rounds, elimination across hands, reconnect, spectators, sound, avatars, animations beyond a flip fade.

## Risks & unknowns

If everyone commits in under two seconds the tell is noise — mitigated by also surfacing mind-change count, but it may need a minimum window. A single-disc bid space (1–3) may be too thin to be interesting; the fix is multi-disc rounds, which breaks "humiliatingly small." Shoulder-surfing is unsolvable and should be a house rule.

## Done means

Three phones join via QR; all three place secretly; the TV shows three face-down stacks and three hesitation bars and at no point exposes a disc face in any network payload; a bid resolves; flips reveal one disc at a time; win/skull is declared correctly; and an artificially throttled phone (+300ms) produces a hesitation bar within 150ms of an unthrottled phone that took the same wall-clock time.
