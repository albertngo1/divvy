## Overview
Root Set is a phones-in-a-room party game (4–10 players) that turns garbage collection into social survival. Each player is a heap object; survival means staying reachable from the GC root. It's for the couch-multiplayer crowd who like hidden-info games (Werewolf, Coup) but want a fresh mechanic—inspired by the 'using OCaml's GC to GC Rust' meta-GC post: what if being collected was the losing condition?

## Problem
Hidden-role party games mostly reuse voting-someone-out. There's an untapped, genuinely novel tension in reference graphs: the difference between reference-counting (can't collect cycles) and mark-and-sweep (does)—a rule that punishes exactly the insular alliances players naturally form.

## How it works
Each round: a rotating 'root' token is held by one player (public). Every other player secretly aims their single outgoing reference at another player (or, if adjacent in the trust web, at root). Aims are hidden. On the host TV, a countdown ends and the collector runs mark-and-sweep from root: it marks everyone on a directed path to root; everyone unmarked is COLLECTED (eliminated this round). The cruel twist players discover: a tight group that only points at each other forms a cycle—mutually referenced, feels safe, but has no path to root, so the whole clique dies at once. Meanwhile being pointed-at by many earns 'liveness points' (incentive to be popular / a hub), but hubs are juicy targets. Survivors score; last cluster standing, or highest liveness over N rounds, wins. Optional 'finalizer' role can resurrect one collected object, and a 'weak reference' card that marks but doesn't protect.

## Technical approach
Pure browser, no installs. Host screen is a static site (served from the homelab or GitHub Pages) running a tiny authoritative game server over WebSocket (Node + `ws`, or PartyKit-style single-room). Players join via QR to a phone web client that just submits their secret aim each round. State model: directed graph, nodes=players, one outedge each, plus the root node. Core algorithm each round: BFS/DFS reachability from root over the reversed-or-forward edge set—O(V+E), trivial—the design work is the scoring and incentive tuning, not the CS. Animate the sweep on the TV: mark wave propagates from root outward (green), then unreached nodes fade/shatter (collected). The genuinely hard part is game balance: making cycles a real trap without making 'just point at root' dominant—likely via root having limited direct-attachment slots so most players must chain through others, forcing risky dependency.

## v1 scope
- Host page + phone join via QR, one room
- Secret single-aim submission per round
- Reachability sweep + eliminate + animate on TV
- 5 fixed rounds, simple survivor scoring

## Out of scope
- Finalizer/weak-ref/roles
- Matchmaking / online play across networks
- Accounts, persistence

## Risks & unknowns
- Is hidden single-aim enough decision depth, or too random? Needs playtesting
- Root-slot limit tuning is the whole game; may need several iterations
- Explaining 'unreachable cycle dies' to non-programmers in one sentence

## Done means
Six people in a room play a full 5-round match on their phones with a TV showing the sweep, at least one cycle-death occurs and gets a laugh, and the winner is determined without the host touching a keyboard mid-game.
