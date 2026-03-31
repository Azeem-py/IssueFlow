import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useOrgQueries } from '../hooks/useOrgQueries';
import { UserRole } from '@issueflow/types';
import { ConfirmModal } from '../components/ConfirmModal';

export function Team() {
  const { user, currentOrg } = useAuth();
  const { canInviteMembers, canManageProjects, canCreateIssues, isOwner, isAdmin, isViewer } = usePermissions();
  const { useMembers, useInvites, useMyInvites, createInvite, updateMemberRole, removeMember, revokeInvite, acceptInvite, declineInvite } = useOrgQueries();
  
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const { data: invites = [], isLoading: isLoadingInvites } = useInvites();
  const { data: myInvites = [], isLoading: isLoadingMyInvites } = useMyInvites();

  const [activeTab, setActiveTab] = useState<'members' | 'received'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

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

  const handleUpdateRole = async (memberId: string, role: UserRole) => {
    try {
      await updateMemberRole.mutateAsync({ memberId, role });
      setEditingMemberId(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Team Member',
      message: 'Are you sure you want to remove this member? They will lose access to all projects and issues in this workspace.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await removeMember.mutateAsync(memberId);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to remove member:', error);
        }
      }
    });
  };

  const handleRevokeInvite = (inviteId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Revoke Invitation',
      message: 'Are you sure you want to revoke this invitation? The invite link will no longer work.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await revokeInvite.mutateAsync(inviteId);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to revoke invite:', error);
        }
      }
    });
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'members' 
                ? 'bg-white dark:bg-card-dark text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Team Members
          </button>
          <button 
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'received' 
                ? 'bg-white dark:bg-card-dark text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Received Invitations
            {myInvites.length > 0 && (
              <span className="size-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
                {myInvites.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'members' ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
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
                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                              {member.user.avatarUrl ? (
                                <img src={member.user.avatarUrl} className="size-full object-cover" alt="" />
                              ) : (
                                member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="font-medium text-sm">{member.user.name || 'Invited User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{member.user.email}</td>
                        <td className="px-6 py-4">
                          {editingMemberId === member.id ? (
                            <select 
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value as UserRole)}
                              onBlur={() => setEditingMemberId(null)}
                              autoFocus
                              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value={UserRole.MEMBER}>MEMBER</option>
                              <option value={UserRole.ADMIN}>ADMIN</option>
                              <option value={UserRole.VIEWER}>VIEWER</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                              member.role === UserRole.OWNER 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                              {member.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOwner && member.user.id !== user?.id && member.role !== UserRole.OWNER && (
                              <>
                                <button 
                                  onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)}
                                  className="text-slate-400 hover:text-white transition-colors p-1"
                                  title="Change Role"
                                >
                                  <span className="material-symbols-outlined text-lg">settings</span>
                                </button>
                                <button 
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                  title="Remove Member"
                                >
                                  <span className="material-symbols-outlined text-lg">person_remove</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  
                  {/* Outgoing Invitations Section */}
                  {invites.map((invite) => (
                    <tr key={invite.id} className="bg-amber-500/5 border-l-4 border-l-amber-500/50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-400 italic">Outgoing Invitation</td>
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
                        {(isOwner || isAdmin) && (
                          <button 
                            onClick={() => handleRevokeInvite(invite.id)}
                            className="text-xs font-bold text-rose-500 hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {isLoadingMembers ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse h-32"></div>
                ))
              ) : (
                <>
                  {members.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                            {member.user.avatarUrl ? (
                              <img src={member.user.avatarUrl} className="size-full object-cover" alt="" />
                            ) : (
                              member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{member.user.name || 'Invited User'}</h4>
                            <p className="text-xs text-slate-500">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOwner && member.user.id !== user?.id && member.role !== UserRole.OWNER && (
                            <>
                              <button 
                                onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)}
                                className="text-slate-400 p-2"
                              >
                                <span className="material-symbols-outlined text-lg">settings</span>
                              </button>
                              <button 
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-slate-400 p-2 hover:text-rose-500"
                              >
                                <span className="material-symbols-outlined text-lg">person_remove</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</span>
                          {editingMemberId === member.id ? (
                            <select 
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value as UserRole)}
                              onBlur={() => setEditingMemberId(null)}
                              autoFocus
                              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs"
                            >
                              <option value={UserRole.MEMBER}>MEMBER</option>
                              <option value={UserRole.ADMIN}>ADMIN</option>
                              <option value={UserRole.VIEWER}>VIEWER</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${
                              member.role === UserRole.OWNER 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                              {member.role}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Outgoing Invitations Mobile */}
                  {invites.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-lg">mail</span>
                        Outgoing Invitations
                      </h3>
                      {invites.map((invite) => (
                        <div key={invite.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-sm text-slate-400 italic">Invite Pending</h4>
                              <p className="text-xs text-slate-500">{invite.email}</p>
                            </div>
                            {(isOwner || isAdmin) && (
                              <button 
                                onClick={() => handleRevokeInvite(invite.id)}
                                className="text-[10px] font-bold text-rose-500 px-2 py-1 border border-rose-500/50 rounded-md hover:bg-rose-500/10 transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {invite.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Desktop Received Invitations Table */}
            <div className="hidden md:block bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Organization</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Invited By</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isLoadingMyInvites ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-6 h-16 bg-slate-50/50 dark:bg-slate-800/20"></td>
                      </tr>
                    ))
                  ) : myInvites.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No invitations received yet.
                      </td>
                    </tr>
                  ) : (
                    myInvites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {invite.organization.logoUrl ? (
                                <img src={invite.organization.logoUrl} className="size-full object-cover rounded-lg" alt="" />
                              ) : (
                                invite.organization.name.charAt(0)
                              )}
                            </div>
                            <span className="font-bold text-sm">{invite.organization.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden shrink-0">
                              {invite.inviter.avatarUrl ? (
                                <img src={invite.inviter.avatarUrl} className="size-full object-cover" alt="" />
                              ) : (
                                (invite.inviter.name || invite.inviter.email).charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                              {invite.inviter.name || invite.inviter.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => declineInvite.mutate(invite.id)}
                              disabled={declineInvite.isPending}
                              className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
                            >
                              Decline
                            </button>
                            <button 
                              onClick={() => acceptInvite.mutate(invite.token)}
                              disabled={acceptInvite.isPending}
                              className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Accept
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Received Invitations Card View */}
            <div className="md:hidden space-y-4">
              {isLoadingMyInvites ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse h-40"></div>
                ))
              ) : myInvites.length === 0 ? (
                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
                  No invitations received yet.
                </div>
              ) : (
                myInvites.map((invite) => (
                  <div key={invite.id} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                        {invite.organization.logoUrl ? (
                          <img src={invite.organization.logoUrl} className="size-full object-cover rounded-xl" alt="" />
                        ) : (
                          invite.organization.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{invite.organization.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {invite.role}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 mb-4">
                      <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden shrink-0">
                        {invite.inviter.avatarUrl ? (
                          <img src={invite.inviter.avatarUrl} className="size-full object-cover" alt="" />
                        ) : (
                          (invite.inviter.name || invite.inviter.email).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Invited By</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {invite.inviter.name || invite.inviter.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => declineInvite.mutate(invite.id)}
                        disabled={declineInvite.isPending}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 dark:text-slate-400 py-2.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => acceptInvite.mutate(invite.token)}
                        disabled={acceptInvite.isPending}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary/20"
                      >
                        Accept Invite
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText={confirmModal.type === 'danger' ? 'Delete' : 'Confirm'}
        isLoading={removeMember.isPending || revokeInvite.isPending}
      />
    </div>
  );
}
