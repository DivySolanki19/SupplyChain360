# Testing

Run `npm test` with Node.js 22+. The suite contains 13 tests covering domain calculations, boundaries, dataset invariants, CSV escaping, HTML escaping, corrupt saved state and storage failures. `npm run build` verifies the static packaging step.

The automated suite is focused on pure functions and adapters. It is not a browser end-to-end suite. Browser checks are recorded separately below; no full cross-browser or screen-reader audit is claimed.

## Manual acceptance checklist

1. Start the server and verify the dashboard loads with populated cards and tables.
2. Find Precision sensor and change stock to zero. Verify the out-of-stock alert and reload to check persistence. Review the suggested order, then restore stock to 145.
3. Export the current view; verify CSV headers and filtered row count.
4. Navigate controls using Tab, Enter and arrow keys. Check visible focus.
5. Inspect the layout at a narrow viewport; tables should scroll inside their containers.
6. Submit an invalid form, cancel without saving, save a valid edit, reload, and verify persistence. Try a search with no results.
7. Restore the demo only after confirming replacement of local edits.

## CI

Every pull request runs the same Node tests and static build on Ubuntu. Only the default branch uploads the Pages artifact and deploys. A deployment failure caused by disabled Pages does not imply the unit tests failed; configure the publishing source as documented in the README.

## Verification record — 14 November 2026

- `npm test`: 13 passing tests, zero failures.
- `npm run build`: successful.
- Browser: Chromium-based in-app browser; desktop rendering and 390-pixel viewport inspected, no page-level horizontal overflow.
- Verified editing stock to zero, out-of-stock recalculation, reload persistence, empty search results and restoration of original stock.
- Full cross-browser, screen-reader and automated browser coverage remain future work.
