# BANGERVERSE v76 — Showroom & Halloween

Completed increment on top of v75; no destructive database, auth or personal progress changes.

## App features
- Original detailed 3D hero variants (frog, human, robot) and hamster Fa are authored as three.js meshes in `premium-models-v76.js`. They replace broken previous minimalist geometry in the viewer.
- Existing GLB imports still render for other pet species; they are not represented as newly imported packages.
- New opaque dark Three.js scene, clearer camera framing, stage/plinth and lighting. Stage gear overlay preserved.
- Universal free preview: each hero/pet item and every unlockable pet (even without coins); previewing colors does not buy the color.
- Limited Halloween 2026 collection (October 25 to November 3) — 8 cosmetic items; existing purchased items stay owned after the event.
- Header version patch in `interface-v61.js` eliminates recurring V63 override. `index.html`, `version.json`, service worker and module URLs bumped to v76.
- Five rarities, shop/inventory, 50 coin arcade daily limit, account-bound local/cloud saves kept.

## Third-party asset candidates, NOT yet bundled
1. [Quaternius Ultimate Animated Animals](https://quaternius.com/packs/ultimateanimatedanimals.html) — 12 rigged animals, glTF, pack advertises CC0.
2. [Kenney Cube Pets](https://kenney.nl/assets/cube-pets) — CC0 animated 3D animals.
3. [KayKit Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) — CC0 themed 3D environment props.
Quaternius site now also has QAL v1.0 (2026-08-28); confirm asset-by-asset licenses and source files before copying binaries to public repository. Do not claim the packs are installed until verified.

## QA limits
Static JavaScript parse and mock non-destructive previews checked. iPhone WebGL aesthetics, all individual GLBs and Supabase round-trip need real-device/account checks.
