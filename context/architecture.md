# Architecture
## Stack
Next.js App Router, React and TypeScript. GSAP handles entrances and dialog animation. Lenis smooths wheel scrolling while touch stays native.
## Boundaries
app/ owns the root layout, route and styles. components/ implements React views and browser interactions. lib/menu.ts defines catalog types and search. scripts/build-menu.mjs validates menu-source.txt and emits data/menu.json. public/media/ holds optimized WebP assets.
## Storage and access
The Next.js build creates a static export in out/. Qubillo handles ordering, cart, and table context.
## Invariants
Keep pricing and dietary values sourced. Treat missing source tags as unknown. Render a bounded page of results at a time. Respect reduced motion. Preserve the numbered image mapping when changing the catalog.
## Local development
Use npm ci to install dependencies and npm run dev to start the app. Run npm run menu:verify to check the snapshot and image inventory, then npm run build to test the production export.
