## Overview
A cooperative word game for 4 players and one host screen, riffing on the "you can't see your own card" family (Hanabi, Letter Jam) but rebuilt so the *clue itself* is a public sequence of people, and the same public clue reads as a different puzzle on every phone. For groups of 4–8 who like word games with a cooperative pressure valve.

## Problem
At a table, "I can see your letter but not mine" games need physical stands, careful eye discipline, and an honor system that breaks the moment someone leans back. Worse, the clue is written on a shared board, so everyone reads the identical string — the asymmetry lives only in one hidden tile. The itch: make the *whole clue* asymmetric, so nobody in the room is ever looking at the same sentence.

## How it works
Each player is secretly assigned one letter. **Private on your phone:** the other three players' letters, big, next to their names — plus your own slot rendered as a grey ▮. **Public on the TV:** four name plates with blank tiles under each. Nobody's letter is ever on the TV.

One player is Speaker. On their phone they build a word by tapping *people*, in order — "Dana, me, Ben, Dana" — using only letters they can see, plus their own unknown ▮ if they dare. The TV shows only the sequence as colored dots: ● ● ● ●. Each phone then privately renders that dot sequence into letters it can see: Ben's phone shows `S ▮ ▮ R`, Dana's shows `▮ ▮ S ▮`. Same clue, four different puzzles.

The hook is the Speaker's gamble. To include their own dot, they must first *guess their own letter* from earlier rounds — if they're wrong, every reader's word is quietly broken and nobody knows why. Readers then privately submit a single letter guess for themselves. The TV flips tiles one at a time: correct = green, wrong = red. The room wins on 3 of 4 correct.

## Technical approach
PartyKit Durable Object per room, authoritative. Data model: `room{code, phase, letters: {playerId → char}, speakerId, clue: [playerId,...], guesses}`. The server never broadcasts `letters` wholesale — on join and on every clue it computes a **per-socket projection**: for socket P, `render(clue) = clue.map(id => id === P ? '▮' : letters[id])`. That projection function is the entire game and must live server-side; a client that receives the full letter map has already lost the game. Phases advance via server timers (60s clue build, 30s guess) broadcast as absolute deadlines so phones render their own countdown without clock sync.

The genuinely hard part is not latency — it's reconnect. A phone that refreshes must be re-served its projection, never the raw state, and a player rejoining must not be able to diff two projections from two sockets to recover their own letter. Fix: bind projections to `playerId`, not socket, and rate-limit re-joins to one live socket per player.

## v1 scope
- Exactly 4 players, one round, one Speaker.
- Hardcoded 20-word pool; letters dealt from the round's target word.
- Clue build = tap names, backspace, submit. No timer polish.
- Guess = one 26-key letter pad per phone.
- TV: four name plates, dot sequence, flip reveal.

## Out of scope
Multiple rounds, letter stacks, scoring across games, Speaker rotation, spectators, custom word packs, animations beyond the flip.

## Risks & unknowns
The Speaker's self-inclusion gamble may be strictly dominated (safest play: never use your own dot) — needs a nudge, e.g. a bonus green tile if a self-inclusive clue lands. Four blanked letters may be too sparse to solve; may need 5 players before it sings. Word pool quality is the difference between delight and shrug.

## Done means
Four phones on a LAN, one TV. The Speaker submits a four-dot clue; each of the three other phones displays a *different* letter string with its own slot blanked, verified by screenshot; at least one player correctly guesses their own letter and the TV flips it green — with no phone's network payload ever containing that player's letter.
