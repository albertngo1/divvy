## Overview
Report is a cooperative riff on **Hanabi** for 3 players building a fireworks display together. Its defining move — you can see everyone's cards *except your own* — is enforced perfectly by phones: each screen renders the table from that player's blind seat. It's for groups who love Hanabi's aching information puzzle but find holding cards backwards, sneaking glimpses, and tracking hint tokens on paper a chore.

## Problem
Hanabi is brilliant *because* you hold your hand facing outward and never see it. In person that's physically awkward, cheat-prone (one reflection ruins it), and the hint/fuse token economy is tedious bookkeeping. The blind-to-self constraint is exactly the kind of thing a private per-phone display makes trivial and tamper-proof.

## How it works
Shared draw deck of colored numbered shells. Each player holds a hand of shells. **Privately on each phone:** you see every *other* player's full hand, but your own slots render face-down. The **host TV** shows the shared firework stacks (each color built 1→5), the hint-token pool, and the fuse (3 mistakes = display fizzles).

On your turn you do one of three things: **give a hint** (spend a token) telling one player "these two slots are red" or "these are 3s" — public, and the hinted player's phone annotates those slots; **discard** a shell (regain a token, TV shows the discard); or **play** a shell to a stack. A correct next shell advances that color's firework on the TV with a bang; a wrong one burns a fuse. The table wins by building the display before the deck runs out or three fuses blow.

Per-phone privacy is load-bearing and inverted: it's not that your info is secret from others — it's that information *about your own hand* is withheld from *you*, and only the network of public hints lets you deduce it. One shared screen makes the entire game impossible.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{deck[], hands:{playerId:[shell]}, stacks:{color:int}, hintTokens, fuses, hintAnnotations:{playerId:{slot:{colorKnown,numberKnown}}}, turn}`. The genuinely hard part is **per-connection redaction**: the server must send each client every hand *but its own*, so a player literally cannot sniff their own cards over the wire — the blind constraint lives on the server, not the client UI. Turn actions mutate authoritative state and broadcast redacted views; hint annotations are public metadata, deductions are left to the human.

## v1 scope
- Exactly 3 players
- TWO colors only, shells numbered 1–5, small deck
- 4 hint tokens, 3 fuses
- Ends when both stacks reach 5, deck empties, or 3 fuses blow
- Host TV shows stacks, tokens, fuses

## Out of scope
- Full 5 suits, rainbow/multicolor variants
- Bonus-turn-after-deck-out rule, scoring tiers, player counts >3
- Reconnect/spectator handling

## Risks & unknowns
- Is two colors enough to be a real puzzle, or trivially solvable?
- Hint-token economy tuning at this tiny scale
- Redaction correctness is the make-or-break — a bug leaks your own hand and kills the game

## Done means
Three phones each show the other two hands but render their own face-down; giving a hint spends a token and annotates the target's slots; playing a correct shell advances the TV stack with a bang; a wrong play burns a fuse; three fuses ends the game — and a network trace confirms no client ever received its own hand.
