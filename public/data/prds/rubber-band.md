## Overview
A three-lap race for 3-5 people where nobody is ever told the standings. Each phone is a private cockpit; the TV is a deliberately useless broadcast camera. Racing games hand the loser a nuke and the leader a banana — *Rubber Band* takes that invisible bookkeeping and makes it the entire information economy.

## Problem
Party games publish the scoreboard constantly, and the middle of the game dies for it: the leader plays safe, last place checks out, everyone in between does arithmetic instead of playing. Meanwhile the one genuinely delicious idea in kart racers — that the item box is a confession of how badly you're doing — is wasted on a single-player HUD nobody else can see. Put five people in the room and that confession becomes leverage.

## How it works
Each lap, every phone privately sets a **throttle** (1-5) and a **line** (inside/outside), then locks. Distance is throttle plus a line bonus that depends on how many others picked the same line; throttle also builds **heat**, and blowing the heat cap spins you out for the lap. Everyone submits at once; nothing about the result is published.

After each lap the server privately deals every phone exactly **one item**, drawn from a table indexed by that player's true hidden rank: 1st gets a Banana, mid-pack gets a Slipstream, last gets a Nuke. The table is printed permanently on the TV, so your item is a private readout of your position — the only one that exists.

Items are played anonymously. The TV animates the **effect and the tier** but never the user. A Nuke going off tells the whole room somebody is in last place; the holder must decide between the effect and the confession. To keep it from being a solvable inference, 20% of grants are drawn from a neighbouring rank's table, and each player holds one **bluff token** that fires a convincing fake item animation with zero effect.

Before the final lap, each phone privately spends a **jam token** naming one opponent whose throttle gets halved. That's what makes reading the room worth money.

PHONE (private): your throttle dial, your heat gauge, your current item, your bluff and jam tokens. TV (public): the item table, a bunched pack of identical cars carrying no positional information, the anonymised item feed, and the final reveal.

## Technical approach
One PartyKit/Durable Object room per game, authoritative. Model: `{players: [{id, distance, heat, item, bluffUsed, jamTarget}], lap, phase, itemFeed[]}`. Phases are simultaneous-lock, so this isn't a latency problem — it's an **anonymity** problem, and that's the hard part. If a Nuke fires 200ms after someone's thumb moves, anyone watching thumbs beats the game. The server buffers all item plays for a lap and releases them at lap end in shuffled order on a fixed 1.2s cadence, with phones showing a uniform "played" state the instant you tap so tap-timing leaks nothing. Bluffs enter the same buffer and are indistinguishable server-side downstream.

## v1 scope
- 3 players, one race, three laps
- Three item tiers, one bluff token, one jam token each
- Throttle/line dial as three fat buttons; no steering, no physics
- TV: item table, anonymised feed, final standings reveal

## Out of scope
- Real driving, tracks, a second race, persistent scores, spectators, more than five players

## Risks & unknowns
- If the rank→item mapping is too clean the game is solved by lap two; if the 20% noise is too high the item stops meaning anything. This ratio is the whole design and needs playtesting.
- Last place may just always fire the Nuke, making the bluff token load-bearing rather than spicy.
- Three players may be too few for anonymity to hold.

## Done means
Three phones and a TV complete a race in under four minutes; a Nuke fires and at least one player audibly changes their jam target because of it; post-game, at least one player guessed the wrong person was last.
