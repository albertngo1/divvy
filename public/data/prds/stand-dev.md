## Overview
Stand Dev is a macOS wallpaper daemon (plus a `.saver` bundle) that picks one photo from your library each night and *develops* it — not with a fade or a filter, but with a running simulation of black-and-white film chemistry. The catch: development only ticks forward while the machine is idle. It is ambient art that rewards absence, for people whose photo libraries are 40,000 images they never look at.

## Problem
Every generative wallpaper resolves instantly and then just sits there. Nothing on a desktop has *duration*, and nothing responds to the one signal a computer has in abundance and never uses: how long you've been away. Meanwhile the film-photography revival has taught a lot of people to love the artifacts of process — edge effects, surge marks, uneven agitation — which no digital filter actually simulates, because filters have no process to be uneven about.

## How it works
At 4am a photo is chosen (weighted toward assets you haven't opened in years) and converted to a *latent image*: a linearized exposure field E(x,y). Nothing is visible. Then the tray fills with developer and the sim runs — but only when `CGEventSourceSecondsSinceLastEventType(kCGAnyInputEventType) > 60`. Full development takes 45–90 minutes of real idle time, so a print might take three days.

Stand development means *no agitation*: developer near dense highlights exhausts locally, bromide byproduct accumulates and inhibits, and the result is the compensating, razor-edged look real stand developers chase (Mackie lines around high-contrast borders). Every burst of user input injects an **agitation impulse** — the concentration field is advected along a flow pattern and partially remixed, wiping out local exhaustion and leaving visible surge streaks off sprocket-hole positions along the edge. A restless day yields a streaky, flat print; a quiet weekend yields a clean, biting one. The finished print is archived to `~/Pictures/StandDev/` with an agitation seismograph strip printed in the border margin: a legible record of how much you fidgeted.

## Technical approach
Swift + Metal compute shaders. Three RG16F textures at 2048²: developer concentration C, restrainer/bromide B, developed density D. Per tick (fixed dt, ~30 ticks/sec while idle):
- `∂C/∂t = Dc∇²C − k·E^n·C·f(B)` — consumption where exposure is high
- `∂B/∂t = Db∇²B + k·E^n·C` with `f(B) = 1/(1+βB)` — the inhibitor term is what produces adjacency/edge effects; it is the whole aesthetic
- `∂D/∂t = k·E^n·C·f(B)`, tone-mapped through a characteristic H&D S-curve so it emerges in the shoulders first, like real film
- Grain: per-pixel blue-noise threshold plus stochastic nucleation, so density quantizes into silver specks at low D.

Agitation kernel: semi-Lagrangian advection of C and B along a procedural convection field scaled by input-event intensity, plus a partial uniform re-mix. Field state is checkpointed as float16 to disk every minute so it survives sleep and reboot. Photos via PhotoKit (`PHAsset`, user-chosen album); wallpaper applied with `NSWorkspace.setDesktopImageURL` per-space.

**Hard part:** tuning β, Dc/Db and the H&D curve so it reads as *developing* rather than *blurring in* — and making agitation damage beautiful instead of merely broken.

## v1 scope
- One folder of JPEGs, no PhotoKit
- Wallpaper only, no screensaver bundle
- Idle detection with a 60s threshold, one hardcoded speed
- Agitation = full remix impulse, no directional flow field
- No archive, no border strip

## Out of scope
Color C-41 (three coupled emulsion layers), push/pull processing UI, Windows/Linux, iOS, sharing.

## Risks & unknowns
The reaction-diffusion may look like a boring blur until parameters are right — this is the whole project's risk. GPU wake-ups during idle may fight power management (must yield on battery). Users on always-on machines never see a clean print, which may be the joke or may be a failure.

## Done means
Leave the Mac untouched for 90 minutes and the resulting wallpaper shows visible Mackie lines at high-contrast edges. Poke the keyboard every 10 minutes for the same duration and the resulting file has visible surge streaks. Both files sit side by side in `~/Pictures/StandDev/` and are obviously, tellably different.
