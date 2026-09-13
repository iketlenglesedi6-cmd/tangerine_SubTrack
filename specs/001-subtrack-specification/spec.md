# Feature Specification: SubTrack Project Specification

**Feature Branch**: `001-subtrack-specification`
**Created**: 2026-09-13
**Status**: Draft
**Input**: User description: "Create a project specification for SubTrack, a personal finance web app that helps users track monthly subscriptions and recurring expenses. Include: project title and description, purpose and target audience, user stories for core workflows (sign up/login, add/view/update/delete a subscription, create/manage categories, view dashboard totals and upcoming renewals), acceptance criteria for each story, API endpoints (auth, subscriptions CRUD, categories CRUD, dashboard summary), and implementation priority."

## Project Title and Description

**Project Title**: SubTrack

**Project Description**: SubTrack is a personal finance web application that helps users understand, organize, and manage monthly subscriptions and recurring expenses in one private dashboard. The product gives users an overview of active subscriptions, category spending, upcoming renewals, and monthly recurring-cost totals.

## Purpose and Target Audience

SubTrack exists to help individuals regain clarity about recurring financial commitments that are easy to forget. The primary target audience is a single user who wants to manage personal subscriptions and recurring purchases without needing a full accounting or business-finance system.

The application should support:

- A user who wants to create a private account and manage a personal subscription ledger.
- A user who needs to create, review, update, and remove subscription records.
- A user who wants to organize subscriptions, renewals, and recurring expenses by category.
- A user who needs a dashboard that summarizes total monthly subscription cost and highlights upcoming renewals.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign up and log in securely (Priority: P1)

As a new user, I want to create a private SubTrack account and sign in using Clerk-backed authentication so that my subscription data remains protected and accessible only to me.

**Why this priority**: Authentication is the gateway to every private workflow in the app. Without a secure login and signup flow, all subscription data would lack a safe boundary.

**Independent Test**: A new user can access the signup flow, create an account, and then sign in to a private dashboard.

**Acceptance Scenarios**:

1. **Given** a first-time user visits the app, **When** they choose sign up, **Then** they can create an account through Clerk and land in a protected dashboard.
2. **Given** an existing user has an account, **When** they sign in, **Then** they access their own subscription data and are redirected to the dashboard.
3. **Given** a user signs out, **When** they try to access protected information, **Then** the server denies access and sends them to the sign-in flow.

---

### User Story 2 - Add and manage subscriptions (Priority: P1)

As a user, I want to add, view, update, and delete subscriptions so that I can maintain an accurate list of recurring expenses and service commitments.

**Why this priority**: The core job of SubTrack is to maintain subscription records that reflect real recurring payments.

**Independent Test**: A user can create a subscription, review the stored data, update details, and remove the subscription from the list.

**Acceptance Scenarios**:

1. **Given** a signed-in user opens the subscription manager, **When** they submit a subscription name, category, amount, billing cycle, next renewal date, and status, **Then** the system saves the subscription and shows it in the subscription list.
2. **Given** a saved subscription exists, **When** the user opens it, **Then** they can view the full details, including category, billing amount, billing cadence, next renewal, and status.
3. **Given** a saved subscription exists, **When** the user updates the subscription details, **Then** the updated record replaces the previous record without affecting other data.
4. **Given** a saved subscription exists, **When** the user deletes the subscription, **Then** the record is removed from the visible list and from the account's saved collection.

---

### User Story 3 - Create and manage categories (Priority: P2)

As a user, I want to create, view, update, and delete categories so that subscriptions can be grouped by meaningful monthly spending areas such as entertainment, work tools, fitness, or cloud services.

**Why this priority**: Categories help the user understand subscription spending patterns and support filtering, budgeting, and dashboard summaries.

**Independent Test**: A user can add a category, assign it to subscriptions, update its name or attributes, and remove it safely when no longer used.

**Acceptance Scenarios**:

1. **Given** a signed-in user wants to organize spending, **When** they create a category with a valid name, **Then** the category becomes available for assignment to subscriptions.
2. **Given** a category has been created, **When** the user edits its details, **Then** the category name or display details update everywhere it is used.
3. **Given** a category exists in the category list, **When** the user removes a category, **Then** the category is deleted and any subscriptions referencing it are reassigned to an "Uncategorized" default or prompted for reassignment.

---

### User Story 4 - View dashboard totals and upcoming renewals (Priority: P1)

As a user, I want to see dashboard totals and upcoming renewals so that I can quickly understand my recurring monthly obligations and prepare for upcoming charges.

**Why this priority**: Dashboard visibility directly supports financial awareness and monthly planning, which is the primary product value.

**Independent Test**: A signed-in user sees a dashboard with monthly recurring cost totals and upcoming renewal dates.

**Acceptance Scenarios**:

1. **Given** a user has active subscriptions, **When** the dashboard loads, **Then** the system calculates and displays the total monthly recurring spend.
2. **Given** multiple subscriptions with different next renewal dates, **When** the user visits the dashboard, **Then** the dashboard shows upcoming renewals ordered by date.
3. **Given** a subscription has a status of active or canceled, **When** the dashboard summarizes totals, **Then** it excludes canceled records from active total calculations.

---

### Edge Cases

- What happens when a user attempts to create a category with a duplicate name?
- What happens when a user tries to delete a category that is still linked to subscriptions?
- What happens when a subscription renewal date is missing or invalid?
- What happens when a user has no subscriptions and opens the dashboard?
- What happens when a new user signs up but has no data yet?

## Requirements *(mandatory)*

### Functional Requirements

1. The application shall provide secure sign-up and sign-in via Clerk for private account access.
2. The application shall allow a signed-in user to add a subscription with at least the following fields: name, category, amount, billing cycle, next renewal date, and status (active or canceled).
3. The application shall allow a signed-in user to view stored subscriptions and subscription details.
4. The application shall allow a signed-in user to update an existing subscription record.
5. The application shall allow a signed-in user to delete an existing subscription record.
6. The application shall allow a signed-in user to create, view, update, and delete category records used to organize subscriptions.
7. The application shall display dashboard totals for the user's recurring monthly spending.
8. The application shall display upcoming subscription renewals sorted by date.
9. The application shall provide an API surface for subscriptions CRUD, categories CRUD, and dashboard summary data.
10. The application shall protect user data through Clerk-authenticated routes and user-scoped database records (filtered by Clerk `userId`).

### API Endpoints

**Authentication**:

- Authentication is handled by Clerk's hosted sign-up/sign-in components and session management — no custom auth routes are built by the team.
- `GET /api/auth/me` - returns the current authenticated user's profile, backed by the active Clerk session.

**Subscriptions CRUD**:

- `GET /api/subscriptions` - returns the authenticated user's subscriptions.
- `POST /api/subscriptions` - creates a new subscription record.
- `GET /api/subscriptions/:id` - returns one subscription record.
- `PATCH /api/subscriptions/:id` - updates an existing subscription record.
- `DELETE /api/subscriptions/:id` - deletes an existing subscription record.

**Categories CRUD**:

- `GET /api/categories` - returns the authenticated user's categories.
- `POST /api/categories` - creates a new category record.
- `GET /api/categories/:id` - returns one category record.
- `PATCH /api/categories/:id` - updates an existing category record.
- `DELETE /api/categories/:id` - deletes an existing category record.

**Dashboard Summary**:

- `GET /api/dashboard/summary` - returns total monthly recurring spend, active subscription count, and upcoming renewals sorted by date.

### Data and Domain Assumptions

- A subscription belongs to one category and one user account.
- A category belongs to one user account.
- A subscription has a status of active or canceled.
- Billing cadence is represented as a billing cycle such as monthly or yearly.
- The dashboard summary uses only data belonging to the signed-in user (scoped by Clerk `userId`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create an account and sign in in under 2 minutes and reach a protected dashboard.
- **SC-002**: Users can add, view, update, and delete a subscription without losing or duplicating records.
- **SC-003**: Users can create and manage categories and associate them with subscriptions for improved spending organization.
- **SC-004**: Users can view their monthly recurring totals and upcoming renewals on the dashboard.

## Implementation Priority

### Priority P1

- Authentication via Clerk (sign up, sign in, protected routes).
- Subscription create, read, update, and delete lifecycle.
- Dashboard summary and upcoming renewals.

### Priority P2

- Category create, read, update, and delete lifecycle.
- Category assignment and subscription organization flows.

### Priority P3 (stretch, time permitting)

- Category-level spending breakdowns or simple charts on the dashboard.

## Additional Constraints

The implementation must respect the SubTrack Constitution for the repository, including Next.js App Router, TypeScript strict mode without `any`, Tailwind-first styling, Clerk authentication, file-based routing, testing expectations, and a shared two-person team workflow.
