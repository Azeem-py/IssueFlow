import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckIcon,
  CommandIcon,
  FolderKanbanIcon,
  GitBranchIcon,
  GlobeIcon,
  InboxIcon,
  KeyboardIcon,
  MenuIcon,
  PlusIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from '@issueflow/ui';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { name: 'Product', href: '#product' },
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
];

const features = [
  {
    icon: PlusIcon,
    title: 'Quick-add that stays out of the way',
    description: 'Title first, details optional. Create an issue from any board column and keep moving.',
  },
  {
    icon: CommandIcon,
    title: 'Command palette for everything',
    description: 'Find issues, jump to projects, and create work with ⌘K. Keyboard-first by design.',
  },
  {
    icon: FolderKanbanIcon,
    title: 'Boards that respect the workflow',
    description: 'Status columns with counts, clear drag feedback, and optimistic moves that roll back safely.',
  },
  {
    icon: InboxIcon,
    title: 'Issue detail without the noise',
    description: 'Description, properties, assignee, comments, and activity in one scannable view.',
  },
  {
    icon: ShieldIcon,
    title: 'Roles you can trust',
    description: 'Owner, admin, member, and viewer capabilities are reflected in the UI and enforced by the API.',
  },
  {
    icon: ActivityIcon,
    title: 'A shared history',
    description: 'Comments, mentions, and an audit trail keep the team aligned on what changed and why.',
  },
];

function ProductPreview() {
  return (
    <div className="relative rounded-xl border border-line bg-panel/80 p-1.5 shadow-elevation-4 backdrop-blur">
      <div className="overflow-hidden rounded-lg border border-subtle bg-canvas">
        <div className="flex h-8 items-center justify-between border-b border-subtle px-3">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-slate-600" />
            <span className="size-1.5 rounded-full bg-slate-600" />
            <span className="size-1.5 rounded-full bg-slate-600" />
            <span className="ml-2 hidden h-3 w-24 rounded-full bg-elevated sm:block" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-12 rounded bg-elevated" />
            <span className="h-3 w-6 rounded bg-brand-500/30" />
          </div>
        </div>

        <div className="flex">
          <div className="hidden w-28 shrink-0 border-r border-subtle bg-sidebar p-2 sm:block">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <span className="size-4 rounded bg-brand-500/30" />
              <span className="h-2 w-12 rounded-full bg-elevated" />
            </div>
            <div className="space-y-1">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`flex h-5 items-center gap-1.5 rounded px-1.5 ${
                    item === 1 ? 'bg-brand-500/10' : ''
                  }`}
                >
                  <span className={`size-2 rounded-sm ${item === 1 ? 'bg-brand-400/70' : 'bg-slate-600'}`} />
                  <span className={`h-1.5 rounded-full ${item === 1 ? 'w-10 bg-brand-400/30' : 'w-8 bg-elevated'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 p-3">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="h-1.5 w-12 rounded-full bg-elevated" />
                <div className="mt-1.5 h-3 w-28 rounded bg-slate-600/60" />
              </div>
              <div className="h-5 w-16 rounded bg-brand-500/80" />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { label: 'Todo', dot: 'bg-sky-400', cards: 2 },
                { label: 'In progress', dot: 'bg-teal-400', cards: 2 },
                { label: 'Done', dot: 'bg-emerald-400', cards: 1 },
              ].map((column, columnIndex) => (
                <div
                  key={column.label}
                  className={`rounded-md border border-subtle bg-panel/50 p-1.5 ${
                    columnIndex === 2 ? 'hidden md:block' : columnIndex === 1 ? 'hidden sm:block' : ''
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-1 px-0.5">
                    <span className={`size-1.5 rounded-full ${column.dot}`} />
                    <span className="h-1.5 w-10 rounded-full bg-slate-600/60" />
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: column.cards }).map((_, index) => (
                      <div key={index} className="rounded border border-subtle bg-canvas p-1.5">
                        <div className="mb-1.5 h-1 w-8 rounded-full bg-slate-700" />
                        <div className="h-1.5 w-full rounded-full bg-slate-600/50" />
                        <div className="mt-1 h-1.5 w-2/3 rounded-full bg-slate-700/70" />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="size-3 rounded-full bg-brand-500/20" />
                          <span className="h-1 w-6 rounded-full bg-slate-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 -right-2 hidden items-center gap-1.5 rounded-md border border-line bg-elevated px-2 py-1 text-[10px] text-ink-secondary shadow-elevation-2 sm:flex">
        <ZapIcon className="size-3 text-brand-400" />
        Moves save instantly
      </div>
    </div>
  );
}

export function Landing() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-ink">
      {/* Nav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
          scrolled || isMobileMenuOpen
            ? 'border-b border-subtle bg-canvas/85 backdrop-blur-md'
            : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-panel">
              <img src="/apple-touch-icon.png" alt="" className="size-full object-cover" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">IssueFlow</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[12.5px] font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-500 px-3 text-[12.5px] font-medium text-slate-950 transition-colors hover:bg-brand-400"
              >
                Open workspace
                <ArrowRightIcon className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-8 items-center rounded-md px-3 text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-hover hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-500 px-3 text-[12.5px] font-medium text-slate-950 transition-colors hover:bg-brand-400"
                >
                  Start free
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="flex size-9 items-center justify-center rounded-md border border-subtle bg-panel text-ink-muted md:hidden"
          >
            {isMobileMenuOpen ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-subtle bg-canvas/95 px-5 py-4 backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md px-2 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-hover hover:text-ink"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-subtle pt-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-brand-500 text-[13px] font-medium text-slate-950"
                >
                  Open workspace
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-subtle bg-panel text-[13px] font-medium text-ink"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-brand-500 text-[13px] font-medium text-slate-950"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
        <div aria-hidden="true" className="surface-grid absolute inset-0 opacity-25" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/[0.06] blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-subtle bg-panel/70 px-3 py-1 text-[11px] font-medium text-ink-muted">
              <span className="size-1.5 rounded-full bg-brand-400" />
              Track. Collaborate. Ship.
            </p>

            <h1 className="max-w-xl text-[38px] font-semibold leading-[1.06] tracking-[-0.03em] text-ink sm:text-[50px] lg:text-[56px]">
              Turn scattered work into a <span className="text-gradient-brand">single flow.</span>
            </h1>

            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
              IssueFlow helps software teams capture ideas, shape them into issues, collaborate in
              context, and ship. Fast to use, easy to understand, and quiet enough to let you focus.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-5 text-[13.5px] font-medium text-slate-950 shadow-elevation-1 transition-colors hover:bg-brand-400"
              >
                {user ? 'Open your workspace' : 'Start building for free'}
                <ArrowRightIcon className="size-4" />
              </Link>
              <a
                href="#product"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-subtle bg-panel px-5 text-[13.5px] font-medium text-ink transition-colors hover:border-line hover:bg-elevated"
              >
                See the board
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-ink-disabled">
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-brand-400" />
                Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-brand-400" />
                No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <KeyboardIcon className="size-3.5 text-teal-400" />
                Keyboard-first
              </span>
            </div>
          </div>

          <div className="relative">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Product */}
      <section id="product" className="border-y border-subtle bg-sidebar/40 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-300">The work stays visible</p>
            <h2 className="mt-3 max-w-md text-[28px] font-semibold leading-tight tracking-tight text-ink md:text-[34px]">
              One board, one detail view, one shared history.
            </h2>
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
              Status, priority, assignee, comments, and activity line up in the same place. No more
              &ldquo;who changed what&rdquo; meetings or hunting across tools.
            </p>

            <ul className="mt-7 space-y-3.5">
              {[
                ['Real-time clarity', 'Status changes and comments land in the issue and the activity feed.'],
                ['Context on every card', 'Issue key, priority, assignee, and project are visible at a glance.'],
                ['Role-aware by default', 'Viewers can read the work without being shown actions they cannot take.'],
              ].map(([title, description]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/12 text-brand-300">
                    <CheckIcon className="size-3" />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-panel/70 p-2 shadow-elevation-2">
            <div className="overflow-hidden rounded-lg border border-subtle bg-canvas">
              <div className="flex items-center justify-between border-b border-subtle px-3.5 py-2.5">
                <span className="text-[11px] font-medium text-ink-secondary">Recent activity</span>
                <span className="flex items-center gap-1.5 text-[10px] text-ink-disabled">
                  <span className="size-1.5 rounded-full bg-brand-400" />
                  Live
                </span>
              </div>
              <ul className="divide-y divide-subtle">
                {[
                  ['Azeem Sanusi', 'created issue', 'WEB-42', '2m ago'],
                  ['Sarah Chen', 'changed role for', 'Alex Rivera', '14m ago'],
                  ['Alex Rivera', 'commented on', 'WEB-39', '1h ago'],
                  ['Mina Park', 'moved issue to done', 'WEB-31', '2h ago'],
                ].map(([name, action, target, time]) => (
                  <li key={`${target}-${time}`} className="flex items-start gap-2.5 px-3.5 py-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-subtle bg-elevated text-[9px] font-semibold text-ink-secondary">
                      {name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] leading-relaxed text-ink-muted">
                        <span className="font-medium text-ink">{name}</span> {action}{' '}
                        <span className="font-medium text-brand-300">{target}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-disabled">{time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-300">Built for focus</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-ink md:text-[34px]">
              Common actions, fewer steps.
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
              IssueFlow is designed around the habits of software teams: capture fast, act in context, and
              keep the interface quiet when you are reading.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-subtle bg-panel p-4 transition-[border-color,background-color] duration-150 hover:border-line hover:bg-elevated/40"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg border border-subtle bg-elevated text-brand-300 transition-colors group-hover:border-brand-500/25 group-hover:bg-brand-500/10">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="mt-3.5 text-[13px] font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="border-y border-subtle bg-sidebar/40 px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-teal-300">Works with your stack</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-ink md:text-[32px]">
              Connect the tools your team already uses.
            </h2>
            <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
              Webhooks, chat alerts, and repository links keep everyone in the loop without leaving the
              workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: GlobeIcon, title: 'Webhooks', description: 'Send issue events to your services.' },
              { icon: GitBranchIcon, title: 'Repositories', description: 'Link pull requests to issue keys.' },
              { icon: CommandIcon, title: 'Chat alerts', description: 'Post mentions and moves to a channel.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-subtle bg-panel p-4">
                  <Icon className="size-4 text-ink-muted" />
                  <p className="mt-3 text-[12.5px] font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-300">Pricing</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-ink md:text-[34px]">
              Start free. Scale when you need to.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
              Every plan includes the board, issue detail, comments, roles, and the command palette.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-subtle bg-panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-ink">Developer</h3>
                <SparklesIcon className="size-4 text-ink-disabled" />
              </div>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-tight text-ink">$0</span>
                <span className="text-[12px] text-ink-muted">forever</span>
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                For individuals and early projects that need a fast, focused tracker.
              </p>
              <ul className="mt-5 space-y-2">
                {['Unlimited projects', 'Kanban board', 'Command palette', 'Issue comments'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-ink-secondary">
                    <CheckIcon className="size-3.5 text-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-md border border-subtle bg-elevated text-[12.5px] font-medium text-ink transition-colors hover:border-line hover:bg-hover"
              >
                Start free
              </Link>
            </div>

            <div className="relative rounded-xl border border-brand-500/35 bg-panel p-5">
              <span className="absolute right-4 top-4 rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-300">
                Recommended
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-ink">Team</h3>
                <UsersIcon className="size-4 text-ink-disabled" />
              </div>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-tight text-ink">Free</span>
                <span className="text-[12px] text-ink-muted">during beta</span>
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                For growing teams that need shared workspaces, roles, and an audit trail.
              </p>
              <ul className="mt-5 space-y-2">
                {['Everything in Developer', 'Workspaces and members', 'Roles and permissions', 'Audit log'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-ink-secondary">
                    <CheckIcon className="size-3.5 text-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-md bg-brand-500 text-[12.5px] font-medium text-slate-950 transition-colors hover:bg-brand-400"
              >
                Create a workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 md:px-8 md:pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-brand-500/25 bg-panel px-6 py-12 text-center md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/[0.08] blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-[26px] font-semibold leading-tight tracking-tight text-ink md:text-[32px]">
              Move from idea to issue to done with less friction.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink-muted">
              Create a workspace, invite your team, and start tracking in minutes.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-5 text-[13px] font-medium text-slate-950 transition-colors hover:bg-brand-400"
              >
                {user ? 'Open workspace' : 'Get started free'}
                <ArrowRightIcon className="size-4" />
              </Link>
              <a
                href="https://github.com/Azeem-py/IssueFlow"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-subtle bg-canvas px-5 text-[13px] font-medium text-ink transition-colors hover:border-line hover:bg-elevated"
              >
                View the project
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-panel">
                <img src="/apple-touch-icon.png" alt="" className="size-full object-cover" />
              </span>
              <span className="text-[14px] font-semibold tracking-tight">IssueFlow</span>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
              Focused issue tracking for modern development teams. Track. Collaborate. Ship.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-disabled">Product</p>
              <ul className="mt-2.5 space-y-1.5 text-[12px] text-ink-muted">
                <li><a href="#product" className="transition-colors hover:text-ink">Board</a></li>
                <li><a href="#features" className="transition-colors hover:text-ink">Features</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-ink">Pricing</a></li>
                <li><Link to="/design-system" className="transition-colors hover:text-ink">Design system</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-disabled">Resources</p>
              <ul className="mt-2.5 space-y-1.5 text-[12px] text-ink-muted">
                <li><a href="https://github.com/Azeem-py/IssueFlow" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">GitHub</a></li>
                <li><a href="https://github.com/Azeem-py/IssueFlow/issues" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">Support</a></li>
                <li><a href="mailto:bljazeem@gmail.com" className="transition-colors hover:text-ink">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-disabled">Account</p>
              <ul className="mt-2.5 space-y-1.5 text-[12px] text-ink-muted">
                <li><Link to="/login" className="transition-colors hover:text-ink">Sign in</Link></li>
                <li><Link to="/signup" className="transition-colors hover:text-ink">Create account</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-2 border-t border-subtle pt-6 text-[11px] text-ink-disabled sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IssueFlow. All rights reserved.</p>
          <p>
            Engineered by{' '}
            <a href="https://devazeem.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-ink-muted underline decoration-slate-600 underline-offset-2 transition-colors hover:text-ink">
              Azeem Sanusi
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
