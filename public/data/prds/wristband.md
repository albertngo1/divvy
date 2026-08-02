## Overview

Wristband is a 4-player, single-round hidden-role game about mistaken identity — not of a fictional character, but of the actual people sitting in the room. Every phone privately shows a roster of the four players as colored wristbands with names on them. Three rosters are honest but incomplete. One roster has two names swapped onto each other's bands. That player knows they hold the bad roster; they do not know which two names.

## Problem

Social deduction almost always runs on invented content — a secret word, a fake role card, a lie you author. The room never has to reason about *itself*. Wristband makes the corrupted data the identity of the person across the coffee table, which turns a deduction puzzle into something that feels rudely personal and very funny, because the imposter's mistakes are sincere and about real friends.

## How it works

At join, each player picks a band color and types their name. The server builds four private rosters:

- **Innocent roster:** all four bands, correct colors, but exactly one other player's name is redacted to `—`. Each innocent's redaction is a *different* player, so nobody sees the whole room and "I couldn't see who that was" is always a legitimate excuse.
- **Odd roster:** no redaction, but two names are transposed between bands.

Six prompts run on the TV, one at a time ("Who would you trust with your passwords?", "Who is lying about liking this game?"). For each prompt:

1. **Privately:** every phone shows your roster; you tap one band to nominate. Taps are simultaneous and hidden.
2. **Aloud:** in turn order shown on the TV, each player says one sentence naming who they picked and why. This is spoken, not typed — the game never records your claim.
3. **Publicly:** the TV reveals an anonymized tally *by color only* — "teal 2, red 1, amber 1" — never who cast what.

The deduction lives in the gap. Four people say four names; the tally shows four colors. If the claimed names and the revealed colors don't add up, somebody's mouth and thumb disagreed. Redacted innocents produce honest noise (they nominate a person they can only describe, or mis-tap), which is exactly the cover the swap needs. Only about half the Odd One's nominations touch the swapped pair, so the signal is intermittent.

The Odd One's live job: watch tallies, work out which two of their names are wearing the wrong bands, and start correcting — which means publicly contradicting a name they already said out loud.

After prompt six: one simultaneous private vote for who held the bad roster. Innocents win by majority on the Odd One. The Odd One wins by surviving, with a bonus if they correctly name the swapped pair.

## Technical approach

PartyKit Durable Object (fallback Socket.IO over Tailscale Serve). State: `players: [{id, color, name}]`, `rosterView: playerId → [{color, displayName|null}]`, `oddOne`, `swap: [colorA, colorB]`, `prompts[6]`, `nominations: promptIdx → {playerId: color}`, `votes`. Rosters are generated server-side once and pushed per-socket; the client never receives the canonical roster, so the swap can't be diffed out of the payload.

Sync is trivial — six barriers of four taps each. The genuinely hard parts are (a) **tally legibility**: with only four players, tallies are so small that a single mismatch can be instantly damning, so the swap must be chosen against the actual color set and the prompt list ordered to delay the first forced use of both swapped names; and (b) **making the swap feel like a swap and not a bug** — the reveal screen must show the two rosters side by side, or players will just say the app broke.

## v1 scope

- Exactly 4 players, one round, six fixed prompts, one vote.
- Name + color entry on join. No avatars, no photos.
- One transposed pair; one redaction per innocent.
- Host: prompt, turn order, color tally, reveal card.
- Phone: four bands, tap to nominate, vote screen.

## Out of scope

Photos or camera capture, 5–8 players, multiple swaps, prompt packs, any text entry beyond your own name, cross-round scoring, spectators.

## Risks & unknowns

With four players the tallies may be so information-dense that the Odd One is caught on prompt two — the mitigation is prompt ordering and possibly hiding the tally for the first two prompts. Groups where players don't know each other well lose most of the joke. Names typed at join may be too similar (two "Sams") and break the whole premise; the server should reject duplicates.

## Done means

Four phones join, each sees a four-band roster; exactly one is transposed and the others each carry a different redaction. A full six-prompt round plays to a vote, and the reveal screen shows all four rosters side by side with the swap highlighted. Playtested three times with a group who know each other, and in at least one game the room correctly identifies the Odd One using a name-versus-color mismatch they noticed themselves — not one the app pointed out.
