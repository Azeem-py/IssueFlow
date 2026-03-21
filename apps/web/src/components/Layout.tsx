import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QuickAddModal } from './QuickAddModal';
import { CreateOrgModal } from './CreateOrgModal';
import { Button } from '@issueflow/ui';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole } from '@issueflow/types';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const orgSwitcherRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const { user, setRole, currentOrg, setCurrentOrg } = useAuth();
  const { logout, useOrganizations } = useAuthQueries();
  const { data: organizations } = useOrganizations();
  const { canCreateIssues } = usePermissions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar on route change
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgSwitcherRef.current && !orgSwitcherRef.current.contains(event.target as Node)) {
        setIsOrgSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/' },
    { label: 'Issues', icon: 'confirmation_number', path: '/issues' },
    { label: 'Projects', icon: 'tactic', path: '/projects' },
    { label: 'Team', icon: 'group', path: '/team' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">fluid</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary">IssueFlow</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
          
          <div className="pt-4 pb-2 px-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Settings</p>
          </div>
          
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/settings'
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
          
          <Link
            to="/support"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">help_center</span>
            <span className="text-sm font-medium">Support</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${user?.img}')` }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <div className="flex items-center gap-2">
                <select 
                  value={user?.role} 
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="text-[10px] text-slate-500 bg-transparent border-none p-0 h-auto cursor-pointer focus:ring-0 uppercase font-bold tracking-wider"
                >
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <button 
                  onClick={() => logout.mutate()}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative" ref={orgSwitcherRef}>
              <div 
                onClick={() => setIsOrgSwitcherOpen(!isOrgSwitcherOpen)}
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-1 md:px-2 py-1 md:py-1.5 rounded-lg transition-colors"
              >
                <span className="text-[10px] md:text-sm font-semibold tracking-wide bg-slate-100 dark:bg-slate-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-slate-500">{currentOrg?.slug || 'no-org'}</span>
                <div className="flex items-center gap-1 md:gap-1.5 text-slate-900 dark:text-slate-100">
                  <span className="text-sm font-medium truncate max-w-[80px] md:max-w-none">{currentOrg?.name || 'Workspace'}</span>
                  <span className={`material-symbols-outlined text-sm transition-transform ${isOrgSwitcherOpen ? 'rotate-180' : ''}`}>unfold_more</span>
                </div>
              </div>


              {/* Org Switcher Dropdown */}
              {isOrgSwitcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Workspaces</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto px-2 space-y-1">
                    {organizations?.map((org: any) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          setCurrentOrg(org);
                          setIsOrgSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                          currentOrg?.id === org.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`size-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold ${currentOrg?.id === org.id ? 'text-primary' : ''}`}>
                            {org.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium truncate">{org.name}</span>
                        </div>
                        {currentOrg?.id === org.id && <span className="material-symbols-outlined text-sm">check</span>}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 px-2">
                    <button 
                      onClick={() => {
                        setIsCreateOrgOpen(true);
                        setIsOrgSwitcherOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary hover:bg-primary/5 transition-colors text-sm font-semibold"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      Create Organization
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative max-w-md hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-1.5 text-sm w-48 xl:w-64 focus:ring-2 focus:ring-primary transition-all" placeholder="Search..." type="text" />
            </div>
            <button 
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
              title="Toggle theme"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button type="button" className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
            </button>
            {canCreateIssues && (
              <Button 
                onClick={() => setIsQuickAddOpen(true)}
                icon="add"
                className="!px-3 sm:!px-4"
              >
                <span className="hidden sm:inline">New Issue</span>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <CreateOrgModal 
        isOpen={isCreateOrgOpen} 
        onClose={() => setIsCreateOrgOpen(false)} 
        onSuccess={(org) => setCurrentOrg(org)}
      />
    </div>
  );
}
