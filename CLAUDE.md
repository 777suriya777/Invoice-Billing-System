WHAT:
This repository is an Invoice Billing System built as a full-stack application.

- Tech stack:
  - Backend: Node.js + TypeScript
  - Database: Prisma ORM with a SQL database configured via `src/prisma/schema.prisma`
  - Frontend: Next.js + TypeScript in `invoice-billing-system-frontend/`
  - API: Express-style route controllers under `src/routes` and business logic in `src/controller`
  - Validation: Zod schemas in `src/validators`
  - Services: email and PDF invoice generation in `src/services`

- Project structure:
  - `src/`: main backend code
    - `src/controller/`: request handlers for auth, customer, invoice, item, payment, report
    - `src/routes/`: route definitions that connect endpoints to controllers
    - `src/repository/`: database access layer for auth, customer, invoice, item, payment
    - `src/prisma/`: Prisma schema and migrations
    - `src/middleware/`: authentication middleware and rate limiting
    - `src/validators/`: request validation schemas for customers, invoices, items, payments
    - `src/services/`: helper services for emailing and invoice PDF generation
    - `src/lib/prisma.ts`: Prisma client initialization
    - `src/utils/Math.ts`: utility math helpers used by backend logic
    - `src/test/`: test files for invoice and payment functionality, plus test setup mocks
    - `src/package.json`, `src/tsconfig.json`: backend dependencies and TypeScript configuration

  - `invoice-billing-system-frontend/`: frontend application
    - `app/`: Next.js app routes and pages
      - `app/page.tsx`: likely the main landing page
      - `app/customer/`, `app/invoices/`, `app/item/`: pages for customer, invoice, item management
      - `app/login/`, `app/register/`: authentication pages
      - `app/dashboard/page.tsx`: dashboard UI
    - `app/components/`: UI components like `ComboBox` and `Invoice`
    - `app/lib/authFetch.ts`: frontend fetch wrapper for authenticated requests
    - `app/middleware.ts`: Next.js middleware for auth or routing behavior
    - `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`: frontend config files

  - Root files:
    - `README.md`: project overview and likely setup instructions
    - `CLAUDE.md`: assistant instructions and codebase map

WHY:
This project is an invoice and billing management system.

- Purpose: to create, manage, and track customers, invoice items, invoices, and payments.
- What it does:
  - Backend exposes endpoints for auth, customer CRUD, invoice creation and listing, item management, payments, and reports.
  - Database logic is abstracted into repository modules with Prisma.
  - Validation ensures request data for customers, invoices, items, and payments is correct.
  - Services handle side effects like sending emails and generating invoice PDFs.
  - Frontend presents a Next.js user interface to login/register, manage customers, create invoices, add items, and view invoice details.
- How pieces fit:
  - Frontend calls backend APIs through `authFetch`.
  - Backend middleware authenticates requests and rate-limits API usage.
  - Controllers orchestrate input validation, repository operations, and service actions.
  - Prisma migrations define the database schema and keep it in sync.

HOW:
As Claude, use this repository map to locate features by area:
  - Backend API code in `src/`
  - Frontend UI code in `invoice-billing-system-frontend/app/`
  - Shared logic is mostly backend-only; frontend and backend are separate packages in this repo.

To work on the project:
  - Look for business logic in `src/controller` and `src/repository`.
  - Validate request shapes in `src/validators`.
  - Use `src/services` for email and PDF-related changes.
  - For UI work, inspect page routes and reusable components under `invoice-billing-system-frontend/app/`.

Verification and commands:
  - Backend tests: run from `src/` with `npm test` after installing dependencies.
  - Frontend typecheck and build:
      cd invoice-billing-system-frontend && npm install && npm run build
  - Backend typecheck and compile:
      cd src && npm install && npm run build
  - Prisma and database:
      cd src && npx prisma generate
  - To verify changes, run the backend test suite and build the frontend. Also inspect the API route and page output for any related feature changes.

