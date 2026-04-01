import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useDashboardQueries } from '../hooks/useDashboardQueries';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { CreateOrgModal } from '../components/CreateOrgModal';
import api from '../lib/api';

export function Dashboard() {
  const { currentOrg, setCurrentOrg, refreshUser } = useAuth();
  const { isOwner, isAdmin, isMember, isViewer, canManageBilling, canInviteMembers, canViewAuditLogs, role } = usePermissions();
  const { useDashboardStats, useActivityFeed, useAuditLogs } = useDashboardQueries();
  const { useMyInvitations, declineInvitation } = useAuthQueries();

  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats();
  const { data: activityFeed, isLoading: isLoadingActivity } = useActivityFeed();
  const { data: auditLogs, isLoading: isLoadingAudit } = useAuditLogs();
  const { data: myInvitations, isLoading: isLoadingInvites } = useMyInvitations();

  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);

  const baseStats = statsData?.baseStats || [];
  const advancedStats = statsData?.advancedStats || [];

  const statsToRender = canInviteMembers ? [...baseStats, ...advancedStats] : baseStats;

  const handleAcceptInvite = async (token: string, inviteId: string) => {
    setAcceptingInviteId(inviteId);
    try {
      await api.post('/organizations/invites/accept', { token });
      await refreshUser();
    } catch (err) {
      console.error('Failed to accept invite', err);
    } finally {
      setAcceptingInviteId(null);
    }
  };

  if (!currentOrg) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">rocket_launch</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Welcome to IssueFlow</h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            You are not part of any organization yet. Create your own workspace or check your pending invitations to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Org Card */}
          <div className="bg-white dark:bg-card-dark rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between hover:border-primary/50 transition-colors group">
            <div>
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">add_business</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Create Workspace</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Start fresh with your own organization. You'll be the owner and can invite your team.
              </p>
            </div>
            <button 
              onClick={() => setIsCreateOrgOpen(true)}
              className="w-full py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Start Building
            </button>
          </div>

          {/* Invitations Card */}
          <div className="bg-white dark:bg-card-dark rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500">mail</span>
              </div>
              {myInvitations && myInvitations.length > 0 && (
                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {myInvitations.length} Pending
                </span>
              )}
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Join Workspace</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Check if your teammates have already invited you to a workspace.
            </p>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
              {isLoadingInvites ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>
              ) : myInvitations && myInvitations.length > 0 ? (
                myInvitations.map((invite: any) => (
                  <div key={invite.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {invite.organization.logoUrl ? (
                        <img src={invite.organization.logoUrl} className="size-8 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="size-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                          {invite.organization.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{invite.organization.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Role: {invite.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => declineInvitation.mutate(invite.id)}
                        disabled={declineInvitation.isPending || acceptingInviteId === invite.id}
                        className="p-2 text-slate-500 hover:text-rose-500 transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                      <button 
                        onClick={() => handleAcceptInvite(invite.token, invite.id)}
                        disabled={declineInvitation.isPending || acceptingInviteId === invite.id}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        {acceptingInviteId === invite.id ? (
                          <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-lg">check</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-600 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <span className="material-symbols-outlined mb-2 opacity-50">drafts</span>
                  <p className="text-xs font-bold uppercase tracking-widest">No invitations found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CreateOrgModal 
          isOpen={isCreateOrgOpen} 
          onClose={() => setIsCreateOrgOpen(false)} 
          onSuccess={(org) => setCurrentOrg(org)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Role Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-slate-800">
        <span className={`material-symbols-outlined text-xl ${isOwner ? 'text-primary' : isAdmin ? 'text-emerald-500' : isViewer ? 'text-blue-400' : 'text-slate-400'}`}>
          {isOwner ? 'stars' : isAdmin ? 'admin_panel_settings' : isViewer ? 'visibility' : 'badge'}
        </span>
        <div>
          <h2 className="text-sm font-bold tracking-tight">Welcome back, {role.charAt(0) + role.slice(1).toLowerCase()}</h2>
          <p className="text-xs text-slate-500">
            {isOwner && "You have full control over the workspace, including billing and security."}
            {isAdmin && "You can manage projects, invite users, and oversee all workspace operations."}
            {isMember && "Here is your issue overview and recent activity."}
            {isViewer && "You have read-only access to this workspace's projects and issues."}
          </p>
        </div>
      </div>

      {/* Stats Summary Row */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(canInviteMembers ? 4 : 2)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsToRender.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.color} ${stat.bg} p-1.5 rounded-lg`}>{stat.icon}</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">{stat.value} {stat.unit && <span className="text-lg font-normal text-slate-500">{stat.unit}</span>}</p>
                <span className={`${stat.change.startsWith('+') ? 'text-emerald-500' : stat.change.startsWith('-') ? 'text-rose-500' : 'text-slate-500'} text-xs font-semibold mb-1.5`}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role-Specific Feature Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed/Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Owner Exclusives: Audit Logs */}
          {canViewAuditLogs && (
            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">policy</span>
                  <h2 className="text-lg font-bold">Recent Audit Logs</h2>
                </div>
                <button className="text-xs text-primary font-medium hover:underline">View Security Center</button>
              </div>
              <div className="p-6">
                <ul className="text-sm space-y-4">
                  {isLoadingAudit ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                  ) : auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log: any) => (
                      <li key={log.id} className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-800 dark:text-slate-200">
                            {(() => {
                              const actor = log.user?.name || log.user?.email || 'System';
                              const meta = log.metadata || {};
                              switch (log.action) {
                                case 'MEMBER_INVITED': return <><span className="font-bold">{actor}</span> invited <span className="text-primary">{meta.invitedEmail}</span> as <span className="font-black italic text-[10px] bg-primary/10 px-1.5 py-0.5 rounded ml-1">{meta.role}</span></>;
                                case 'MEMBER_JOINED': return <><span className="font-bold">{actor}</span> joined the organization via invitation</>;
                                case 'MEMBER_ROLE_UPDATED': return <><span className="font-bold">{actor}</span> changed <span className="text-primary">{meta.targetEmail}'s</span> role to <span className="font-black italic text-[10px] bg-primary/10 px-1.5 py-0.5 rounded ml-1">{meta.newRole}</span></>;
                                case 'MEMBER_REMOVED': return <><span className="font-bold">{actor}</span> removed <span className="text-primary font-bold">{meta.targetEmail}</span> from the workspace</>;
                                case 'PROJECT_CREATED': return <><span className="font-bold">{actor}</span> created project <span className="font-black italic text-primary">{meta.name}</span></>;
                                case 'PROJECT_DELETED': return <><span className="font-bold">{actor}</span> deleted project <span className="italic">{meta.name}</span></>;
                                case 'OWNERSHIP_TRANSFERRED': return <><span className="font-bold">{actor}</span> transferred organization ownership</>;
                                default: return <><span className="font-bold">{actor}</span> performed <span className="italic">{log.action.replace(/_/g, ' ')}</span></>;
                              }
                            })()}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                            {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No recent administrative actions recorded.</p>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Admin Exclusives: Pending Invites */}
          {isAdmin && !isOwner && (
             <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-emerald-500 text-xl">mail</span>
                 <h2 className="text-lg font-bold">Pending Invitations</h2>
               </div>
               <button className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-md font-medium hover:bg-emerald-600 transition-colors">Invite Team</button>
             </div>
             <div className="p-6">
               <ul className="text-sm space-y-4">
                 <li className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">JW</div>
                      <div>
                        <p className="font-medium">jordan.wu@external.com</p>
                        <p className="text-xs text-amber-500">Pending Acceptance</p>
                      </div>
                   </div>
                   <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">Resend</button>
                 </li>
               </ul>
             </div>
           </div>
          )}

          {/* Activity Feed (Visible to all) */}
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">Activity Feed</h2>
              <button className="text-xs text-primary font-medium">View all</button>
            </div>
            <div className="p-6">
              <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                {isLoadingActivity ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                ) : activityFeed && activityFeed.length > 0 ? (
                  activityFeed.map((activity, index) => (
                    <div key={activity.id} className="relative pl-10 pb-8">
                      <div className="absolute left-0 top-0 size-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-sm">
                          {activity.action === 'ISSUE_CREATED' ? 'add_task' :
                           activity.action === 'ISSUE_UPDATED' ? 'update' :
                           activity.action === 'ISSUE_DELETED' ? 'delete' :
                           activity.action === 'COMMENT_ADDED' ? 'chat_bubble' :
                           activity.action === 'MEMBER_INVITED' ? 'person_add' :
                           activity.action === 'MEMBER_JOINED' ? 'how_to_reg' :
                           activity.action === 'PROJECT_CREATED' ? 'create_new_folder' :
                           'rocket_launch'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            <span className="text-primary cursor-pointer">{activity.user?.name || activity.user?.email}</span> {activity.action.replace('_', ' ').toLowerCase()}
                          </p>
                        </div>
                        {activity.metadata && (
                           <p className="text-xs text-slate-500">{JSON.stringify(activity.metadata)}</p>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pl-10 pb-2 text-sm text-slate-500">No recent activity.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Cards */}
        <div className="space-y-8">
          
          {/* Owner Exclusives: Billing */}
          {canManageBilling && (
            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">credit_card</span>
                Billing Dashboard
              </h3>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">Enterprise Plan</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Total Seats</span>
                  <span className="font-semibold text-slate-900 dark:text-white">12 / 50</span>
                </div>
              </div>
              <button className="w-full text-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Manage Subscription & Invoices</button>
            </div>
          )}

          {/* Admin & Owner: Team Management Shortcuts */}
          {canInviteMembers && (
            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">folder_managed</span>
                Workspace Control
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">domain_add</span> Create New Project
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">group_add</span> Invite Members
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* All Roles: Quick Links */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Quick Resources</h3>
            <ul className="space-y-3">
              {[
                { label: 'Documentation', icon: 'menu_book' },
                { label: 'My Assigned Issues', icon: 'assignment_ind' },
                { label: 'API Tokens', icon: 'api' },
              ].map((link) => (
                <li key={link.label}>
                  <a href="#" className="text-sm flex items-center gap-2 hover:underline decoration-primary">
                    <span className="material-symbols-outlined text-base">{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Owner Exclusives: Danger Zone */}
          {isOwner && (
            <div className="bg-rose-500/5 rounded-xl border border-rose-500/20 p-6 shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                Danger Zone
              </h3>
              <p className="text-xs text-rose-600/70 mb-4 leading-relaxed">Permanently delete this organization, along with all projects, issues, and users.</p>
              <button className="text-xs font-semibold bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors w-full">Delete Workspace</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
