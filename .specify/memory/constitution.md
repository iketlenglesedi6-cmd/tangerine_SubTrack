<!-- Sync Impact Report
Version change: placeholder → 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] → Product Clarity and Subscription Insight
- [PRINCIPLE_2_NAME] → TypeScript Discipline
- [PRINCIPLE_3_NAME] → Tailwind-First UI Discipline
- [PRINCIPLE_4_NAME] → Next.js App Router Discipline
- [PRINCIPLE_5_NAME] → Auth, Testing, Naming, and Team Collaboration Discipline
Added sections:
- Additional Constraints
- Development Workflow
Removed sections:
- None
Templates requiring updates:
- .specify/templates/plan-template.md: ⚠ pending
- .specify/templates/spec-template.md: ⚠ pending
- .specify/templates/tasks-template.md: ⚠ pending
- .specify/templates/commands/*.md: ⚠ pending because command templates are absent in the workspace
Follow-up TODOs:
- TODO(RATIFICATION_DATE): original ratification date is not stored in the repo and must be supplied by the project owner or team
-->

# SubTrack Constitution

## Core Principles

### I. Product Clarity and Subscription Insight
SubTrack exists to give one person a clear, dependable view of personal subscriptions and recurring expenses. Every feature, dashboard card, table, chart, alert, and workflow must help the user understand what is active, due, canceled, changing, or overspending. Product decisions must preserve the user’s financial clarity and reduce forgotten recurring payments.

### II. TypeScript Discipline
All production TypeScript must be written in strict mode without `any`. Types must model domain data, API responses, route params, authentication states, and UI state instead of falling back to permissive types. Prefer explicit interfaces, discriminated unions, type guards, and safe runtime validation. Errors must be typed, chained, and surfaced clearly through the app rather than swallowed.

### III. Tailwind-First UI Discipline
SubTrack uses Tailwind CSS as the default styling model and favors utility-first composition for React and Next.js UI. Custom CSS must only exist when Tailwind cannot represent the requirement safely, such as global resets, font loading, or necessary cross-browser polish. Styling must remain consistent, compact, and readable across all screens.

### IV. Next.js App Router Discipline
SubTrack is implemented with Next.js App Router and TypeScript. Routes are file-based under the app directory, with layout and page files representing route structure. Server components are the default model for data access, route rendering, and business rules. Client components are allowed only when the feature needs browser APIs, local interactivity, or Clerk client-side UI elements. Route files and component boundaries must separate server responsibilities from client responsibilities.

### V. Auth, Testing, Naming, and Team Collaboration Discipline
SubTrack uses Clerk for authentication and must route authentication responsibilities through Clerk conventions and protected server patterns. Every user-facing workflow must include or preserve a clear auth state, and private account data must never be exposed through public routes. Tests must be written or updated before implementation where behavior is changed, and test coverage must verify type-safe validation, auth flow boundaries, subscription calculations, route integrity, and the core recurring-expense dashboard. Naming must be consistent: files and directories use kebab-case when they represent routes or documents; components and domain types use PascalCase; utility variables and functions use camelCase; environment and Prisma model names use descriptive lower snake or model-specific naming; no ambiguous abbreviations. The two-person team, Lesedi Pride Iketleng and Farai Dale Rwambiwa, must collaborate through shared ownership, clear branch naming, review comments, and documentation updates on every product or architecture change.

## Additional Constraints

The required stack is Next.js App Router with TypeScript and Tailwind CSS. Application source must stay aligned with the repository structure that already uses the app directory, TypeScript configuration, and ESLint linting. Clerk must be the sole authentication provider. Data storage and Prisma integration must remain domain-aware and schema-driven rather than ad hoc. Custom CSS is allowed only when necessary; Tailwind classes must carry the majority of visual styling. No `any` in TypeScript source, tests, or Prisma configuration. The final implementation must remain friendly to a two-person team that shares review, delivery, and documentation responsibilities.

## Development Workflow

SubTrack development must follow a simple review rhythm: define the user-visible behavior, implement the smallest typed change, verify tests and linting, and update documentation when architecture or routing changes. Components should be authored as reusable units where appropriate, but all UI must remain grounded in the product purpose: tracking subscriptions and recurring expenses with a calm, private, and accurate dashboard experience. Team members must keep implementation decisions discoverable, write clear commit topics, and keep the branch and route naming consistent with the repository conventions.

## Governance

This Constitution governs all SubTrack product, architecture, implementation, testing, and collaboration decisions. Changes to the stack, source structure, authentication strategy, testing strategy, UI styling model, or naming model require written documentation and a matching update to the repository guidance. The original version remains governed by the same principles until replaced by a properly amended version. A valid amendment requires explicit documentation of the principle change, a review by both team members, and a clear migration note when existing code or conventions become non-compliant. Compliance review happens at planning, implementation, and pull-request review time. If a new requirement conflicts with a principle, the principle wins until the constitution is amended.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original ratification date is not stored in the repository and must be supplied by the team | **Last Amended**: 2026-09-13
