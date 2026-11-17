# Parichayam Café

A mobile-first Next.js App Router site with a photo menu, table ordering, reservations, and a private staff desk.

## Run locally

Use Node.js 24 or later.

    npm ci
    npm run dev

Open http://localhost:3000. Copy .env.example to .env.local and set CAFE_STAFF_PASSWORD to a strong passphrase before opening http://localhost:3000/staff. Restart Next.js when changing environment values.

## Café workflow

- Put the table number in each table QR URL, such as /?table=4. Guests can also choose from tables 1 through 15 when ordering.
- Orders appear on /staff. Staff can move an order from queued to preparing to served, or cancel it.
- Guest reservations confirm immediately when an eligible table is available. A table cannot have overlapping bookings. Seating defaults to 90 minutes and can be set with CAFE_RESERVATION_MINUTES. Use CAFE_RESERVATION_TABLE_CAPACITIES to supply 15 comma-separated seat counts in table order. The default is four seats per table.
- Guests can copy an alphanumeric reservation ID and download a CSV with their name, table, party size, and time. The ID can be used to check status without a guest account. The public lookup returns booking status, date, party size, and assigned table.
- The staff desk presents the phone number for manual follow-up. The app does not send SMS or email or process payment.

## Build and host

    npm run menu:verify
    npm run build
    npm run typecheck
    npm start

Serve over HTTPS on a Node host with a persistent disk. Set CAFE_DB_PATH to a writable path on that disk and configure the staff password in the host's environment. Run a single service instance for the café database. The default .cafe-data directory is ignored by Git.

## Project layout

- src/app/ contains route handlers, pages, metadata and global styles.
- src/features/menu/ contains dish browsing, filtering and storefront motion.
- src/features/hospitality/ contains the order and reservation screens, staff desk, and illustrated greetings.
- src/server/ contains SQLite storage, service validation and staff access.
- menu-source.txt and src/data/menu.json store the original catalog and its generated runtime data. Use npm run menu:build after editing the snapshot.
- public/media/, public/brand/ and public/staff/ contain menu photos, the SVG mark and character art.
- context/ contains the six-file project context, specs and image credits.
