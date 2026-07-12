## Overview
An endurance betting party game for 3-5 people. The TV plays something intentionally dull; the actual market is on human willpower. It weaponizes the most universal group behavior — half-watching boring content while doomscrolling — and makes the scroll the scoreboard.

## Problem
Groups constantly "watch" tedious content with a phone in hand, drifting into their feed the second attention lags. That collective weakness is invisible and unscored. Everyone privately knows who at the table cracks first — so turn that shared knowledge into a bet, and turn the very device that tempts you into the honest witness.

## How it works
The host TV starts a genuinely tedious ~90s loop (a buffering wheel, a slow-TV train window, a crawling progress bar). **Betting window:** each phone PRIVATELY bets chips on WHO will crack first — start scrolling — and roughly WHEN (early/mid/late bucket). Then the clip plays and each phone SIMULTANEOUSLY opens its OWN irresistible auto-scrolling feed of memes/gifs, local to that phone. The rule: you're supposed to keep your eyes on the TV; the feed is bait. Your phone privately logs the exact moment you scroll or flick the feed — your "crack" — timestamped server-side and hidden from everyone. The tension is exquisite: you've bet others will cave while the thing in your hand actively lures you and rats you out. The TV shows only a neutral countdown and anonymous splashes ("someone cracked!") with no names. **At time-up:** reveal crack order and timestamps on the TV, pay out correct WHO+WHEN bets (contrarian picks pay more), plus a bonus to the last survivor.

Private per phone: your bets, your tempting feed, your own crack timestamp. Shared TV: the boring clip, anonymous crack splashes, the final crack-order reveal + payouts.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit/DO or Socket.IO over Tailscale Serve). Data model: `Room{phase,clipId,players[{id,chips,score}]}`, `Bets{bettorId,targetId,whenBucket,chips}`, `Cracks{playerId,tCrackedMs|null}`. Each phone runs a local feed component; a scroll/touchmove past a distance threshold fires a one-time crack event → WS → server stamps the authoritative time. Sync: the server relays only anonymized "crack happened at T" to the host; identities withheld until reveal. Hard part: reliably distinguishing a genuine crack from an accidental brush (debounce + minimum scroll distance) while keeping crack identity private in real time as the host animates progress. Feed content preloads per phone so no mid-round network stall breaks the temptation.

## v1 scope
- 3 players, one 90s clip
- Bet WHO + early/mid/late bucket
- Local ~15-item meme feed per phone
- First real scroll = crack, timestamped
- Single reveal + payout + last-survivor bonus

## Out of scope
Gaze/camera detection; integrating real social feeds; multi-round play; cross-game leaderboards; configurable temptation intensity.

## Risks & unknowns
Players could simply ignore their phone (mitigate: feed buzzes/flashes a live like-count; require the phone in hand to have placed bets); false-positive cracks; is 90s the right length. Unknown: whether generic meme bait is tempting enough without personalized content.

## Done means
Three phones join, privately bet WHO+WHEN, a 90s dull clip plays while each phone shows a tempting feed, the first scroll on each phone is privately timestamped, the TV shows anonymous crack splashes live, and at the end it reveals crack order and pays out bets with a survivor bonus — every phone's temptation and crack time provably private until reveal.
