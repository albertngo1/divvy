## Overview
Live Wire is a 3-4 player cooperative defusal game for a shared host screen plus private phones. It takes the Keep Talking and Nobody Explodes premise — one person sees the bomb, another reads the manual — and shatters it so that *everyone is simultaneously the defuser and the expert, for different modules*. There is no god who can see everything. The only path to the answer runs through someone else's mouth.

## Problem
Most 'one sees, one reads' co-op games have a clean split: defusers and experts. That means half the table is idle-ish at any moment and the private-phone gimmick collapses into 'pass me the manual.' The itch: make every phone carry a piece nobody else can see, and make the dependencies *cyclic*, so silence is instant death and the room has to keep three conversations braided at once.

## How it works
Each phone privately holds TWO things: (1) one live **module** — a panel of colored/labeled wires and a symbol that only that phone renders, and (2) one **manual page** — the cut-rule for a *different* player's module. The assignment is a cycle: A's manual solves B's module, B's solves C's, C's solves A's. So to defuse the module in front of you, you must describe it aloud to whoever holds its manual, and take spoken cut instructions back — while simultaneously reading YOUR manual page to guide someone else. Nobody can go silent; three interpretation channels run concurrently.

The **host screen** shows only public tension: a 90-second countdown, a strike counter (max 1), and a live 'defused: 1/3' tally. It reveals no wires, no rules — it cannot be used to shortcut the talking. Each **phone** privately shows its own module (tap a wire to cut) and its manual page (scrollable rules like 'if the symbol is a LAMBDA and there are 3+ red wires, cut the second wire from the top'). A wrong cut = strike + the module reshuffles its wires (not its rule), forcing a fresh readback.

## Technical approach
- **Server:** authoritative WebSocket room (PartyKit / Cloudflare Durable Object) over Tailscale Serve. Host tab and phone PWAs join by room code.
- **Data model:** `Room{code, timer, strikes, phase}`; `Module{id, ownerSeat, wires[], symbol, solutionIndex, solvedBy?}`; `ManualPage{id, targetModuleId, ruleText}`; a `cycle[]` mapping seat→manual→module. Seats each get `{moduleId, manualPageId}` where `manualPageId.targetModuleId != moduleId`.
- **Sync:** cuts are server-validated against `solutionIndex`; state deltas broadcast so the host tally and phone panels stay consistent. Latency is forgiving — this is turn-of-phrase, not millisecond timing.
- **Hard part:** *puzzle generation*. Each module must be solvable ONLY from its paired manual page, the pages must be terse enough to read aloud in seconds yet ambiguous enough to require careful description, and the three modules must be independently solvable so the room can pipeline them. Generating rule/module pairs with exactly one valid cut and no cross-module shortcut is the whole design cost.

## v1 scope
- Exactly 3 players, 3 wire-cut modules, one cycle.
- 90-second timer, one strike allowed, single win/lose screen.
- One module archetype (colored wires + symbol), ~12 hand-tuned rule variants.
- Host tab + phone PWA join by 4-letter code.

## Out of scope
- 4+ players, multiple module types (buttons, keypads, morse).
- Multi-round campaigns, difficulty scaling, scoring/leaderboards.
- Reconnect grace, spectators, accessibility audio mode.

## Risks & unknowns
- Cyclic dependency may overwhelm 3 people talking at once — might need to prove fun at 3 before ever adding a 4th channel.
- Manual rules that are trivially describable kill the tension; too baroque and nobody finishes in 90s. Tuning window is narrow.
- Colorblindness: wires need labels, not just hues.

## Done means
Three phones on one network, given one shared code, each render a distinct private module and a manual page for someone else; the room defuses all three modules by voice alone within 90 seconds with the host showing an accurate strike/tally; a wrong cut reshuffles that module's wires and increments the shared strike counter.
