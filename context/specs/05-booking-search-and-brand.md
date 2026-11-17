# Booking, search, and brand refinement

1. Contain the SVG within a centered square in both brand treatments and give the reservation action a distinct, high-contrast style.
2. Add keyboard and pointer accessible dish suggestions. Selecting one clears other filters and shows that single dish, with the existing detail and order flow.
3. Assign an eligible free table and save confirmation in one database transaction. Show the confirmed guest card only after the server returns. Preserve old references and status lookup.
4. Give the guest a copyable alphanumeric ID and a spreadsheet-safe CSV receipt. Keep staff access separate from the guest flow.
5. Pick a new greeting on each page opening and vary order compliments independently of the portrait. Prevent consecutive repeat messages.
6. Verify concurrent bookings and retries, mobile and desktop search selection, the CSV, and the running local preview.

## Review decisions
- Use 15 configurable tables, with four seats per table as the default until the café supplies its seating plan. Keep the existing 90-minute default.
- When every eligible table is taken, give a clear error and keep the form available for a different time. Do not turn a server failure into a fake booking.
- Confirming a public booking does not require a sign-in. Restrict the staff desk and keep phone numbers out of the public lookup and downloaded receipt.
