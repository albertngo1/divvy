## Overview
A two-window art piece. The sender turns an image into sound in the 1928 Baird 30-line television format — the same format that was, historically, recorded onto shellac discs because the video signal fit inside the audio band. The receiver listens through a microphone and paints the picture back, line by line, as it arrives. For people who like plotters, risograph, cyanotype, and other processes where the medium leaves fingerprints.

## Problem
Sending an image is instant, lossless, and completely without event. Nothing about the file records that it crossed a room. Meanwhile there's a gorgeous dead format sitting right there whose whole nature is that a picture *is* a sound — and it has never been given back to people as a room-scale, acoustic, unrepeatable thing.

## How it works
Point the webcam at a face. Hit TRANSMIT. Your laptop shrieks for twelve seconds — a warbling, unmistakably 1920s sound. Across the room, a second laptop's canvas fills top-to-bottom with a smeary amber 30-line portrait, tall and narrow (the real Baird 3:7 aspect), scrolling and skewing. Move further away and it gets grainier. Transmit into a tiled bathroom and the reverb doubles every edge. Someone laughs mid-frame and there's a permanent white scar across line 14. Every print is stamped with distance, measured noise floor, and an RT60 estimate, and lands in a contact-sheet gallery — the same face, twenty different rooms, twenty different pictures.

## Technical approach
Encoder: 30 lines at 12.5 fps = 375 lines/sec; at 48 kHz that's 128 samples per line. Luminance amplitude-modulates a ~6 kHz carrier, with a below-black sync notch at each line start and a Barker-coded frame sync. Pure Web Audio + an `AudioWorklet`; the whole transmission is a generated buffer.

Decoder: `getUserMedia` → FFT-based Hilbert transform for the analytic signal → envelope → AGC. Line sync is recovered by correlating against the sync notch and driving a second-order PLL; frame sync by correlating the Barker sequence. The genuinely hard part is that the two machines' audio clocks differ by tens of ppm, which walks the image sideways at a visible rate, and room multipath smears exactly the sharp sync edges you need — so the PLL output feeds a fractional resampler that continuously retimes the sample stream. Crucially, the residual skew is not a bug to eliminate: clamp the correction loop slow enough that the drift stays visible as a gentle lean. Rendering is a 30×70 canvas upscaled with an amber-phosphor LUT, plus an optional Nipkow-disc view where the image is painted by a spiral of holes on a spinning wheel.

## v1 scope
- Fixed built-in test portrait, no webcam
- Encode to a WAV you can hear, decode from mic in the *same* browser via speaker loopback
- 30 lines, monochrome, no gallery, no metadata

## Out of scope
Color, error correction (the errors are the point), hardware Nipkow disc, phone build, real-time video.

## Risks & unknowns
Laptop speakers roll off badly below ~200 Hz — the design lives at 1–8 kHz, so probably fine, but a near-ultrasonic variant may be needed for anyone sharing an office. Twelve seconds of screeching is genuinely unpleasant; a slower, quieter, gentler-timbre mode may be the actual product. And the honest risk: this can read as "SSTV, but a webpage," so the archive of place-stamped prints has to carry the concept, not the codec.

## Done means
Two laptops three meters apart, no cable: a recognizable human face decodes on the receiver, and the same source image sent from a hallway and from a carpeted room produces two visibly, describably different prints, both saved to the gallery with their measured conditions.
