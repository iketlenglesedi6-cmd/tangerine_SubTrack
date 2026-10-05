# SubTrack

SubTrack helps individuals see their recurring subscription costs, upcoming renewals, and spending by category in one place. Users sign in with Clerk, add subscriptions, and manage the categories used to organize them.

## Team

- Lesedi Pride Iketleng
- Farai Dale Rwambiwa

## Stack

- Next.js App Router and TypeScript
- Clerk authentication
- PostgreSQL with Prisma ORM Postgres
- Tailwind CSS

## Local setup

1. Install Node.js and create an empty PostgreSQL 15+ database. Neon works for a hosted development database.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to the database connection string.
3. Emit the Prisma ORM 8 contract and initialize the empty database:

   ```bash
   npm install
   npm run contract:emit
   npm run db:init
   ```

   The contract source of truth is `src/prisma/contract.prisma`; `prisma/schema.prisma` is not used by the current Prisma ORM 8 config. `db:init` creates tables and records the database contract. Only run it against a new, empty database. For an existing database, confirm its schema before using `npm run db:verify`.

4. Create a Clerk application and set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env` using its development keys.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

Never commit `.env` or real credentials. `npm run contract:emit` compiles the contract source into the generated `contract.json` and `contract.d.ts` files; review generated changes before committing them.

## Main user flows

- Sign up or sign in using Clerk.
- Open the dashboard to review monthly spend, active subscriptions, upcoming renewal dates, and category totals.
- Add, cancel/reactivate, or delete subscriptions.
- Add, rename, or delete categories. A category can only be deleted when it has no subscriptions.

## API notes

All API endpoints require an authenticated Clerk session. Responses use JSON.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET`, `POST` | `/api/subscriptions` | List or create the signed-in user's subscriptions |
| `PATCH`, `DELETE` | `/api/subscriptions/[id]` | Update status/details or delete an owned subscription |
| `GET`, `POST` | `/api/categories` | List or create the signed-in user's categories |
| `PATCH`, `DELETE` | `/api/categories/[id]` | Rename or delete an owned category |
| `GET` | `/api/dashboard/summary` | Return summary totals for the signed-in user's subscriptions |

## Deployment and grading access

- **Production URL:** Add the public deployment URL here after deployment.
- **Repository:** https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack
- **Authentication:** Clerk.
- **Vercel environment:** Set `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` in Project Settings. Use Clerk development keys for previews; production keys require a Clerk production instance configured for a domain you own.
- **Demo credentials:** Create a dedicated grader account in the production Clerk instance and provide its credentials in the course submission. Do not commit credentials here.
- **Grader steps:** Sign in, add a subscription, edit its status, remove it, and manage a category from the dashboard.

## Known limitations and opportunities

- The production URL and grader account need to be supplied with the final Canvas submission.
- Renewal dates are displayed, but the app does not send email or push reminders.
- Lighthouse mobile scores and WCAG contrast results still need to be measured against the deployed app and recorded in the Canvas submission.
- Category deletion is blocked while subscriptions still reference that category.
