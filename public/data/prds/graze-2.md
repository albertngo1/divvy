## Overview
Graze is a 3-player cooperative party game that steals danmaku (bullet-hell) and splits its core skill — reading incoming fire — across the room. You tilt your phone to dodge, but the bullets targeting you are hidden from you; only your teammates can see them. The name is the genre's own word for a near-miss. For groups that love yelling.

## Problem
Bullet hell is a twitch-solo genre; multiplayer versions just add more dots to one screen. There's no reason it needs three phones — unless you make the information asymmetric. The party fun isn't the dodging, it's being blind and trusting the two people screaming coordinates at you.

## How it works
One 60-second wave, survive together. The shared TV shows all three player dots and the general bullet field. But each player's OWN aimed bullets — the ones curving toward them — are stripped from the TV and rendered ONLY on the other two players' phones, drawn relative to that endangered dot with a colored ring matching its owner. So PRIVATELY your phone shows: your own dot (which you steer by tilting the phone, accelerometer), plus the incoming threats aimed at your two teammates that you must call out. You literally cannot see what's about to kill you. You dodge on faith from "Maya, hard right, NOW." Get grazed and lose a shared shield; lose all three shields and the wave fails.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, one room object). Server owns the bullet sim at ~30Hz: Bullet{x,y,vx,vy,targetId}; Player{x,y,tiltVx,tiltVy}. Phones stream devicemotion-derived velocity intents up; server integrates positions, runs collision, and — crucially — broadcasts a PER-CLIENT redacted view: to each phone it sends its own dot + only bullets whose targetId != self; to the host it sends dots + only untargeted/ambient bullets. Hard part: real-time sync under redaction — every client sees a different slice at 30Hz, so the server does per-recipient filtering each tick, and phone-side dead-reckoning + interpolation hides the ~80ms round-trip on the fast-moving bullets teammates are calling.

## v1 scope
- Exactly 3 players (asymmetry needs at least 2 watchers per dodger), one 60s wave.
- One bullet pattern (radial + aimed streams), one shared 3-shield health pool.
- Tilt-only movement; a 5-second calibration to zero each phone's resting tilt.
- Win/lose text on the TV; no score, no levels.

## Out of scope
- Solo/2-player modes, multiple waves, boss phases.
- Player firing back, power-ups, per-player scoring.
- Reconnect handling; touch-drag as an alt control.

## Risks & unknowns
- Tilt control precision + latency may make faithful dodging feel unfair vs. what teammates see.
- Verbal chaos with 3 people could be noise, not coordination — needs a tuned bullet density.
- Redacted 30Hz broadcast is bandwidth-heavier than a shared view; must confirm it holds on phone wifi.

## Done means
Three phones and a TV in one room; a 60s wave runs where each phone shows its own dot plus its teammates' incoming bullets (never its own), players audibly call dodges, and the run ends in a clear shared win or loss driven by the server's redacted bullet sim.
