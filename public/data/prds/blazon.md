## Overview
Blazon is a k-anonymity party game for 4-6 players. Each phone privately confesses to traits from a shared prompt deck ('has a scar with a story', 'cried at a kids' movie', 'still has a childhood stuffed animal', 'can't whistle'). Any trait that at least TWO players secretly claim becomes a heraldic charge on a single shared coat of arms; a trait only one person claims is silently dropped. The win is collective and structural: the richer and weirder the crest, the better — and by construction, no charge can ever be traced to an individual. The exported crest is the keepsake.

## Problem
'Anonymous confession' games are fun but leak: a specific enough answer outs its author instantly. The fix is usually to make answers blander, which kills the fun. Blazon inverts it — you're *rewarded* for confessing specific, weird things, because the game guarantees deniability (a charge needs a quorum, so there are always ≥2 suspects). Anonymity isn't a hope; it's enforced by the rules.

## How it works
The host TV shows an empty escutcheon and a deck of ~20 trait cards face-up. During a 90-second window, each phone shows PRIVATELY: the same 20 cards as toggles, each optionally with a short free-text detail. You tap the ones true for you. Nobody sees anyone else's toggles.

At reveal, the server counts each trait. Traits with count ≥2 ('quorum') are rendered as charges onto the shared shield on the TV — quietly, with no counts and no names. Traits with count 1 are dropped. Each phone then gets a PRIVATE whisper: 'You were the only one who claimed X' — a small solitary thrill only you see. The host shows an aggregate ('13 of 20 traits reached quorum') and exports the blazon as a PNG + QR. Group goal: reach ≥10 quorum charges. Because k≥2 is enforced, the group 'stays anonymous' automatically — that's the win condition made physical.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `room{players[], deck[20], phase}`, per-player private `claims: bitset(20)` + `details{traitId:string}`. Sync: phones send toggle diffs; the DO holds claims server-side and NEVER echoes any individual claim to any client during play. At reveal the DO computes per-trait counts, emits only (a) the set of quorum traits to the host and (b) each player's own solitary-trait list to that player alone. The hard part is the trust boundary: the aggregation must be provably one-way (no client ever receives another's raw claims), and charges must render as recognizable emblems mapped from trait IDs.

## v1 scope
- 4 players, one fixed 20-card deck, one round.
- Simple toggles, no free-text details.
- Quorum k=2; render safe traits as a stacked emblem grid on the shield.
- PNG export + 'you were alone on these' private whisper.

## Out of scope
- Free-text details, custom decks, adjustable k.
- Any guessing/attribution phase or scoring.
- Fancy heraldic layout (tinctures, ordinaries).

## Risks & unknowns
- Honesty is on the social contract; no verification you actually have a trait.
- With only 4 players, few traits may hit quorum → sparse, sad crest. Tune deck to common experiences.
- Emblem art for 20 traits is real design work.

## Done means
Four phones privately toggle traits with zero cross-leak; the host renders a shield containing only traits ≥2 people claimed, whispers each player their solitary traits, and exports a crest PNG — with no charge attributable to any single player.
