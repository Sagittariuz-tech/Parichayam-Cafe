# Progress tracker
## Completed
- Captured and validated 266 entries, 30 categories, prices, descriptions and dietary flags from the café’s Qubillo table menu.
- Created the six context files and a catalog spec.
- Implemented responsive browsing, sticky mobile filters, dish details, category navigation and the original table ordering handoff.
- Cropped, reviewed and optimized a separate WebP for every entry. Recorded the photography sources and prompts.
- Checked the phone layout at 320 and 390 pixels, desktop composition, search, empty state, pagination, dietary filtering and dish dialogs.
## Release
Private review deployment through Sites.

## Next.js migration
- Ported the catalog and dialogs to React and TypeScript, keeping the captured menu and all 269 media files byte-for-byte.
- Verified menu inputs and image coverage, TypeScript, static production build, and locally tested search, pagination, keyboard dismissal, and mobile category and diet controls.

## In-house service and interface update
- Relocated the Next.js app under src and introduced a Node runtime with SQLite for orders, reservations, and staff actions.
- Added a vector logo, individual letter reveals, one-card phone carousel, and six illustrated staff greetings.
- Verified the original menu and image inventory, 320-pixel fit, order and reservation dialogs, and staff confirmation in a local browser. Exercised concurrent retry deduplication, authorization, time validation, privacy of booking lookups, and overlapping-table protection.

## Dish and category refinement
- Added unique editorial descriptions and three kitchen note suggestions for every item.
- Verified the mobile category drawer, uncropped burger photo, QR table prefill, table 15 ordering, quantity bounds, and persisted kitchen notes.
- Verified menu assets, the production build, TypeScript, and the high-contrast browser tab icon.

## Booking, search, and brand refinement
- Centered the contained SVG in the header and footer. Styled the main reservation action and added keyboard and touch dish suggestions with exact selection.
- Verified one confirmed booking per eligible table under concurrent requests, retry idempotency, adjacent time slots, legacy references, and account-free guest confirmation.
- Verified ID copying, CSV details and spreadsheet escaping, greeting variation, and the 320-pixel layout. The production build, TypeScript, and menu checks passed.

## Order write recovery
- Reproduced the order failure with an isolated SQLite write lock. Added a bounded retry for busy or locked writes and kept the original order reference.
- Verified the Cheese Sandwich order, a lock that clears, a persistent lock, and duplicate prevention on replay. Refreshed the local production preview.
