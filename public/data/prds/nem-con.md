## Overview

**Nem Con** (*nemine contradicente* — "no one dissenting") is a 10-minute, 4-player game whose only output is a printable poster: five lines of house rules, a toast, or a manifesto the room actually keeps. There is no score, no winner, no reveal. It's for a group that wants to make one small permanent thing together on a night they're already sitting around a TV.

## Problem

Every real group artifact — the leaving card, the roommate agreement, the toast — gets written by the loudest person in the room, because objecting out loud costs more socially than the line is worth. So people nod, and the keepsake ends up being one person's voice with four signatures on it. Meanwhile collaborative writing *games* score cleverness, which makes everyone perform instead of agree.

## How it works

The host TV shows a poster: a fixed title and five empty lines. Any phone may propose text for any line at any time; the proposal replaces that line on the TV immediately (last write wins). Every phone also holds **blocks** — a toggle per line.

A blocked line renders on the TV as *unset*: wet-looking, smeared, with an anonymous count ("2 hands up"). Never a name, never a color. A line sets into type after **10 continuous seconds at zero blocks**, then locks permanently.

Privately, each phone shows: its own five block toggles (yours are the only ones lit for you), a per-line typesetting ring, and — the load-bearing bit — a **conscience card** drawn secretly at start:

- *No line may name a person.*
- *At least one line must be a promise, not a prohibition.*
- *No line may exceed seven words.*
- *One line must mention something physically in this room.*

You are obliged to block violations of your card. So friction is diagnostic but never conclusive: the room talks aloud, reverse-engineers an invisible constitution from anonymous resistance, and the poster comes out stranger and tighter than any one person would have written. When all five lines set, the server renders a letterpress PNG to every phone, then deletes the block log and the cards without ever displaying them.

## Technical approach

One Durable Object per room. State: `{lines:[{id,text,setAt,blocks:Set<playerId>}], players, cards}`. Two serializations: the TV socket receives counts only, player sockets receive own-blocks + own-card. **Enforce redaction at serialization, not at render** — the anonymity guarantee is worthless if identities are on the wire.

The hard part is the 10-second continuous-zero timer under jitter: server-authoritative, debounced so a block toggled off within 200ms doesn't visibly reset everyone's ring, and atomic against in-flight proposals (a proposal landing in the final 300ms wins and resets the line).

## v1 scope

- Exactly 4 players, one poster, five lines, one fixed title
- 8-card conscience deck
- Text proposals + block toggles only
- PNG export, no accounts, no lobby codes beyond a 4-letter room code

## Out of scope

Font/layout choice, multiple rounds, any reveal phase, moderation tools, >6 players, rich text, saved posters.

## Risks & unknowns

A griefer with a permanent block stalls the game forever. v1 mitigation: each phone holds only **2 blocks in play at once**, making dissent scarce and deliberate — plus a 6-minute hard clock after which unset lines print smeared, which is its own honest artifact. Real unknown: does anonymity protect dissent, or does the room simply interrogate everyone until the blocker folds? Only playtesting answers that.

## Done means

Four phones and a TV, cold start to poster in under 10 minutes; all five lines reach *set*; the PNG downloads on every phone within 3 seconds; and dumping the Durable Object's state afterward shows no record of who blocked what.
