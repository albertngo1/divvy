## Overview
A 3-player concurrent-room game where the group cuts one shared image into personal shards. The host TV holds the image; each phone is a private claim brush plus a private valuation of the picture. Nobody keeps anything unless the final division satisfies envy-freeness — the fair-division condition where no player prefers someone else's piece to their own. For friends who want to leave with a physical-feeling souvenir of the night rather than a scoreboard.

## Problem
Party games hand out points, which evaporate on the drive home. Fair-division math (cake-cutting, envy-freeness) is one of the most socially charged ideas in game theory and has never been a party game, because you need genuinely private, genuinely different preferences — impossible on one passed-around phone.

## How it works
The host loads one image (v1: a still life or a webcam group selfie snapped in the lobby) and overlays a 24×24 cell grid.

**Privately, on each phone:** the image, dimmed, with your own soft value heatmap glowing over it (server-generated smooth field, ~5 peaks, normalized to 100 points, deliberately different per player). Your painted cells in your color. A live readout: *"your piece: 41 of your 100."* You never see anyone else's heatmap.

**On the TV:** the image with claimed territory frosted into one anonymous mass, an unclaimed-cell counter, and three area bars — how *much* each player has grabbed, never *where*. Greed is public; taste is private.

**CLAIM (90s):** all three drag-paint at once. Cells are first-writer-wins — losing a race snaps the cell out from under your finger, which is the whole tactile drama.

**AUDIT:** server dots each player's private value map against all three pieces. Coverage must be 100% and no player may value another's piece strictly higher than their own. TV shows only red envy arrows between seats — direction, not magnitude.

**GIVE (45s, only if envy exists):** envious players show a red lamp; anyone may paint cells as *given*, releasing them to a named seat. One re-audit, then it's over.

**SEALED:** each phone downloads only its own irregular shard as a transparent PNG; the TV prints the seam map. The whole image now exists nowhere but reassembled. **ENVIOUS:** the image goes back together and nobody takes anything.

## Technical approach
PartyKit Durable Object per room. State: `grid: Uint8Array(576)` of owner ids, `phase`, `deadline`, and per-player `valueMap: Float32Array(576)` never leaving the server except to its own socket. Phones coalesce painted cell indices into ~50ms batches; server applies compare-and-set per cell and broadcasts only changed `(index, owner)` deltas. Clients paint optimistically and reconcile on delta — the hard part is making a snap-back feel like a lost race rather than a bug (brief red flash + haptic). Envy is three 576-length dot products, trivial. Shard export: host canvas masks the source image by each owner set, `toBlob`, served to that phone over its own socket.

## v1 scope
- Exactly 3 players, one image, one round
- 24×24 grid, server-generated random smooth value fields
- CLAIM → AUDIT → optional single GIVE → seal
- PNG shard per phone + seam-map PNG on TV

## Out of scope
- Free-form polygon lassos, 4+ players, trading/auctions, uploading your own photos, printing

## Risks & unknowns
- Random value maps may feel arbitrary ("why do I love this corner?"); deriving them from image saliency is the likely fix
- Envy-freeness may be nearly unreachable with greedy real-time claiming — the GIVE phase may need to be longer or repeatable
- Snap-back on contested cells could read as lag

## Done means
Three phones on a LAN paint one image simultaneously; the TV never reveals who claimed where; the server correctly flags an engineered envy case and clears an engineered fair one; on a clean run each phone ends holding a different transparent PNG shard that visually reassembles into the original with no gaps.
