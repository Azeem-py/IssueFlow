# Product Requirements Document (PRD): IssueFlow

**Version:** 1.0  
**Status:** Ready for Implementation  
**Date:** March 2026  
**Stack:** NestJS (Backend), Prisma (ORM), PostgreSQL (DB), Vite/React (Frontend), Turborepo (Monorepo)

---

## 1. Executive Summary
### Vision
IssueFlow is a high-performance, multi-tenant issue tracking system designed for speed and clarity. It aims to bridge the gap between overly complex enterprise tools and simplistic task lists, focusing on "Developer Experience" (DX) and "Productivity Flow."

---

## 2. Target Audience
* **Software Engineers:** Need fast navigation, keyboard shortcuts, and clear task assignment.
* **Product Managers:** Need an overview of project health and team velocity.
* **Small to Mid-sized Startups:** Need a structured environment that grows with their team without the bloat of legacy enterprise software.

---

## 3. Functional Requirements

### 3.1 Secure Access & Multi-Tenancy
* **Authentication:** Email/Password signup and login. JWT-based session management.
* **Tenant Isolation:** A "Workspace" (Organization) architecture. Users can belong to multiple organizations, but data remains strictly isolated.
* **Profile Management:** Basic user profile viewing and account verification.

### 3.2 Workspace & Team Management
* **Organization Creation:** Users can create an Org with a unique name and URL slug.
* **Ownership:** The creator of a workspace is automatically assigned the `OWNER` role.
* **Member Roles:**
    * **Owner:** Full control (Billing, Deletion, Permissions).
    * **Admin:** Manage projects and team members.
    * **Member:** Create, edit, and move issues.
    * **Viewer:** Read-only access to boards and issues.

### 3.3 Project Management
* **Project Scope:** Projects exist inside an Organization.
* **Unique Coding:** Every project requires a short code/prefix (e.g., "WEB", "API", "IOS").
* **Metadata:** Title, description, and project-specific settings.

### 3.4 Issue Tracking (Core Engine)
* **Smart Numbering:** Issues are prefixed by Project Code and auto-incremented (e.g., `WEB-1`, `WEB-2`).
* **Issue Metadata:** Title, Markdown description, Status, Priority, Author, and Assignee.
* **Workflow States:** `Backlog` → `Todo` → `In Progress` → `Review` → `Done` → `Canceled`.
* **Priority Levels:** `Low`, `Medium`, `High`, `Urgent`.

---

## 4. Technical & Design Requirements

### 4.1 Interface (UI/UX)
* **Themed Design:** High-contrast Dark Mode (Deep Charcoal background with Indigo accents).
* **Responsive Layout:** Sidebar navigation on desktop, collapsible menu/bottom bar on mobile.
* **Kanban View:** Drag-and-drop board for managing issue states.
* **Command Palette:** `Cmd+K` interface for quick navigation between projects and issues.



### 4.2 Backend Architecture
* **Tenant Guards:** Middleware/Guards to verify `orgId` on every request.
* **Atomic Transactions:** Prisma-level transactions for the `IssueNumber` generation to prevent race conditions.
* **Type Safety:** Shared types between `apps/api` and `apps/web` via the `packages/types` directory.

---

## 5. User Journey
1.  **Onboarding:** User signs up → Creates "Alpha Team" Workspace → Sets slug `alpha-team`.
2.  **Creation:** User creates Project "Mobile App" with prefix `MOB`.
3.  **Action:** User creates an issue "Fix Splash Screen" → System assigns `MOB-1`.
4.  **Collaboration:** User assigns `MOB-1` to a teammate → Teammate moves it to "In Progress".
5.  **Completion:** Issue is moved to "Done" → System logs the completion date and notifies the author.

---

## 6. Success Metrics & KPIs
* **Latency:** Core API responses under **100ms**.
* **Concurrency:** Zero duplicate issue numbers across parallel requests.
* **Engagement:** At least 5 issues created per active user per week.

---

## 7. Roadmap & Future Scope
* **V1.1:** Email invitations for team members.
* **V1.2:** Issue comments and file attachments.
* **V2.0:** Real-time updates via WebSockets (Socket.io).
* **V3.0:** Integration with GitHub/GitLab to link commits directly to Issues.