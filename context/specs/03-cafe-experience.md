# Café experience update

## Plan
1. Move application code into src/app and src/features. Keep public assets stable and verify the menu records are identical.
2. Trace the supplied logo into SVG. Remove the eyebrow rules. Use a full-width snap slide on phones and preserve the desktop featured rail.
3. Run Lenis and GSAP on one animation clock. Reveal heading letters as sections enter the viewport and keep reduced-motion and horizontal gestures usable.
4. Introduce in-house table orders, reservation requests, and a password-protected staff queue. Add six illustrated staff characters with a first-visit welcome and rotating successful-order messages.
5. Test phone navigation, motion preferences, validation, retries, storage, staff access and status updates, then build and document setup.

## Plan review and revisions
- A static export cannot accept or save orders. Use the Next.js Node runtime and a SQLite database on a durable local disk. A staff queue provides an actual delivery path.
- A request cannot promise kitchen receipt or table availability. Show the order reference only after storage succeeds, and make the reservation pending until staff confirms. Keep messages truthful if the save fails.
- Requests may be retried or tapped twice. Use per-request keys and a unique database constraint. Validate item IDs and request details on the server.
- Table numbers are supplied by diners or the café's QR URL. Reservation availability is managed by staff using their real seating plan. Treat booking dates and café greetings in Asia/Kolkata.
- Keep staff access separate from public ordering. Avoid surprise motion and interruptions on repeat visits. Use one dismissible welcome per session and keep the order confirmation in a modal.

