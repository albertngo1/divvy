## Overview
Sonar is a talk-free cooperative party game for 3-5 players in one room. Each player's phone is simultaneously a beacon and a listener: it plays a steady private tone and measures how loudly it hears everyone else's tone. Loudness is a stand-in for distance, so the group's physical arrangement becomes a graph only the phones can perceive. The room is the board; the goal is to reshape your standing positions into a target formation using nothing but the private nudges each phone whispers.

## Problem
Most 'get up and move' party games devolve into someone shouting directions. Sonar removes speech entirely: the only channel is what your own phone can hear, and no single device can perceive the whole picture. The itch is the delicious frustration of coordinating a group when everyone holds one private puzzle piece.

## How it works
Each phone is assigned a distinct audible tone (e.g. 900 / 1300 / 1700 Hz). On start, every phone emits its tone continuously and runs an FFT (WebAudio AnalyserNode) to read the amplitude at every OTHER assigned frequency. That gives each phone a private vector of 'how close am I to each neighbor.'

Round goal (v1): form a perfect equilateral spread — everyone equidistant from everyone. PRIVATELY, each phone shows two/three little bars (loudness per neighbor) and a single coaching arrow: 'ease away from the loud one.' It never shows the full graph. The shared host screen shows ONLY a fat 'balance' meter (how equal the room's distances are, computed server-side) plus a countdown. Players shuffle around the room silently, reading only their own phone, until every phone reports balance at once. Hold it for 2 seconds → the host bursts into a 'locked' animation and reveals the graph it hid the whole time.

Because each phone must emit AND listen at the same moment, one phone passed around is useless — it can't triangulate a network of positions. Privacy of the per-phone view is what forces silent, distributed coordination.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { players[], phase, targetFormation }`, `player { id, toneHz, lastVector: {peerId: amplitude}, balanced: bool }`. Each phone samples its AnalyserNode ~10Hz, self-normalizes (calibrate against its own tone's amplitude to correct for mic gain), and posts its peer-amplitude vector. Server computes the balance metric (variance of all pairwise loudnesses) and broadcasts only the aggregate meter + each player's own coaching hint. Sync strategy: phones are the sensors, server is truth, host is a dumb display.

The genuinely hard part: acoustic crosstalk and room reverb. Simultaneous tones smear; hard walls create standing waves that lie about distance. Mitigations: well-separated frequencies, narrow FFT bins, per-phone self-calibration, and treating loudness as ORDINAL (rank) not metric.

## v1 scope
- 3 players, fixed frequencies, one round.
- Single target formation: equidistant triangle.
- Balance meter + per-phone 2-bar coach only.
- Hold-2-seconds win, then reveal.

## Out of scope
- Ultrasonic (18-20kHz) inaudible tones.
- Multiple formations, competitive mode, scoring.
- True metric distance / actual triangulation math.

## Risks & unknowns
- Cheap phone speakers/mics vary wildly; ordinal ranking may still be noisy.
- iOS requires a user gesture to start audio + mic over HTTPS.
- Reverberant rooms may make the puzzle unsolvable; needs a real-room playtest.

## Done means
Three phones in a real living room, each emitting and detecting the others; players silently rearrange and the host locks a win within 90 seconds a majority of attempts, with no verbal coordination.
