## Overview
Parallax is a 4–6 player hidden-role party game for a phones-as-controllers setup. Everyone gives clues about a shared "target" on the host screen — but one player, the Parallax, unknowingly sees the target one position off. For friend groups who like Spyfall/Codenames but want the imposter to be genuinely unaware they're the imposter.

## Problem
Most imposter games make the faker KNOW they're faking, so play collapses into deliberate bluffing and the tells become performances. The itch: an imposter who sincerely believes they're right, producing honest, un-actable tells — plus the delicious paranoia of "wait, am I the one who's off?"

## How it works
The host screen shows a numbered ring of 8 tiles (icons or words), visible to all. Each phone PRIVATELY shows an arrow pointing at ONE tile = "your target this round." For everyone except the Parallax the arrow points at the same tile (say #3); the Parallax's arrow points at #4 — one seat clockwise. Nobody is told which role they have.

Round: going around the circle, each player says ONE clue word describing their target aloud. Everyone hears everyone. The Parallax describes #4 in good faith; their clue subtly clashes with the emerging consensus. After 2 clue-passes, everyone secretly votes on their phone for who's off-ring. Reveal: votes, roles, and both targets appear on the host. Town scores if the majority fingers the Parallax; the Parallax scores by surviving.

Private per phone: your arrow/target. Shared: the ring, whose turn it is, the clue log, the final reveal.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {code, players[], ringTiles[8], trueTarget, parallaxId, parallaxTarget, turnOrder, clues[], votes{}}. Server assigns targets at round start and pushes each phone ONLY its own arrow. Clues are typed on the phone; server broadcasts turn state to the host. Sync is turn-based and low-rate — the hard part isn't latency, it's INFORMATION LEAK: the server must never send a phone anything that reveals whether its target matches others'. Every phone's payload is identically shaped ("my target = tile N"); town and Parallax are indistinguishable at the wire. Voting is a simultaneous ballot behind a reveal barrier.

## v1 scope
- 4 players, exactly 1 Parallax, 1 round.
- 8-tile ring, offset fixed at +1.
- 2 clue passes, one vote, one reveal screen.
- Text clues typed on phone (no audio path).
- Tailscale Serve LAN; room-code join.

## Out of scope
- Multiple rounds / cross-game scoring.
- Audio clue capture, profanity filter.
- Variable offset, multiple imposters, themed tile packs.
- Reconnect/spectator handling.

## Risks & unknowns
- Is a +1 ring offset catchable in 2 passes, or too subtle / too obvious? Needs playtest to tune tile semantics (neighbors must not be synonyms).
- An unwitting Parallax may realize mid-game and start acting — eroding the honest-tell magic.
- With only 4 players the clue signal may be thin.

## Done means
4 phones join a room, each sees a private arrow, one is secretly offset; players type clues that appear on the host in turn; everyone votes; the host reveals both targets and all roles and declares town/Parallax winner — all without any phone payload betraying who's offset.
