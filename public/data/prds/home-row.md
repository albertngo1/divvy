## Overview
Home Row is a one-round cooperative game for three people, a TV, and three phones. The goal is visible to everyone from the first second. The controls are not. Each phone is an unlabeled 3×3 pad wired to the TV's nine pictures in a different secret order, and the room wins by all pressing the same picture in the same tick.

## Problem
Convergence games have a knowing problem: once everyone independently thinks "the cat," the game is already over, and the whole round resolves in four seconds of nothing. Home Row splits *knowing* from *doing*. Agreement is trivially cheap. Execution is expensive, private, and different for every player — which is where all the comedy lives.

## How it works
- **Host TV (public):** a 3×3 grid of nine unmistakable images (cat, anvil, hot dog, traffic cone…). A tick clock counts down 4 seconds, eight times. At the end of each tick the TV lights every image that got pressed — anonymously, in shuffled order, with no player identity. Two players on the same image lights it twice as bright. All three on one image = green flash, room wins.
- **Phone (private):** nine blank keys. A secret permutation maps your key positions to the nine images and is different for every player. You tap one key per tick. After the tick resolves, your phone *permanently prints the image on the key you pressed* — so every tap buys exactly one cell of your own keyboard, and only your own.
- Talking is banned. The TV's anonymous lights are the entire channel: "someone found the cat — the cat is live — everybody get to the cat."
- The tension is that the room's obvious Schelling target may be a key nobody has mapped yet, so the room has to silently abandon it and re-converge on whatever image two players already own. Watching two people sit on a bright hot dog while the third hunts is the game.
- Eight ticks. Win = one tick with all three on the same image.

## Technical approach
Host tab + phone PWAs + an authoritative PartyKit Durable Object (or Socket.IO over Tailscale Serve). State: `{tick, deadlineAt, images[9], players: {id, perm[9], revealed[9], tapThisTick}}`. Permutations are generated server-side at round start and never sent whole — a phone only ever receives the single mapping it just earned.

The hard part is honest simultaneity. Taps are buffered server-side and nothing is echoed until the tick deadline, so tap *order* can't leak as a side channel; the reveal broadcast shuffles hits before sending. Phones render their countdown against a server clock offset measured by three ping round-trips at join, with a 250 ms grace window past the deadline so a laggy phone isn't silently robbed of a tick. Late taps count as a miss, announced as a miss, never as a different image.

## v1 scope
- Exactly 3 players, 1 round, 9 hardcoded images, 8 ticks of 4 seconds.
- Server-generated permutations; phone reveals one key per tap.
- TV: grid, tick clock, anonymous hit lights with a two-player brightness step.
- Win screen naming the image the room landed on. Loss screen showing all three permutations side by side (the funniest part).
- 4-letter room code, no accounts, no reconnect.

## Out of scope
- More players, multiple rounds, image packs, difficulty scaling (larger pads).
- Any private text or emoji channel between phones.
- Persistent stats, spectators, remote play.

## Risks & unknowns
- **Frustration vs. comedy.** Eight ticks may be too few to map enough keys; the tuning knob is grid size (3×3 vs. 2×4) and tick count.
- **Degenerate strategy:** everyone hammers the top-left key every tick, since a shared physical convention beats a shared image. Mitigation is that the pad *labels itself* as you go, making the image channel strictly better — but this needs playtesting.
- Nine images must be instantly, unambiguously nameable in a dark living room.
- Cheating by peeking at a neighbour's phone is trivial and unpolicable; treat as a house rule.

## Done means
Three phones join a code and show nine blank keys. Each tick, all three tap, nothing is echoed until the deadline, and the TV lights the hit images in shuffled order with a brightness step for doubles. Each phone permanently labels the key it just pressed. When all three land the same image in one tick the TV flashes green and names it; after eight ticks it reveals all three keyboards. Three players who may not speak win within eight ticks at least half the time.
