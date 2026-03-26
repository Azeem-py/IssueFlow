import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QuickAddModal } from './QuickAddModal';
import { CreateOrgModal } from './CreateOrgModal';
import { ProfileModal } from './ProfileModal';
import { Button } from '@issueflow/ui';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { usePermissions } from '../hooks/usePermissions';
import { useNotificationQueries } from '../hooks/useNotificationQueries';
import { PushNotificationManager } from './PushNotificationManager';
import { UserRole } from '@issueflow/types';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const orgSwitcherRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const { user, setRole, currentOrg, setCurrentOrg } = useAuth();
  const { logout, useOrganizations } = useAuthQueries();
  const { data: organizations } = useOrganizations();
  const { canCreateIssues } = usePermissions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { useMyNotifications, markAsRead, markAllAsRead } = useNotificationQueries();
  const { data: notifications = [] } = useMyNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Close sidebar on route change
    setIsSidebarOpen(false);
  }, [location.pathname]);

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

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'Issues', icon: 'confirmation_number', path: '/dashboard/issues' },
    { label: 'Projects', icon: 'tactic', path: '/dashboard/projects' },
    { label: 'Team', icon: 'group', path: '/dashboard/team' },
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
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 mb-4">
          <Link to="/" className="flex items-center gap-2 group transition-all">
            <div className="size-8 rounded-lg overflow-hidden shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <img src="/apple-touch-icon.png" alt="IssueFlow" className="size-full object-cover" />
            </div>
            <h1 className="text-lg text-brand">IssueFlow</h1>
          </Link>
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
          
          <button
            onClick={() => setIsProfileOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isProfileOpen
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-sm font-medium">Profile</span>
          </button>
          
          <Link
            to="/support"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">help_center</span>
            <span className="text-sm font-medium">Support</span>
          </Link>
          
          <PushNotificationManager />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0 border-2 border-transparent hover:border-primary transition-all cursor-pointer overflow-hidden shadow-inner"
              style={user?.avatarUrl ? { backgroundImage: `url('${user.avatarUrl}')` } : {}}
            >
               {!user?.avatarUrl && <div className="size-full flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-sm">person</span></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight">{user?.name || 'User'}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-primary/70 uppercase font-black tracking-widest bg-primary/5 px-1.5 py-0.5 rounded leading-none">
                  {user?.role?.toLowerCase()}
                </span>
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
                {currentOrg?.logoUrl ? (
                  <div className="size-6 rounded-md overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                    <img src={currentOrg.logoUrl} className="size-full object-cover" alt="Org Logo" />
                  </div>
                ) : (
                  <span className="text-[10px] md:text-sm font-semibold tracking-wide bg-slate-100 dark:bg-slate-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-slate-500">{currentOrg?.slug?.charAt(0) || 'W'}</span>
                )}
                <div className="flex items-center gap-1 md:gap-1.5 text-slate-900 dark:text-slate-100">
                  <span className="text-sm font-bold truncate max-w-[80px] md:max-w-none tracking-tight">{currentOrg?.name || 'Select Workspace'}</span>
                  <span className={`material-symbols-outlined text-sm transition-transform ${isOrgSwitcherOpen ? 'rotate-180' : ''}`}>unfold_more</span>
                </div>
              </div>


              {/* Org Switcher Dropdown */}
              {isOrgSwitcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Workspaces</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto px-2 space-y-1">
                    {organizations?.map((org: any) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          setCurrentOrg(org);
                          setIsOrgSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors ${
                          currentOrg?.id === org.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {org.logoUrl ? (
                            <img src={org.logoUrl} className="size-6 rounded-md object-cover border border-slate-200 dark:border-slate-700" alt="" />
                          ) : (
                            <div className={`size-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold ${currentOrg?.id === org.id ? 'text-primary' : ''}`}>
                              {org.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-bold truncate">{org.name}</span>
                        </div>
                        {currentOrg?.id === org.id && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2">
                    <button 
                      onClick={() => {
                        setIsCreateOrgOpen(true);
                        setIsOrgSwitcherOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-primary hover:bg-primary/5 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      Create New Org
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative max-w-md hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-48 xl:w-64 focus:ring-4 focus:ring-primary/10 transition-all font-medium" placeholder="Search anything..." type="text" />
            </div>
            <button 
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
              title="Toggle theme"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="relative" ref={notificationsRef}>
              <button 
                type="button" 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifications</p>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead.mutate()}
                        className="text-[10px] text-primary font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_off</span>
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                          >
                            <Link 
                              to={`/dashboard/issues/${notif.issue?.id}`} 
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                if (!notif.read) markAsRead.mutate(notif.id);
                              }}
                              className="flex gap-3"
                            >
                              <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 mt-1">
                                {notif.actor?.avatarUrl ? (
                                  <img src={notif.actor.avatarUrl} alt="" className="size-full object-cover" />
                                ) : (
                                  <div className="size-full flex items-center justify-center font-bold text-xs">
                                    {notif.actor?.name?.charAt(0) || '?'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                                  <span className="font-bold">{notif.actor?.name}</span> mentioned you in an issue.
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-bold">{notif.issue?.shortId}: {notif.issue?.title}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {canCreateIssues && (
              <Button 
                onClick={() => setIsQuickAddOpen(true)}
                icon="add"
                className="!px-3 sm:!px-5 !rounded-xl !font-black !uppercase !text-[10px] !tracking-widest !shadow-lg !shadow-primary/25"
              >
                <span className="hidden sm:inline">New Issue</span>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-4 md:p-8">
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
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </div>
  );
}
