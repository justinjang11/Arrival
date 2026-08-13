# Arrival

AI-powered outfit discovery and multi-retailer shopping platform.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styles | Tailwind CSS v4 |
| Lint | ESLint (next/core-web-vitals + typescript) |
| Tests | Vitest + React Testing Library |
| Auth & database | Supabase / Postgres *(not yet connected)* |
| Catalog pipeline | Apify *(not yet connected)* |
| Checkout automation | Playwright / Browserbase *(not yet connected)* |

## Prerequisites

- Node.js 20+
- npm

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template
cp .env.example .env.local
# Fill in values as each service is connected — see .env.example for the full list

# 3. Start the development server (port 5000)
npm run dev
```

Open <http://localhost:5000> in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server on port 5000 with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Vitest single run (for CI) |

## Testing

```bash
npm test          # watch mode during development
npm run test:ci   # single run — used in CI and pre-merge checks
```

Tests live alongside the source they cover. The `src/__tests__/` directory holds
cross-cutting tests; feature-scoped tests should sit next to the feature they
cover.

## Production build

```bash
npm run build   # output in .next/
npm run start   # requires the compiled output above
```

## Project structure

```
src/
  app/           # Next.js App Router routes and layouts
  components/    # Reusable UI components (shared across features)
  features/      # Product feature modules (onboarding, outfit, checkout, …)
  lib/           # Domain logic, utilities, and type definitions
  data/          # Controlled mock data for local development
  __tests__/     # Cross-cutting unit and integration tests
docs/
  ARRIVAL_PRODUCT_SPEC.md   # Canonical product specification (authoritative)
  migrations.md             # Database migration rules and conventions
```

## Database migrations

All schema changes must be committed as sequential migration files before they
are applied. See [docs/migrations.md](docs/migrations.md) for the full
convention.

## Environment variables

[`.env.example`](.env.example) lists every required variable name (no values).
Copy it to `.env.local` and fill in values. **Never commit `.env.local` or any
file containing credentials.**

## Product specification

[`docs/ARRIVAL_PRODUCT_SPEC.md`](docs/ARRIVAL_PRODUCT_SPEC.md) is the canonical
source of truth. `BINDING_MVP` requirements take precedence over implementation
convenience. Do not implement `NORTH_STAR` features unless a task explicitly
promotes them, and do not silently resolve `UNRESOLVED` items.
