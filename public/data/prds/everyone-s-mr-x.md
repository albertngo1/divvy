## Overview
A hidden-movement party game for 3-5 players, built on Scotland Yard's Mr. X and turned around: nobody is the detective, so everyone is Mr. X. The TV shows a 12-station transit map. Each phone holds one player's secret position and ticket wallet. Made for game-night groups who like deduction but never want to be the one player stuck keeping the Mr. X logbook.

## Problem
Hidden movement is one of tabletop's best mechanics and one of its most tedious. One player writes secret moves on a pad, covers each ticket with their hand, and everyone else has to trust they made no illegal move. So the format only allows one hidden mover. With five honest secret logs nobody could check them, and the table would spend all night on bookkeeping. With phones the server keeps every log, checks every move, and can hide everyone at once.

## How it works
- **Host screen:** the map (12 stations, edges colored taxi/bus/tube), plus a public ticket log with one column per player: round 1 TAXI, round 2 BUS, and so on. It never shows positions.
- **Phone (private):** your current station, which edges you can legally take right now, and your wallet (4 taxi, 2 bus, 1 tube). You also get one ACCUSE button for the whole game.
- **Flow:** you secretly pick a start station. Then 6 rounds. Each round everyone picks a move at the same time (20s timer), and all tickets flip onto the TV log together.
- **Surfacing:** after round 3, every position flashes on the TV for 3 seconds. Then everyone dives again.
- **Accuse:** once per game, name a player and a station. A correct guess is +3 for you, and that player is *caught* (−2, their position stays shown on the TV). A wrong guess is −1.
- **Scoring:** +1 for each round you finish unnamed. Ending on the same station as another player gives you both a 'crossed paths' alert on your phones. It works as a private clue: you both now know where the other one is.
- The tension: every ticket you spend narrows down where you can be. The tube ticket gets you clean away but leaves an obvious stub.

## Technical approach
The authoritative server is a PartyKit room, one Durable Object per game. Data model: `graph {stations[], edges[{a,b,mode}]}`, `players {id, pos, wallet, accuseUsed, caught}`, `log [{round, playerId, mode}]`. Moves are commit-then-reveal. Phones send `{to}`, the server checks legality against `pos` and `wallet`, and holds every move until all are in or the timer ends (no submission means a forced cheapest legal move). Then it broadcasts only `{round, modes[]}` to the host. Private state goes only over each phone's own socket. The hard part is not sync; it is map design. The map must give each ticket sequence 3-6 possible locations, so deduction can be done but never trivially. Write an offline script that enumerates possible locations per ticket-log prefix and tune the graph until a typical log leaves 2-5 candidate stations.

## v1 scope (humiliatingly small)
- One hand-tuned 12-station map
- 3-5 players, one game of 6 rounds, one surfacing after round 3
- One accusation each, no special tickets
- Phone shows a mini-map with your station highlighted and legal moves as buttons
- Final screen: everyone's full route animated on the TV

## Out of scope (for now)
Black/double-move tickets, multiple maps, teams, detectives, replays.

## Risks & unknowns
- The 'crossed paths' alert may give away too much. It may need to be just a vibration with no station named.
- Players may get lost tracking 4 columns. The TV could offer an optional 'possible stations' heatmap per player, but that might kill the deduction.
- Accusations may cluster in the last round. Consider closing them after round 5.

## Done means
Four people on four phones finish a 6-round game in under 10 minutes. The server rejects every illegal move. The TV never shows a position except during surfacing and at the end. At least one correct accusation lands in 3 of 5 playtests, and at least one player in each test can explain a deduction they made from the ticket log.
