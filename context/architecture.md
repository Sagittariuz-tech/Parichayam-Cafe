# Architecture
## Stack
Buildless HTML, CSS, and browser JavaScript. GSAP handles entrance and reveal motion. Lenis handles optional smooth wheel scrolling while touch stays native.
## Boundaries
menu-source.txt stores the captured menu. scripts/build-menu.mjs validates it and emits dist/menu-data.js. dist/app.js controls the catalog and dialogs. dist/media/ holds resized WebP assets.
## Storage and access
The design requires only static hosting. Qubillo continues to handle ordering, cart, and table context.
## Invariants
Keep pricing and dietary values sourced. Treat missing source tags as unknown. Render a bounded page of results at a time. Exclude decorative motion when reduced motion is requested.
## Local development
Run python -m http.server 8000 --directory dist from the project root. Open http://localhost:8000. Run node scripts/build-menu.mjs --verify-images to check the snapshot and image inventory. The shipped site needs no package install or build at runtime.
