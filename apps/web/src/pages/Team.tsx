import React, { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CheckCircleIcon,
  Dialog,
  EmptyState,
  Input,
  MailIcon,
  PencilIcon,
  Select,
  ShieldIcon,
  Tabs,
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
  useToast,
} from '@issueflow/ui';
import { UserRole } from '@issueflow/types';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useOrgQueries } from '../hooks/useOrgQueries';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const ROLE_TONE: Record<string, 'brand' | 'teal' | 'neutral' | 'info'> = {
  OWNER: 'brand',
  ADMIN: 'teal',
  MEMBER: 'neutral',
  VIEWER: 'info',
};

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  {
    value: UserRole.MEMBER,
    label: 'Member',
    description: 'Create and edit issues, move work across the board, and comment.',
  },
  {
    value: UserRole.ADMIN,
    label: 'Admin',
    description: 'Everything a member can do, plus manage projects and invite members.',
  },
  {
    value: UserRole.VIEWER,
    label: 'Viewer',
    description: 'Read-only access to projects, issues, and comments.',
  },
];

export function Team() {
  const { user, currentOrg } = useAuth();
  const { canInviteMembers, canManageProjects, canCreateIssues, canEditOwnIssues, isOwner, isViewer } =
    usePermissions();
  const {
    useMembers,
    useInvites,
    useMyInvites,
    createInvite,
    updateMemberRole,
    removeMember,
    revokeInvite,
    acceptInvite,
    declineInvite,
  } = useOrgQueries();
  const { toast } = useToast();

  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const { data: invites = [], isLoading: isLoadingInvites } = useInvites(canInviteMembers);
  const { data: myInvites = [], isLoading: isLoadingMyInvites } = useMyInvites();

  const [activeTab, setActiveTab] = useState<'members' | 'received'>('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER);
  const [roleTarget, setRoleTarget] = useState<any | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole>(UserRole.MEMBER);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  const role = currentOrg?.members?.[0]?.role || user?.role || 'MEMBER';
  const currentRole = String(role).toUpperCase();

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await createInvite.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
      toast({ tone: 'success', title: `Invitation sent to ${inviteEmail.trim()}` });
      setInviteEmail('');
      setInviteRole(UserRole.MEMBER);
      setIsInviteModalOpen(false);
    } catch (err: any) {
      toast({
        tone: 'error',
        title: 'Could not send invitation',
        description: err?.response?.data?.message || 'Check the email address and try again.',
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!roleTarget) return;
    try {
      await updateMemberRole.mutateAsync({ memberId: roleTarget.id, role: pendingRole });
      toast({ tone: 'success', title: `${roleTarget.user.name || roleTarget.user.email} is now ${ROLE_LABEL[pendingRole]}` });
      setRoleTarget(null);
    } catch (err) {
      toast({ tone: 'error', title: 'Could not update role', description: 'Try again.' });
    }
  };

  const handleRemoveMember = (member: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove member',
      message: `Remove ${member.user.name || member.user.email}? They will lose access to every project and issue in this workspace.`,
      confirmText: 'Remove member',
      onConfirm: async () => {
        try {
          await removeMember.mutateAsync(member.id);
          toast({ tone: 'success', title: 'Member removed' });
          setConfirmModal((previous) => ({ ...previous, isOpen: false }));
        } catch (err) {
          toast({ tone: 'error', title: 'Could not remove member', description: 'Try again.' });
        }
      },
    });
  };

  const handleRevokeInvite = (invite: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Revoke invitation',
      message: `Revoke the invitation for ${invite.email}? The invite link will stop working.`,
      confirmText: 'Revoke invitation',
      onConfirm: async () => {
        try {
          await revokeInvite.mutateAsync(invite.id);
          toast({ tone: 'success', title: 'Invitation revoked' });
          setConfirmModal((previous) => ({ ...previous, isOpen: false }));
        } catch (err) {
          toast({ tone: 'error', title: 'Could not revoke invitation', description: 'Try again.' });
        }
      },
    });
  };

  const handleAcceptInvite = (invite: any) => {
    acceptInvite.mutate(invite.token, {
      onSuccess: () => toast({ tone: 'success', title: `Joined ${invite.organization.name}` }),
      onError: () => toast({ tone: 'error', title: 'Could not accept invitation', description: 'Try again.' }),
    });
  };

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="No workspace selected"
        description="Choose or create a workspace to manage your team."
        className="mt-10"
      />
    );
  }

  const canManageMember = (member: any) =>
    (isOwner || currentRole === 'ADMIN') &&
    member.user.id !== user?.id &&
    member.role !== UserRole.OWNER;

  const capabilities = [
    { label: 'View workspace content', allowed: true },
    { label: 'Create and edit issues', allowed: canCreateIssues },
    { label: 'Move issues across the board', allowed: canEditOwnIssues },
    { label: 'Comment on issues', allowed: !isViewer },
    { label: 'Manage projects', allowed: canManageProjects },
    { label: 'Invite and manage members', allowed: canInviteMembers },
    { label: 'Manage workspace ownership', allowed: isOwner },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Team"
        description="Manage who can access this workspace and what their role allows."
        actions={
          canInviteMembers ? (
            <Button onClick={() => setIsInviteModalOpen(true)} icon={<UserPlusIcon className="size-4" />}>
              Invite member
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_308px]">
        <div className="min-w-0 space-y-5">
          <Tabs
            variant="pill"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'members' | 'received')}
            items={[
              { value: 'members', label: 'Members', icon: <UsersIcon />, badge: members.length },
              {
                value: 'received',
                label: 'Received invitations',
                icon: <MailIcon />,
                badge: myInvites.length || undefined,
              },
            ]}
          />

          {activeTab === 'members' ? (
            <>
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="size-4 text-ink-muted" />
                    <h2 className="text-[13px] font-semibold text-ink">Workspace members</h2>
                  </div>
                  <span className="text-[11px] text-ink-muted tnum">{members.length} total</span>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-subtle">
                        <th scope="col" className="px-4 py-2.5 text-[11px] font-medium text-ink-muted">Member</th>
                        <th scope="col" className="px-4 py-2.5 text-[11px] font-medium text-ink-muted">Role</th>
                        <th scope="col" className="px-4 py-2.5 text-[11px] font-medium text-ink-muted">Status</th>
                        <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-medium text-ink-muted">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle">
                      {isLoadingMembers
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <tr key={index}>
                              <td colSpan={4} className="px-4 py-3">
                                <div className="h-9 animate-pulse rounded bg-elevated" />
                              </td>
                            </tr>
                          ))
                        : members.map((member) => (
                            <tr key={member.id} className="transition-colors hover:bg-hover/30">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <Avatar
                                    src={member.user.avatarUrl}
                                    name={member.user.name || member.user.email}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-[12.5px] font-medium text-ink">
                                      {member.user.name || 'Invited user'}
                                      {member.user.id === user?.id && (
                                        <span className="ml-1.5 text-[11px] font-normal text-ink-muted">(you)</span>
                                      )}
                                    </p>
                                    <p className="truncate text-[11px] text-ink-muted">{member.user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge tone={ROLE_TONE[member.role] || 'neutral'} dot>
                                  {ROLE_LABEL[member.role] || member.role}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-secondary">
                                  <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />
                                  Active
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  {canManageMember(member) && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRoleTarget(member);
                                          setPendingRole(member.role as UserRole);
                                        }}
                                        aria-label={`Change role for ${member.user.name || member.user.email}`}
                                        title="Change role"
                                        className="flex size-7 items-center justify-center rounded-md text-ink-disabled transition-colors hover:bg-hover hover:text-ink"
                                      >
                                        <PencilIcon className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member)}
                                        aria-label={`Remove ${member.user.name || member.user.email}`}
                                        title="Remove member"
                                        className="flex size-7 items-center justify-center rounded-md text-ink-disabled transition-colors hover:bg-danger/10 hover:text-red-300"
                                      >
                                        <TrashIcon className="size-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <ul className="divide-y divide-subtle md:hidden">
                  {isLoadingMembers
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <li key={index} className="p-4">
                          <div className="h-12 animate-pulse rounded bg-elevated" />
                        </li>
                      ))
                    : members.map((member) => (
                        <li key={member.id} className="flex items-start justify-between gap-3 p-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Avatar src={member.user.avatarUrl} name={member.user.name || member.user.email} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-medium text-ink">
                                {member.user.name || 'Invited user'}
                                {member.user.id === user?.id && (
                                  <span className="ml-1.5 text-[11px] font-normal text-ink-muted">(you)</span>
                                )}
                              </p>
                              <p className="truncate text-[11px] text-ink-muted">{member.user.email}</p>
                              <div className="mt-1.5">
                                <Badge tone={ROLE_TONE[member.role] || 'neutral'} dot>
                                  {ROLE_LABEL[member.role] || member.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {canManageMember(member) && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRoleTarget(member);
                                  setPendingRole(member.role as UserRole);
                                }}
                                aria-label={`Change role for ${member.user.name || member.user.email}`}
                                className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hover hover:text-ink"
                              >
                                <PencilIcon className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member)}
                                aria-label={`Remove ${member.user.name || member.user.email}`}
                                className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-danger/10 hover:text-red-300"
                              >
                                <TrashIcon className="size-4" />
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                </ul>
              </Card>

              {canInviteMembers && (
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MailIcon className="size-4 text-ink-muted" />
                      <h2 className="text-[13px] font-semibold text-ink">Pending invitations</h2>
                    </div>
                    {invites.length > 0 && <Badge tone="warning">{invites.length} pending</Badge>}
                  </div>
                  {isLoadingInvites ? (
                    <div className="space-y-2 p-4">
                      <div className="h-10 animate-pulse rounded bg-elevated" />
                      <div className="h-10 animate-pulse rounded bg-elevated" />
                    </div>
                  ) : invites.length === 0 ? (
                    <p className="px-4 py-6 text-center text-[12px] text-ink-muted">
                      No pending invitations. Invited teammates appear here until they accept.
                    </p>
                  ) : (
                    <ul className="divide-y divide-subtle">
                      {invites.map((invite) => (
                        <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-full border border-warning/25 bg-warning/10 text-amber-300">
                              <MailIcon className="size-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-medium text-ink">{invite.email}</p>
                              <p className="text-[11px] text-ink-muted">Invited as {ROLE_LABEL[invite.role] || invite.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge tone="warning" dot>
                              Pending
                            </Badge>
                            {(isOwner || currentRole === 'ADMIN') && (
                              <Button variant="ghost" size="sm" onClick={() => handleRevokeInvite(invite)}>
                                Revoke
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}
            </>
          ) : (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
                <div className="flex items-center gap-2">
                  <MailIcon className="size-4 text-ink-muted" />
                  <h2 className="text-[13px] font-semibold text-ink">Invitations you&apos;ve received</h2>
                </div>
              </div>

              {isLoadingMyInvites ? (
                <div className="space-y-2 p-4">
                  <div className="h-14 animate-pulse rounded bg-elevated" />
                  <div className="h-14 animate-pulse rounded bg-elevated" />
                </div>
              ) : myInvites.length === 0 ? (
                <EmptyState
                  icon={<MailIcon />}
                  title="No invitations"
                  description="When someone invites your email to a workspace, it will appear here."
                  className="m-4 border-0 bg-transparent"
                />
              ) : (
                <ul className="divide-y divide-subtle">
                  {myInvites.map((invite) => (
                    <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {invite.organization.logoUrl ? (
                          <img src={invite.organization.logoUrl} alt="" className="size-9 rounded-lg border border-subtle object-cover" />
                        ) : (
                          <span className="flex size-9 items-center justify-center rounded-lg border border-subtle bg-elevated text-[12px] font-semibold text-ink-secondary">
                            {invite.organization.name.charAt(0)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-ink">{invite.organization.name}</p>
                          <p className="truncate text-[11.5px] text-ink-muted">
                            Invited by {invite.inviter.name || invite.inviter.email} as{' '}
                            {ROLE_LABEL[invite.role] || invite.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-ink-disabled">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            declineInvite.mutate(invite.id, {
                              onSuccess: () => toast({ tone: 'success', title: 'Invitation declined' }),
                              onError: () => toast({ tone: 'error', title: 'Could not decline invitation' }),
                            })
                          }
                          disabled={declineInvite.isPending}
                        >
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => handleAcceptInvite(invite)} loading={acceptInvite.isPending}>
                          Accept
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        {/* Role and permissions */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-4 text-ink-muted" />
              <h2 className="text-[13px] font-semibold text-ink">Your access</h2>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-subtle bg-canvas/50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-ink">{currentOrg.name}</p>
                <p className="text-[11px] text-ink-muted">Current workspace</p>
              </div>
              <Badge tone={ROLE_TONE[currentRole] || 'neutral'} dot>
                {ROLE_LABEL[currentRole] || currentRole}
              </Badge>
            </div>

            <ul className="mt-3 space-y-2">
              {capabilities.map((capability) => (
                <li key={capability.label} className="flex items-start gap-2">
                  {capability.allowed ? (
                    <CheckCircleIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircleIcon className="mt-0.5 size-3.5 shrink-0 text-ink-disabled" />
                  )}
                  <span className={`text-[12px] leading-snug ${capability.allowed ? 'text-ink-secondary' : 'text-ink-disabled'}`}>
                    {capability.label}
                    <span className="sr-only">{capability.allowed ? ': allowed' : ': not allowed'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-lg border border-subtle bg-panel/60 p-3">
            <p className="text-[11.5px] leading-relaxed text-ink-muted">
              Roles are enforced by the API. Hiding an action in the interface never replaces server-side
              authorization.
            </p>
          </div>
        </aside>
      </div>

      {/* Invite dialog */}
      <Dialog
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite a teammate"
        description="They'll receive an email with a link to join this workspace."
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="invite-form"
              size="sm"
              loading={createInvite.isPending}
              disabled={!inviteEmail.trim()}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="teammate@example.com"
            autoFocus
          />
          <Select
            label="Role"
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as UserRole)}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <div className="rounded-md border border-subtle bg-canvas/60 px-3 py-2.5">
            <p className="text-[11.5px] leading-relaxed text-ink-muted">
              <span className="font-medium text-ink-secondary">Role impact:</span>{' '}
              {ROLE_OPTIONS.find((option) => option.value === inviteRole)?.description}
            </p>
          </div>
        </form>
      </Dialog>

      {/* Change role dialog */}
      <Dialog
        open={Boolean(roleTarget)}
        onClose={() => setRoleTarget(null)}
        title="Change member role"
        description={
          roleTarget
            ? `Update the role for ${roleTarget.user.name || roleTarget.user.email}.`
            : undefined
        }
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleUpdateRole}
              loading={updateMemberRole.isPending}
              disabled={!roleTarget || pendingRole === roleTarget.role}
            >
              Save role
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Role"
            value={pendingRole}
            onChange={(event) => setPendingRole(event.target.value as UserRole)}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <div className="rounded-md border border-subtle bg-canvas/60 px-3 py-2.5">
            <p className="text-[11.5px] leading-relaxed text-ink-muted">
              <span className="font-medium text-ink-secondary">{ROLE_LABEL[pendingRole]}</span>
              {' — '}
              {ROLE_OPTIONS.find((option) => option.value === pendingRole)?.description}
            </p>
          </div>
        </div>
      </Dialog>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        confirmText={confirmModal.confirmText}
        onClose={() => setConfirmModal((previous) => ({ ...previous, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        isLoading={removeMember.isPending || revokeInvite.isPending}
      />
    </div>
  );
}
