# Inventory planning dashboard with supplier performance analytics

Replaces the heading-only repository with a complete, independently runnable portfolio application. The original Git history and project heading are retained.

## Behaviour

Validated inventory CRUD; local persistence; demand forecasting; stock cover and reorder alerts; suggested replenishment; supplier scorecards; CSV export.

Responsive HTML/CSS and ES modules require no production dependencies. Includes synthetic datasets, semantic controls, safe CSV/HTML output, architecture documentation, interview preparation and an explicit AI-assistance disclosure.

## Validation

- `npm test`: 13 passed, zero failures.
- `npm run build`: passed.
- Browser checks: desktop and 390px layouts, core interactions and CSV download. See `docs/TESTING.md` for the exact checks and limits.

## Deployment and scope

GitHub Actions tests PRs and builds the static artifact. Default-branch pushes deploy with Pages after the repository publishing source is set to GitHub Actions. No claim of an active deployment is made before that succeeds.

This is a single-user synthetic-data demonstration. There is no backend authentication, shared database or audit trail. Forecasts and scoring are illustrative. Development was AI-assisted.
