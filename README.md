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

1. Install Node.js and PostgreSQL (version 15 or later).
2. Create a PostgreSQL database and configure the tables described in `src/prisma/contract.prisma`.
3. Create a Clerk application and copy `.env.example` to `.env`. Set `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` to your local values.
4. Install dependencies and start the development server:

   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Never commit `.env` or real credentials. `npm run contract:emit` refreshes the generated database contract from the configured database; review the generated changes before committing them.

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
- **Demo credentials:** Create a dedicated grader account in the production Clerk instance and provide its credentials in the course submission. Do not commit credentials here.
- **Grader steps:** Sign in, add a subscription, edit its status, remove it, and manage a category from the dashboard.

## Known limitations and opportunities

- The production URL and grader account need to be supplied with the final Canvas submission.
- Renewal dates are displayed, but the app does not send email or push reminders.
- Lighthouse mobile scores and WCAG contrast results still need to be measured against the deployed app and recorded in the Canvas submission.
- Category deletion is blocked while subscriptions still reference that category.
