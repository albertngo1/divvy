## Overview
A wordless séance for 3–5 friends. The host TV is a Ouija-style letter board with a single glass planchette that drifts under the *summed* pull of everyone's phones. Together, with no talking, the room channels a short message; each player secretly must smuggle one assigned word into it. The keepsake is the transcript of what you collectively spelled.

## Problem
Consensus games resolve by voting or by the loudest voice. Nothing makes a whole room *physically pull together* on one object in real time. And the classic real-life Ouija trick — everyone swears they aren't pushing — is precisely a hidden-per-hand experience that a single phone passed around the room cannot recreate.

## How it works
Each phone shows a private thumb-joystick and, pinned at the top, one secret target word ("MOON", "SORRY", "LEAVE") only you can see. There is no chat. On the TV, the planchette's velocity each tick equals the vector average of all live joystick pushes. When the group holds the planchette inside a letter's hit-zone for ~1.2s (a "dwell"), that letter commits and is appended to the growing message. A shared BACKSPACE zone lets the group undo. Play ends when the group parks on a GOODBYE corner to seal.

Privately, each phone also shows a tiny check: has *your* secret word appeared in the committed string yet? You want it in but can't announce it — you must steer the herd toward your letters while three others tug elsewhere. The comedy is the tug-of-war: two people fighting over U versus O.

Host screen (shared): the board, the drifting planchette, the committed message, and an anonymized "N hands pulling" glow. It never shows anyone's secret word or joystick.

At seal: the TV reveals the channeled message as a framed spirit-photograph transcript (exportable PNG). Then each secret word lights up in the message if it made it in. Win = a group win if the message is non-empty AND every secret word landed — a séance transcript nobody could have written alone. No score.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ planchettePos, planchetteVel, committed:string, players:[{id, joystick:{x,y}, secretWord, wordFound:bool}] }`. Phones send joystick vectors at ~20Hz; the server is authoritative — it integrates `vel = avg(joysticks)*k`, damps, clamps to the board, runs dwell detection, appends letters, and broadcasts `planchettePos` + `committed` at ~30Hz. Secret words are dealt server-side and never broadcast. Hard part: physics feel — tuning damping and dwell so four opposing thumbs feel like one heavy glass and commits aren't accidental; plus lag compensation so the planchette looks smooth on the TV despite 20Hz input (interpolate server state on the host).

## v1 scope
- 3 players, one séance, one message.
- Fixed board (A–Z + GOODBYE), one secret word each.
- PNG transcript export.

## Out of scope
- Numbers/punctuation, multiple rounds, spectators.
- Voice, scoring, difficulty tuning.

## Risks & unknowns
- Does summed control feel fun or just mushy? Needs damping playtest.
- Grief potential: one player yanking against everyone (maybe cap per-phone force).
- Secret-word feasibility on a short message — may need a generous word list.

## Done means
Three phones each summon the planchette, spell a ≥4-letter message with no talking, seal on GOODBYE, all three secret words appear, and the host exports a transcript PNG.
