# GEMINI.md

## Project Overview

IssueFlow is a high-performance, multi-tenant issue tracking system. It is designed as a developer-centric alternative to complex enterprise tools, focusing on speed, productivity flow, and a sleek dark-themed interface.

### Main Technologies
- **Monorepo Management:** [Turborepo](https://turbo.build/repo), [pnpm](https://pnpm.io/)
- **Backend:** [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), PostgreSQL
- **Frontend:** [React](https://react.dev/) (Vite), [TanStack Query](https://tanstack.com/query/latest), [React Hook Form](https://react-hook-form.com/), [Tailwind CSS 4](https://tailwindcss.com/)
- **API Documentation:** [Swagger](https://swagger.io/)
- **Authentication:** JWT (Passport), Cookie-based sessions

### Architecture
- `apps/api`: NestJS backend. Core logic, multi-tenant guards, Prisma integration.
- `apps/web`: React frontend. Vite-powered, using Tailwind 4 for styling.
- `packages/types`: Shared TypeScript interfaces and DTOs used by both API and Web.
- `packages/ui`: Shared React UI components (e.g., Button).
- `packages/config`, `packages/tsconfig`: Centralized configurations.

---

## Building and Running

### Root Commands
- **Install Dependencies:** `pnpm install`
- **Development Mode:** `pnpm dev` (Runs both API and Web)
- **Build Project:** `pnpm build`
- **Lint All:** `pnpm lint`
- **Format Code:** `pnpm format`

### API Specifics (`apps/api`)
- **Generate Prisma Client:** `pnpm --filter api prisma:generate`
- **Run Migrations:** `pnpm --filter api prisma:migrate`
- **Open Prisma Studio:** `pnpm --filter api prisma:studio`
- **Default Port:** `3000`
- **Swagger Docs:** `http://localhost:3000/api/docs`

### Web Specifics (`apps/web`)
- **Default Port:** `5173` (Vite)

---

## Development Conventions

### Multi-Tenancy & Security
- **Organization Isolation:** All requests affecting tenant data MUST include an Organization ID (`orgId`).
- **Guards:** Use `OrgMemberGuard` to ensure the user belongs to the requested organization and has appropriate roles.
- **X-Org-ID Header:** The backend expects `x-org-id` in headers for many requests, though it also checks route params (`orgId`, `id`).

### Coding Standards
- **Shared Types:** ALWAYS use types from `@issueflow/types` for data consistency between frontend and backend.
- **Backend DTOs:** Every endpoint MUST have a proper DTO for its payload (`Body`), parameters (`Param`), or query (`Query`).
  - Use `class-validator` for request validation.
  - Use `@nestjs/swagger` decorators (`@ApiProperty`) to provide a `description` and `example` (sample payload) for every field.
  - Define Response DTOs with `@ApiProperty` examples to ensure Swagger documentation includes sample response data.
- **Issue Numbering:** Issues use a `shortId` format (e.g., `PROJ-1`). Increment logic is handled in `IssueSequenceService`.
- **Styling:** Use Tailwind CSS 4 utility classes. Prefer Vanilla CSS when customization is complex.
- **Data Fetching:** API integration on the frontend is handled through custom hooks (e.g., `useAuthQueries.ts`) and TanStack Query (React Query) for all API interactions.
- **Form Handling:** Use React Hook Form with Zod/HookForm resolvers.

### Testing
- **Backend:** Jest for unit and integration tests. Run with `pnpm test` in `apps/api`.
- **Reproduction:** Before fixing a bug, create a failing test case in the relevant `.spec.ts` file.

---

## Key Files
- `apps/api/prisma/schema.prisma`: The source of truth for the database model.
- `packages/types/index.ts`: Shared type definitions.
- `apps/api/src/common/guards/org-member.guard.ts`: Multi-tenancy enforcement.
- `apps/api/src/modules/issues/issue-sequence.service.ts`: Logic for `shortId` generation.
