import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  FolderKanbanIcon,
  HomeIcon,
  InboxIcon,
  Kbd,
  PlusIcon,
  SearchIcon,
  UsersIcon,
} from '@issueflow/ui';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { usePermissions } from '../hooks/usePermissions';
import { KeyboardHint } from './KeyboardHint';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: () => void;
}

interface RecentSearch {
  id: string;
  type: 'project' | 'issue';
  title: string;
  subtitle: string;
  path: string;
}

const itemClass =
  'flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 text-[13px] text-ink-secondary transition-colors data-[selected=true]:bg-hover data-[selected=true]:text-ink';
const groupClass =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-ink-disabled';

export function CommandPalette({ isOpen, onClose, onOpenQuickAdd }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { useProjects } = useProjectQueries();
  const { useIssues } = useIssueQueries();
  const { canCreateIssues } = usePermissions();

  const { data: projects = [] } = useProjects();
  const { data: issues = [] } = useIssues();

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('issueflow-recent-searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (error) {
      // Ignore malformed local history.
    }
  }, []);

  const addRecentSearch = (item: RecentSearch) => {
    setRecentSearches((previous) => {
      const filtered = previous.filter((entry) => entry.id !== item.id);
      const next = [item, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('issueflow-recent-searches', JSON.stringify(next));
      } catch (error) {
        // Ignore storage failures.
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.getAttribute('role') === 'dialog' ||
          activeElement.closest('[cmdk-root]'))
      ) {
        const hasModifier = event.ctrlKey || event.metaKey;
        const isEmpty = (event.target as HTMLInputElement)?.value === '';

        if (event.key === 'j' && (hasModifier || isEmpty)) {
          activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          event.preventDefault();
        } else if (event.key === 'k' && (hasModifier || isEmpty)) {
          activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
          event.preventDefault();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (callback: () => void, itemToRecord?: RecentSearch) => {
    if (itemToRecord) addRecentSearch(itemToRecord);
    callback();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-xl border border-line bg-elevated shadow-elevation-4">
        <Command
          label="Command palette"
          className="flex w-full flex-col"
          shouldFilter
          filter={(value, search) => (value.includes(search.toLowerCase()) ? 1 : 0)}
          loop
        >
          <div className="flex items-center gap-2.5 border-b border-subtle px-3.5 py-3">
            <SearchIcon className="size-4 shrink-0 text-ink-muted" />
            <Command.Input
              placeholder="Search issues, projects, or run a command…"
              className="h-6 w-full flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-muted"
              autoFocus
            />
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded border border-subtle px-1.5 py-0.5 text-ink-muted transition-colors hover:bg-hover hover:text-ink"
              aria-label="Close command palette"
            >
              <Kbd className="border-0 bg-transparent p-0 shadow-none">Esc</Kbd>
            </button>
          </div>

          <Command.List className="max-h-[58vh] overflow-y-auto p-2 app-scrollbar">
            <Command.Empty className="px-4 py-12 text-center">
              <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg border border-subtle bg-panel text-ink-disabled">
                <SearchIcon className="size-4" />
              </span>
              <p className="text-[13px] font-medium text-ink">No results</p>
              <p className="mt-1 text-[12px] text-ink-muted">Try a different issue key, title, or command.</p>
            </Command.Empty>

            <Command.Group heading="Actions" className={groupClass}>
              {canCreateIssues && (
                <Command.Item
                  value="action create new issue"
                  onSelect={() => handleSelect(onOpenQuickAdd)}
                  className={itemClass}
                >
                  <PlusIcon className="size-4 shrink-0 text-brand-300" />
                  <span className="flex-1">Create new issue</span>
                  <KeyboardHint keys={['C']} />
                </Command.Item>
              )}
              <Command.Item
                value="action go home dashboard"
                onSelect={() => handleSelect(() => navigate('/dashboard'))}
                className={itemClass}
              >
                <HomeIcon className="size-4 shrink-0 text-ink-muted" />
                <span className="flex-1">Go to home</span>
                <KeyboardHint keys={['G', 'H']} />
              </Command.Item>
              <Command.Item
                value="action go to issues board"
                onSelect={() => handleSelect(() => navigate('/dashboard/issues'))}
                className={itemClass}
              >
                <InboxIcon className="size-4 shrink-0 text-ink-muted" />
                <span className="flex-1">Go to issues</span>
                <KeyboardHint keys={['G', 'I']} />
              </Command.Item>
              <Command.Item
                value="action go to projects"
                onSelect={() => handleSelect(() => navigate('/dashboard/projects'))}
                className={itemClass}
              >
                <FolderKanbanIcon className="size-4 shrink-0 text-ink-muted" />
                <span className="flex-1">Go to projects</span>
                <KeyboardHint keys={['G', 'P']} />
              </Command.Item>
              <Command.Item
                value="action go to team settings members"
                onSelect={() => handleSelect(() => navigate('/dashboard/team'))}
                className={itemClass}
              >
                <UsersIcon className="size-4 shrink-0 text-ink-muted" />
                <span className="flex-1">Go to team</span>
                <KeyboardHint keys={['G', 'T']} />
              </Command.Item>
            </Command.Group>

            {recentSearches.length > 0 && (
              <Command.Group heading="Recently opened" className={groupClass}>
                {recentSearches.map((item) => (
                  <Command.Item
                    key={`recent-${item.id}`}
                    value={`recent ${item.title} ${item.subtitle}`.toLowerCase()}
                    onSelect={() => handleSelect(() => navigate(item.path), item)}
                    className={itemClass}
                  >
                    <ClockIcon className="size-4 shrink-0 text-ink-disabled" />
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-disabled">{item.subtitle}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {projects.length > 0 && (
              <Command.Group heading="Projects" className={groupClass}>
                {projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`${project.name} ${project.key}`.toLowerCase()}
                    onSelect={() =>
                      handleSelect(() => navigate(`/dashboard/projects/${project.id}`), {
                        id: project.id,
                        type: 'project',
                        title: project.name,
                        subtitle: project.key,
                        path: `/dashboard/projects/${project.id}`,
                      })
                    }
                    className={itemClass}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded border border-subtle bg-canvas text-[9px] font-semibold text-ink-secondary">
                      {project.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{project.name}</span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-disabled">{project.key}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {issues.length > 0 && (
              <Command.Group heading="Issues" className={groupClass}>
                {issues.slice(0, 12).map((issue) => (
                  <Command.Item
                    key={issue.id}
                    value={`${issue.shortId} ${issue.title}`.toLowerCase()}
                    onSelect={() =>
                      handleSelect(() => navigate(`/dashboard/issues/${issue.id}`), {
                        id: issue.id,
                        type: 'issue',
                        title: issue.title,
                        subtitle: issue.shortId,
                        path: `/dashboard/issues/${issue.id}`,
                      })
                    }
                    className={itemClass}
                  >
                    <InboxIcon className="size-4 shrink-0 text-ink-disabled" />
                    <span className="min-w-0 flex-1 truncate">{issue.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-disabled">{issue.shortId}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center justify-between gap-3 border-t border-subtle px-3.5 py-2 text-[11px] text-ink-disabled">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Esc</Kbd>
                close
              </span>
            </span>
            <span className="hidden sm:inline">J / K also navigates</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
