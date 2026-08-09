## Overview
A small macOS app (menubar + capture window) that turns the built-in or USB webcam into a flicker meter. You aim it at a lamp, LED strip, car taillight, or office panel; five seconds later you get a frequency, a percent-flicker number, a flicker index, and a verdict plotted against the IEEE 1789-2015 risk curve: *No Effect / Low Risk / Bad*. For anyone who gets headaches or eye strain under cheap LEDs, and for anyone who wants to stop buying bulbs by guesswork.

## Problem
LED and driver quality is invisible at purchase time. Half of cheap LED bulbs and nearly every dimmed fixture ripple at 100/120 Hz with 40-100% modulation, which is well-documented as a trigger for headache, eye strain, and phantom-array effects while moving your eyes. The only consumer answer today is "wave a pencil and look for a strobe effect" or a $200 dedicated meter. The physics to measure it properly is already sitting in every rolling-shutter camera sensor.

## How it works
Rolling shutter reads the sensor row by row, so a fast exposure smears temporal light modulation into *spatial* banding across the frame. Lock the camera to manual exposure at ~1/8000 s, grab 3 seconds of frames, compute the row-mean luminance vector per frame, concatenate into a single 1-D signal using the known line readout time, then FFT. The peaks are the light's real modulation frequencies. Percent flicker = (max-min)/(max+min); flicker index = area above mean / total area per cycle. Plot (frequency, modulation %) on the IEEE 1789 exemption/low-risk boundaries and render the verdict. Save each measurement with a nickname ("kitchen ceiling", "desk lamp 2") so you build a house-wide blacklist.

## Technical approach
Swift + AVFoundation: `AVCaptureDevice.setExposureModeCustom` for fixed 1/8000 s and locked ISO/white balance (auto-exposure would destroy the measurement); grab `CVPixelBuffer` planes, do the row-mean reduction on the GPU with a Metal Performance Shaders reduction, FFT with vDSP. Storage: a JSON file of measurements; charting with Swift Charts.

The genuinely hard part is aliasing. The camera's line rate is a sampling rate, so a 4 kHz PWM driver can fold down to a fake 60 Hz peak. Mitigation: (1) estimate line readout time from reported frame duration ÷ active rows, refine it once by calibrating against an incandescent or a known mains bulb rippling at exactly 2× line frequency; (2) capture at two different frame durations and keep only peaks that stay put across both — real peaks are stationary, aliases move. Report an explicit "above measurable band" state instead of lying.

## v1 scope
- One capture button, one bulb at a time, 3-second measurement
- Manual exposure lock + line-rate calibration against a user-confirmed mains reference
- Frequency, percent flicker, flicker index, IEEE 1789 verdict
- Two-frame-rate alias rejection
- Local list of named measurements

## Out of scope
Spectral/CRI measurement, iPhone companion, bulb database/crowdsourcing, dimmer sweep automation.

## Risks & unknowns
Some webcams expose no manual exposure control at all; auto-exposure ruins everything. Global-shutter sensors have no banding (detect and refuse). Accuracy above ~2 kHz is likely unreachable, which must be stated honestly rather than fudged.

## Done means
Measuring a known-good incandescent returns 120 Hz at <10% modulation and a "no effect" verdict; a known-bad dimmed LED returns 120 Hz at >40% with a "high risk" verdict; both results reproduce within 15% across three separate captures and two frame rates.
