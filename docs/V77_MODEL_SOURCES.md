# BANGERVERSE v77 · Real 3D model sources and status

## Implemented

Existing accounts and local/Supabase saves remain unchanged.

- **Heroes**: KayKit Adventurers glTF/GLB (CC0): Knight, Mage, Rogue Hooded, Barbarian. Added as selectable character types; their previews do not change the saved hero until Select is pressed.
- **Pets**: Quaternius Ultimate Animated Animals glTF (pack page CC0): Fox, Wolf, Husky, Shiba Inu. Wolf/Husky/Shiba are additional coin-unlockable pets; previews are free and do not change the selected companion.
- **Rigged animations**: three.js GLTFLoader + SkeletonUtils.clone; play an idle/stand clip if available, otherwise the first clip.
- **Fallbacks**: use current local models or constructed fallback if upstream assets cannot be fetched. The previously saved companion name, pet gear and coins remain independent of previews.
- **Version**: visible header, `index.html`, `version.json`, module cache parameters and PWA worker are v77.

## Provenance and license

1. KayKit Adventurers, Kay Lousberg, CC0 1.0. https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 , pinned git commit `672074b73ba276876a19e8816ecdc5241817ab47`.
2. Quaternius Ultimate Animated Animal Pack, CC0 1.0 (pack page). https://quaternius.com/packs/ultimateanimatedanimals.html . GitHub mirror https://github.com/agentkaerf/FreeModels , pinned git commit `db3df04d1e4714298a09510b26fb6de6645138a2`.

Models load via HTTPS from GitHub at runtime. They are **not yet copied into this repository**. That means first load requires connectivity and may take longer over mobile internet. Do not call this an offline asset pack. Copies should be vendored after verifying bytes, retained author/pack/license metadata, runtime loading and iPhone WebGL performance.

## QA scope

Passed: modified JavaScript syntax, repository commit inspection and mock tests for zero-cost previews of unowned items, separate account-scoped profile, and insufficient-balance protection. **Not yet independently verified:** live iPhone WebGL display, actual animation playback, all external model downloads, GitHub Pages propagation or a signed-in Supabase cloud round-trip.
