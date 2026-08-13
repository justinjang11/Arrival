# Arrival

AI-powered outfit discovery and multi-retailer shopping platform.

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Auth & database:** Supabase / Postgres (not yet connected — see Setup)
- **Catalog pipeline:** Apify (not yet connected)
- **Checkout automation:** Playwright / Browserbase (not yet connected)

## Running locally on Replit

The app runs on port 5000:

```bash
npm run dev
```

The workflow **Start application** is configured to start this automatically.

## Setup

The following environment secrets are needed when connecting Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

And later:

- `APIFY_API_TOKEN`
- `BROWSERBASE_API_KEY`

## Product specification

See `docs/ARRIVAL_PRODUCT_SPEC.md` for the canonical product specification.

## User preferences

- Keep the project's existing structure and stack unless asked to change it.
