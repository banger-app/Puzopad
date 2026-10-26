# BANGERVERSE v80 · REBORN

## Implemented in existing app (non-destructive)
- Character Studio: stage and zoom controls remain always visible, compact scrolling catalogue below on iPhone; species/pets/color in collapsible folders. Purchases and try-on unchanged.
- BENNY: home command dock, AI photo/receipt recognition via secured Supabase Edge Function `banger-inventory` (authenticated). AI returns reviewed product proposals; only user-confirmed items with explicit positive quantities enter `db.loot`. Unreadable nutrition stays null.
- Products: 3 locations in one inventory `home → transit → work`. Physical move requires tapping location. Eating is a separate confirmed action requiring quantity and kcal-per-100. `pcs` cannot be consumed without converting to known grams/ml. No auto foods added from purchases.
- Gym v80: personalized weekly count and goal, scheduled rotating Push/Pull/Legs plan. Guided steps and timer; workout log gets only manually completed exercises upon confirmation. The active workout is saved to user's existing cloud-synced game state.
- Version: v80 everywhere, service-worker cache revision updated, no destructive schema changes.
- Account ownership: existing `onboarding-v69` account ID and Supabase RLS retained; new fields exist only under user-specific `db.gymV80` and `db.bennyV80Imports`.

## Known limits / next proper asset pipeline
- GLB cosmetics from pre-v80 still don't have skin-weighted body-conforming meshes: true Sims-like character creator requires coherent rig, PBR textures, morph targets, LOD, animations and production content.
- External CC0 assets v77 are requested over HTTPS on first viewing; no offline vendor bundle yet.
- Benny recognizes only what's visible. Accuracy needs photos of labels; no inferred quantities or nutritional values.
- Cannot claim iPhone/WebGL photo AI inference or cloud cross-device replay end-to-end is tested until an authenticated mobile test.

## QA
Static module integration/syntax checks, Edge Function deployment status, preview/dedup/quantity contracts and game-state safety checks. No existing weights, foods, drinks, sleep, coins or garage data deleted.

## v80.2 QA patch: Benny read-only context
When the signed-in user sends a message to Benny, the app now includes a bounded read-only snapshot of today's actually logged food (18:00 rollover), latest approved weights, known inventory locations and quantities, the current training plan and coins. The existing banger-ai function version 13 accepts this optional context; older clients are unaffected. The user's request, not the context, determines whether any food action is proposed. Purchase scan remains a distinct authenticated endpoint and requires confirmation. No background tracking, no autonomous food/weight entries.

QA covered mock guided workout cycle, optional quantity rejection, imported item dedupe, location moves, explicit grams/ml consumption and null-macro protection. No signed-in browser's cloud round-trip, production model recognition accuracy, nor live iPhone visual QA was possible here.
