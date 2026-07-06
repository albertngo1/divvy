## Overview
A hidden-role party game for 4-6 players on a shared host TV plus a private phone each. Everyone is a film continuity supervisor reviewing the same still 'frame' from a movie set. One player — the Imposter — is secretly reviewing a subtly-different take: exactly one prop in the frame is wrong. Crucially, the Imposter doesn't know which detail differs, or even that theirs is the odd one out. The room interrogates the frame verbally, then votes on who was looking at the bad take.

## Problem
Most hidden-role games hand the imposter a *blank* — no word, no location — so bluffing is about faking knowledge you don't have. The fresh itch: give the imposter a *full, confident, wrong* view. Now the tell isn't hesitation, it's confident contradiction. And the whole thing only works per-phone: the asymmetry exists solely because five phones hold five simultaneous private frames. Pass one phone around and there's nothing to deduce.

## How it works
- The host TV shows only a title card, whose turn it is, the timer, and (deliberately) NOTHING of the frame itself.
- Each phone privately shows the same 3x3 grid of set objects (a coffee cup, a clock reading 3:15, a red book, a hat...). All phones are identical EXCEPT the Imposter's, where exactly one cell is altered (clock reads 4:15; book is blue).
- Round-robin: on your turn, describe ONE not-yet-described cell aloud ('the clock says three-fifteen'). Everyone hears every claim.
- Honest players corroborate. The Imposter, reading their own grid, either describes the altered cell wrongly, or silently hears an honest claim that contradicts their private grid — and must choose to challenge it (revealing) or swallow it (suspicious later).
- After two go-arounds, everyone secretly votes on their phone. The TV reveals both grids side by side with the diff highlighted.

Private per phone: your full grid + your role. Shared TV: turn order, timer, tally, final reveal. The host NEVER renders the grid — that would erase the asymmetry.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { code, players[], phase, turnIndex, grid: Cell[9], imposterId, diffCellIndex, altValue, votes{} }. The server generates one canonical grid, picks imposterId + diffCellIndex + a plausible alt, and sends each phone a *personalized* grid payload — honest players get the canonical grid, the imposter gets canonical-with-one-cell-swapped. Roles and grids are never broadcast; each client gets a private `you` message. Turn order and phase are server-authoritative. The genuinely hard part isn't sync — it's *content*: the diff must be subtle enough not to scream yet discoverable through talk. v1 ships a small hand-authored deck of grids with pre-baked alts.

## v1 scope
- One room, 4-5 players, exactly one round.
- A single hand-authored grid with one pre-defined alt cell.
- Server-enforced 'describe an un-described cell' round-robin; players talk aloud (no speech/text capture).
- Phone vote + TV reveal of the diff.

## Out of scope
- Speech/text capture; procedurally generated grids; scoring across rounds; imposter 'win by guessing the diff'; more than one imposter.

## Risks & unknowns
- Balance: too-obvious diff = instant catch; too-subtle = no signal. Needs deck tuning.
- Parrot risk: imposter could echo others and never volunteer the diff cell — the 'must describe an un-described cell' rule forces someone onto it.
- 4 players may be too little cover.

## Done means
Five phones join via room code; each shows a grid, exactly one differs on one phone; the server enforces two go-arounds; all vote; the TV reveals both grids with the diff highlighted and names the most-voted player — one round, end to end, no crashes.
