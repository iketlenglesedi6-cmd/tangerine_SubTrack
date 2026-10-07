# Tangerine SubTrack

- **Team:** Lesedi Pride Iketleng and Farai Dale Rwambiwa
- **Live app:** [tangerine-sub-track.vercel.app](https://tangerine-sub-track.vercel.app)
- **Repository:** [iketlenglesedi6-cmd/tangerine_SubTrack](https://github.com/iketlenglesedi6-cmd/tangerine_SubTrack)

SubTrack helps people keep track of recurring subscriptions and see what is coming up before the next charge. Add subscriptions manually or import a bank statement CSV, review the recurring charges SubTrack finds, and choose which ones to save.

SubTrack is a tracking tool. It does not connect to a bank, cancel a service with a provider, or make payments.

## Project links

- **Authentication:** Clerk (not Auth.js v5)
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

The app uses **Clerk** for authentication (not Auth.js v5). `proxy.ts` installs Clerk middleware. Protected pages and API handlers use Clerk's server-side `auth()` helper, and database queries are scoped to the current user's Clerk ID. Signing up or signing in returns the user to the dashboard. The Clerk account menu includes sign-out.

### Grader walkthrough

Follow these steps with a **new account** so the first-time onboarding is included in the demo. Use an email address you can access to complete Clerk verification.

1. Open the [live app](https://tangerine-sub-track.vercel.app) and choose **Start tracking**. Create a new Clerk account and complete email verification if prompted. Do not sign in to an account that has already completed onboarding.
2. On the dashboard, go through the three onboarding slides with **Next little tip**, then choose **Let's go to the dashboard**. The intro can also be dismissed with **Skip intro**.
3. From the dashboard, choose **Import a bank statement**. On the import page, click **Download sample bank CSV**. Save the downloaded `sample-bank-statement.csv` file somewhere you can find it.
4. On that same page, use the **CSV statement** file picker to select the downloaded file. SubTrack reads the file in your browser; it does not upload the original statement.
5. Review the **Match your statement columns** controls. For the supplied sample, use **Transaction Date** for the date, **Description** for the description, and **Debit** for the amount. Leave the currency column unset, use **ZAR** as the fallback currency, choose **Expenses are positive amounts**, and choose **Day / month / year** for the date format. The app may fill in some of these choices automatically.
6. Review the recurring-charge suggestions. Select the suggestions you want to track, or choose **Select all new**, then click **Import N selected**. Wait for the import confirmation.
7. Return to the dashboard. Review monthly spend, category totals, upcoming renewals, and the imported subscriptions. Try searching, filtering, changing the display currency, and exporting the list as CSV.
8. To demonstrate manual creation and subscription updates, expand **Add a subscription**. Enter a distinct name such as **Demo service**, a price and currency, choose a billing cycle and category, set a renewal date today or later, and click **Save subscription**. Use **Edit** on a row to change and save a value. Use **Mark canceled** and confirm; this changes the SubTrack record only and does not contact the provider. To demonstrate deletion, choose **Delete** on a test subscription and confirm **Yes, remove it**; this removes the record from SubTrack only.
9. Choose **View schedule** to review active upcoming renewals. On the dashboard, expand **Manage categories** to add a category, rename it, and delete it while it has no linked subscriptions.
10. Use the Clerk account menu to sign out when finished.

The intro is shown until an account completes or skips it; completion is stored in that user's Clerk public metadata. An existing Canvas demo account can be used to test the app, but may not show onboarding. For repeat onboarding tests, use a separate fresh account or, from the Clerk Dashboard, remove `subtrackOnboardingComplete` from the test user's public metadata. The deployed course demo uses Clerk development keys and displays Clerk's development-instance warning. Development and production Clerk instances have separate user lists, so any fallback demo credentials shared through Canvas must belong to the instance configured for the live deployment. For wider public use, configure a Clerk production instance and its production keys.

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

4. For an existing database, apply outstanding migrations and verify the schema:

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

## Product demo summary

SubTrack gives people a clear view of the recurring services they pay for and when the next charges are expected. It is designed for anyone who wants to organize subscriptions without connecting a bank account or giving another app control of their service accounts.

After signing in, add subscriptions one at a time or import a CSV and review likely recurring charges before saving them. The dashboard summarizes monthly spend and category totals, while the renewal schedule shows upcoming charges. Users can edit or remove entries, mark tracking as canceled, and choose a display currency while each saved amount retains its original currency.

## Lighthouse scores

Lighthouse 13.4.1 scores for the production app, captured October 7, 2026, using Chromium 154. Both reports cover a single initial page load. The desktop run used custom throttling; the mobile run emulated a Moto G Power on slow 4G.

| Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 97 | 100 | 100 | 100 | 0.3 s | 0.8 s | 110 ms | 0.002 | 1.4 s |
| Mobile (Moto G Power, slow 4G) | 76 | 100 | 100 | 100 | 2.1 s | 2.7 s | 760 ms | 0.001 | 2.6 s |

Accessibility, Best Practices, and SEO tied as the strongest categories at 100; Performance was weakest at 76 on mobile. Lighthouse scores are estimates and can shift with the browser, device, cache, network conditions, and page activity, so compare runs using the same page and settings. The full reports also flag unused JavaScript and long main-thread tasks for follow-up. Lighthouse's automated accessibility score does not replace manual accessibility checks.

The supplied WAVE reports for the pages scanned each showed 0 errors and 0 contrast errors. One report listed a redundant alternative-text alert; another listed four alerts, including redundant alternative text, an orphaned form label, a missing first-level heading, and a possible heading. Source changes now make the logo images decorative, give the dashboard a first-level heading, and explicitly associate the display-currency label with its control. These supplied counts are from before those changes were deployed; re-scan the landing page and signed-in dashboard, renewal schedule, import, and category pages after deployment. Review any remaining alerts manually. Zero automated contrast errors is useful evidence for the pages scanned, but does not establish full WCAG AA or AAA conformance.

## What we still want to improve

- **More statement formats:** Import currently supports CSV, not PDF. Bank CSV formats also differ, so users may need to select the right date, amount, or currency column.
- **Recurring-charge suggestions:** Detection is a heuristic. It can miss variable charges or suggest unrelated transactions, which is why users review the results before saving.
- **Reminders:** The app shows the renewal schedule, but it does not send email or push reminders yet.
- **Currency rates:** Frankfurter rates are references. They may not match a bank/card conversion or include provider fees.
- **Clerk deployment:** The Vercel app uses Clerk development keys for the course demo. Configure a production Clerk instance and keys before a wider public launch.

Bank linking, automatic cancellation, and payments are outside what we set out to build: SubTrack only helps users track and plan.
