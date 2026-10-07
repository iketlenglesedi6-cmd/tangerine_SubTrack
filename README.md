# Tangerine SubTrack

We are Lesedi Pride Iketleng and Farai Dale Rwambiwa. We built SubTrack for people who want to keep track of recurring subscriptions and see what is coming up before the next charge. You can add subscriptions yourself or import a bank statement CSV, check the charges SubTrack finds, and choose what to save.

SubTrack is a tracking tool. It does not connect to a bank, cancel a service with a provider, or make payments.

## Project links

- **Live app:** [tangerine-sub-track.vercel.app](https://tangerine-sub-track.vercel.app)
- **GitHub repository:** [iketlenglesedi6-cmd/tangerine_SubTrack](https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack)
- **Authentication:** Clerk
- **Hosting:** Vercel
- **Database:** Neon PostgreSQL

## What you can do in the app

- **Dashboard (`/dashboard`):** See your monthly subscription spend, saved subscriptions, category totals, and upcoming renewals. Search and filter the list, export it as CSV, change the display currency, and add or update entries.
- **Renewals (`/renewals`):** Review the renewal schedule by date.
- **Import (`/import`):** Choose a CSV from your device, match its columns, review recurring-charge suggestions, and save the ones you want to track.
- **Categories (`/categories`):** Add and rename categories. A category can be deleted once no subscriptions use it.
- **Landing, features, and pricing (`/`, `/features`, `/pricing`):** Read about SubTrack and sign in or create an account.

The dashboard and schedule use the signed-in user's saved data. New accounts start with helpful empty states and an animated Tangerine introduction.

## How we built it

The app uses Next.js App Router, React, and TypeScript. Clerk handles sign-up, sign-in, sessions, and the onboarding completion flag. PostgreSQL stores subscriptions and categories. We use Prisma ORM's Postgres runtime and the typed schema at `src/prisma/contract.prisma`. Tailwind CSS is used for styling; ESLint and Prettier configs are in the repo.

The main data flow is:

1. A signed-in user fills in the subscription form or chooses rows from the CSV import.
2. The client sends the selected information to an App Router handler such as `POST /api/subscriptions`.
3. The handler checks the Clerk session, validates the fields, and uses the signed-in user's Clerk ID when reading or writing database rows.
4. The route returns JSON. The page refreshes and reads the updated records from PostgreSQL.

The same ownership check is used for edits and deletes, so a user cannot use an API request to change another user's records. Page reads and dashboard calculations are done on the server; forms, filters, import review, and row actions run in client components.

### Data we store

- **Category:** The category name, its owner (`userId`), and its subscriptions. Names are unique for each user.
- **Subscription:** Name, cost, original currency, billing cycle, renewal date, status, owner, and category.

Both models support create, read, update, and delete. Deleting a subscription removes it from SubTrack; marking it canceled only changes its SubTrack status. Neither action contacts the subscription provider. We block duplicate subscription names and reject renewal dates in the past. Before canceling or deleting, the app asks the user to confirm.

## Bank statement CSV import

The selected file is read in the browser; the original statement is not uploaded or stored. `src/lib/bank-statement.ts` handles comma-, semicolon-, and tab-separated CSVs. It looks for date, description, amount/debit, and currency columns, groups similar merchant names, and suggests charges with monthly or yearly patterns and fairly consistent amounts. This is a best-effort match, so the user reviews suggestions before saving them.

The sample at [`public/sample-bank-statement.csv`](public/sample-bank-statement.csv) is fictional South African bank-style data in ZAR. It includes regular subscription charges and unrelated transactions. When importing the sample, choose **day/month/year** dates and **positive** expenses if those options appear.

## Currency and renewal dates

New manual subscriptions default to ZAR, while each saved subscription keeps its original currency. The app suggests a display currency using Vercel's country information or the browser locale; users can change it from the dashboard. That choice is stored in a one-year HTTP-only cookie.

`src/lib/exchange-rates.ts` gets reference rates from Frankfurter and caches them for six hours. If rates cannot be fetched, SubTrack shows the original currencies separately instead of guessing. These are reference conversions; a bank or card provider may use a different rate or charge fees.

Renewal dates must be today or later. The date input and the API both check this, so manually entering an old date is rejected. Duplicate subscription names are also checked in the form and API.

## Authentication and trying the app

`proxy.ts` installs Clerk middleware. Protected pages and API handlers use Clerk's server-side `auth()` helper, and queries are scoped to the current user's Clerk ID. Signing up or signing in returns the user to the dashboard. The Clerk account menu includes sign-out.

To try the main flow:

1. Open the [live app](https://tangerine-sub-track.vercel.app).
2. Choose **Start tracking** to create an account, or **Sign in** with demo details shared through Canvas.
3. Complete Clerk's email verification if requested.
4. Add a subscription manually, or go to **Import a bank statement** and select the sample CSV. Review suggestions before saving.
5. Try search and filters, edit a subscription, mark one canceled, and select **View schedule** to see its renewal date.

The deployed app currently shows Clerk's development-key warning. Clerk development instances allow up to 100 user accounts and up to 100 real emails per month. One grader account should be fine while the instance is below those limits; a demo login can be shared in Canvas as a backup. Development and production instances keep separate user lists.

## API routes

All the routes below check for a signed-in Clerk user and return JSON.

| Method | Route | What it does / who calls it |
| --- | --- | --- |
| `GET`, `POST` | `/api/subscriptions` | Lists the user's subscriptions or creates one. The manual form and CSV importer use `POST`. |
| `PATCH`, `DELETE` | `/api/subscriptions/[id]` | Updates or deletes an owned subscription. The editor and row actions use these methods. |
| `GET`, `POST` | `/api/categories` | Lists or creates the user's categories. The category manager uses `POST`. |
| `PATCH`, `DELETE` | `/api/categories/[id]` | Renames an owned category or deletes it if unused. The category manager calls these methods. |
| `GET` | `/api/dashboard/summary` | Returns a calculated summary for the signed-in user. The dashboard currently calculates its initial summary in the server page. |
| `POST` | `/api/currency-preference` | Checks and stores the selected display currency. |
| `POST` | `/api/onboarding/complete` | Saves completion of the intro montage in the user's Clerk public metadata. |

## Run it locally

You need Node.js/npm, PostgreSQL 15 or later, and a Clerk application. For local work, use Clerk's development keys.

1. Install packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your local database URL and Clerk development keys:

   ```dotenv
   DATABASE_URL="postgresql://user:password@localhost:5432/subtrack"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```

3. If you are using a **new, empty database**, create the contract and initialize the schema:

   ```bash
   npm run contract:emit
   npm run db:init
   ```

   Do not run `db:init` against a database that already has app data. `src/prisma/contract.prisma` is the active schema source, `src/prisma/db.ts` configures the database client, and `prisma/schema.prisma` is not used by the current Prisma ORM 8 setup.

4. For an existing database, inspect and apply migrations, then verify the schema:

   ```bash
   npm run db:migrate
   npm run db:verify
   ```

   The currency migration is `migrations/app/20261005T1509_add_subscription_currency`. Existing rows receive USD as their migration default; new manual entries default to ZAR.

5. Start the development server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

### Environment variables

| Name | Used for | Keep it safe? |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the server. | Yes. Do not commit or expose it. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser setup. | It is public configuration; use the key paired with the right Clerk instance. |
| `CLERK_SECRET_KEY` | Clerk server-side operations. | Yes. Never expose it in browser code or commit it. |

Never commit `.env`, `.env.local`, database URLs, or real Clerk keys. `npm run contract:emit` regenerates `contract.json` and `contract.d.ts`; review generated changes before committing.

## Deploying on Vercel

The GitHub repo is connected to Vercel, which runs the normal Next.js production build (`npm run build`). The live app uses Neon PostgreSQL and Clerk.

1. Set `DATABASE_URL` in Vercel to the Neon connection string.
2. Set both Clerk variables in Vercel and make sure they come from the same Clerk instance. The current course demo uses development keys, which trigger the browser warning above. For a public production launch, use a Clerk production instance, its matching `pk_live_...` and `sk_live_...` keys, and a production domain configured in Clerk.
3. Apply/verify database migrations before using a new database. Do not initialize a database that already contains user data.
4. Deploy from the intended branch, then check sign-in, dashboard data, and CSV import on the deployed URL. Vercel environment-variable changes take effect on a new deployment.

Keep demo credentials in Canvas, not in this file. Never commit the Clerk secret key or database URL.

## Short product demo

We made SubTrack for people who want to know what recurring services they are paying for and when those charges are due. It is for anyone who wants to organize subscriptions without connecting a bank account or handing control of services to another app.

After signing in, add subscriptions one at a time or import a CSV and review the possible recurring charges before saving them. The dashboard shows monthly spend and categories; the renewal schedule shows what's coming up. A user can change an entry, mark it canceled, or remove it, and can choose a display currency while the saved amount keeps its original currency.

## Lighthouse scores

Latest scores shared for the production dashboard:

| Run | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 99 | 100 | 100 | 100 |
| Mobile | 80 | 100 | 100 | 100 |

These are Lighthouse scores, not fixed app settings; results can shift with the browser, device, cache, and network throttling. When we compare another run, we should use the same page and test settings and keep the full Lighthouse report with the scores.

## What we still want to improve

- **More statement formats:** Import currently supports CSV, not PDF. Bank CSV formats also differ, so users may need to select the right date, amount, or currency column.
- **Recurring-charge suggestions:** Detection is a heuristic. It can miss variable charges or suggest unrelated transactions, which is why users review the results before saving.
- **Reminders:** The app shows the renewal schedule, but it does not send email or push reminders yet.
- **Currency rates:** Frankfurter rates are references. They may not match a bank/card conversion or include provider fees.
- **Clerk deployment:** The Vercel app currently uses Clerk development keys. This is enough for a small class demo, but the warning and development limits should be addressed before a wider public launch.

Bank linking, automatic cancellation, and payments are outside what we set out to build: SubTrack only helps users track and plan.
