import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderKanbanIcon,
  HomeIcon,
  InboxIcon,
  Kbd,
  LifeBuoyIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  XIcon,
  BellIcon,
  type IconProps,
} from '@issueflow/ui';
import { QuickAddModal } from './QuickAddModal';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CreateOrgModal } from './CreateOrgModal';
import { ProfileModal } from './ProfileModal';
import { useAuth } from '../contexts/AuthContext';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { usePermissions } from '../hooks/usePermissions';
import { useNotificationQueries } from '../hooks/useNotificationQueries';
import { PushNotificationManager } from './PushNotificationManager';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<IconProps>;
  path: string;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: HomeIcon, path: '/dashboard', match: (p) => p === '/dashboard' },
  {
    label: 'Issues',
    icon: InboxIcon,
    path: '/dashboard/issues',
    match: (p) => p.startsWith('/dashboard/issues'),
  },
  {
    label: 'Projects',
    icon: FolderKanbanIcon,
    path: '/dashboard/projects',
    match: (p) => p.startsWith('/dashboard/projects'),
  },
  {
    label: 'Team',
    icon: UsersIcon,
    path: '/dashboard/team',
    match: (p) => p.startsWith('/dashboard/team'),
  },
];

function pageTitle(pathname: string) {
  if (pathname === '/dashboard') return 'Home';
  if (pathname.startsWith('/dashboard/issues/')) return 'Issue';
  if (pathname.startsWith('/dashboard/issues')) return 'Issues';
  if (pathname.startsWith('/dashboard/projects/')) return 'Project';
  if (pathname.startsWith('/dashboard/projects')) return 'Projects';
  if (pathname.startsWith('/dashboard/team')) return 'Team';
  if (pathname.startsWith('/design-system')) return 'Design system';
  return 'Workspace';
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const orgSwitcherRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const sidebarCloseRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const hasOpenedSidebar = useRef(false);

  const { canCreateIssues, role } = usePermissions();
  const { user, currentOrg, setCurrentOrg } = useAuth();
  const { logout, useOrganizations } = useAuthQueries();
  const { data: organizations = [] } = useOrganizations();
  const { useMyNotifications, markAsRead, markAllAsRead } = useNotificationQueries();
  const { data: notifications = [] } = useMyNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useKeyboardShortcuts({
    'cmd+k': () => setIsCommandPaletteOpen((prev) => !prev),
    ...(canCreateIssues ? { c: () => setIsQuickAddOpen(true) } : {}),
    'g i': () => navigate('/dashboard/issues'),
    'g p': () => navigate('/dashboard/projects'),
    'g t': () => navigate('/dashboard/team'),
  });

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsOrgSwitcherOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setIsSidebarOpen(false);
      setIsOrgSwitcherOpen(false);
      setIsNotificationsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      hasOpenedSidebar.current = true;
      sidebarCloseRef.current?.focus();
    } else if (hasOpenedSidebar.current) {
      menuButtonRef.current?.focus();
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgSwitcherRef.current && !orgSwitcherRef.current.contains(event.target as Node)) {
        setIsOrgSwitcherOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const workspaceLabel = currentOrg?.name || 'No workspace';
  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Member';

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-subtle px-4">
        <Link to="/dashboard" className="group flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-panel shadow-elevation-1">
            <img src="/apple-touch-icon.png" alt="" className="size-full object-cover" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">IssueFlow</span>
        </Link>
        <button
          ref={sidebarCloseRef}
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-hover hover:text-ink md:hidden"
          aria-label="Close navigation"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 pt-3" ref={orgSwitcherRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOrgSwitcherOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isOrgSwitcherOpen}
            className="flex w-full items-center gap-2.5 rounded-lg border border-subtle bg-panel px-2.5 py-2 text-left transition-colors duration-150 hover:border-line hover:bg-elevated"
          >
            {currentOrg?.logoUrl ? (
              <img
                src={currentOrg.logoUrl}
                alt=""
                className="size-7 shrink-0 rounded-md border border-subtle object-cover"
              />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-500/12 text-[11px] font-semibold text-brand-300">
                {currentOrg?.name?.charAt(0)?.toUpperCase() || 'W'}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium leading-tight text-ink">
                {workspaceLabel}
              </span>
              <span className="mt-0.5 block text-[11px] leading-none text-ink-muted">{roleLabel}</span>
            </span>
            <ChevronDownIcon
              className={`size-3.5 shrink-0 text-ink-muted transition-transform duration-150 ${
                isOrgSwitcherOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOrgSwitcherOpen && (
            <div
              role="menu"
              className="absolute left-0 right-0 top-full z-50 mt-1.5 animate-scale-in overflow-hidden rounded-lg border border-line bg-elevated shadow-elevation-3"
            >
              <div className="border-b border-subtle px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                  Workspaces
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5 app-scrollbar">
                {organizations.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-ink-muted">No workspaces yet.</p>
                ) : (
                  organizations.map((org: any) => {
                    const active = currentOrg?.id === org.id;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setCurrentOrg(org);
                          setIsOrgSwitcherOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors ${
                          active ? 'bg-brand-500/10 text-brand-200' : 'text-ink-secondary hover:bg-hover'
                        }`}
                      >
                        {org.logoUrl ? (
                          <img src={org.logoUrl} alt="" className="size-6 rounded border border-subtle object-cover" />
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded border border-subtle bg-canvas text-[10px] font-semibold">
                            {org.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{org.name}</span>
                        {active && <span className="size-1.5 rounded-full bg-brand-400" aria-label="Current workspace" />}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="border-t border-subtle p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsCreateOrgOpen(true);
                    setIsOrgSwitcherOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
                >
                  <PlusIcon className="size-4" />
                  Create workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 app-scrollbar" aria-label="Workspace">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-disabled">
          Workspace
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-brand-500/10 text-brand-200'
                    : 'text-ink-muted hover:bg-hover/70 hover:text-ink'
                }`}
              >
                {active && (
                  <span aria-hidden="true" className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-400" />
                )}
                <Icon className={`size-4 shrink-0 ${active ? 'text-brand-300' : 'text-ink-disabled group-hover:text-ink-muted'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <p className="mb-2 mt-6 px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-disabled">
          Tools
        </p>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-ink-muted transition-colors duration-150 hover:bg-hover/70 hover:text-ink"
          >
            <SearchIcon className="size-4 shrink-0 text-ink-disabled" />
            <span className="flex-1 text-left">Search</span>
            <Kbd className="h-4 min-w-4 border-0 bg-transparent px-0 text-[10px] text-ink-disabled shadow-none">⌘K</Kbd>
          </button>
          <a
            href="https://github.com/Azeem-py/IssueFlow/issues"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-ink-muted transition-colors duration-150 hover:bg-hover/70 hover:text-ink"
          >
            <LifeBuoyIcon className="size-4 shrink-0 text-ink-disabled" />
            Support
          </a>
        </div>

        <div className="mt-4">
          <PushNotificationManager />
        </div>
      </nav>

      {/* Account */}
      <div className="shrink-0 border-t border-subtle p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-1.5">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            title="Account settings"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left focus-visible:outline-none"
          >
            <Avatar src={user?.avatarUrl} name={user?.name || user?.email} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium leading-tight text-ink">
                {user?.name || 'Account'}
              </span>
              <span className="mt-0.5 block truncate text-[11px] leading-none text-ink-muted">
                {user?.email}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => logout.mutate()}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-md p-1.5 text-ink-disabled transition-colors hover:bg-danger/10 hover:text-red-300"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 px-2">
          <ShieldRole role={role} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: persistent on desktop, drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-subtle bg-sidebar transition-transform duration-200 ease-standard md:static md:z-auto md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-subtle bg-canvas/85 px-4 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-hover hover:text-ink md:hidden"
              aria-label="Open navigation"
            >
              <MenuIcon className="size-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <span className="hidden max-w-40 truncate text-ink-muted sm:inline">{workspaceLabel}</span>
              <ChevronRightIcon className="hidden size-3.5 shrink-0 text-ink-disabled sm:block" />
              <span className="truncate font-medium text-ink">{pageTitle(location.pathname)}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Search workspace"
              className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hover hover:text-ink sm:hidden"
            >
              <SearchIcon className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden h-8 items-center gap-2 rounded-md border border-subtle bg-panel/70 px-2.5 text-[12px] text-ink-muted transition-colors hover:border-line hover:bg-elevated hover:text-ink sm:flex"
            >
              <SearchIcon className="size-3.5" />
              <span className="pr-6">Search workspace</span>
              <Kbd className="h-4 min-w-4 px-1 text-[10px]">⌘K</Kbd>
            </button>

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((open) => !open)}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isNotificationsOpen}
                className="relative flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hover hover:text-ink"
              >
                <BellIcon className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand-400 ring-2 ring-canvas" />
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  role="region"
                  aria-label="Notifications"
                  className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] animate-scale-in overflow-hidden rounded-xl border border-line bg-elevated shadow-elevation-3"
                >
                  <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
                    <p className="text-[13px] font-semibold text-ink">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllAsRead.mutate()}
                        className="text-[11px] font-medium text-brand-300 transition-colors hover:text-brand-200"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[26rem] overflow-y-auto app-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center px-5 py-10 text-center">
                        <span className="mb-3 flex size-10 items-center justify-center rounded-lg border border-subtle bg-panel text-ink-disabled">
                          <BellIcon className="size-4" />
                        </span>
                        <p className="text-[13px] font-medium text-ink">You&apos;re all caught up</p>
                        <p className="mt-1 text-xs text-ink-muted">Mentions and assignments appear here.</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-subtle">
                        {notifications.map((notif) => (
                          <li key={notif.id}>
                            <Link
                              to={`/dashboard/issues/${notif.issue?.id}`}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                if (!notif.read) markAsRead.mutate(notif.id);
                              }}
                              className={`flex gap-3 px-4 py-3 transition-colors hover:bg-hover ${
                                notif.read ? '' : 'bg-brand-500/[0.06]'
                              }`}
                            >
                              <Avatar src={notif.actor?.avatarUrl} name={notif.actor?.name} size="sm" className="mt-0.5" />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[12.5px] leading-snug text-ink-secondary">
                                  <span className="font-medium text-ink">{notif.actor?.name}</span> mentioned you
                                </span>
                                <span className="mt-1 block truncate font-mono text-[11px] text-ink-muted">
                                  {notif.issue?.shortId}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-ink-disabled">
                                  {new Date(notif.createdAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </span>
                              {!notif.read && (
                                <span aria-label="Unread" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" />
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {canCreateIssues && (
              <Button onClick={() => setIsQuickAddOpen(true)} size="sm" icon={<PlusIcon className="size-4" />}>
                <span className="hidden sm:inline">New issue</span>
                <span className="sm:hidden">New</span>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto app-scrollbar">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 md:py-6 lg:px-8">{children}</div>
        </main>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />
      <CreateOrgModal
        isOpen={isCreateOrgOpen}
        onClose={() => setIsCreateOrgOpen(false)}
        onSuccess={(org) => setCurrentOrg(org)}
      />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </div>
  );
}

function ShieldRole({ role }: { role?: string }) {
  const label = role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Member';
  return (
    <Badge tone={role === 'OWNER' ? 'brand' : role === 'ADMIN' ? 'teal' : 'neutral'} dot>
      {label}
    </Badge>
  );
}
