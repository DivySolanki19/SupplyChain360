# SupplyChain360

Inventory and supplier analytics for practical replenishment decisions.

A responsive, accessible-by-design portfolio application built with vanilla JavaScript, HTML and CSS. All application logic runs locally in the browser. No API keys, paid services or production packages are required.

![Checks](https://github.com/DivySolanki19/SupplyChain360/actions/workflows/pages.yml/badge.svg)

## Features

- Create, edit and delete inventory items with validated stock, cost and demand inputs
- Search and category/status filters, with filtered valuation and unit KPIs
- Weighted demand forecasts and interactive demand chart
- Reorder alerts, stock cover and suggested quantities net of incoming units
- Supplier scorecard with on-time delivery, accepted-unit quality and weighted scores
- Browser persistence, graceful storage failure, demo reset and CSV export

## Run locally

Install Node.js 22 or newer, then:

```sh
git clone https://github.com/DivySolanki19/SupplyChain360.git
cd SupplyChain360
npm start
```

Open `http://127.0.0.1:4173`. No `npm install` step is needed. ES modules require HTTP serving; opening `index.html` directly from disk is not supported. Set `PORT` if another application uses 4173.

```sh
npm test       # Node's built-in automated test runner
npm run build # Copy deployable assets into dist/
```

## Two-minute demonstration

Find Precision sensor and change stock to zero. Verify the out-of-stock alert and reload to check persistence. Review the suggested order, then restore stock to 145.

## Data and persistence

12 SKUs, three categories and four fictional suppliers. Three 30-day demand observations per item; synthetic supplier totals cover a trailing 12-month period.

Edits are stored under an application-specific, versioned localStorage key. Invalid saved records fall back to demo data with a warning. Storage denial or quota failure leaves edits in memory and displays a warning. Export before clearing browser data. Each browser is independent; concurrent tabs use last-write-wins. CSV is an export, not an import/restore format.

All datasets are synthetic. Do not enter confidential business information or personal data into the demo.

## Architecture and interview preparation

- [Architecture and design decisions](docs/ARCHITECTURE.md)
- [Interview guide and extension exercises](docs/INTERVIEW.md)
- [Testing and manual verification](docs/TESTING.md)
- [AI-assisted development disclosure](AI_DISCLOSURE.md)

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. Pull requests run tests and build; pushes to `main` also deploy `dist/` with GitHub Pages.

1. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
2. Merge the reviewed application pull request into `main`.
3. Check **Actions → Test and deploy** for the deployment URL.

Expected address after a successful deployment: `https://DivySolanki19.github.io/SupplyChain360/`. This is an expected address, not a claim of an active deployment. Relative asset paths support project subdirectories. The workflow requires Pages to be enabled; no custom domain or paid infrastructure is needed.

See [GitHub’s publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Scope and limitations

Incoming units have no delivery dates, so they cannot guarantee avoidance of stockouts. Forecasts use fixed weights, assume 30-day periods and ignore seasonality. Supplier observations are read-only. No purchase orders are transmitted.

This is a single-user portfolio demonstration, not a production business system. There is no authentication, server-side database, audit log or multi-user synchronisation. Accessible controls, text equivalents, focus states, responsive layouts and semantic tables are included, but no formal WCAG conformance certification is claimed.

## Authorship

Portfolio owner: [DivySolanki19](https://github.com/DivySolanki19). Development was AI-assisted; see the disclosure for the role of AI and the review expectations. The existing repository heading and history are retained.
