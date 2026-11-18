# IssueFlow --- Design System

**Version:** 1.0\
**Product:** IssueFlow\
**Design direction:** Dark, focused, developer-first, high-performance\
**Primary interface:** Web application (React + Vite)\
**Document purpose:** Define the visual language, design tokens,
components, interaction patterns, and accessibility rules for a
consistent IssueFlow experience.

------------------------------------------------------------------------

## 1. Product and brand foundations

### 1.1 Product promise

IssueFlow helps software teams turn scattered work into a single, shared
flow: capture an idea, shape it into an issue, collaborate, move it
across a workflow, and ship it.

**Brand line:** Track. Collaborate. Ship.

### 1.2 Mission

Turn scattered work into a single, shared flow.

### 1.3 Vision

Become the go-to issue tracker for modern development teams: fast to
use, easy to understand, dependable at scale, and unobtrusive enough to
let teams focus on their work.

### 1.4 Brand attributes

-   **Developer-first:** Designed around the habits and expectations of
    software teams.
-   **Focused:** Clear hierarchy, restrained decoration, and minimal
    visual noise.
-   **Fast:** Common actions should be discoverable and require as few
    steps as possible.
-   **Reliable:** States, permissions, and feedback should be explicit
    and predictable.
-   **Collaborative:** People, comments, mentions, and activity should
    feel connected to the work.
-   **Confident:** Dark surfaces, crisp typography, and a distinctive
    green accent create a composed technical identity.

### 1.5 Design principles

1.  **Make the work the interface.** Issues, projects, and boards take
    visual priority over decoration.
2.  **Prefer clarity over density.** Show useful information without
    turning every screen into a dashboard of competing widgets.
3.  **Keep actions close to context.** Editing, assigning, commenting,
    and changing status should be available where the user needs them.
4.  **Make state visible.** Status, priority, assignee, role, loading,
    success, and errors must be easy to distinguish.
5.  **Respect permissions everywhere.** Hide unavailable actions in the
    UI and enforce authorization in the API.
6.  **Optimize repeated workflows.** Keyboard shortcuts, command search,
    quick-add, and drag-and-drop should reduce friction.
7.  **Be consistent across workspaces.** Switching organizations must
    not change the underlying interaction model.
8.  **Use motion as feedback.** Animation should explain a transition,
    not decorate an otherwise static screen.

------------------------------------------------------------------------

## 2. Visual identity

### 2.1 Overall look

IssueFlow uses a dark-first interface with deep blue-black backgrounds,
layered slate surfaces, cool neutral text, and a vivid teal-green
accent. The result should feel technical and modern without looking like
a terminal or a generic admin template.

The interface should have: - Deep, low-glare page backgrounds. -
Slightly lighter panels for navigation, cards, dialogs, and detail
drawers. - Thin, subtle borders to define structure. - Bright green/teal
for primary actions and active navigation. - Cyan or teal highlights for
interactive focus and in-progress work. - Restrained semantic colors for
status, priority, and destructive actions. - Compact but comfortable
spacing for information-dense workflows.

### 2.2 Logo direction

The logo concept is a simple geometric mark suggesting a completed task,
forward motion, or connected workflow, paired with the **IssueFlow**
wordmark.

Guidelines: - Use the mark and wordmark together for the main
application identity. - Use the mark alone for a compact sidebar,
favicon, or app icon where the wordmark would not fit. - Keep the logo
on dark or neutral backgrounds with sufficient contrast. - Do not add
gradients, outlines, shadows, or effects that reduce legibility. -
Preserve clear space around the mark; do not crowd it with adjacent
controls.

------------------------------------------------------------------------

## 3. Color system

The values below establish a practical token palette consistent with the
visual direction. Treat them as the canonical starting point; sample and
reconcile them against the approved logo and production UI before
implementation.

### 3.1 Brand colors

  ------------------------------------------------------------------------
  Token                                          Hex Usage
  --------------------- ---------------------------- ---------------------
  `brand-500`                              `#10B981` Primary brand green;
                                                     primary buttons and
                                                     selected states

  `brand-400`                              `#34D399` Hover and bright
                                                     emphasis

  `brand-600`                              `#059669` Pressed state and
                                                     stronger green
                                                     surfaces

  `brand-700`                              `#047857` Dark green emphasis

  `teal-400`                               `#2DD4BF` Secondary interactive
                                                     highlight

  `teal-500`                               `#14B8A6` Teal emphasis and
                                                     selected indicators

  `cyan-400`                               `#22D3EE` Focus accents and
                                                     informational
                                                     highlights
  ------------------------------------------------------------------------

**Usage rule:** Green is the primary action color. Teal and cyan are
supporting highlights; they should not compete with the primary green on
the same screen.

### 3.2 Neutral palette

  ------------------------------------------------------------------------
  Token                                          Hex Usage
  --------------------- ---------------------------- ---------------------
  `slate-950`                              `#020617` Deepest background

  `slate-925`                              `#08111F` Main application
                                                     background

  `slate-900`                              `#0F172A` Primary dark surface

  `slate-850`                              `#172235` Raised panels and
                                                     cards

  `slate-800`                              `#1E293B` Secondary surface

  `slate-700`                              `#334155` Borders and stronger
                                                     dividers

  `slate-600`                              `#475569` Muted controls and
                                                     secondary borders

  `slate-500`                              `#64748B` Muted text

  `slate-400`                              `#94A3B8` Secondary text

  `slate-300`                              `#CBD5E1` Body text on dark
                                                     surfaces

  `slate-200`                              `#E2E8F0` High-emphasis text

  `slate-100`                              `#F1F5F9` Primary text

  `white`                                  `#FFFFFF` Maximum-contrast text
                                                     and icons, used
                                                     sparingly
  ------------------------------------------------------------------------

### 3.3 Semantic colors

  ------------------------------------------------------------------------
  Semantic token                     Suggested value Meaning
  --------------------- ---------------------------- ---------------------
  `success-500`                            `#22C55E` Completed,
                                                     successful, healthy

  `warning-500`                            `#F59E0B` Caution, medium
                                                     priority, needs
                                                     attention

  `danger-500`                             `#EF4444` Destructive action,
                                                     error, blocked

  `info-500`                               `#3B82F6` Informational state

  `purple-500`                             `#8B5CF6` Feature labels or
                                                     secondary
                                                     categorization

  `orange-500`                             `#F97316` Urgent or
                                                     high-priority
                                                     emphasis
  ------------------------------------------------------------------------

Semantic colors should be paired with text, an icon, or another cue.
Never communicate meaning through color alone.

### 3.4 Surface and text tokens

  Token                Suggested value Purpose
  ------------------ ----------------- ----------------------------------------
  `bg-canvas`                `#08111F` App canvas
  `bg-sidebar`               `#0B1422` Persistent navigation
  `bg-panel`                 `#0F172A` Main panels
  `bg-elevated`              `#172235` Cards, popovers, menus
  `bg-hover`                 `#1E293B` Hovered row or control
  `bg-selected`              `#12352F` Selected item with a subtle green tint
  `border-subtle`            `#1E293B` Panel boundaries
  `border-default`           `#334155` Inputs and visible separators
  `text-primary`             `#F1F5F9` Main text
  `text-secondary`           `#CBD5E1` Supporting text
  `text-muted`               `#94A3B8` Metadata and hints
  `text-disabled`            `#64748B` Disabled labels

### 3.5 Status colors

Use consistent status color mapping throughout boards, issue details,
filters, and activity feeds.

  Status           Suggested treatment
  ---------------- ---------------------
  Backlog / Open   Slate or blue-gray
  Todo             Blue
  In Progress      Cyan or teal
  In Review        Purple
  Done             Green
  Blocked          Red
  Cancelled        Muted slate

A status pill should include a readable label. A small colored dot may
reinforce the label but should not replace it.

### 3.6 Priority colors

  Priority   Suggested treatment
  ---------- ---------------------
  Low        Slate
  Medium     Amber
  High       Orange
  Urgent     Red

Priority should remain visually secondary to the issue title. Avoid
making every issue card brightly colored.

### 3.7 Color usage rules

-   Reserve the strongest green for the most important action on a
    screen.
-   Use dark surfaces to create hierarchy rather than placing borders
    around every element.
-   Keep body text comfortably readable against every surface.
-   Use semantic colors consistently; do not use red as a generic
    decoration.
-   Keep hover, active, selected, disabled, and focus states distinct.
-   Avoid large saturated color blocks unless they communicate a
    meaningful state.
-   For charts and analytics, use a restrained palette and include
    labels or legends.

------------------------------------------------------------------------

## 4. Typography

### 4.1 Typeface

**Primary typeface:** Inter\
**Fallback stack:**
`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Inter is suitable for dense product interfaces because it remains
legible at small sizes and has a neutral, contemporary character.

### 4.2 Type scale

  -------------------------------------------------------------------------
  Token                  Size          Weight     Line height Usage
  ----------- --------------- --------------- --------------- -------------
  `display`              32px             700            1.15 Rare
                                                              marketing or
                                                              onboarding
                                                              headline

  `h1`                   28px             700             1.2 Main page
                                                              title

  `h2`                   24px             600            1.25 Major section
                                                              title

  `h3`                   20px             600             1.3 Panel or
                                                              dialog title

  `h4`                   16px             600             1.4 Card and
                                                              subsection
                                                              title

  `body-lg`              16px             400             1.5 Prominent
                                                              explanatory
                                                              copy

  `body`                 14px             400             1.5 Default
                                                              application
                                                              text

  `body-sm`              13px             400            1.45 Dense
                                                              supporting
                                                              content

  `caption`              12px             400             1.4 Metadata,
                                                              timestamps,
                                                              hints

  `micro`                11px             500             1.3 Compact
                                                              labels; use
                                                              sparingly
  -------------------------------------------------------------------------

### 4.3 Typographic rules

-   Use weight and spacing before color to establish hierarchy.
-   Issue titles should be medium or semibold, not bold by default.
-   Use tabular numerals for counters, dates, and issue identifiers
    where alignment matters.
-   Keep long-form descriptions at a comfortable line length.
-   Use sentence case for buttons, labels, and navigation.
-   Avoid all-caps labels except for very short, intentional
    micro-labels.
-   Do not use tiny text for important actions or permission
    explanations.

------------------------------------------------------------------------

## 5. Spacing, sizing, and layout

### 5.1 Spacing scale

Use a 4px base unit.

  Token          Value
  ------------ -------
  `space-1`        4px
  `space-2`        8px
  `space-3`       12px
  `space-4`       16px
  `space-5`       20px
  `space-6`       24px
  `space-8`       32px
  `space-10`      40px
  `space-12`      48px
  `space-16`      64px
  `space-20`      80px

Use the scale consistently. Prefer 8px or 16px gaps for repeated
component spacing, with 4px increments for fine adjustments.

### 5.2 Layout principles

-   Use a persistent left sidebar on desktop.
-   Keep the primary workspace in the central content region.
-   Use a right-side drawer for issue details when preserving board
    context is important.
-   Keep page titles, breadcrumbs, and primary actions aligned
    consistently.
-   Use responsive layouts rather than shrinking desktop columns until
    they become unusable.
-   Allow dense data regions to scroll independently where that improves
    navigation.
-   Preserve a clear content hierarchy on smaller screens.

### 5.3 Suggested desktop dimensions

These are implementation starting points, not rigid requirements.

  Region                              Suggested size
  --------------------------------- ----------------
  Sidebar                                 224--256px
  Compact sidebar                           64--72px
  Top bar                                   56--64px
  Main content horizontal padding           24--32px
  Board column minimum width              260--280px
  Issue detail drawer                     400--480px
  Modal width                             440--560px
  Standard control height                   36--40px
  Large primary control height                  44px

### 5.4 Responsive behavior

**Large desktop** - Full sidebar, board columns, and issue detail drawer
can coexist where space allows. - Keep the main content width controlled
to prevent excessively long text lines.

**Laptop and tablet** - Allow the sidebar to collapse. - Keep board
columns horizontally scrollable. - Show issue details as a drawer or
full-height overlay. - Reduce outer padding before reducing control
sizes.

**Mobile** - Replace the persistent sidebar with a navigation drawer or
bottom navigation where appropriate. - Use a single-column issue list or
horizontally scrollable board. - Make issue details a full-screen
view. - Keep primary actions reachable and touch targets at least 44px
where practical. - Avoid relying on hover to expose essential actions.

------------------------------------------------------------------------

## 6. Shape, borders, and elevation

### 6.1 Radius scale

  Token              Value Usage
  --------------- -------- -------------------------------------
  `radius-xs`          4px Small labels and compact controls
  `radius-sm`          6px Inputs and small buttons
  `radius-md`          8px Standard buttons, cards, menus
  `radius-lg`         12px Panels and dialogs
  `radius-xl`         16px Large surfaces
  `radius-2xl`        20px Feature panels, onboarding surfaces
  `radius-full`     9999px Avatars, pills, circular controls

### 6.2 Borders

-   Use 1px borders for most component boundaries.
-   Prefer low-contrast borders on cards and panels.
-   Increase border contrast for focused inputs and selected elements.
-   Avoid outlining every nested element; use spacing and surface
    contrast to group content.

### 6.3 Shadows and elevation

Dark interfaces need subtle elevation rather than heavy, bright shadows.

  Level           Treatment                     Usage
  --------------- ----------------------------- ----------------------------
  `elevation-0`   No shadow                     Base canvas
  `elevation-1`   Very subtle dark shadow       Cards and sidebar sections
  `elevation-2`   Soft shadow plus border       Popovers and dropdowns
  `elevation-3`   Larger soft shadow            Dialogs and drawers
  `elevation-4`   Strongest restrained shadow   Critical overlays only

Use elevation to communicate layering and focus. Do not use shadows as a
substitute for clear layout.

------------------------------------------------------------------------

## 7. Iconography and imagery

### 7.1 Icons

Use a consistent outline icon family, such as Lucide, with consistent
stroke width and optical sizing.

Suggested sizes: - 14px: compact metadata and inline indicators. - 16px:
standard buttons and navigation. - 18px: prominent controls. - 20--24px:
empty states and larger feature actions.

Rules: - Pair unfamiliar icons with text labels. - Keep icon stroke
weight consistent. - Use the same icon for the same action throughout
the product. - Provide accessible labels for icon-only buttons. - Do not
use emoji as substitutes for core interface icons.

### 7.2 Avatars

-   Use circular avatars.
-   Use a consistent fallback with initials when no image exists.
-   Provide a tooltip or accessible name for the person represented.
-   Overlapping avatar groups should show a limited number of people and
    a `+N` overflow indicator.
-   Do not use avatars as the only way to communicate assignment; show
    the assignee name in the issue detail view.

### 7.3 Illustrations and product imagery

Use restrained, purposeful illustrations for onboarding, empty states,
and marketing pages. Prefer abstract workflow, connected tasks, and
collaboration motifs. Avoid decorative imagery inside dense
issue-management screens.

------------------------------------------------------------------------

## 8. Core component system

### 8.1 Buttons

**Primary** - Green background, dark text where contrast permits, clear
label. - Used for the single most important action in a region. -
Examples: Create issue, Invite member, Save changes.

**Secondary** - Slate surface or transparent fill with a visible
border. - Used for supporting actions.

**Ghost** - Transparent background, muted text, subtle hover surface. -
Used for low-emphasis actions and toolbar controls.

**Danger** - Red treatment reserved for destructive actions such as
delete or revoke. - Require confirmation for irreversible operations.

**Button states** - Default, hover, pressed, focus-visible, disabled,
and loading. - Loading state should prevent duplicate submissions and
preserve the button's layout. - Disabled state must remain legible and
should explain missing requirements when appropriate.

### 8.2 Inputs

Inputs should have: - A persistent label where the field's purpose is
not otherwise obvious. - A dark surface and subtle border. - A visible
focus ring or border change. - Clear placeholder text that is not used
as the only label. - Inline validation and error messaging. - Disabled
and read-only states that are visually distinct.

Support text fields, search fields, text areas, selects, comboboxes,
date pickers, and assignee selectors with consistent height and spacing.

### 8.3 Badges and pills

Use badges for: - Issue type: Bug, Feature, Chore. - Priority: Low,
Medium, High, Urgent. - Status: Backlog, In Progress, Done. - Small
contextual metadata.

Guidelines: - Keep labels short. - Use tinted backgrounds with readable
foreground text. - Do not overload badges with too many colors. - Keep
status and priority visually distinguishable. - Do not use a badge for
ordinary metadata that can be plain text.

### 8.4 Cards

Issue cards should prioritize: 1. Issue identifier. 2. Issue title. 3.
Status or type where relevant. 4. Priority. 5. Assignee. 6. Comment or
activity count.

Card behavior: - Entire card may be clickable if the interaction is
unambiguous. - Drag handles or drag affordances should not conflict with
buttons inside the card. - Hover should subtly raise the card or adjust
its surface. - Selected and dragging states should be visually
explicit. - Truncate long titles carefully and expose the full title on
the detail view.

### 8.5 Navigation

Sidebar navigation should include: - Workspace identity and workspace
switcher. - Main destinations such as Home, Projects, Issues, Search,
Notifications, and Settings. - Active item indication using a tinted
surface and accent icon/text. - User profile and current role context
near the bottom.

Do not rely on color alone to identify the active route. Use a
background, weight, or indicator as well.

### 8.6 Tabs

Tabs are appropriate for related views such as Board, List, Timeline,
Activity, and Settings.

-   Use a clear active indicator.
-   Keep tab labels stable across projects.
-   Preserve state when switching tabs where feasible.
-   On narrow screens, allow horizontal scrolling rather than wrapping
    into multiple rows.

### 8.7 Dropdowns and menus

-   Anchor menus to the triggering control.
-   Keep menu width appropriate to its content.
-   Group related actions and separate destructive actions.
-   Close on selection, Escape, and appropriate outside interaction.
-   Keep keyboard focus inside modal menus where required.
-   Do not show actions the current role cannot perform.

### 8.8 Dialogs and drawers

Use dialogs for focused tasks that require a decision or short form. Use
drawers for contextual detail that benefits from preserving the
underlying page.

-   Give every dialog a clear title.
-   Provide an explicit close or cancel action.
-   Keep destructive confirmation language specific.
-   Ensure Escape and focus behavior are predictable.
-   On mobile, dialogs may become full-screen sheets.

### 8.9 Tooltips

Use tooltips for icon-only controls and concise supplemental
explanations. Do not put essential instructions or error messages only
in tooltips.

### 8.10 Toasts and notifications

Use short-lived toasts for transient confirmations and non-blocking
errors.

Examples: - "Issue created" - "Invitation sent" - "Changes saved" -
"Could not update status. Try again."

Toasts should: - Use concise, actionable wording. - Include a semantic
icon where helpful. - Avoid disappearing before users can reasonably
read them. - Not be the only record of important events.

------------------------------------------------------------------------

## 9. IssueFlow-specific interaction patterns

### 9.1 Kanban board

The board is a primary product surface.

-   Represent each workflow status as a column.
-   Display the issue count in each column header.
-   Keep column actions, such as quick-add, close to the header.
-   Allow horizontal scrolling when columns exceed the viewport.
-   Support drag-and-drop with a clear insertion indicator.
-   Show a visual dragging state without making the card unreadable.
-   Update the UI optimistically only when the application can safely
    reconcile failures.
-   Provide a clear error and restore the previous position if a move
    fails.
-   Respect role permissions in both drag interactions and API requests.

### 9.2 Issue detail

An issue detail view should include: - Issue key and title. -
Description and editable fields. - Status, priority, type, project, and
assignee. - Creator and timestamps where useful. - Comments and threaded
replies. - Activity history. - Mentions and notification context.

Keep the title prominent and the metadata scannable. Avoid forcing users
to open multiple dialogs for common edits.

### 9.3 Quick-add flow

Quick-add should allow a user to create a minimally complete issue
without leaving the current context.

-   Make the title the first and most prominent field.
-   Allow optional description, project, status, priority, and assignee.
-   Validate required fields clearly.
-   Preserve typed content if a recoverable submission error occurs.
-   Return the created issue key and provide a route to open the issue.

### 9.4 Command palette

The command palette is a core speed feature.

-   Open from a consistent keyboard shortcut.
-   Provide a prominent search input.
-   Group results by action, issue, project, or navigation destination.
-   Support arrow-key navigation, Enter to select, and Escape to close.
-   Show keyboard hints where helpful.
-   Filter actions according to the user's role and current workspace.
-   Include useful empty and loading states.

### 9.5 Keyboard shortcuts

-   Provide a discoverable shortcut reference.
-   Avoid overriding browser and operating-system shortcuts
    unnecessarily.
-   Do not trigger shortcuts while a user is typing in an input, unless
    the shortcut is explicitly designed for that context.
-   Make shortcuts consistent across pages.
-   Provide non-keyboard ways to perform every essential action.

### 9.6 Workspace switching

-   Display the current workspace clearly.
-   Make switching fast and predictable.
-   Update workspace-scoped navigation, project data, issue data, and
    role context together.
-   Show a loading or transition state while the new workspace loads.
-   Never briefly expose data from the previous workspace as if it
    belonged to the next one.
-   Provide an understandable empty state for a user with no available
    workspace.

### 9.7 Invitations and team management

-   Make invitation status visible: pending, accepted, expired, or
    revoked.
-   Show each person's role clearly.
-   Explain role capabilities before a role change.
-   Confirm high-impact changes such as removing a member or
    transferring ownership.
-   Provide clear success and failure feedback.

------------------------------------------------------------------------

## 10. Roles and permission-aware UI

IssueFlow has four workspace roles. The interface must reflect these
capabilities, but frontend visibility is not a security boundary; the
backend remains authoritative.

  -------------------------------------------------------------------------------
  Capability           Owner           Admin          Member          Viewer
  --------------- --------------- --------------- --------------- ---------------
  View workspace        Yes             Yes             Yes             Yes
  content                                                         

  Create and edit       Yes             Yes             Yes             No
  issues                                                          

  Move issues           Yes             Yes             Yes             No
  through                                                         
  workflow                                                        

  Comment on            Yes             Yes             Yes             No
  issues                                                          

  Manage projects       Yes             Yes        According to         No
                                                  product policy  

  Invite/manage         Yes             Yes             No              No
  members                                                         

  Change                Yes        According to         No              No
  workspace                       product policy                  
  settings                                                        

  Manage                Yes             No              No              No
  ownership                                                       
  -------------------------------------------------------------------------------

The exact Admin and Member project-management scope should be aligned
with the backend authorization policy. Do not infer permissions from the
role name alone.

UI requirements: - Hide or disable actions that the user cannot
perform. - If an action is disabled, explain why when the explanation is
useful. - Do not render misleading affordances that lead to predictable
authorization failures. - Treat API authorization errors as possible
even when the UI has already checked permissions. - Never rely on a
client-provided role value as proof of authorization.

------------------------------------------------------------------------

## 11. States and feedback

Every data-driven screen should define the following states.

### Loading

-   Use skeletons that approximate the final layout.
-   Avoid flashing a blank screen for short requests.
-   Prevent repeated submissions while a mutation is in progress.

### Empty

-   Explain what belongs in the space.
-   Offer one relevant next action.
-   Use concise, encouraging copy without blaming the user.

Examples: - No projects yet --- "Create your first project to organize
work." - No issues --- "Add an issue to start tracking work." - No
notifications --- "You're all caught up."

### Error

-   State what failed in plain language.
-   Offer a retry when retrying is safe.
-   Preserve user-entered data whenever possible.
-   Do not expose stack traces, secrets, internal identifiers, or raw
    database errors.

### Success

-   Confirm the action that succeeded.
-   Keep feedback brief.
-   Update the visible data so the confirmation matches reality.

### Offline and reconnecting

-   Make connectivity state visible when it affects actions.
-   Distinguish unsaved local changes from server-confirmed changes.
-   Do not imply that a mutation succeeded until it has been confirmed
    or safely queued.

### Permission denied

-   Explain that the current role does not allow the action.
-   Avoid exposing restricted resource details.
-   Provide a path to contact an owner or administrator where
    appropriate.

------------------------------------------------------------------------

## 12. Motion and transitions

Motion should be subtle, purposeful, and fast.

Suggested timings: - Micro-interaction: 100--150ms. - Hover and focus
transitions: 120--180ms. - Menu and popover: 140--200ms. - Drawer and
modal: 180--240ms. - Larger page transition: 200--300ms.

Guidelines: - Prefer opacity and small transform changes. - Avoid large
bounces, elastic motion, or long decorative transitions. - Respect
`prefers-reduced-motion`. - Do not make drag-and-drop depend on
animation to communicate the destination. - Keep motion consistent
across similar components.

------------------------------------------------------------------------

## 13. Accessibility

Target WCAG 2.2 AA as the baseline.

-   Ensure text and interactive controls have sufficient contrast.
-   Provide visible keyboard focus indicators.
-   Use semantic HTML elements and correct heading order.
-   Label all form controls.
-   Provide accessible names for icon-only buttons.
-   Ensure dialogs, menus, and drawers have correct focus management.
-   Make all essential interactions keyboard accessible.
-   Do not use color as the only signal for status, priority, or errors.
-   Provide useful alternative text for meaningful images.
-   Ensure touch targets are comfortably sized, especially on mobile.
-   Respect reduced-motion preferences.
-   Announce important asynchronous updates to assistive technologies
    without overwhelming users.

------------------------------------------------------------------------

## 14. Content and microcopy

IssueFlow's voice is direct, calm, useful, and developer-aware.

### Voice characteristics

-   **Direct:** Say what happened.
-   **Specific:** Name the issue, project, or action where useful.
-   **Calm:** Avoid alarmist wording.
-   **Concise:** Remove unnecessary filler.
-   **Respectful:** Never blame the user for an error.

### Examples

  -----------------------------------------------------------------------
  Prefer                              Avoid
  ----------------------------------- -----------------------------------
  "Issue created"                     "Awesome!!! Your issue has been
                                      successfully created!!!"

  "You don't have permission to edit  "Access denied."
  this project."                      

  "No issues match this search."      "Nothing here."

  "Invitation sent to                 "Done."
  alex@example.com."                  

  "Could not save changes. Try        "Something went wrong!!!"
  again."                             
  -----------------------------------------------------------------------

Use consistent terms: **workspace**, **project**, **issue**, **member**,
**owner**, **admin**, **viewer**, **status**, and **priority**.

------------------------------------------------------------------------

## 15. Suggested design tokens

The following CSS custom properties provide a practical implementation
baseline.

``` css
:root {
  color-scheme: dark;

  /* Brand */
  --color-brand-400: #34d399;
  --color-brand-500: #10b981;
  --color-brand-600: #059669;
  --color-teal-400: #2dd4bf;
  --color-teal-500: #14b8a6;
  --color-cyan-400: #22d3ee;

  /* Neutrals */
  --color-slate-950: #020617;
  --color-slate-925: #08111f;
  --color-slate-900: #0f172a;
  --color-slate-850: #172235;
  --color-slate-800: #1e293b;
  --color-slate-700: #334155;
  --color-slate-600: #475569;
  --color-slate-500: #64748b;
  --color-slate-400: #94a3b8;
  --color-slate-300: #cbd5e1;
  --color-slate-200: #e2e8f0;
  --color-slate-100: #f1f5f9;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  --color-purple: #8b5cf6;
  --color-orange: #f97316;

  /* Surfaces */
  --color-bg-canvas: var(--color-slate-925);
  --color-bg-sidebar: #0b1422;
  --color-bg-panel: var(--color-slate-900);
  --color-bg-elevated: var(--color-slate-850);
  --color-bg-hover: var(--color-slate-800);
  --color-border-subtle: var(--color-slate-800);
  --color-border-default: var(--color-slate-700);

  /* Text */
  --color-text-primary: var(--color-slate-100);
  --color-text-secondary: var(--color-slate-300);
  --color-text-muted: var(--color-slate-400);
  --color-text-disabled: var(--color-slate-500);

  /* Typography */
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --text-xs: 12px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 28px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* Motion */
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --duration-slow: 240ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-bg-canvas),
                0 0 0 4px var(--color-brand-400);
}
```

------------------------------------------------------------------------

## 16. Component implementation checklist

Before shipping a component, verify:

-   [ ] It uses the shared color, spacing, typography, and radius
    tokens.
-   [ ] Its default, hover, active, focus, disabled, loading, and error
    states are defined where relevant.
-   [ ] It works with keyboard navigation.
-   [ ] It has an accessible name and label.
-   [ ] It remains usable at narrow viewport widths.
-   [ ] It does not rely on color alone to communicate meaning.
-   [ ] It respects reduced-motion preferences.
-   [ ] It handles long text and missing data gracefully.
-   [ ] It respects workspace role permissions in the UI.
-   [ ] Its corresponding API action enforces authorization
    independently.
-   [ ] It provides clear success and failure feedback.
-   [ ] It does not expose data from another workspace.

------------------------------------------------------------------------

## 17. Product-screen checklist

### Dashboard

-   [ ] Clear page title and workspace context.
-   [ ] Useful summary metrics without excessive decoration.
-   [ ] My Tasks count is based on the authenticated user.
-   [ ] Recent activity is readable and correctly scoped.
-   [ ] Empty state offers a useful first action.

### Project

-   [ ] Project name and description are clear.
-   [ ] Board, list, timeline, activity, and settings navigation is
    consistent.
-   [ ] Issue counts and status labels are accurate.
-   [ ] Board columns remain usable on smaller screens.

### Issue

-   [ ] Issue key is visible and copyable.
-   [ ] Title and description are easy to scan.
-   [ ] Status and priority are clear.
-   [ ] Assignee can be empty without breaking the layout.
-   [ ] Comments, mentions, and activity are distinguishable.
-   [ ] Mutations update all relevant cached views.

### Team and settings

-   [ ] Current role is visible.
-   [ ] Role changes explain their impact.
-   [ ] Pending invitations are distinguishable from active members.
-   [ ] Owner-only controls are not shown to unauthorized roles.
-   [ ] Destructive actions require appropriate confirmation.

### Workspace switcher

-   [ ] Workspace name and current selection are obvious.
-   [ ] Switching updates all tenant-scoped data together.
-   [ ] No stale data from the previous workspace flashes into view.
-   [ ] Users with no workspace see a guided empty state.

------------------------------------------------------------------------

## 18. Design-system governance

To keep the product coherent as it grows:

1.  Treat tokens as the source of truth; avoid one-off hex values and
    arbitrary spacing.
2.  Build reusable components before duplicating patterns across pages.
3.  Document new variants when a genuine product need appears.
4.  Avoid adding a new color for a single isolated screen.
5.  Review components in default, hover, focus, disabled, loading, and
    error states.
6.  Test at desktop, tablet, and mobile widths.
7.  Review keyboard and screen-reader behavior for interactive
    components.
8.  Validate contrast when changing surface or text tokens.
9.  Keep frontend permission states aligned with backend authorization
    policy.
10. Update this document whenever a shared token or interaction pattern
    changes.

------------------------------------------------------------------------

## 19. Final design direction

IssueFlow should feel like a fast, dependable workspace for people who
build software. Its visual identity comes from a deep slate foundation,
a confident green accent, crisp Inter typography, compact but breathable
layouts, and purposeful interaction patterns.

The product should be visually quiet when users are reading or planning,
and responsive when they are acting. The Kanban board, issue detail,
command palette, and workspace switcher should all feel like parts of
one coherent system.

**The guiding test:** does this design help a team move from idea to
issue to done with less friction and more confidence? If not, simplify
it.
