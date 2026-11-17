# Parichayam Café

A mobile-first digital table menu built with Next.js App Router, React and TypeScript. The catalog contains 266 items across 30 categories. Guests browse here and follow the table ordering link to Qubillo.

## Run locally

Use Node.js 22 or later.

    npm ci
    npm run dev

Open http://localhost:3000.

## Build and verify

    npm run menu:verify
    npm run build
    npm run typecheck

Next.js writes the deployable static site to out/. Serve that folder with any static web server.

## Project layout

- app/ contains the page, root layout and styles.
- components/ contains the catalog, dialogs, landing sections and motion.
- lib/menu.ts handles display and search.
- menu-source.txt is the menu snapshot. Run npm run menu:build after editing it to regenerate data/menu.json.
- public/media/ contains the WebP images. Each numbered filename matches a menu item ID.
- context/ contains the six-file project context. Image credits and prompts are in context/specs/photo-production.md.
