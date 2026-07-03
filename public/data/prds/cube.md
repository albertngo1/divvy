## Overview
Cube is a mobile app for small shippers and 3PLs that scans a pallet with the phone's LiDAR, computes its real dimensional density, and tells you the correct NMFC freight class *before* the LTL carrier does — so their post-pickup reweigh/reclass invoice has nowhere to hide.

## Problem
Less-than-truckload freight is billed by NMFC class, which for most commodities is driven by density (lbs per cubic foot). Shippers eyeball dimensions, guess a class, and book. Carriers then reweigh and re-measure at the terminal; if your pallet is denser or bigger than declared, they issue a 'reclass' or 'reweigh' adjustment — often $40–$300 per shipment, sometimes weeks later, with a grainy photo as 'proof.' Small shippers have no independent measurement and eat the charge because disputing it means calling the terminal blind.

## How it works
1. Place the loaded pallet on the floor. Open Cube, walk a slow arc around it.
2. ARKit fuses the LiDAR depth mesh into a tight bounding cuboid (L×W×H to the nearest 0.1 in), auto-detecting the pallet base and ignoring overhang shrink-wrap wisps.
3. Enter or Bluetooth-import the scale weight.
4. Cube computes cubic feet, density, and maps to the NMFC density-scale class (50–500). It flags 'you declared 92.5, real is 85' before you book.
5. It saves a timestamped, geotagged evidence packet: the mesh, the cuboid dimensions, weight, and a rendered photo overlay — a one-tap PDF to counter any bogus reclass.

## Technical approach
- iOS-first (LiDAR on Pro iPhones/iPads): ARKit `sceneReconstruction` mesh + a RANSAC plane fit for the floor, then an oriented-bounding-box solve (PCA on the above-floor point cluster) for the cuboid. Hard part: rejecting shrink-wrap fuzz and forklift forks so the OBB is tight, not inflated — median-filter the point cloud and clamp to the convex hull's dominant faces.
- Density→class is a lookup against the standard NMFC density scale; commodity-specific NMFC codes are a paid data layer we license later, v1 uses the density scale which covers most freight-all-kinds.
- Data model: Shipment { dims, weight, density, class, meshRef, photos, ts, geo }. Local SQLite + iCloud sync.
- Weight via manual entry or BLE floor-scale (Mettler Toledo/Rice Lake broadcast APIs).

## v1 scope
- Single-pallet LiDAR scan → cuboid + cubic feet.
- Manual weight entry → density → density-scale class.
- Save/share a PDF evidence packet.

## Out of scope
- Full NMFC commodity code lookup.
- Android / non-LiDAR phones (photogrammetry fallback later).
- BOL generation, TMS integration, carrier API booking.

## Risks & unknowns
- LiDAR accuracy on large/dark/reflective loads; needs field calibration against a certified freight scale.
- Carriers may not accept a phone scan as dispute evidence — value may be pre-emptive pricing, not litigation.
- Density scale ≠ full NMFC; some commodities are class-fixed regardless of density.

## Done means
A user scans a real loaded pallet, Cube reports dimensions within ±1 inch of a tape measure and cubic feet within 5% of hand calculation, outputs the matching density-scale class, and exports a shareable PDF packet.
