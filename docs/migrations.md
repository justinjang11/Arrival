# Database Migrations

All changes to the Arrival database schema must use committed, sequential
migration files. Never modify an existing migration — always create a new one.

## Rules

1. Every schema change gets its own migration file.
2. Migrations are sequential and committed to version control before they run.
3. Do not edit or delete a migration that has already been applied anywhere.
4. Run migrations in order; never skip one.
5. Review migrations before applying them to a production database.

## Convention

When Supabase is connected, migrations live in `supabase/migrations/` and follow
this naming pattern:

```
YYYYMMDDHHMMSS_short_description.sql
```

Example:

```
20260901120000_create_users_table.sql
20260901130000_add_wishbone_profile.sql
```

## Commands (once Supabase CLI is installed)

```bash
# Generate a new migration from local schema changes
supabase db diff -f short_description

# Apply pending migrations to the linked project
supabase db push

# Re-apply all migrations from scratch (local dev only — destructive)
supabase db reset
```

## Initial schema

The target schema entities are defined in `docs/ARRIVAL_PRODUCT_SPEC.md §5.5`.
The first migration must establish all tables listed there before any feature
code references them.
