## Overview
Last Mile is a cooperative comms-overload game for 4–6: one **Dispatcher** whose phone is the warehouse map, plus 3–5 blind **Couriers**. The twist is *complementary* hidden information — the Dispatcher can see the geography but not anyone's goal, and each Courier privately knows their goal but not the geography. Neither side can win alone; the only bridge is talking, and everyone talks at once.

## Problem
Most "guide the blind" games put all the knowledge on the guide, so it's really a one-person puzzle narrated at others. Last Mile splits the knowledge down the middle and makes the *channel between people* the scarce resource. The itch is the traffic jam of voices: three Couriers each shouting a different destination while one Dispatcher tries to route them without knowing who needs what until they say so.

## How it works
The **Dispatcher's phone** shows the full warehouse: a grid of rooms, each stamped with an icon (anchor, kite, boot, bell), plus a live dot per Courier — but no indication of anyone's target. Each **Courier's phone** shows only a swipe pad, their own facing arrow, a private target icon ("deliver to the KITE room"), and a bump flash on walls — never the map, never another Courier's goal. A Courier must physically reach their assigned room. To do it they announce their need ("I've got the kite!") and the Dispatcher, seeing where the kite room is, calls directions back ("Kite person, three left, then up"). Delivery registers when a Courier stops in the correct room. Room wins when all Couriers deliver before the timer. The **host TV** shows a blurred map, a deliveries-done tally, and the countdown.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Board{rooms[]{id,icon,tiles[]}}`, `Courier{id,name,pos,targetIcon,delivered}`. The server sends the Dispatcher the full map + all positions, but sends each Courier *only* their `targetIcon`, own `pos`, and bump events — so no Courier can reconstruct the map or another's goal. Sync: swipe → server resolves move immediately → position broadcast to Dispatcher + host only. The hard part isn't the netcode (small messages, immediate resolution) — it's *balancing the chaos*: 3 Couriers + 1 Dispatcher must be loud and tangled yet winnable, which means clear per-Courier identity (color + name the Dispatcher can address) and readable bump feedback under latency.

## v1 scope
- Single 6×6 warehouse with 4 distinct icon-rooms
- 4 players: 1 Dispatcher + 3 Couriers
- Exactly one delivery per Courier
- 3-minute timer, win = all delivered
- Host shows blurred map + tally + timer

## Out of scope
- Multiple deliveries, chained routes, moving hazards
- Scoring beyond win/lose, betrayal/traitor roles
- Text chat (voice is the intended channel)

## Risks & unknowns
- Audio chaos might tip from fun to frustrating with too many Couriers
- Dispatcher needs to reliably tell Couriers apart to address them
- Whether the complementary-info split reads as clever or just confusing in the first 30 seconds

## Done means
Four phones + a host: each Courier is privately assigned an icon that neither the others nor the Dispatcher can see, all three reach their correct rooms within 3 minutes purely by voice-bridging with the map-holder, and the host plays a delivery-complete celebration.
