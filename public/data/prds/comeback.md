## Overview
Comeback is a 4-player simultaneous booster draft where the entire game is about the wheel — the moment a card you passed survives a lap of the table and returns to you. You bet on it, out loud-proof, and score when you're right.

## Problem
Booster drafting is beloved and agonizing in person: you sit holding a hidden pack, everyone picks at their own pace, someone's slow, packs pile up, and the signature thrill — the wheel — is invisible and unprovable. You can't demonstrate you called it. The passing itself is pure logistics tedium.

## How it works
Content: a pack of ~8 absurd cards (party guests / superpowers), each worth points and forming sets. All four phones pick SIMULTANEOUSLY. Your phone shows only the pack currently in your hands: tap a card to add it secretly to your private pool, then — before passing — secretly TAG one remaining card as your "wheel call," betting it comes back. All four packs advance one seat at the same server tick. With 4 players and an 8-card pack, each pack laps you twice. If a tagged card returns and you pick it, you score a "called shot" bonus.

Private per phone: the pack in your hands right now, your growing pool, your secret tag. Public on host TV: each player's face-up taken pile grows (readable signal about who's collecting what) and a shared draft timer — never your pack contents or tags. The skill is reading the table: grab it now, or gamble that nobody else wants it and it wheels?

## Technical approach
Host tab + phone PWAs + authoritative WS server. Data model: Draft{packs:Pack[], seatOf, timer}, Pack{cards[], holderSeat}, Player{pool[], tag:{cardId,packId}}. The server is the ring buffer — it owns which pack each seat holds and advances all packs one seat on a synchronized tick once every seat has picked (or a per-pick timer expires and auto-picks). The genuinely hard part is the simultaneous-pass barrier: the server must wait for all four picks, resolve them atomically, rotate packs, and re-deal each phone its NEW pack in one broadcast, while detecting wheel-tag matches (tagged card still present when its pack returns to the tagger). Slow players are absorbed by the per-pick countdown so the ring never stalls.

## v1 scope
- Exactly 4 players (a full ring is required to wheel), one 8-card pack.
- Pick + tag each turn; auto-pick on timeout.
- Called-shot bonus + simple set scoring at pack end.

## Out of scope
- Multiple packs / a full 3-pack draft.
- Deck-vs-deck play with the drafted pool.
- Variable player counts, reconnection, art beyond text.

## Risks & unknowns
- Wheel prediction may be too heady for a party crowd; the bonus must be juicy and legible.
- The 8-cards / 4-players math must guarantee at least one clean wheel to teach the mechanic.
- Auto-pick could feel punishing; timer length needs playtesting.

## Done means
Four phones each draft from their own private pack, tag a wheel call each pick, packs rotate in lockstep on the server tick, and when a tagged card laps back and is taken the host awards a visible called-shot bonus — with no phone ever seeing another's pack or tag.
