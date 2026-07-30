## Overview
A phone app (LiDAR iPhone/iPad first) for small shippers, 3PLs, and warehouse clerks that measures a palletized shipment's true outer envelope, computes density in pounds per cubic foot, returns the correct LTL freight class, and archives a signed, timestamped 3D capture as dispute evidence.

## Problem
Since the NMFC restructuring pushed most commodities onto a density-based scale, freight class is arithmetic — but nobody has good arithmetic inputs. Clerks eyeball "48x40x60" off a tape measure, forget the pallet, forget the shrink-wrap bulge, forget the 3 inches of overhang on one corner. The carrier's dimensioner tunnel measures the real envelope, reclasses the shipment, and bills a correction plus an inspection fee weeks later. Disputing it requires proof of what the pallet actually looked like at pickup, and the shipper has a photo at best. Warehouse dimensioners that solve this cost $20–60k and live in one building.

## How it works
Walk a half-circle around the pallet. ARKit's scene reconstruction plus depth frames build a point cloud; the app plane-fits the floor, segments the pallet cluster, and fits a minimum-volume oriented bounding box using rotating calipers on the 2D convex hull of the floor-projected points, then takes height as a high percentile of cloud z. Overhang beyond the pallet footprint is highlighted in red because that is what gets you billed. Type or Bluetooth-scale the weight; density and class fall out. Output: a PDF bill-of-lading insert with dimensions, density, class, a hash of the capture, GPS, and timestamp — plus the raw .usdz.

## Technical approach
Swift + ARKit `sceneReconstruction` / `ARDepthData`, Accelerate for the hull and PCA, on-device only. Class lookup from a small NMFC density-bracket table (sub-1 to 500) with a manual override for exception commodities. Server side is a thin Fastify + Postgres store for capture archives with a content-addressed S3 blob. The genuinely hard part is calibration honesty: LiDAR depth degrades past ~4 m and on black shrink wrap, so v1 must estimate and display its own error bars (repeat-scan variance on a known-size test box) and refuse to emit a certificate when the fit residual is high. Second hard part: shrink wrap is translucent and reflective, so depth returns are noisy — median-filter across frames and prefer the outer envelope.

## v1 scope
- One pallet at a time, on a flat floor, indoors
- Manual weight entry only
- Density → class table, single PDF export
- Repeatability self-test screen against a measured reference box

## Out of scope
Android/photogrammetry fallback, carrier API integrations, rate shopping, multi-pallet scenes, OCR of the BOL.

## Risks & unknowns
NMFC tables are licensed by NMFTA — v1 ships the density brackets and tells users to confirm the item number. Legal weight of a self-generated scan in a carrier dispute is untested; the honest pitch is leverage, not adjudication. Carriers may simply not care.

## Done means
Ten scans of a pallet whose true dimensions were tape-measured come back within ±0.5 inch per axis and produce the same freight class as a carrier dimensioner run on the same pallet.
