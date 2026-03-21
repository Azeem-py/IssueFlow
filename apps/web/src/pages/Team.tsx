import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useOrgQueries } from '../hooks/useOrgQueries';
import { UserRole } from '@issueflow/types';

export function Team() {
  const { user, currentOrg } = useAuth();
  const { canInviteMembers, canManageProjects, canCreateIssues, isOwner, isAdmin, isViewer } = usePermissions();
  const { useMembers, useInvites, createInvite } = useOrgQueries();
  
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const { data: invites = [], isLoading: isLoadingInvites } = useInvites();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await createInvite.mutateAsync({ email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  if (!currentOrg) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="size-20 bg-slate-100 dark:bg-card-dark rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-400">group</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">No Organization Selected</h2>
        <p className="text-slate-500 max-w-md">Please select or create an organization to manage your team.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Primary View */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          {canInviteMembers && (
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Invite Member
            </button>
          )}
        </div>
        <p className="text-slate-500 mb-8">Manage your team members and their workspace permissions.</p>

        {/* Members Table */}
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoadingMembers ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6 h-16 bg-slate-50/50 dark:bg-slate-800/20"></td>
                  </tr>
                ))
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{member.user.name || 'Invited User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{member.user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        member.role === UserRole.OWNER 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      {isOwner && member.user.id !== user?.id && (
                        <button className="hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-lg">settings</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
              
              {/* Invitations Section */}
              {invites.map((invite) => (
                <tr key={invite.id} className="bg-amber-500/5 border-l-4 border-l-amber-500/50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-400 italic">Pending Invitation</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{invite.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {invite.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-rose-500 hover:underline">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar: Permissions Preview */}
      <aside className="w-80 border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark rounded-xl p-6 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-xl">shield_person</span>
            <h3 className="text-lg font-bold">Permissions Preview</h3>
          </div>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Workspace: {currentOrg.name}</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Project Management</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <span className={`material-symbols-outlined text-lg ${canManageProjects ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {canManageProjects ? 'check_circle' : 'cancel'}
                </span>
                Create Projects
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <span className={`material-symbols-outlined text-lg ${canManageProjects ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {canManageProjects ? 'check_circle' : 'cancel'}
                </span>
                Archive Projects
              </li>
            </ul>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Tasks & Issues</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <span className={`material-symbols-outlined text-lg ${canCreateIssues ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {canCreateIssues ? 'check_circle' : 'cancel'}
                </span>
                Create Issues
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <span className={`material-symbols-outlined text-lg text-emerald-500`}>
                  check_circle
                </span>
                View Content
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Team & Workspace</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <span className={`material-symbols-outlined text-lg ${canInviteMembers ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {canInviteMembers ? 'check_circle' : 'cancel'}
                </span>
                Invite Members
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <span className={`material-symbols-outlined text-lg ${isOwner ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isOwner ? 'check_circle' : 'cancel'}
                </span>
                Delete Workspace
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={UserRole.MEMBER}>Member (Full Access)</option>
                  <option value={UserRole.ADMIN}>Admin (Management Access)</option>
                  <option value={UserRole.VIEWER}>Viewer (Read Only)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-lg text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createInvite.isPending}
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {createInvite.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
