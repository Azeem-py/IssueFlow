import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  EmptyState,
  Input,
  Kbd,
  PriorityBadge,
  Select,
  Skeleton,
  Spinner,
  StatusBadge,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
  ToastProvider,
  useToast,
  cx,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  EyeIcon,
  InboxIcon,
  InfoIcon,
  LayersIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  XCircleIcon,
  XIcon,
  type IconProps,
} from '@issueflow/ui';

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const navGroups = [
  {
    label: 'Foundations',
    links: [
      { id: 'brand', label: 'Brand & principles' },
      { id: 'color', label: 'Color' },
      { id: 'typography', label: 'Typography' },
      { id: 'space', label: 'Spacing & shape' },
      { id: 'icons', label: 'Iconography' },
    ],
  },
  {
    label: 'Components',
    links: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'forms', label: 'Form controls' },
      { id: 'badges', label: 'Badges & status' },
      { id: 'cards', label: 'Cards & avatars' },
      { id: 'feedback', label: 'Feedback & overlays' },
      { id: 'navigation', label: 'Tabs & navigation' },
    ],
  },
  {
    label: 'Patterns',
    links: [
      { id: 'roles', label: 'Roles & permissions' },
      { id: 'content', label: 'Content & microcopy' },
      { id: 'accessibility', label: 'Accessibility' },
    ],
  },
] as const;

const sectionIds = navGroups.flatMap((group) => group.links.map((link) => link.id));

const topLinks = [
  { id: 'brand', label: 'Foundations' },
  { id: 'buttons', label: 'Components' },
  { id: 'roles', label: 'Patterns' },
  { id: 'accessibility', label: 'Accessibility' },
];

/* ------------------------------------------------------------------ */
/* Shared page pieces                                                  */
/* ------------------------------------------------------------------ */

function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    const update = () => {
      const offset = 128;
      let current = ids[0] ?? '';

      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }

      setActive(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ids]);

  return active;
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-subtle pt-10 sm:pt-12 lg:scroll-mt-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>}
      <div className="mt-8 space-y-8">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>
          {description && <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Panel({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cx('rounded-xl border border-subtle bg-panel', padded && 'p-5', className)}>
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Color                                                               */
/* ------------------------------------------------------------------ */

interface ColorToken {
  token: string;
  hex: string;
  usage: string;
}

const colorGroups: Array<{ title: string; description: string; tokens: ColorToken[] }> = [
  {
    title: 'Brand',
    description: 'Green is the primary action color. Teal and cyan are supporting highlights.',
    tokens: [
      { token: 'brand-300', hex: '#6EE7B7', usage: 'Text on tinted green' },
      { token: 'brand-400', hex: '#34D399', usage: 'Hover and bright emphasis' },
      { token: 'brand-500', hex: '#10B981', usage: 'Primary actions and selected states' },
      { token: 'brand-600', hex: '#059669', usage: 'Pressed state' },
      { token: 'brand-700', hex: '#047857', usage: 'Dark green emphasis' },
      { token: 'teal-400', hex: '#2DD4BF', usage: 'Secondary interactive highlight' },
      { token: 'cyan-400', hex: '#22D3EE', usage: 'Focus and informational accents' },
    ],
  },
  {
    title: 'Semantic',
    description: 'Always paired with a label, icon, or another cue. Color is never the only signal.',
    tokens: [
      { token: 'success', hex: '#22C55E', usage: 'Completed and healthy' },
      { token: 'warning', hex: '#F59E0B', usage: 'Caution and attention' },
      { token: 'danger', hex: '#EF4444', usage: 'Errors and destructive actions' },
      { token: 'info', hex: '#3B82F6', usage: 'Informational state' },
      { token: 'purple', hex: '#8B5CF6', usage: 'Review and categorization' },
      { token: 'orange', hex: '#F97316', usage: 'High priority emphasis' },
    ],
  },
  {
    title: 'Surfaces & lines',
    description: 'Use surface contrast to create hierarchy before adding borders.',
    tokens: [
      { token: 'canvas', hex: '#08111F', usage: 'Application canvas' },
      { token: 'sidebar', hex: '#0B1422', usage: 'Persistent navigation' },
      { token: 'panel', hex: '#0F172A', usage: 'Main panels and cards' },
      { token: 'elevated', hex: '#172235', usage: 'Cards, popovers, menus' },
      { token: 'hover', hex: '#1E293B', usage: 'Hovered row or control' },
      { token: 'selected', hex: '#12352F', usage: 'Selected item with green tint' },
      { token: 'subtle', hex: '#1E293B', usage: 'Panel boundaries' },
      { token: 'line', hex: '#334155', usage: 'Inputs and visible dividers' },
    ],
  },
  {
    title: 'Text',
    description: 'Use weight and spacing before reaching for a different text color.',
    tokens: [
      { token: 'ink', hex: '#F1F5F9', usage: 'Primary text' },
      { token: 'ink-secondary', hex: '#CBD5E1', usage: 'Supporting text' },
      { token: 'ink-muted', hex: '#94A3B8', usage: 'Metadata and hints' },
      { token: 'ink-disabled', hex: '#64748B', usage: 'Disabled labels' },
    ],
  },
];

function ColorSwatch({ token, hex, usage }: ColorToken) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  async function handleCopy() {
    let copiedOk = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(hex);
        copiedOk = true;
      }
    } catch {
      copiedOk = false;
    }

    if (!copiedOk) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = hex;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        copiedOk = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copiedOk = false;
      }
    }

    if (!copiedOk) return;

    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group rounded-lg border border-subtle bg-panel p-2.5 text-left transition-colors duration-150 hover:border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <span className="sr-only">Copy </span>
      <span
        aria-hidden="true"
        className="block h-16 rounded-md border border-white/10"
        style={{ backgroundColor: hex }}
      />
      <span className="mt-2.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-medium text-ink">{hex}</span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-brand-300">
          {copied ? 'Copied' : <CopyIcon className="size-3.5 text-ink-muted transition-colors group-hover:text-ink-muted" />}
        </span>
      </span>
      <span className="mt-1 block truncate font-mono text-[10px] text-ink-secondary">{token}</span>
      <span className="mt-1 block text-[10px] leading-relaxed text-ink-muted">{usage}</span>
      <span className="sr-only" aria-live="polite">
        {copied ? `${token} copied` : ''}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Components with local state                                         */
/* ------------------------------------------------------------------ */

function FormsDemo() {
  const [notify, setNotify] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Issue title" placeholder="Add rate limiting to public endpoints" />
        <Input
          label="Project key"
          defaultValue="A"
          error="Use 2–6 uppercase letters."
          hint="Used as the prefix for issue keys."
        />
        <Input
          label="Reporter"
          defaultValue="Azeem Sanusi"
          disabled
          hint="Reporter can't be changed after creation."
        />
        <Input
          label="Search issues"
          placeholder="Search by key, title, or assignee…"
          leftIcon={<SearchIcon />}
          rightSlot={<Kbd>⌘K</Kbd>}
        />
        <Select label="Status" defaultValue="IN_PROGRESS">
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="REVIEW">In review</option>
          <option value="DONE">Done</option>
        </Select>
        <Select label="Assignee" defaultValue="">
          <option value="">Unassigned</option>
          <option value="azeem">Azeem Sanusi</option>
          <option value="jane">Jane Doe</option>
        </Select>
      </div>

      <Textarea
        label="Description"
        placeholder="What needs to happen, and why?"
        hint="Markdown is supported. Keep the first paragraph scannable."
      />

      <div className="grid gap-5 rounded-lg border border-subtle bg-canvas/60 p-4 sm:grid-cols-2">
        <Checkbox
          label="Notify watchers"
          description="Send an update when the issue changes status."
          defaultChecked
        />
        <Checkbox
          label="Create another issue"
          description="Keep the quick-add flow open after saving."
        />
        <Switch
          checked={notify}
          onCheckedChange={setNotify}
          label="In-app notifications"
          description="Mentions and assignments appear in the bell menu."
        />
        <Switch
          checked={emailDigest}
          onCheckedChange={setEmailDigest}
          label="Weekly email digest"
          description="A Monday summary of assigned and recently updated work."
        />
      </div>
    </div>
  );
}

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast({ tone: 'success', title: 'Issue created', description: 'IF-142 is ready to open.' })
        }
      >
        Success toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'error',
            title: 'Could not update status',
            description: 'Check your connection and try again.',
          })
        }
      >
        Error toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast({ tone: 'info', title: 'Invitation sent', description: 'alex@example.com was invited.' })
        }
      >
        Info toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'warning',
            title: 'You don’t have permission to edit this project',
            description: 'Ask an owner or admin for access.',
          })
        }
      >
        Warning toast
      </Button>
    </div>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a member"
        description="They’ll join the workspace with the role you choose."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast({
                  tone: 'success',
                  title: 'Invitation sent',
                  description: 'alex@example.com was invited as a member.',
                });
              }}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Email address" type="email" placeholder="alex@example.com" required />
          <Select label="Role" defaultValue="MEMBER">
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </Select>
        </div>
      </Dialog>
    </>
  );
}

function TabsDemo() {
  const [tab, setTab] = useState('board');

  const items = [
    { value: 'board', label: 'Board', badge: 12, panelId: 'ds-tab-panel' },
    { value: 'list', label: 'List', badge: 12, panelId: 'ds-tab-panel' },
    { value: 'activity', label: 'Activity', panelId: 'ds-tab-panel' },
    { value: 'settings', label: 'Settings', panelId: 'ds-tab-panel' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Tabs items={items} value={tab} onValueChange={setTab} label="Issue views" />
        <div
          id="ds-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex={0}
          className="mt-4 rounded-lg border border-subtle bg-canvas/50 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {tab === 'board' && (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Backlog', count: 3, issues: ['Polish empty states', 'Document invite flow'] },
                { title: 'In progress', count: 2, issues: ['Implement rate limiting', 'Fix mobile filters'] },
                { title: 'Done', count: 7, issues: ['Add command palette'] },
              ].map((column) => (
                <div key={column.title} className="rounded-lg border border-subtle bg-panel p-2.5">
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-semibold text-ink-secondary">{column.title}</span>
                    <span className="rounded-full bg-elevated px-1.5 py-0.5 text-[10px] text-ink-muted">{column.count}</span>
                  </div>
                  <div className="space-y-1.5">
                    {column.issues.map((issue) => (
                      <div key={issue} className="rounded-md border border-subtle bg-elevated/60 px-2.5 py-2">
                        <p className="text-[11px] leading-snug text-ink">{issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'list' && (
            <div className="divide-y divide-subtle">
              {[
                { key: 'IF-142', title: 'Implement API rate limiting', status: 'IN_PROGRESS' },
                { key: 'IF-139', title: 'Polish empty states', status: 'BACKLOG' },
                { key: 'IF-131', title: 'Add command palette', status: 'DONE' },
              ].map((issue) => (
                <div key={issue.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-[11px] text-ink-muted">{issue.key}</span>
                    <span className="truncate text-xs text-ink">{issue.title}</span>
                  </div>
                  <StatusBadge status={issue.status} />
                </div>
              ))}
            </div>
          )}

          {tab === 'activity' && (
            <ul className="space-y-3">
              {[
                { name: 'Azeem Sanusi', action: 'moved IF-142 to In progress', time: '2m ago' },
                { name: 'Jane Doe', action: 'commented on IF-139', time: '18m ago' },
                { name: 'Azeem Sanusi', action: 'created IF-131', time: '1h ago' },
              ].map((entry) => (
                <li key={`${entry.name}-${entry.time}`} className="flex items-center gap-3">
                  <Avatar name={entry.name} size="xs" />
                  <p className="min-w-0 flex-1 text-xs text-ink-secondary">
                    <span className="font-medium text-ink">{entry.name}</span> {entry.action}
                  </p>
                  <span className="shrink-0 text-[10px] text-ink-muted">{entry.time}</span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'settings' && (
            <p className="text-xs leading-relaxed text-ink-muted">
              Tab labels stay stable across projects, and panel state is preserved when the user switches views.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-ink-muted">Pill variant:</span>
        <Tabs
          items={[
            { value: 'mine', label: 'My issues', badge: 4 },
            { value: 'all', label: 'All issues' },
          ]}
          value={tab === 'board' ? 'mine' : 'all'}
          onValueChange={(value) => setTab(value === 'mine' ? 'board' : 'list')}
          variant="pill"
          label="Issue scope"
        />
      </div>
    </div>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      label="Include closed issues"
      description="Only applies to the current project."
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const principles = [
  {
    title: 'Make the work the interface',
    description: 'Issues, projects, and boards take visual priority over decoration.',
  },
  {
    title: 'Prefer clarity over density',
    description: 'Show useful information without turning every screen into competing widgets.',
  },
  {
    title: 'Keep actions close to context',
    description: 'Editing, assigning, and changing status stay where the work happens.',
  },
  {
    title: 'Make state visible',
    description: 'Status, priority, role, loading, success, and errors are easy to distinguish.',
  },
];

const typeScale = [
  { token: 'display', sample: 'Ship with clarity.', className: 'text-[32px] font-bold leading-[1.15]', meta: '32 / 700 / 1.15', usage: 'Rare onboarding headline' },
  { token: 'h1', sample: 'Issues', className: 'text-[28px] font-bold leading-[1.2]', meta: '28 / 700 / 1.2', usage: 'Main page title' },
  { token: 'h2', sample: 'Project overview', className: 'text-2xl font-semibold leading-[1.25]', meta: '24 / 600 / 1.25', usage: 'Major section title' },
  { token: 'h3', sample: 'Activity', className: 'text-xl font-semibold leading-[1.3]', meta: '20 / 600 / 1.3', usage: 'Panel or dialog title' },
  { token: 'h4', sample: 'Assigned to you', className: 'text-base font-semibold leading-[1.4]', meta: '16 / 600 / 1.4', usage: 'Card and subsection title' },
  { token: 'body-lg', sample: 'Turn scattered work into a single, shared flow.', className: 'text-base leading-relaxed', meta: '16 / 400 / 1.5', usage: 'Prominent explanatory copy' },
  { token: 'body', sample: 'Status and priority are clear, and the assignee can be empty.', className: 'text-sm leading-relaxed', meta: '14 / 400 / 1.5', usage: 'Default application text' },
  { token: 'body-sm', sample: 'Updated 2 minutes ago by Azeem Sanusi.', className: 'text-[13px] leading-relaxed text-ink-secondary', meta: '13 / 400 / 1.45', usage: 'Dense supporting content' },
  { token: 'caption', sample: 'IF-142 · In progress', className: 'text-xs text-ink-muted', meta: '12 / 400 / 1.4', usage: 'Metadata and timestamps' },
  { token: 'micro', sample: 'OWNER', className: 'text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted', meta: '11 / 500 / 1.3', usage: 'Short micro-labels only' },
];

const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];

const radiusScale = [
  { token: 'xs', value: '4px', className: 'rounded-xs' },
  { token: 'sm', value: '6px', className: 'rounded-sm' },
  { token: 'md', value: '8px', className: 'rounded-md' },
  { token: 'lg', value: '12px', className: 'rounded-lg' },
  { token: 'xl', value: '16px', className: 'rounded-xl' },
  { token: '2xl', value: '20px', className: 'rounded-2xl' },
  { token: 'full', value: '9999px', className: 'rounded-full' },
];

const iconShowcase: Array<{ label: string; Icon: React.ComponentType<IconProps> }> = [
  { label: 'Check', Icon: CheckIcon },
  { label: 'Search', Icon: SearchIcon },
  { label: 'Plus', Icon: PlusIcon },
  { label: 'Arrow', Icon: ArrowRightIcon },
  { label: 'Info', Icon: InfoIcon },
  { label: 'Success', Icon: CheckCircleIcon },
  { label: 'Warning', Icon: AlertTriangleIcon },
  { label: 'Error', Icon: XCircleIcon },
  { label: 'Inbox', Icon: InboxIcon },
  { label: 'Lock', Icon: LockIcon },
  { label: 'Copy', Icon: CopyIcon },
  { label: 'Layers', Icon: LayersIcon },
  { label: 'Eye', Icon: EyeIcon },
  { label: 'Chevron', Icon: ChevronRightIcon },
];

const statusExamples = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELED', 'BLOCKED'];
const priorityExamples = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const roleCards = [
  {
    name: 'Owner',
    tone: 'brand',
    summary: 'Full control over the workspace and its ownership.',
    abilities: ['Manage ownership', 'Invite and manage members', 'Change workspace settings'],
  },
  {
    name: 'Admin',
    tone: 'teal',
    summary: 'Runs the workspace day to day, including membership.',
    abilities: ['Manage projects and members', 'Create, edit, and move issues', 'Update workspace settings per policy'],
  },
  {
    name: 'Member',
    tone: 'info',
    summary: 'Does the work: creates, edits, comments, and moves issues.',
    abilities: ['Create and edit issues', 'Comment and mention teammates', 'Manage projects per policy'],
  },
  {
    name: 'Viewer',
    tone: 'neutral',
    summary: 'Read-only visibility without changing the workspace.',
    abilities: ['View issues and projects', 'Read comments and activity', 'No create, edit, or move actions'],
  },
] as const;

type PermissionValue = 'yes' | 'no' | 'policy';

const capabilityMatrix: Array<{
  capability: string;
  values: [PermissionValue, PermissionValue, PermissionValue, PermissionValue];
}> = [
  { capability: 'View workspace content', values: ['yes', 'yes', 'yes', 'yes'] },
  { capability: 'Create and edit issues', values: ['yes', 'yes', 'yes', 'no'] },
  { capability: 'Move issues through workflow', values: ['yes', 'yes', 'yes', 'no'] },
  { capability: 'Comment on issues', values: ['yes', 'yes', 'yes', 'no'] },
  { capability: 'Manage projects', values: ['yes', 'yes', 'policy', 'no'] },
  { capability: 'Invite and manage members', values: ['yes', 'yes', 'no', 'no'] },
  { capability: 'Change workspace settings', values: ['yes', 'policy', 'no', 'no'] },
  { capability: 'Manage ownership', values: ['yes', 'no', 'no', 'no'] },
];

const copyExamples = [
  { prefer: 'Issue created', avoid: 'Awesome!!! Success!!!' },
  { prefer: 'You don’t have permission to edit this project.', avoid: 'Access denied.' },
  { prefer: 'No issues match this search.', avoid: 'Nothing here.' },
  { prefer: 'Invitation sent to alex@example.com.', avoid: 'Done.' },
  { prefer: 'Could not save changes. Try again.', avoid: 'Something went wrong!!!' },
];

const accessibilityChecks = [
  'Text and UI controls meet WCAG 2.2 AA contrast.',
  'Every interactive element has a visible keyboard focus state.',
  'Dialogs, menus, and drawers manage focus predictably.',
  'Status, priority, and errors never rely on color alone.',
  'Icon-only buttons have accessible names and tooltips.',
  'Touch targets stay comfortable on mobile widths.',
  'Motion is subtle and respects prefers-reduced-motion.',
  'Async updates are announced without overwhelming users.',
];

/* ------------------------------------------------------------------ */
/* Permission helper                                                   */
/* ------------------------------------------------------------------ */

function PermissionMark({ value }: { value: PermissionValue }) {
  if (value === 'policy') {
    return <span className="text-xs text-ink-muted">Per policy</span>;
  }

  if (value === 'yes') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
        <CheckIcon className="size-3.5 text-emerald-300" />
        Yes
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
      <XIcon className="size-3.5 text-red-300" />
      No
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DesignSystem() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}

function DesignSystemContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const active = useScrollSpy(sectionIds);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'IssueFlow design system';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-subtle/80 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
            <img src="/apple-touch-icon.png" alt="" className="size-8 rounded-lg ring-1 ring-white/10" />
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-ink">IssueFlow</span>
              <span className="hidden text-xs text-ink-muted sm:inline">/ Design system</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Design system sections">
            {topLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone="brand" variant="subtle" dot>
              v1.0
            </Badge>
            <Button
              size="sm"
              variant="secondary"
              iconRight={<ArrowRightIcon className="size-3.5" />}
              onClick={() => navigate('/dashboard')}
            >
              Open app
            </Button>
          </div>
        </div>

        <div className="border-t border-subtle/60 px-4 py-2 md:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {topLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-muted hover:bg-hover hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto flex max-w-[1440px] gap-8 px-4 sm:px-6 lg:gap-10 lg:px-8">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto border-r border-subtle/60 py-8 pr-4 lg:block custom-scrollbar">
          <nav aria-label="On this page" className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.links.map((link) => {
                    const isActive = active === link.id;

                    return (
                      <li key={link.id}>
                        <a
                          href={`#${link.id}`}
                          aria-current={isActive ? 'true' : undefined}
                          className={cx(
                            'block border-l-2 py-1.5 pl-2.5 text-xs transition-colors duration-150',
                            isActive
                              ? 'border-brand-400 bg-brand-500/10 font-medium text-brand-300'
                              : 'border-transparent text-ink-muted hover:border-line hover:text-ink',
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-subtle bg-panel p-3">
            <p className="text-[11px] font-medium text-ink-secondary">Using the system</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              Import components from{' '}
              <code className="font-mono text-brand-300">@issueflow/ui</code>. Prefer tokens over
              one-off hex values.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 py-8 lg:py-12">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-subtle bg-panel px-6 py-10 shadow-elevation-1 sm:px-10 sm:py-12">
            <div className="relative grid gap-10 xl:grid-cols-[1fr_320px] xl:items-center">
              <div className="max-w-2xl">
                <Badge tone="brand" variant="outline" dot>
                  IssueFlow design system · v1.0
                </Badge>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  One system for focused, developer-first work.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base">
                  A dark-first visual language built on deep slate surfaces, crisp Inter typography, and a
                  confident green accent. Every token, component, and state in this guide is reusable from
                  the shared UI package.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={() => scrollTo('brand')} iconRight={<ArrowRightIcon className="size-4" />}>
                    Explore foundations
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Open the app
                  </Button>
                </div>

                <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                  <span>Track. Collaborate. Ship.</span>
                  <span aria-hidden="true">·</span>
                  <span>Inter · green accent · reduced-motion safe</span>
                </p>
              </div>

              <div className="hidden xl:block">
                <div className="rounded-xl border border-line bg-canvas/80 p-4 shadow-elevation-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      Live preview
                    </span>
                    <Badge tone="success" variant="subtle" dot>
                      Ready
                    </Badge>
                  </div>

                  <Input
                    aria-label="Search issues"
                    placeholder="Search issues…"
                    leftIcon={<SearchIcon />}
                    rightSlot={<Kbd>⌘K</Kbd>}
                  />

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <StatusBadge status="IN_PROGRESS" />
                    <PriorityBadge priority="HIGH" />
                    <Badge tone="brand">Feature</Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-subtle bg-panel p-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name="Azeem Sanusi" size="sm" status="online" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-ink">Azeem Sanusi</p>
                        <p className="text-[10px] text-ink-muted">Owner</p>
                      </div>
                    </div>
                    <Button size="sm" aria-label="Create issue">
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 grid grid-cols-2 gap-4 border-t border-subtle pt-6 sm:grid-cols-4">
              <Stat value="8" label="Color families" />
              <Stat value="24" label="Reusable components" />
              <Stat value="7" label="Radius steps" />
              <Stat value="WCAG 2.2 AA" label="Accessibility target" />
            </div>
          </section>

          <div className="mt-14 space-y-14 pb-16">
            {/* Brand */}
            <Section
              id="brand"
              eyebrow="01 · Foundations"
              title="Brand and principles"
              description="IssueFlow should feel technical, calm, and fast. Surfaces stay quiet so the work stays loud."
            >
              <Panel className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-3">
                  <img src="/apple-touch-icon.png" alt="IssueFlow logo" className="size-11 rounded-lg ring-1 ring-white/10" />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-brand-400">IssueFlow</p>
                    <p className="text-[11px] text-ink-muted">Issue tracking for software teams</p>
                  </div>
                </div>
                <div className="hidden h-10 w-px bg-subtle sm:block" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed text-ink-secondary">
                    Use the mark with the wordmark for the product identity, and alone for compact spaces.
                    Keep it on dark or neutral backgrounds with clear space around it.
                  </p>
                </div>
                <Badge tone="brand" variant="outline">
                  Track. Collaborate. Ship.
                </Badge>
              </Panel>

              <div className="grid gap-3 sm:grid-cols-2">
                {principles.map((principle, index) => (
                  <Panel key={principle.title} className="p-4">
                    <span className="font-mono text-[11px] text-brand-300">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="mt-2 text-sm font-semibold text-ink">{principle.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{principle.description}</p>
                  </Panel>
                ))}
              </div>
            </Section>

            {/* Color */}
            <Section
              id="color"
              eyebrow="02 · Foundations"
              title="Color"
              description="Deep slate surfaces create hierarchy. Green carries the primary action; semantic colors are reserved for meaning. Select a swatch to copy its hex."
            >
              {colorGroups.map((group) => (
                <SubSection key={group.title} title={group.title} description={group.description}>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                    {group.tokens.map((token) => (
                      <ColorSwatch key={token.token} {...token} />
                    ))}
                  </div>
                </SubSection>
              ))}

              <Alert
                tone="info"
                title="Usage rules"
                description="Reserve the strongest green for the most important action on a screen. Pair every semantic color with a label, icon, or other cue. Avoid large saturated blocks unless they communicate a real state."
              />
            </Section>

            {/* Typography */}
            <Section
              id="typography"
              eyebrow="03 · Foundations"
              title="Typography"
              description="Inter carries the full interface. Hierarchy comes from weight, size, and spacing before color."
            >
              <div className="overflow-hidden rounded-xl border border-subtle bg-panel">
                {typeScale.map((type) => (
                  <div
                    key={type.token}
                    className="grid gap-3 border-b border-subtle px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className={cx('truncate text-ink', type.className)}>{type.sample}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <p className="font-mono text-[10px] text-brand-300">{type.token}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-muted">{type.meta}</p>
                      <p className="mt-0.5 text-[10px] text-ink-muted">{type.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Spacing & shape */}
            <Section
              id="space"
              eyebrow="04 · Foundations"
              title="Spacing, shape, and motion"
              description="A 4px base unit keeps rhythm predictable. Radii run from 4px to 20px, with full radius for pills and avatars."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <SubSection title="Spacing scale" description="4px base unit; prefer 8px and 16px for repeated components.">
                  <Panel>
                    <div className="space-y-2">
                      {spacingScale.map((value) => (
                        <div key={value} className="flex items-center gap-3">
                          <span className="w-10 shrink-0 font-mono text-[10px] text-ink-muted">{value}</span>
                          <span
                            className="h-2 rounded-full bg-brand-500/70"
                            style={{ width: `${value}px` }}
                            aria-hidden="true"
                          />
                        </div>
                      ))}
                    </div>
                  </Panel>
                </SubSection>

                <SubSection title="Radius scale" description="Do not round every surface into the same generic card.">
                  <Panel>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {radiusScale.map((radius) => (
                        <div key={radius.token} className="text-center">
                          <div className={cx('mx-auto size-14 border border-line bg-elevated', radius.className)} />
                          <p className="mt-2 font-mono text-[10px] text-ink-secondary">{radius.token}</p>
                          <p className="text-[10px] text-ink-muted">{radius.value}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </SubSection>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <SubSection title="Elevation" description="Subtle dark shadows plus borders; never bright, heavy shadows.">
                  <Panel>
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className="text-center">
                          <div
                            className={cx(
                              'mx-auto flex size-14 items-center justify-center rounded-lg border border-subtle bg-panel text-xs font-medium text-ink-muted',
                              level === 1 && 'shadow-elevation-1',
                              level === 2 && 'shadow-elevation-2',
                              level === 3 && 'shadow-elevation-3',
                              level === 4 && 'shadow-elevation-4',
                            )}
                          >
                            {level}
                          </div>
                          <p className="mt-2 font-mono text-[10px] text-ink-muted">elev-{level}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </SubSection>

                <SubSection title="Motion and focus" description="100–240ms, opacity and small transforms, purposeful feedback.">
                  <Panel className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: 'Fast', value: '120ms' },
                        { label: 'Normal', value: '180ms' },
                        { label: 'Slow', value: '240ms' },
                      ].map((duration) => (
                        <div key={duration.label} className="rounded-lg border border-subtle bg-canvas/60 px-2 py-3">
                          <p className="text-xs font-medium text-ink">{duration.label}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-ink-muted">{duration.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="secondary" size="sm">
                        Focus me
                      </Button>
                      <span className="text-xs text-ink-muted">Tab to see the focus ring.</span>
                    </div>
                  </Panel>
                </SubSection>
              </div>
            </Section>

            {/* Icons */}
            <Section
              id="icons"
              eyebrow="05 · Foundations"
              title="Iconography"
              description="A consistent 2px outline family. Pair unfamiliar icons with labels and give icon-only controls an accessible name."
            >
              <Panel>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {iconShowcase.map(({ label, Icon }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 rounded-lg border border-subtle bg-canvas/50 px-2 py-3 text-ink-muted transition-colors duration-150 hover:border-line hover:text-ink"
                    >
                      <Icon className="size-5" />
                      <span className="text-[10px]">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-6 border-t border-subtle pt-4">
                  {[14, 16, 18, 20, 24].map((size) => (
                    <div key={size} className="flex flex-col items-center gap-1.5">
                      <SearchIcon style={{ width: size, height: size }} className="text-ink-secondary" />
                      <span className="font-mono text-[10px] text-ink-muted">{size}px</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </Section>

            {/* Buttons */}
            <Section
              id="buttons"
              eyebrow="06 · Components"
              title="Buttons"
              description="Primary is the single strongest action in a region. Secondary, outline, and ghost support it; danger is reserved for destructive work."
            >
              <Panel className="space-y-6">
                <div>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">Variants</p>
                  <div className="flex flex-wrap gap-2.5">
                    <Button>Create issue</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Delete issue</Button>
                    <Button variant="danger-outline">Delete</Button>
                    <Button variant="link" iconRight={<ArrowRightIcon className="size-3.5" />}>
                      View activity
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">Sizes and states</p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button loading>Saving…</Button>
                    <Button disabled>Disabled</Button>
                    <Button variant="secondary" icon={<PlusIcon className="size-4" />}>
                      With icon
                    </Button>
                    <Tooltip label="Search issues">
                      <Button variant="ghost" size="icon" aria-label="Search issues">
                        <SearchIcon className="size-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-ink-muted">
                  Loading prevents duplicate submissions and preserves the button width. Disabled buttons keep
                  readable labels and explain missing requirements nearby when the reason isn’t obvious.
                </p>
              </Panel>
            </Section>

            {/* Forms */}
            <Section
              id="forms"
              eyebrow="07 · Components"
              title="Form controls"
              description="Every field has a persistent label, a clear focus state, inline validation, and distinct disabled behavior."
            >
              <Panel>
                <FormsDemo />
              </Panel>
              <div className="flex flex-wrap items-center gap-4">
                <CheckboxDemo />
                <span className="text-[11px] text-ink-muted">Checkbox uses a native input; switches use role="switch".</span>
              </div>
            </Section>

            {/* Badges */}
            <Section
              id="badges"
              eyebrow="08 · Components"
              title="Badges and status"
              description="Tinted backgrounds with readable foreground text. Status and priority badges always include a text label and a reinforcing dot."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <SubSection title="Tones" description="Subtle is the default; solid is for high-emphasis summaries.">
                  <Panel className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="neutral" dot>Neutral</Badge>
                      <Badge tone="brand" dot>Brand</Badge>
                      <Badge tone="success" dot>Success</Badge>
                      <Badge tone="warning" dot>Warning</Badge>
                      <Badge tone="danger" dot>Danger</Badge>
                      <Badge tone="info" dot>Info</Badge>
                      <Badge tone="purple" dot>Review</Badge>
                      <Badge tone="orange" dot>High</Badge>
                      <Badge tone="teal" dot>Active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="brand" variant="solid">Brand</Badge>
                      <Badge tone="success" variant="solid">Done</Badge>
                      <Badge tone="warning" variant="solid">Warning</Badge>
                      <Badge tone="danger" variant="solid">Blocked</Badge>
                      <Badge tone="info" variant="outline">Info</Badge>
                      <Badge tone="brand" variant="outline">Outline</Badge>
                    </div>
                  </Panel>
                </SubSection>

                <SubSection title="Status and priority" description="Mapped consistently across boards, filters, and detail views.">
                  <Panel className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {statusExamples.map((status) => (
                        <StatusBadge key={status} status={status} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {priorityExamples.map((priority) => (
                        <PriorityBadge key={priority} priority={priority} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-subtle pt-3">
                      <StatusBadge status="DONE" variant="solid" />
                      <PriorityBadge priority="URGENT" variant="solid" />
                    </div>
                  </Panel>
                </SubSection>
              </div>
            </Section>

            {/* Cards & avatars */}
            <Section
              id="cards"
              eyebrow="09 · Components"
              title="Cards and avatars"
              description="Issue cards prioritize key, title, status, priority, and assignee. Avatars always have an accessible name and an initials fallback."
            >
              <SubSection title="Issue card" description="The whole card can be clickable when the interaction is unambiguous.">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card
                    interactive
                    className="max-w-xl"
                    onClick={() =>
                      toast({
                        tone: 'info',
                        title: 'Issue opened',
                        description: 'IF-142 · Implement API rate limiting for public endpoints.',
                      })
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] text-ink-muted">IF-142</span>
                            <StatusBadge status="IN_PROGRESS" />
                          </div>
                          <h4 className="mt-2 text-sm font-medium leading-snug text-ink">
                            Implement API rate limiting for public endpoints
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                            Add per-workspace limits, clear 429 responses, and retry guidance.
                          </p>
                        </div>
                        <PriorityBadge priority="HIGH" />
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-subtle pt-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar name="Azeem Sanusi" size="xs" status="online" />
                          <span className="truncate text-[11px] text-ink-muted">Azeem Sanusi</span>
                        </div>
                        <span className="shrink-0 text-[11px] text-ink-muted">3 comments</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="max-w-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle>Project health</CardTitle>
                        <Badge tone="success" dot>
                          On track
                        </Badge>
                      </div>
                      <CardDescription>
                        A standard card groups a title, supporting copy, content, and actions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-3">
                        <Stat value="12" label="Open" />
                        <Stat value="4" label="In review" />
                        <Stat value="28" label="Done" />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <span className="text-[11px] text-ink-muted">Updated 2m ago</span>
                      <Button size="sm" variant="ghost" iconRight={<ChevronRightIcon className="size-3.5" />}>
                        Open
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </SubSection>

              <SubSection title="Avatar sizes and groups" description="Overlapping groups show a limited number of people plus an overflow count.">
                <Panel className="flex flex-wrap items-center gap-8">
                  <div className="flex items-end gap-3">
                    {[
                      { size: 'xs' as const, label: '24' },
                      { size: 'sm' as const, label: '32' },
                      { size: 'md' as const, label: '40' },
                      { size: 'lg' as const, label: '48' },
                    ].map((avatar) => (
                      <div key={avatar.size} className="flex flex-col items-center gap-1.5">
                        <Avatar name="Azeem Sanusi" size={avatar.size} status={avatar.size === 'lg' ? 'online' : undefined} />
                        <span className="font-mono text-[10px] text-ink-muted">{avatar.size} · {avatar.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-10 w-px bg-subtle" />

                  <div className="space-y-2">
                    <AvatarGroup max={4} size="sm">
                      <Avatar name="Azeem Sanusi" />
                      <Avatar name="Jane Doe" />
                      <Avatar name="Sam Carter" />
                      <Avatar name="Mina Park" />
                      <Avatar name="Alex Chen" />
                      <Avatar name="Rui Costa" />
                    </AvatarGroup>
                    <p className="text-[11px] text-ink-muted">Group with overflow count and accessible label.</p>
                  </div>
                </Panel>
              </SubSection>
            </Section>

            {/* Feedback */}
            <Section
              id="feedback"
              eyebrow="10 · Components"
              title="Feedback and overlays"
              description="Every data surface defines loading, empty, error, success, and permission-denied states. Feedback is brief, specific, and actionable."
            >
              <SubSection title="Alerts" description="Inline messages stay close to the action that caused them.">
                <div className="grid gap-3 md:grid-cols-2">
                  <Alert tone="info" title="New comment on IF-142" description="Jane Doe mentioned you in a reply." />
                  <Alert tone="success" title="Changes saved" description="The issue description was updated." />
                  <Alert
                    tone="warning"
                    title="Connection interrupted"
                    description="Your draft is saved locally and will sync when you reconnect."
                  />
                  <Alert
                    tone="danger"
                    title="Could not update status"
                    description="Check your connection and try again. Your previous status is unchanged."
                  />
                </div>
              </SubSection>

              <SubSection title="Toasts" description="Short-lived confirmations and non-blocking errors.">
                <Panel>
                  <ToastDemo />
                </Panel>
              </SubSection>

              <SubSection title="Loading, empty, and permission states">
                <div className="grid gap-4 lg:grid-cols-3">
                  <Panel className="space-y-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">Loading</p>
                    <div className="flex items-start gap-3">
                      <Skeleton className="size-9" rounded="full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-t border-subtle pt-3">
                      <Spinner className="text-brand-400" />
                      <span className="text-xs text-ink-muted">Loading issues…</span>
                    </div>
                  </Panel>

                  <EmptyState
                    className="h-full bg-panel"
                    icon={<InboxIcon />}
                    title="No issues yet"
                    description="Add an issue to start tracking work in this project."
                    action={<Button size="sm" variant="secondary">Create issue</Button>}
                  />

                  <div className="space-y-3">
                    <Alert
                      tone="danger"
                      title="You don’t have permission to edit this project"
                      description="Ask an owner or admin to update your role."
                    />
                    <Alert
                      tone="warning"
                      title="Some changes are not saved"
                      description="Reconnect before leaving this page to keep your draft."
                    />
                  </div>
                </div>
              </SubSection>

              <SubSection title="Overlays and shortcuts" description="Dialogs keep focus, Escape closes them, and shortcuts stay discoverable.">
                <Panel className="flex flex-wrap items-center gap-4">
                  <DialogDemo />

                  <Tooltip label="Copy issue key" side="bottom">
                    <Button variant="outline" size="icon" aria-label="Copy issue key">
                      <CopyIcon className="size-4" />
                    </Button>
                  </Tooltip>

                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span>Open command palette</span>
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </div>
                </Panel>
              </SubSection>
            </Section>

            {/* Tabs & navigation */}
            <Section
              id="navigation"
              eyebrow="11 · Components"
              title="Tabs and navigation"
              description="Tabs keep related views stable. Active items use a surface, weight, and indicator, not color alone. Arrow keys, Home, and End move between tabs."
            >
              <Panel>
                <TabsDemo />
              </Panel>
            </Section>

            {/* Roles */}
            <Section
              id="roles"
              eyebrow="12 · Patterns"
              title="Roles and permission-aware UI"
              description="Hide or disable actions a role cannot perform, and never treat the UI check as the authorization boundary. The API stays authoritative."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {roleCards.map((role) => (
                  <Panel key={role.name} className="flex h-full flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink">{role.name}</h3>
                      <Badge tone={role.tone} variant="subtle" dot>
                        Role
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">{role.summary}</p>
                    <ul className="mt-3 space-y-1.5">
                      {role.abilities.map((ability) => (
                        <li key={ability} className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-secondary">
                          <CheckIcon className="mt-0.5 size-3 shrink-0 text-emerald-300" />
                          {ability}
                        </li>
                      ))}
                    </ul>

                    {role.name === 'Viewer' && (
                      <div className="mt-auto pt-4">
                        <Button size="sm" disabled icon={<PlusIcon className="size-3.5" />} fullWidth>
                          Create issue
                        </Button>
                        <p className="mt-1.5 text-[10px] leading-relaxed text-ink-muted">
                          Viewers can’t create or edit issues. The backend enforces the same rule.
                        </p>
                      </div>
                    )}
                  </Panel>
                ))}
              </div>

              <SubSection title="Capability matrix" description="Align UI visibility with backend authorization policy; do not infer permissions from role names alone.">
                <div className="overflow-x-auto rounded-xl border border-subtle bg-panel">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-subtle bg-elevated/50">
                        <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          Capability
                        </th>
                        {['Owner', 'Admin', 'Member', 'Viewer'].map((role) => (
                          <th key={role} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                            {role}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {capabilityMatrix.map((row) => (
                        <tr key={row.capability} className="border-b border-subtle last:border-b-0">
                          <th scope="row" className="px-4 py-3 text-xs font-medium text-ink-secondary">
                            {row.capability}
                          </th>
                          {row.values.map((value, index) => (
                            <td key={`${row.capability}-${index}`} className="px-4 py-3">
                              <PermissionMark value={value} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SubSection>
            </Section>

            {/* Content */}
            <Section
              id="content"
              eyebrow="13 · Patterns"
              title="Content and microcopy"
              description="Direct, calm, specific, and respectful. Say what happened and what to do next."
            >
              <div className="overflow-hidden rounded-xl border border-subtle bg-panel">
                <div className="grid grid-cols-2 border-b border-subtle bg-elevated/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-emerald-300" />
                    Prefer
                  </span>
                  <span className="flex items-center gap-1.5">
                    <XIcon className="size-3.5 text-red-300" />
                    Avoid
                  </span>
                </div>
                {copyExamples.map((example) => (
                  <div key={example.prefer} className="grid grid-cols-2 gap-3 border-b border-subtle px-4 py-3 text-xs last:border-b-0">
                    <span className="text-ink">{example.prefer}</span>
                    <span className="text-ink-muted line-through decoration-danger/40">{example.avoid}</span>
                  </div>
                ))}
              </div>

              <SubSection title="Consistent terms" description="Use the same product vocabulary everywhere.">
                <div className="flex flex-wrap gap-2">
                  {['workspace', 'project', 'issue', 'member', 'owner', 'admin', 'viewer', 'status', 'priority'].map((term) => (
                    <Badge key={term} tone="neutral">
                      {term}
                    </Badge>
                  ))}
                </div>
              </SubSection>
            </Section>

            {/* Accessibility */}
            <Section
              id="accessibility"
              eyebrow="14 · Patterns"
              title="Accessibility and quality bar"
              description="Target WCAG 2.2 AA. Essential interactions work by keyboard, focus is visible, and meaning never depends on color alone."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {accessibilityChecks.map((check) => (
                  <div key={check} className="flex items-start gap-2.5 rounded-lg border border-subtle bg-panel p-3">
                    <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    <p className="text-xs leading-relaxed text-ink-secondary">{check}</p>
                  </div>
                ))}
              </div>

              <Panel className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">Test the focus ring</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Use Tab to move through controls. Focus uses brand-400 at 2px with a 2px offset.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">
                    Focus me
                  </Button>
                  <Kbd>Tab</Kbd>
                </div>
              </Panel>
            </Section>
          </div>

          <footer className="border-t border-subtle py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/apple-touch-icon.png" alt="" className="size-6 rounded-md ring-1 ring-white/10" />
                <p className="text-xs text-ink-muted">
                  IssueFlow design system · <span className="text-ink-secondary">Track. Collaborate. Ship.</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-muted">
                <a href="#top" className="hover:text-ink">
                  Back to top
                </a>
                <span aria-hidden="true">·</span>
                <span>v1.0</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
