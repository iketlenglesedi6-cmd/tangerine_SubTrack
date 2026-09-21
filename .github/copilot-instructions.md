# SubTrack — Copilot Instructions

## Stack
- Next.js 16 (App Router), TypeScript strict mode, Tailwind CSS 4
- Auth: Clerk (Core 3 API — use `Show when="signed-in"` / `Show when="signed-out"`, not `<SignedIn>`/`<SignedOut>`)
- Database: PostgreSQL (Neon), accessed via Prisma's ORM client at `src/prisma/db.ts`
- Data model source of truth: `src/prisma/contract.prisma`

## Data Model
- `Category`: id, name, userId, createdAt — one Category has many Subscriptions
- `Subscription`: id, name, cost, billingCycle ("monthly" | "yearly"), renewalDate, status ("active" | "canceled"), userId, categoryId, createdAt, updatedAt

## Conventions
- All database queries must filter by the authenticated Clerk `userId` — never return another user's data.
- API routes live under `app/api/`, one folder per resource, `route.ts` for collection endpoints and `[id]/route.ts` for single-resource endpoints.
- Server Components fetch data directly via `db.orm.public.*`; Client Components (`"use client"`) call the API routes via `fetch`.
- Color palette: tangerine accent `#F97316` (used sparingly — one CTA, one bold moment per view), warm-neutral base (`#1C1917` text, `#FAFAF9`/`#FFFFFF` backgrounds, `#78716C` secondary text). Avoid generic card-grid layouts with identical borders/shadows on every element.
- No `any` types.

## Testing
- Unit tests for calculation logic (e.g. `src/lib/dashboard.ts`) live alongside the file as `*.test.ts`.
