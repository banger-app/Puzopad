# BANGERVERSE v78 · Visual stability

Focused visual patch on top of v77, non-destructive to account state.

- HQ canvas has alpha; it blends into the existing room instead of showing an opaque black box.
- HQ 3D stage occupies the existing world art area; original SVG avatar/pet elements are hidden only after 3D successfully loads.
- Existing local `pet-dog.glb` (full dog) replaces the Gobkit corgi-head model for regular dog profiles, including Surechka.
- Imported GLB normalization uses an external wrapper for animated scenes instead of mutating the glTF root. Camera is reframed against combined visible scene bounds after switching hero or pet.
- Only stable idle/standing animation clips are played. No arbitrary first clip with jumping/death/walking motion.
- Wardrobe viewers support +/- zoom and rotation reset. Character/account state is not changed by controls.
- Header and PWA build 78, service worker revision 78.

Functional limitation: Outfit pieces still use procedural accessory geometry, not rigged clothing meshes matching each external character. No account, food, weight, garage or Supabase tables were altered. Real device/WebGL aesthetic validation outstanding.
