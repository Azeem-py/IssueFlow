import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useIssueQueries } from '../hooks/useIssueQueries';
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

export function CommandPalette({ isOpen, onClose, onOpenQuickAdd }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { useProjects } = useProjectQueries();
  const { useIssues } = useIssueQueries();

  const { data: projects = [] } = useProjects();
  const { data: issues = [] } = useIssues();

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('issueflow-recent-searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  const addRecentSearch = (item: RecentSearch) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(x => x.id !== item.id);
      const newRecent = [item, ...filtered].slice(0, 5);

      try {
        localStorage.setItem('issueflow-recent-searches', JSON.stringify(newRecent));
      } catch (e) {
        // ignore
      }
      return newRecent;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Vim style navigation (j = down, k = up)
      // Only trigger if focus is on the input or within the dialog to avoid global conflicts
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.getAttribute('role') === 'dialog' || activeElement.closest('[cmdk-root]'))
      ) {
        const isJ = e.key === 'j';
        const isK = e.key === 'k';
        const hasModifier = e.ctrlKey || e.metaKey;
        const isEmpty = (e.target as HTMLInputElement)?.value === '';

        // Allow J/K to navigate if it's accompanied by Ctrl/Cmd OR if the input is completely empty
        if (isJ && (hasModifier || isEmpty)) {
          // Dispatch ArrowDown
          const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
          activeElement.dispatchEvent(arrowDownEvent);
          e.preventDefault();
        } else if (isK && (hasModifier || isEmpty)) {
          // Dispatch ArrowUp
          const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
          activeElement.dispatchEvent(arrowUpEvent);
          e.preventDefault();
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
    if (itemToRecord) {
      addRecentSearch(itemToRecord);
    }
    callback();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#1a1933] shadow-2xl border border-slate-200 dark:border-primary/20 animate-in fade-in zoom-in-95 duration-200">
        <Command
          label="Command Palette"
          className="w-full flex flex-col"
          shouldFilter={true}
          filter={(value, search) => {
            if (value.includes(search.toLowerCase())) return 1;
            return 0;
          }}
          loop
        >
          <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-primary/10">
            <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
            <Command.Input
              placeholder="Search projects, issues, or type a command... (J/K to navigate)"
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-[#9392c9] text-lg w-full h-full"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 rounded bg-slate-100 dark:bg-[#111022] text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs font-mono font-bold border border-slate-200 dark:border-[#333267]"
            >
              ESC
            </button>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar outline-none">
            <Command.Empty className="p-8 text-center text-slate-500 dark:text-slate-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions" className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2 py-2">
              <Command.Item
                value="action create new issue"
                onSelect={() => handleSelect(() => onOpenQuickAdd())}
                className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-primary/10 aria-selected:bg-slate-100 dark:aria-selected:bg-primary/10 data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-primary/10 transition-colors"
              >
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary text-base shrink-0">add_circle</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Create New Issue</span>
                 </div>
                 <KeyboardHint keys={['C']} />
              </Command.Item>
              <Command.Item
                value="action go to team settings"
                onSelect={() => handleSelect(() => navigate('/dashboard/team'))}
                className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-primary/10 aria-selected:bg-slate-100 dark:aria-selected:bg-primary/10 data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-primary/10 transition-colors"
              >
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary text-base shrink-0">group</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Go to Team Settings</span>
                 </div>
                 <KeyboardHint keys={['G', 'T']} />
              </Command.Item>
            </Command.Group>

            {recentSearches.length > 0 && (
              <Command.Group heading="Recent" className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2 py-2 mt-2 border-t border-slate-100 dark:border-primary/5 pt-4">
                {recentSearches.map((item) => (
                  <Command.Item
                    key={`recent-${item.id}`}
                    value={`recent ${item.title} ${item.subtitle}`.toLowerCase()}
                    onSelect={() => handleSelect(() => navigate(item.path), item)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-primary/10 aria-selected:bg-slate-100 dark:aria-selected:bg-primary/10 data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-primary/10 transition-colors"
                  >
                     <div className="flex items-center gap-3 flex-1 min-w-0 pr-4 opacity-80">
                       <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                         {item.type === 'project' ? 'folder' : 'task_alt'}
                       </span>
                       <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.title}</span>
                     </div>
                     <span className="text-xs text-slate-400 font-mono font-bold shrink-0">{item.subtitle}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {projects.length > 0 && (
              <Command.Group heading="Projects" className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2 py-2 mt-2 border-t border-slate-100 dark:border-primary/5 pt-4">
                {projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`${project.name} ${project.key}`.toLowerCase()}
                    onSelect={() => handleSelect(() => navigate(`/dashboard/projects/${project.id}`), {
                      id: project.id,
                      type: 'project',
                      title: project.name,
                      subtitle: project.key,
                      path: `/dashboard/projects/${project.id}`
                    })}
                    className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-primary/10 aria-selected:bg-slate-100 dark:aria-selected:bg-primary/10 data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-primary/10 transition-colors"
                  >
                     <div className="flex items-center gap-3">
                       <div className="size-6 bg-primary/20 rounded flex items-center justify-center text-[10px] font-black text-primary">
                         {project.name.charAt(0)}
                       </div>
                       <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.name}</span>
                     </div>
                     <span className="text-xs text-slate-400 font-mono font-bold">{project.key}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {issues.length > 0 && (
              <Command.Group heading="Issues" className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2 py-2 mt-2 border-t border-slate-100 dark:border-primary/5 pt-4">
                {issues.map((issue) => (
                  <Command.Item
                    key={issue.id}
                    value={`${issue.shortId} ${issue.title}`.toLowerCase()}
                    onSelect={() => handleSelect(() => navigate(`/dashboard/issues/${issue.id}`), {
                      id: issue.id,
                      type: 'issue',
                      title: issue.title,
                      subtitle: issue.shortId,
                      path: `/dashboard/issues/${issue.id}`
                    })}
                    className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-primary/10 aria-selected:bg-slate-100 dark:aria-selected:bg-primary/10 data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-primary/10 transition-colors"
                  >
                     <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                       <span className="material-symbols-outlined text-slate-400 text-base shrink-0">task_alt</span>
                       <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{issue.title}</span>
                     </div>
                     <span className="text-xs text-slate-400 font-mono font-bold shrink-0">{issue.shortId}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

          </Command.List>
        </Command>
      </div>
    </div>
  );
}
