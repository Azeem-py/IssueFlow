# IssueFlow — OpenCode Project Instructions

## Mandatory design-system skill

Always load the `issueflow-design-system` skill with the `skill` tool at the
start of every session in this repository, before planning or editing code.

Then follow it for:

- any frontend, UI, UX, styling, Tailwind, component, page, or design-token work
- empty states, loading states, errors, toasts, dialogs, menus, and microcopy
- role-aware UI, permission visibility, or workspace-scoped screens
- accessibility, responsive behavior, motion, or visual review
- screenshots, browser testing, or design QA

The skill lives at `.opencode/skills/issueflow-design-system/SKILL.md`.
Its full reference is `references/issueflow-design-system.md`, and its visual
overview is `assets/issueflow-design-system-showcase.png`.

Do not make visual design decisions from memory or from the legacy styling of a
nearby component. Check the design system first. If a requested change conflicts
with the design system, surface the conflict and ask before proceeding.

## Project facts

- Monorepo: pnpm workspaces + Turborepo
- Backend: NestJS + Prisma + PostgreSQL (`apps/api`, port 8034)
- Frontend: React + Vite + Tailwind CSS 4 (`apps/web`, port 8033)
- Shared packages: `packages/types`, `packages/ui`, `packages/tsconfig`
- The backend is the authorization boundary; UI hiding is never sufficient.
- All tenant-scoped requests must remain scoped to the active organization.
