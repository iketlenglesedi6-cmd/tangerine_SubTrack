# Tangerine SubTrack

SubTrack helps people see recurring charges, organize subscriptions, and plan for upcoming renewals. Users can add subscriptions themselves or import a bank statement CSV, review likely recurring charges, and decide what to save. The app does not connect to a bank, contact subscription providers, cancel services, or make payments.

## Team

- Lesedi Pride Iketleng
- Farai Dale Rwambiwa

## Live project

- **Application:** [https://tangerine-sub-track.vercel.app](https://tangerine-sub-track.vercel.app)
- **Repository:** [https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack](https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack)
- **Authentication:** Clerk
- **Hosting:** Vercel
- **Database:** PostgreSQL on Neon

The live app requires a Clerk account. For grading, provide a dedicated demo account and its sign-in details in Canvas; credentials and secrets do not belong in this repository.

## Technology

- Next.js App Router, React, and TypeScript
- Clerk for sign-in, sign-up, protected pages, and user metadata
- PostgreSQL with Prisma ORM Postgres runtime and a typed Prisma ORM 8 contract
- Tailwind CSS
- Frankfurter reference exchange rates

## Run locally

### Requirements

- Node.js and npm
- A PostgreSQL 15 or newer database
- A Clerk application

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your local PostgreSQL URL and Clerk development keys:

   ```dotenv
   DATABASE_URL="postgresql://user:password@localhost:5432/subtrack"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```

3. For a **new, empty database only**, generate the Prisma ORM contract and initialize the schema:

   ```bash
   npm run contract:emit
   npm run db:init
   ```

   `src/prisma/contract.prisma` is the active schema source. Prisma's runtime client is configured in `src/prisma/db.ts` and generated contract files are in `src/prisma/`. The separate `prisma/schema.prisma` file is not used by the current Prisma ORM 8 configuration. Do not run `db:init` against a database that already contains app data.

4. For an existing database, inspect the pending changes, apply migrations, and verify the result:

   ```bash
   npm run db:migrate
   npm run db:verify
   ```

   The existing currency migration is in `migrations/app/20261005T1509_add_subscription_currency`. It adds a required currency value to existing subscriptions, defaulting those existing rows to USD. New manual form entries default to ZAR.

5. Start the local app:

   ```bash
   npm run dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000).

Never commit `.env`, `.env.local`, database URLs, or real Clerk keys. `npm run contract:emit` regenerates `contract.json` and `contract.d.ts`; review those files before committing generated changes.

## Backend and data flow

Clerk identifies the signed-in user. Each protected page and API route reads the Clerk session with `auth()` and uses the Clerk `userId` to scope database queries, so a user can only read or change their own subscription and category records.

The database connection is created in `src/prisma/db.ts` using `DATABASE_URL` and the Prisma ORM Postgres runtime. The typed contract in `src/prisma/contract.prisma` defines two tables:

- **Category** stores a user's category names. Category names are unique per user.
- **Subscription** stores its name, price, currency, billing cycle, next renewal date, active/canceled tracking status, owner, and category relation.

### Example: creating a subscription

1. The dashboard's client-side `SubscriptionForm` sends a JSON `POST` to `/api/subscriptions`.
2. The route handler checks the Clerk session, validates the fields and renewal date, and checks that a normalized subscription name is not already in the user's list.
3. It finds or creates the user's category, then creates the subscription row in PostgreSQL with the Clerk `userId`.
4. The handler returns the saved record as JSON. The client refreshes the dashboard so its server-rendered data reflects the database.

Editing and deletion use the same client-to-route-handler pattern. The API checks record ownership before changing or deleting it. Marking a subscription canceled only changes its SubTrack status; it does not cancel the account with the provider. Category deletion is refused while subscriptions still use that category.

### Bank statement import

`components/statement-importer.tsx` reads the selected CSV in the browser. `src/lib/bank-statement.ts` parses comma-, semicolon-, and tab-separated rows; identifies likely date, description, debit/amount, and currency columns; groups similar merchant descriptions; then looks for monthly or yearly intervals with reasonably stable amounts. Detection is a heuristic, so the user reviews each suggestion. The original statement file is not uploaded or stored. Only the individual recurring charges the user selects are sent to `POST /api/subscriptions`.

The downloadable demo at `/sample-bank-statement.csv` is fictional South African data in ZAR. It has bank-style debit and credit columns, a running balance, masked references, regular subscription charges, and unrelated transactions. For this sample, choose **day/month/year** dates and **positive** expenses if the importer asks.

### Currency selection and conversion

The app suggests a display currency from Vercel's country header, then the browser's locale when that header is unavailable. Users can change it. The selection is validated by `POST /api/currency-preference` and saved in a one-year, HTTP-only cookie in that browser. It does not replace the original currency stored on each subscription.

`src/lib/exchange-rates.ts` requests reference rates from Frankfurter and caches them for six hours. Dashboard and renewal pages use those rates to convert displayed totals. If rates are unavailable, the app leaves amounts in their original currencies instead of guessing. These are reference conversions, not a promise of the amount a bank or card provider will settle.

### First-time introduction

After Clerk sign-in or sign-up, Clerk redirects to `/dashboard`. Users who have not completed or skipped the Tangerine onboarding montage see it there. `POST /api/onboarding/complete` records the completion flag in the signed-in user's Clerk public metadata, so the montage is shown only once per account.

## API route handlers

All listed routes require an authenticated Clerk session and return JSON. Data routes are implemented under `app/api/`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET`, `POST` | `/api/subscriptions` | List the signed-in user's subscriptions or create one. |
| `PATCH`, `DELETE` | `/api/subscriptions/[id]` | Update an owned subscription or delete it. PATCH validates fields and blocks duplicate names. |
| `GET`, `POST` | `/api/categories` | List or create the signed-in user's categories. |
| `PATCH`, `DELETE` | `/api/categories/[id]` | Rename an owned category or delete it if it has no subscriptions. |
| `GET` | `/api/dashboard/summary` | Return calculated summary data for the signed-in user's subscriptions. |
| `POST` | `/api/currency-preference` | Validate and save a display-currency preference cookie. |
| `POST` | `/api/onboarding/complete` | Save the current user's onboarding completion flag in Clerk metadata. |

## Deploy to Vercel

The GitHub repository is connected to Vercel. The production build uses the Next.js defaults and `npm run build`.

1. Create or select a Neon PostgreSQL database and copy its connection string into the Vercel project's `DATABASE_URL` variable.
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel Project Settings. Configure Clerk for the deployment domain and use the matching Clerk instance's keys in each Vercel environment.
3. Apply the required database contract/migrations and verify the schema before serving the deployment. Do not initialize an existing database with `db:init`.
4. Deploy from the intended Git branch and open the deployment URL to verify sign-in, dashboard data, and statement import.

Do not put secrets in this README or in Git. For the course submission, provide the repository URL, live URL, demo credentials, and access steps in Canvas.

## Product demo summary

SubTrack helps people with recurring bills understand what they are paying and when the next charges are expected. It is intended for individuals who want one place to review subscriptions, spot recurring charges in a bank CSV export, and organize expenses without giving an app access to their bank account.

After signing in, a user can add subscriptions manually or import a CSV and review likely recurring charges before saving them. The dashboard summarizes monthly spend and categories, while the renewal schedule shows upcoming charges. Users can edit, mark entries canceled, or delete records, manage categories, and choose a display currency while retaining each subscription's original amount. SubTrack is a planning tool; it does not cancel services or initiate payments.

## Lighthouse results supplied for the production dashboard

The reports were captured on October 7, 2026 using Lighthouse 13.4.1:

| Device and time (GMT+2) | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop, 5:24 PM | 99 | 96 | 100 | 100 |
| Mobile (Moto G Power, 5:26 PM) | 76 | 96 | 100 | 100 |
| Mobile (Moto G Power, 5:54 PM, latest) | 75 | 100 | 100 | 100 |

The latest mobile report no longer shows a color-contrast warning. Its metrics were FCP 1.0 s, LCP 3.6 s, TBT 550 ms, CLS 0.001, and Speed Index 3.2 s. Lighthouse also reported 3.7 s of main-thread work, 1.8 s JavaScript execution, an estimated 214 KiB of unused JavaScript, and 18 long tasks. Mobile performance is the main remaining Lighthouse opportunity; measure any future optimizations against the same device and throttling settings.

## Known limitations and next steps

- SubTrack does not connect to banks or service providers and does not send email or push renewal reminders.
- The statement importer accepts CSV, not PDF. Some banks offer CSV or spreadsheet exports alongside PDF statements.
- Recurring-charge detection is heuristic. It can miss variable charges or group unrelated charges; users should review matches before saving them.
- When the statement has no currency column or currency code, the user must choose the correct fallback currency.
- Exchange rates are reference rates and may differ from bank/card conversion rates, fees, and final settlement amounts.
- The latest supplied Lighthouse mobile performance score is 75. The most recent mobile report scored accessibility 100 and did not show the earlier contrast warning.
- Category deletion is blocked while subscriptions still reference that category.
