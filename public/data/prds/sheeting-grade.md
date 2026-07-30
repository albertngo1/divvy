## Overview
A dashcam app plus offline processing pipeline that estimates the retroreflectivity of traffic signs from a normal night drive, and outputs a GPS-tagged sign inventory with pass / marginal / fail against FHWA minimum retroreflectivity levels, ranked by replacement priority. Customer: small-city and county public works departments, and the sign contractors who bid their work.

## Problem
Federal rules require road agencies to maintain a method for keeping signs above minimum retroreflectivity. A handheld ASTM E1709 retroreflectometer runs $8–15k and measures one sign at a time; survey vans cost far more. So a town of 9,000 with 2,400 signs does the legal-but-useless thing: a superintendent drives around at night and eyeballs it on a clipboard, producing no defensible record and no prioritization. When someone crashes at a faded stop sign, that clipboard is the town's entire defense.

## How it works
Phone is mounted at a fixed, recorded position on the dash; low beams on; drive the route at 25 mph. The app locks exposure, ISO, focus and white balance and captures RAW frames with GPS and heading. A retroreflective calibration patch of known R_A is taped to the hood, in frame on every capture. Offline: detect and classify signs, track each across frames, and for each frame linearize the RAW, measure mean luminance per color region of the sign face, and recover distance from the known MUTCD standard size for that sign class via pinhole projection. Observation angle follows from the fixed headlight-to-lens separation and distance; entrance angle from vehicle heading versus sign normal. R_A ∝ measured luminance × d² / illuminance at the sign — and the hood patch, seen at a known distance under the same headlights and the same locked exposure, cancels out the unknown headlight output entirely. Multiple frames give an R_A curve across observation angles; fit and compare to the FHWA minimum table by sign color and class.

## Technical approach
iOS/Android capture app (AVCapturePhotoOutput RAW / Camera2 + DngCreator). Detection: RT-DETR or YOLOv8 fine-tuned on the Mapillary Traffic Sign Dataset (~300 classes) plus a small hand-labeled local set; tracking via ByteTrack; sign identity deduplicated across passes by geospatial clustering (DBSCAN on back-projected position + class). Pipeline in Python (rawpy, OpenCV, GDAL) writing GeoJSON + a per-sign photo strip; report generated as PDF referencing the agency's chosen assessment method. The hard part is photometry in the wild: headlight aim varies with load, LED spectra differ from halogen, wet pavement and dirty sign faces both suppress return, and oncoming traffic blows out frames. Mitigation is the hood reference patch, per-frame outlier rejection, and requiring N≥5 clean frames per sign before issuing a number.

## v1 scope
- One road, ~20 signs, manual mount and manual patch placement
- Capture app does nothing but lock exposure and dump RAW + GPS
- Desktop notebook does detection, distance, and relative R_A
- Output is a CSV plus a folder of crops

## Out of scope
Multi-vehicle fleets, real-time on-device inference, overhead guide signs, pavement markings, any claim of certified measurement.

## Risks & unknowns
Whether phone-grade photometry lands within ±25% of a real retroreflectometer — validate against a borrowed unit early. Legal positioning matters: sell this as a *screening and prioritization* tool that tells you where to point the expensive instrument, not as a compliance measurement, until the correlation data justifies more.

## Done means
On 20 signs measured with a borrowed ASTM E1709 unit, the pipeline's ranking correlates with ground truth at Spearman ρ > 0.8 and correctly identifies every sign below the FHWA minimum.
