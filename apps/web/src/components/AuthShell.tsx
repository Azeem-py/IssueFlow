import React from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CommandIcon,
  GitBranchIcon,
  ShieldIcon,
  ZapIcon,
} from '@issueflow/ui';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

const highlights = [
  { icon: ZapIcon, title: 'Fast by default', description: 'Quick-add, command search, and keyboard-first flows.' },
  { icon: ActivityIcon, title: 'One shared flow', description: 'Issues, comments, and activity stay in context.' },
  { icon: ShieldIcon, title: 'Permission-aware', description: 'Roles are reflected in the UI and enforced by the API.' },
];

export function AuthShell({ title, description, children, footer, wide = false }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] shrink-0 overflow-hidden border-r border-subtle bg-sidebar lg:flex lg:flex-col">
        <div aria-hidden="true" className="surface-grid absolute inset-0 opacity-40" />
        <div
          aria-hidden="true"
          className="absolute -left-24 top-1/3 size-[28rem] rounded-full bg-brand-500/[0.07] blur-3xl"
        />

        <div className="relative flex items-center gap-2.5 px-10 pt-9">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-panel">
            <img src="/apple-touch-icon.png" alt="" className="size-full object-cover" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">IssueFlow</span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center px-10 py-14 xl:px-14">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-subtle bg-panel/70 px-3 py-1 text-[11px] font-medium text-ink-muted">
            <span className="size-1.5 rounded-full bg-brand-400" />
            Track. Collaborate. Ship.
          </p>
          <h2 className="max-w-md text-[34px] font-semibold leading-[1.15] tracking-tight text-ink xl:text-[38px]">
            Turn scattered work into a single, shared flow.
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-muted">
            Capture an idea, shape it into an issue, collaborate in context, and move it to done
            without losing the thread.
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-subtle bg-panel text-brand-300">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-ink">{item.title}</span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-muted">
                      {item.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 flex flex-wrap items-center gap-4 text-[11px] text-ink-disabled">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon className="size-3.5 text-brand-400" />
              Free to start
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GitBranchIcon className="size-3.5 text-teal-400" />
              Built for software teams
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CommandIcon className="size-3.5 text-cyan-400" />
              Keyboard-first
            </span>
          </div>
        </div>

        <p className="relative px-10 pb-8 text-[11px] text-ink-disabled xl:px-14">
          IssueFlow — focused issue tracking for modern development teams.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-5 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to home
          </Link>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-panel">
              <img src="/apple-touch-icon.png" alt="" className="size-full object-cover" />
            </span>
            <span className="text-[14px] font-semibold tracking-tight text-ink">IssueFlow</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 md:px-8">
          <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-[400px]'}`}>
            <div className="mb-7">
              <h1 className="text-[24px] font-semibold tracking-tight text-ink">{title}</h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{description}</p>
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-[12.5px] text-ink-muted">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
