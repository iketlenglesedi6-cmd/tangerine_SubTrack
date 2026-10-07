# SubTrack

SubTrack helps people find recurring charges, track subscriptions, and plan for upcoming renewals. Users can enter records themselves or import a bank statement CSV, review likely repeats, and choose which subscriptions to save.

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
- Choose a preferred display currency; SubTrack suggests one from your Vercel-detected country when deployed (or browser locale locally) and converts totals while retaining each original subscription currency.
- Add, edit, cancel/reactivate, or delete subscriptions; search and filter the list, then export the visible results as CSV.
- Import a bank CSV. The file is processed in the browser; only recurring-charge records the user approves are sent to the app.
- Try the importer with the fictional sample at `/sample-bank-statement.csv`; it contains no personal or bank account data.
- Review upcoming renewal dates and spending grouped by currency and category.
- Add, rename, or delete categories. A category can only be deleted when it has no subscriptions.

Changing a subscription's tracking status does not cancel or change the user's account with that service provider. SubTrack does not automatically connect to banks or service providers; the CSV import is a user-selected statement export.

## Updating an existing database

Existing databases need the currency field before deploying a build that supports multiple currencies. The reviewable migration is in `migrations/app/20261005T1509_add_subscription_currency`; it adds a non-null `currency` column with a `USD` default for existing subscriptions. Apply pending migrations with `npm run db:migrate`, then run `npm run db:verify`. New manual entries default to `ZAR`, and users can choose another supported currency. Do not run `npm run db:init` on this existing database.

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
- **Grader steps:** Sign in with the dedicated Clerk grader account, download the fictional sample CSV from `/import`, import it using ZAR and positive expense amounts, review and save the detected charges, then edit/search/filter/export subscriptions and visit **Renewal schedule**.
- **CSV format:** The importer accepts comma-, semicolon-, or tab-separated files and tries to detect date, description, amount, and currency columns. Users can map columns, choose date order and expense sign, and set a fallback currency for rows without currency information. It detects likely monthly/yearly repeats; users confirm each record before import.

## Known limitations and opportunities

- The production URL and grader account need to be supplied with the final Canvas submission.
- The app does not sync with banks or service-provider accounts and does not send email or push reminders.
- The importer accepts CSV, not PDF. Some banks offer CSV or Excel exports; the included fictional CSV is available to demonstrate the flow without a bank login.
- Recurring-charge detection is heuristic and can miss variable charges or misidentify repeated merchants; users review all matches before import.
- When a CSV includes a currency column, imports retain currency per transaction group; otherwise the user chooses a fallback currency.
- Display-currency conversion uses daily reference rates from [Frankfurter](https://frankfurter.dev/) and is an estimate; card-network rates, bank fees, and the exact settlement amount may differ. The chosen display currency is saved in a browser cookie.
- Lighthouse mobile scores and WCAG contrast results still need to be measured against the deployed app and recorded in the Canvas submission.
- Category deletion is blocked while subscriptions still reference that category.
