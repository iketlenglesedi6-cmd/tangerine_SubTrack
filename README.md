# Tangerine SubTrack

SubTrack helps people see recurring charges, organize subscriptions, and plan for upcoming renewals. Users can add subscriptions themselves or import a bank statement CSV, review likely recurring charges, and decide what to save. The app does not connect to a bank, contact subscription providers, cancel services, or make payments.

## Contents

- [Team and deployment](#team-and-deployment)
- [Application views](#application-views)
- [Technology](#technology)
- [Run locally](#run-locally)
- [Authentication and grader access](#authentication-and-grader-access)
- [Backend and data flow](#backend-and-data-flow)
- [Data models and CRUD](#data-models-and-crud)
- [Bank statement import](#bank-statement-import)
- [Currency selection and conversion](#currency-selection-and-conversion)
- [API route handlers](#api-route-handlers)
- [Deploy to Vercel](#deploy-to-vercel)
- [Product demo summary](#product-demo-summary)
- [Lighthouse results](#lighthouse-results)
- [Known limitations and next steps](#known-limitations-and-next-steps)

## Team and deployment

- Lesedi Pride Iketleng
- Farai Dale Rwambiwa

## Live project

- **Application:** [https://tangerine-sub-track.vercel.app](https://tangerine-sub-track.vercel.app)
- **Repository:** [https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack](https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack)
- **Authentication:** Clerk
- **Hosting:** Vercel
- **Database:** PostgreSQL on Neon

The live app requires a Clerk account. A grader can create an account from the sign-up flow. For convenience, provide concise access steps and, if available, a dedicated demo account in Canvas. Never put credentials or secrets in this repository.

## Application views

| Route | View | Main user value |
| --- | --- | --- |
| `/` | Landing page | Explains the product and offers sign-in or sign-up. |
| `/dashboard` | Subscription dashboard | Shows monthly recurring spend, active subscription count, near-term renewals, category totals, and the saved subscription list. Users can search, filter, export, change display currency, and manage entries. |
| `/renewals` | Renewal schedule | Presents upcoming renewals in date order so users can plan for charges. |
| `/import` | Statement import | Lets a user choose a local CSV, map its columns, and review detected recurring charges before saving selected items. |
| `/categories` | Category management | Creates, renames, and removes categories used to organize subscriptions. |
| `/features` and `/pricing` | Product information | Describe SubTrack's features and intended value. |

The dashboard, renewals, and categories views are backed by the signed-in user's database records. Empty states guide new users before they have saved subscriptions.

## Technology

- Next.js App Router, React, and TypeScript
- Clerk for sign-in, sign-up, protected pages, and user metadata
- PostgreSQL with Prisma ORM Postgres runtime and a typed Prisma ORM 8 contract
- Tailwind CSS
- Frankfurter reference exchange rates
- ESLint and Prettier configuration for consistent code style

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

### Environment variables

| Variable | Purpose | Handling |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the server-side Prisma database client. | Secret; configure locally and in the hosting provider. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public key used to initialize Clerk authentication in the browser. | Public configuration; use the key paired with the matching Clerk instance. |
| `CLERK_SECRET_KEY` | Clerk server key used by server routes and user metadata operations. | Secret; never expose it in client code or commit it. |

Use Clerk development keys for local development. The deployed app currently displays Clerk's warning that development keys are in use. Development instances have a 100-user cap and limited email delivery, so this setup is suitable only for a small course demo, not a general public launch. A production launch requires a Clerk production instance, its matching live keys, and a configured production domain.

Never commit `.env`, `.env.local`, database URLs, or real Clerk keys. `npm run contract:emit` regenerates `contract.json` and `contract.d.ts`; review those files before committing generated changes.

## Backend and data flow

Clerk identifies the signed-in user. Each protected page and API route reads the Clerk session with `auth()` and uses the Clerk `userId` to scope database queries, so a user can only read or change their own subscription and category records.

The database connection is created in `src/prisma/db.ts` using `DATABASE_URL` and the Prisma ORM Postgres runtime. The typed contract in `src/prisma/contract.prisma` defines two tables:

- **Category** stores a user's category names. Category names are unique per user.
- **Subscription** stores its name, price, currency, billing cycle, next renewal date, active/canceled tracking status, owner, and category relation.

The app uses server components for authenticated page reads and calculations, and client components for interactive forms, filters, import review, and row actions. For example, the subscription form sends a request to an App Router route handler; the handler authenticates the request, validates the input, writes to PostgreSQL, and returns JSON to the client. Database queries are scoped by Clerk `userId` so one user's records are not returned to another user's session.

### Example: creating a subscription

1. The dashboard's client-side `SubscriptionForm` sends a JSON `POST` to `/api/subscriptions`.
2. The route handler checks the Clerk session, validates the fields and renewal date, and checks that a normalized subscription name is not already in the user's list.
3. It finds or creates the user's category, then creates the subscription row in PostgreSQL with the Clerk `userId`.
4. The handler returns the saved record as JSON. The client refreshes the dashboard so its server-rendered data reflects the database.

Editing and deletion use the same client-to-route-handler pattern. The API checks record ownership before changing or deleting it. Marking a subscription canceled only changes its SubTrack status; it does not cancel the account with the provider. Category deletion is refused while subscriptions still use that category.

## Data models and CRUD

| Model | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Subscription | Manual form or selected CSV import rows. | Dashboard list, summary, and renewal schedule. | Edit form updates name, price, currency, cycle, and renewal date. | Delete removes the SubTrack record; marking canceled changes its tracking status without contacting the provider. |
| Category | Category manager. | Dashboard filters and category management. | Rename in the category manager. | Delete is allowed only when no subscriptions use the category. |

All CRUD operations are limited to records owned by the authenticated Clerk user. Category names are unique per user, and the subscription API prevents duplicate normalized names for the same user.

### Bank statement import

`components/statement-importer.tsx` reads the selected CSV in the browser. `src/lib/bank-statement.ts` parses comma-, semicolon-, and tab-separated rows; identifies likely date, description, debit/amount, and currency columns; groups similar merchant descriptions; then looks for monthly or yearly intervals with reasonably stable amounts. Detection is a heuristic, so the user reviews each suggestion. The original statement file is not uploaded or stored. Only the individual recurring charges the user selects are sent to `POST /api/subscriptions`.

The downloadable demo at `/sample-bank-statement.csv` is fictional South African data in ZAR. It has bank-style debit and credit columns, a running balance, masked references, regular subscription charges, and unrelated transactions. For this sample, choose **day/month/year** dates and **positive** expenses if the importer asks.

### Currency selection and conversion

The app suggests a display currency from Vercel's country header, then the browser's locale when that header is unavailable. Users can change it. The selection is validated by `POST /api/currency-preference` and saved in a one-year, HTTP-only cookie in that browser. It does not replace the original currency stored on each subscription.

`src/lib/exchange-rates.ts` requests reference rates from Frankfurter and caches them for six hours. Dashboard and renewal pages use those rates to convert displayed totals. If rates are unavailable, the app leaves amounts in their original currencies instead of guessing. These are reference conversions, not a promise of the amount a bank or card provider will settle.

### First-time introduction

After Clerk sign-in or sign-up, Clerk redirects to `/dashboard`. Users who have not completed or skipped the Tangerine onboarding montage see it there. `POST /api/onboarding/complete` records the completion flag in the signed-in user's Clerk public metadata, so the montage is shown only once per account.

## Authentication and grader access

Authentication is provided by Clerk. `proxy.ts` installs `clerkMiddleware()`, and protected pages and API handlers call Clerk's server-side `auth()` helper. Sign-up and sign-in return users to the dashboard; the Clerk account menu provides sign-out.

To grade the deployed app:

1. Open the [live application](https://tangerine-sub-track.vercel.app).
2. Choose **Start tracking** to create an account, or **Sign in** if using a demo account supplied in Canvas.
3. Complete Clerk's verification step if prompted.
4. On the dashboard, add a subscription manually or choose **Import a bank statement** and use the included sample CSV. Review detected rows before saving.
5. Try dashboard search and filters, edit or cancel an entry, and open **View schedule** to inspect upcoming renewals.

The current Clerk development instance supports up to 100 user accounts. Clerk-delivered development email is also limited to 100 messages per calendar month. A grader should be able to create one account while the instance is below those limits; provide a demo login in Canvas as a fallback if verification email is unavailable. Development and production Clerk instances have separate user data.

## API route handlers

All listed routes require an authenticated Clerk session and return JSON. Data routes are implemented under `app/api/`. The dashboard and other pages read their initial data in server components; interactive client components use the mutation routes shown below.

| Method | Endpoint | Purpose and caller |
| --- | --- | --- |
| `GET`, `POST` | `/api/subscriptions` | List the signed-in user's subscriptions or create one. `POST` is used by the manual form and CSV importer. |
| `PATCH`, `DELETE` | `/api/subscriptions/[id]` | Update an owned subscription or delete it. `PATCH` validates fields and blocks duplicate names; the editor and row actions call these methods. |
| `GET`, `POST` | `/api/categories` | List or create the signed-in user's categories. The category manager uses `POST` to create categories. |
| `PATCH`, `DELETE` | `/api/categories/[id]` | Rename an owned category or delete it if it has no subscriptions. The category manager calls these mutations. |
| `GET` | `/api/dashboard/summary` | Return calculated summary data for the signed-in user's subscriptions. The dashboard currently calculates its initial summary in the server page. |
| `POST` | `/api/currency-preference` | Validate and save a display-currency preference cookie. Called by the currency selector. |
| `POST` | `/api/onboarding/complete` | Save the current user's onboarding completion flag in Clerk metadata. Called by the onboarding montage. |

## Deploy to Vercel

The GitHub repository is connected to Vercel. The production build uses the Next.js defaults and `npm run build`.

1. Create or select a Neon PostgreSQL database and copy its connection string into the Vercel project's `DATABASE_URL` variable.
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel Project Settings. For the course demo, use the matching Clerk development instance keys. For a production launch, create and configure a Clerk production instance, associate a production domain, use its paired `pk_live_...` and `sk_live_...` keys, and redeploy. The publishable key is public configuration; the secret key must remain secret.
3. Apply the required database contract/migrations and verify the schema before serving the deployment. Do not initialize an existing database with `db:init`.
4. Deploy from the intended Git branch and open the deployment URL to verify sign-in, dashboard data, and statement import.

Do not put secrets in this README or in Git. For the course submission, provide the repository URL, live URL, demo credentials, and access steps in Canvas.

## Product demo summary

SubTrack helps people with recurring bills understand what they are paying and when the next charges are expected. It is intended for individuals who want one place to review subscriptions, spot recurring charges in a bank CSV export, and organize expenses without giving an app access to their bank account.

After signing in, a user can add subscriptions manually or import a CSV and review likely recurring charges before saving them. The dashboard summarizes monthly spend and categories, while the renewal schedule shows upcoming charges. Users can edit, mark entries canceled, or delete records, manage categories, and choose a display currency while retaining each subscription's original amount. SubTrack is a planning tool; it does not cancel services or initiate payments.

## Lighthouse results

The latest supplied Lighthouse scores for the production dashboard (`/dashboard`) are:

| Form factor | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 99 | 100 | 100 | 100 |
| Mobile | 80 | 100 | 100 | 100 |

The latest mobile result has no Lighthouse score deductions in accessibility, best practices, or SEO. Performance results can vary with device, browser, network throttling, and cache state. For a useful comparison, run the same production route with the same Lighthouse settings and retain the complete report so metric details can be reviewed alongside the category scores.

## Known limitations and next steps

- SubTrack does not connect to banks or service providers and does not send email or push renewal reminders.
- The statement importer accepts CSV, not PDF. Some banks offer CSV or spreadsheet exports alongside PDF statements.
- Recurring-charge detection is heuristic. It can miss variable charges or group unrelated charges; users should review matches before saving them.
- When the statement has no currency column or currency code, the user must choose the correct fallback currency.
- Exchange rates are reference rates and may differ from bank/card conversion rates, fees, and final settlement amounts.
- The production browser console currently warns that Clerk development keys are loaded. Development instances have user and email limits; configure a Clerk production instance and production domain before a general public launch.
- Lighthouse performance varies between runs. The latest supplied scores are 99/100/100/100 on desktop and 80/100/100/100 on mobile; keep the complete report when updating these figures.
- Category deletion is blocked while subscriptions still reference that category.
