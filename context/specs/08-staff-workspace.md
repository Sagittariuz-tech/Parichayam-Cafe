# Staff operations workspace

Replace the three basic staff forms with a responsive sidebar workspace: My day, Attendance, Leave, Off duty, and Ingredients. Keep the staff route protected by its role session, bind signatures to the role, and retain the existing developer and owner screens.

Attendance tracks one active shift, check-in, break/off-duty intervals, return and checkout, net hours and history. Leave has types, date ranges, half days, entitlement estimates, overlap validation, pending/cancelled decisions and an owner review surface in the same browser demo. Off duty covers temporary live unavailability and dated requests with handover details. Ingredients have a stock catalog, thresholds, locations, units, receipts/usage/wastage/counts, batch/expiry/supplier details, immutable movement history and replenishment requests.

Use typed domain operations with business validation. Demo state persists locally, synchronizes between tabs and exposes storage errors. The owner can review the same local requests; no claim of cross-device delivery or production authorization. Keep older unstructured staff entries accessible as legacy history. Test transition rules, date overlaps, stock arithmetic, role isolation, responsive UI and persistence.
