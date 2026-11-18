---
name: IssueFlow Design System
description: Use for any IssueFlow UI, UX, frontend, Tailwind, component, page, design-token, accessibility, microcopy, empty-state, permission-visibility, or visual-review task. Defines the canonical dark developer-first visual language, components, interaction patterns, role-aware UI, and product checklists.
metadata:
  opencode/autoinvoke: true
---

# IssueFlow Design System

This skill is the canonical design source for the IssueFlow web app. Load it
before changing any visual or interaction behavior, and check the relevant
reference section before making a design decision.

## Supporting files

- `references/issueflow-design-system.md` — the complete design system. Read the
  relevant sections before implementing a component or screen.
- `assets/issueflow-design-system-showcase.png` — visual overview of the brand,
  tokens, components, navigation, Kanban, roles, accessibility, and feature set.
  Read this image with the `read` tool when a visual reference would help.

## Mandatory workflow for UI work

1. Read this skill.
2. Read the relevant sections of `references/issueflow-design-system.md`.
3. Inspect the existing screen and shared components before editing.
4. Reuse existing tokens/components where possible; do not invent a parallel style.
5. Implement default, hover, active, focus-visible, disabled, loading, empty,
   error, and permission-denied states where relevant.
6. Check role visibility in the UI and confirm the API still enforces authorization.
7. Verify keyboard access, labels, contrast, responsive behavior, and reduced motion.
8. Run the web type-check/build and exercise the changed flow in the browser.
9. Use the checklists at the end of the reference document before calling the work done.

## Non-negotiable visual rules

- **Dark-first, developer-first.** Deep slate/blue-black canvas, layered surfaces,
  thin low-contrast borders, restrained shadows.
- **Brand accent:** green/teal (`brand-500 #10B981`, `brand-400 #34D399`,
  `teal-400 #2DD4BF`). Green is the primary action color. Teal/cyan are supporting
  highlights and must not compete with green on the same screen.
- **Typography:** Inter with the system fallback stack. Use weight, size, and spacing
  for hierarchy before color. Sentence case for buttons, labels, and navigation.
  Avoid all-caps except short intentional micro-labels.
- **Spacing:** 4px base scale; prefer 8/16px rhythm for repeated components.
- **Radius:** 4–20px scale; pills/avatars use full radius. Do not round everything
  into the same generic card.
- **Elevation:** subtle dark shadows plus borders; never bright/heavy shadows.
- **Motion:** 100–240ms, opacity and small transforms, purposeful feedback, and
  respect `prefers-reduced-motion`.
- **Semantic color is never the only signal.** Pair status/priority/error color
  with a label, icon, or other cue.

## Core tokens

```css
--color-brand-400: #34d399;
--color-brand-500: #10b981;
--color-brand-600: #059669;
--color-teal-400: #2dd4bf;
--color-cyan-400: #22d3ee;

--color-bg-canvas: #08111f;
--color-bg-sidebar: #0b1422;
--color-bg-panel: #0f172a;
--color-bg-elevated: #172235;
--color-bg-hover: #1e293b;
--color-border-subtle: #1e293b;
--color-border-default: #334155;

--color-text-primary: #f1f5f9;
--color-text-secondary: #cbd5e1;
--color-text-muted: #94a3b8;
--color-text-disabled: #64748b;

--color-success: #22c55e;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;
--color-purple: #8b5cf6;
--color-orange: #f97316;
```

Use the full token table in the reference for neutrals, status mapping, priority
mapping, radius, spacing, and motion.

## Product structure and interaction patterns

- **Sidebar:** workspace identity/switcher, Home, Projects, Issues, search,
  notifications, settings, profile + current role.
- **Top bar:** workspace context, search/command entry, notifications, primary action.
- **Kanban:** status columns with counts, quick-add in the header, horizontal
  scrolling, clear drag state and insertion feedback, permission-aware dragging,
  and rollback/error feedback if a move fails.
- **Issue detail:** key + title prominent, scannable metadata, editable status,
  priority, assignee, project, description; comments/replies; activity; mentions.
- **Quick-add:** title first, optional description/project/status/priority/assignee,
  preserve entered content on recoverable errors, return the created issue key.
- **Command palette:** consistent shortcut, grouped actions/issues/projects/navigation,
  arrow/Enter/Escape support, visible keyboard hints, and role/workspace filtering.
- **Workspace switcher:** update tenant-scoped data and role context together; never
  flash stale data from the previous workspace; guide users with no workspace.
- **Team/invitations:** distinguish pending/accepted/expired/revoked, show roles,
  explain impact before role changes, confirm destructive/high-impact actions.

## Role-aware UI

| Capability | Owner | Admin | Member | Viewer |
| --- | --- | --- | --- | --- |
| View workspace content | Yes | Yes | Yes | Yes |
| Create/edit issues | Yes | Yes | Yes | No |
| Move issues | Yes | Yes | Yes | No |
| Comment | Yes | Yes | Yes | No |
| Manage projects | Yes | Yes | Per policy | No |
| Invite/manage members | Yes | Yes | No | No |
| Change workspace settings | Yes | Per policy | No | No |
| Manage ownership | Yes | No | No | No |

Hide or disable actions a role cannot perform. Never render misleading affordances.
Treat the backend as the authorization boundary even when the UI already checked.

## States every data surface must define

- **Loading:** skeletons that approximate the final layout; prevent duplicate submissions.
- **Empty:** explain what belongs here + one relevant next action.
- **Error:** plain language, retry when safe, preserve user input, no stack traces/secrets.
- **Success:** brief confirmation + update visible data so it matches reality.
- **Permission denied:** explain the role limitation without exposing restricted data.
- **Offline/reconnecting:** distinguish unsaved local changes from server-confirmed changes.

## Microcopy voice

Direct, calm, specific, concise, respectful. Say what happened and what to do next.

Prefer: “Issue created”, “Invitation sent to alex@example.com.”,
“No issues match this search.”, “You don’t have permission to edit this project.”

Avoid: “Awesome!!! Success!!!”, “Access denied.”, “Something went wrong!!!”,
“Nothing here.”

Use consistent terms: workspace, project, issue, member, owner, admin, viewer,
status, priority.

## Accessibility and quality bar

- Target WCAG 2.2 AA.
- Visible keyboard focus; semantic HTML; correct heading order.
- Label every form control; accessible names for icon-only buttons.
- Correct focus management for dialogs, menus, drawers.
- Essential interactions work by keyboard; no hover-only actions.
- Do not rely on color alone.
- Useful alt text for meaningful images.
- Comfortable touch targets (44px where practical).
- Respect reduced motion.
- Verify desktop, tablet, and mobile widths.

## Implementation notes for this repository

- The app is React + Vite + Tailwind CSS 4. Shared components live in
  `packages/ui`; app-level tokens and utilities live in `apps/web/src/index.css`.
- The current UI still contains legacy indigo primary (`#6764f2`) and Outfit display
  styling in places. Treat those as migration debt: do not copy them into new work.
  Bring touched surfaces toward this design system without performing a large,
  unrequested restyle of unrelated screens.
- Use the existing role and permission logic (`usePermissions`, backend guards) as
  the source of truth for what the UI may expose.
- Prefer TanStack Query cache updates/invalidation so visible data changes immediately.
- Before shipping a component, run the component checklist in
  `references/issueflow-design-system.md` §16.
- Before shipping a screen, run the matching product-screen checklist in §17.
