## Overview
A phone-native riff on **Dixit** for 3-6 friends who actually know each other. Instead of pre-printed surrealist art, the 'cards' are photos each player privately curates from their own camera roll — blurry dogs, screenshots, inside-joke selfies. A clue lands only for people who know you, which is the whole joke.

## Problem
Dixit's magic is the poetic in-between clue — right enough that *some* people find your card, wrong enough that not *everyone* does. But the printed deck is generic and impersonal, and reaction-image party games share a deck no one owns. The itch: a Dixit where the deck is *yours*, so ambiguity is personal and every decoy is a little confession.

## How it works
Pre-round: each phone privately shows the player's camera roll; they pick a small hand of photos (thumbnails uploaded, never shown to others). Round: the server designates a Storyteller. Their phone privately shows their hand; they pick one photo and type a one-line clue, which appears on the host TV. Every other phone privately shows *their own* hand and asks 'submit a photo that fits this clue'; each secretly submits one decoy. The host TV shuffles the Storyteller's photo + all decoys into an anonymous gallery. Each non-storyteller phone privately shows that gallery with a vote button — **your own tile is greyed out, computed per-phone**. Dixit scoring: if everyone or no one finds the Storyteller's photo, Storyteller +0 and others +2; otherwise Storyteller +3 and correct guessers +3; decoy owners +1 per vote stolen.

PRIVATE per phone: your hand, your submission, your vote, and which tile is 'yours.' SHARED: clue text, anonymized gallery, final scores.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Cloudflare Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `Room{code,phase,storytellerId,clue,round}`, `Player{id,hand:[photoId],submittedPhotoId,vote}`, `Photo{id,ownerId,thumbBlobUrl}`. Photos uploaded downscaled (≤512px) to the DO/R2 under opaque ids; the server maps id→owner but sends clients only an `isYours` boolean per viewer. Phase machine LOBBY→PICK_HAND→CLUE→SUBMIT→VOTE→SCORE broadcast to TV; private payloads sent as targeted per-socket messages. The genuinely hard part is **privacy correctness**: never leak owner→photo mapping over the wire before reveal, render each phone's own tile greyed without revealing others', and survive flaky mobile uploads + reconnection (restore a phone's private hand).

## v1 scope
- 3 players, exactly one round, one Storyteller
- Hand of 3 photos each
- Text-only clue, single vote, Dixit scoring on TV
- No accounts, no persistence past the room

## Out of scope
- Multiple rounds / storyteller rotation, >6 players
- Image moderation, AI-generated cards, animations, spectators, reconnection polish

## Risks & unknowns
- Camera-roll privacy comfort (mitigate: explicit per-photo pick, thumbnails only, room deleted on end)
- Some players lack shareable photos; upload latency on cellular
- Is 3-player Dixit fun? (storyteller + 2 decoys works, but thin)
- Inside-joke photos may be illegible to near-strangers

## Done means
Three phones each pick 3 private photos; one gives a clue; the other two each submit a decoy from their own hand and then vote on a 3-tile anonymized gallery where each voter sees their own tile greyed; the TV shows correct Dixit scores; and no phone ever received another player's photo→owner mapping before reveal (verifiable in WS logs).
