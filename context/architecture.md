# Architecture

## Stack
Next.js App Router, React and TypeScript on Node 24. GSAP ScrollTrigger and Lenis share the animation clock. Native scrolling handles touch gestures.

## Boundaries
src/app owns page and API routes. src/features/menu owns browsing, render logic, and catalog data access. src/features/hospitality owns reservation UI, order acknowledgements and the staff desk. src/server validates and persists service requests. src/components contains shared UI controls.

## Storage and access
SQLite persists orders and reservations. Configure a durable local disk in production. A staff passphrase protects the queue and mutations. Guests can check a reservation via its UUID, which returns no guest name, phone or notes.

## Invariants
Use the existing snapshot for menu prices and labels. Match media by item ID. A retry keeps the same request ID. Assign the first eligible free table and confirm in the same SQLite transaction. Table capacities are configurable in table order. A successful order means it was saved to the kitchen queue.

## Local development
Use npm ci, npm run dev and a CAFE_STAFF_PASSWORD in .env.local for staff access. Use npm run menu:verify, npm run build and npm run typecheck for release checks. This release needs a Node host with persistent storage for production service.

## Database-free order preview
Orders default to demo mode. Validation runs on the server, but demo receipts do not read or write SQLite and explicitly disclose that nothing was sent to the kitchen. CAFE_ORDER_MODE=live enables the original persistent ordering flow. Hosted database integration for Vercel is deferred by the user.
