import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CheckCircleIcon,
  ChevronRightIcon,
  CircleDotIcon,
  FolderKanbanIcon,
  InboxIcon,
  LoaderIcon,
  MailIcon,
  PlusIcon,
  RocketIcon,
  ShieldIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
  useToast,
} from '@issueflow/ui';
import { PageHeader } from '../components/PageHeader';
import { CreateOrgModal } from '../components/CreateOrgModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePermissions } from '../hooks/usePermissions';
import { useDashboardQueries } from '../hooks/useDashboardQueries';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { useOrgQueries } from '../hooks/useOrgQueries';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const ACTIVITY_ICONS: Record<string, React.ComponentType<any>> = {
  ISSUE_CREATED: CircleDotIcon,
  ISSUE_UPDATED: LoaderIcon,
  ISSUE_DELETED: XIcon,
  COMMENT_ADDED: MailIcon,
  MEMBER_INVITED: UsersIcon,
  MEMBER_JOINED: UsersIcon,
  PROJECT_CREATED: FolderKanbanIcon,
  PROJECT_DELETED: FolderKanbanIcon,
};

function statIcon(label: string) {
  const value = label.toLowerCase();
  if (value.includes('progress') || value.includes('active')) return LoaderIcon;
  if (value.includes('done') || value.includes('complete') || value.includes('resolved')) return CheckCircleIcon;
  if (value.includes('member') || value.includes('people') || value.includes('team')) return UsersIcon;
  if (value.includes('project')) return FolderKanbanIcon;
  if (value.includes('task') || value.includes('issue')) return InboxIcon;
  return TargetIcon;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { currentOrg, setCurrentOrg, refreshUser, user } = useAuth();
  const { isOwner, isAdmin, isMember, isViewer, canManageBilling, canInviteMembers, canViewAuditLogs, role } =
    usePermissions();
  const { useDashboardStats, useActivityFeed, useAuditLogs } = useDashboardQueries();
  const { useMyInvitations, declineInvitation, deleteOrganization } = useAuthQueries();
  const { useMembers, useInvites } = useOrgQueries();
  const { toast } = useToast();

  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats();
  const { data: activityFeed, isLoading: isLoadingActivity } = useActivityFeed();
  const { data: auditLogs, isLoading: isLoadingAudit } = useAuditLogs();
  const { data: myInvitations, isLoading: isLoadingInvites } = useMyInvitations();
  const { data: members = [] } = useMembers();
  const { data: pendingInvites = [] } = useInvites(canInviteMembers);

  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);

  const baseStats = statsData?.baseStats || [];
  const advancedStats = statsData?.advancedStats || [];
  const statsToRender = canInviteMembers ? [...baseStats, ...advancedStats] : baseStats;

  const firstName = (user?.name || '').trim().split(/\s+/)[0] || '';
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'Member';

  const describeActivity = (activity: any) => {
    const meta = activity.metadata || {};
    switch (activity.action) {
      case 'ISSUE_CREATED':
        return <>created <span className="font-medium text-brand-300">{meta.shortId}</span>{meta.title ? ` — ${meta.title}` : ''}</>;
      case 'ISSUE_UPDATED': {
        const fields = meta.changes ? Object.keys(meta.changes) : [];
        return <>updated <span className="font-medium text-brand-300">{meta.shortId || 'an issue'}</span>{fields.length ? ` (${fields.join(', ')})` : ''}</>;
      }
      case 'ISSUE_DELETED':
        return <>deleted <span className="font-medium text-brand-300">{meta.shortId || 'an issue'}</span></>;
      case 'COMMENT_ADDED':
        return <>commented on <span className="font-medium text-brand-300">{meta.shortId || 'an issue'}</span></>;
      case 'PROJECT_CREATED':
        return <>created project <span className="font-medium text-brand-300">{meta.name}</span></>;
      case 'PROJECT_UPDATED':
        return <>updated project <span className="font-medium text-brand-300">{meta.name || 'a project'}</span></>;
      case 'PROJECT_DELETED':
        return <>deleted project <span className="font-medium text-brand-300">{meta.name || 'a project'}</span></>;
      case 'MEMBER_INVITED':
        return <>invited <span className="font-medium text-brand-300">{meta.invitedEmail}</span> as {meta.role?.toLowerCase()}</>;
      case 'MEMBER_JOINED':
        return <>joined the workspace</>;
      case 'MEMBER_ROLE_UPDATED':
        return <>changed {meta.targetEmail || 'a member'}&apos;s role to <span className="font-medium text-brand-300">{meta.newRole?.toLowerCase()}</span></>;
      case 'MEMBER_REMOVED':
        return <>removed <span className="font-medium text-brand-300">{meta.targetEmail || 'a member'}</span></>;
      default:
        return <>{activity.action.replace(/_/g, ' ').toLowerCase()}</>;
    }
  };

  const handleAcceptInvite = async (token: string, inviteId: string) => {
    setAcceptingInviteId(inviteId);
    try {
      await api.post('/organizations/invites/accept', { token });
      await refreshUser();
      toast({ tone: 'success', title: 'Invitation accepted', description: 'The workspace is now available in your switcher.' });
    } catch (err) {
      toast({ tone: 'error', title: 'Could not accept invitation', description: 'Try again or ask a workspace admin to resend it.' });
    } finally {
      setAcceptingInviteId(null);
    }
  };

  const handleDeclineInvite = (inviteId: string) => {
    declineInvitation.mutate(inviteId, {
      onSuccess: () => toast({ tone: 'success', title: 'Invitation declined' }),
      onError: () => toast({ tone: 'error', title: 'Could not decline invitation', description: 'Try again.' }),
    });
  };

  const handleDeleteWorkspace = async () => {
    if (!currentOrg) return;
    try {
      await deleteOrganization.mutateAsync(currentOrg.id);
      setIsDeleteOpen(false);
      setCurrentOrg(null);
      toast({ tone: 'success', title: 'Workspace deleted' });
      navigate('/dashboard');
    } catch (err) {
      toast({ tone: 'error', title: 'Could not delete workspace', description: 'Try again or contact support.' });
    }
  };

  if (!currentOrg) {
    return (
      <div className="mx-auto max-w-3xl py-6 md:py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-subtle bg-panel text-brand-300">
            <RocketIcon className="size-5" />
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Welcome to IssueFlow</h1>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
            Create a workspace or accept an invitation to start tracking work with your team.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col p-5">
            <span className="mb-4 flex size-9 items-center justify-center rounded-lg border border-subtle bg-elevated text-brand-300">
              <PlusIcon className="size-4" />
            </span>
            <h2 className="text-[15px] font-semibold text-ink">Create a workspace</h2>
            <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">
              Start fresh with your own organization. You&apos;ll be the owner and can invite your team.
            </p>
            <Button className="mt-5 w-full" onClick={() => setIsCreateOrgOpen(true)}>
              Create workspace
            </Button>
          </Card>

          <Card className="flex flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg border border-subtle bg-elevated text-teal-300">
                <MailIcon className="size-4" />
              </span>
              {myInvitations && myInvitations.length > 0 && (
                <Badge tone="warning" dot>
                  {myInvitations.length} pending
                </Badge>
              )}
            </div>
            <h2 className="text-[15px] font-semibold text-ink">Join a workspace</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              Accept an invitation from a teammate to join their workspace.
            </p>

            <div className="mt-4 flex-1 space-y-2">
              {isLoadingInvites ? (
                <div className="space-y-2">
                  <div className="h-12 animate-pulse rounded-md bg-elevated" />
                  <div className="h-12 animate-pulse rounded-md bg-elevated" />
                </div>
              ) : myInvitations && myInvitations.length > 0 ? (
                myInvitations.map((invite: any) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-subtle bg-canvas/50 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {invite.organization.logoUrl ? (
                        <img src={invite.organization.logoUrl} className="size-7 rounded object-cover" alt="" />
                      ) : (
                        <span className="flex size-7 items-center justify-center rounded bg-elevated text-[11px] font-semibold text-ink-secondary">
                          {invite.organization.name.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-ink">{invite.organization.name}</p>
                        <p className="text-[11px] capitalize text-ink-muted">{invite.role.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeclineInvite(invite.id)}
                        disabled={declineInvitation.isPending || acceptingInviteId === invite.id}
                        aria-label={`Decline invitation to ${invite.organization.name}`}
                        className="flex size-7 items-center justify-center rounded-md text-ink-disabled transition-colors hover:bg-danger/10 hover:text-red-300 disabled:opacity-50"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvite(invite.token, invite.id)}
                        loading={acceptingInviteId === invite.id}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed border-subtle text-center">
                  <p className="text-[12px] font-medium text-ink-secondary">No invitations</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">Ask an admin to invite your email.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <CreateOrgModal
          isOpen={isCreateOrgOpen}
          onClose={() => setIsCreateOrgOpen(false)}
          onSuccess={(org) => setCurrentOrg(org)}
        />
      </div>
    );
  }

  const roleDescription = isOwner
    ? 'You have full control over this workspace, including billing and security.'
    : isAdmin
      ? 'You can manage projects, invite members, and oversee workspace operations.'
      : isMember
        ? 'You can create issues, comment, and move work across the board.'
        : 'You have read-only access to projects and issues in this workspace.';

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ''}`}
        description={`Here's what's moving in ${currentOrg.name}.`}
        actions={
          canInviteMembers ? (
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/team')}>
              <UsersIcon className="size-4" />
              Manage team
            </Button>
          ) : undefined
        }
      />

      {/* Role context */}
      <div className="flex flex-col gap-3 rounded-lg border border-subtle bg-panel/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-300">
            <ShieldIcon className="size-4" />
          </span>
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{roleLabel} access</span>
            <span className="mx-1.5 text-ink-disabled">·</span>
            {roleDescription}
          </p>
        </div>
        {isViewer && (
          <Badge tone="info" dot>
            Read-only
          </Badge>
        )}
      </div>

      {/* Summary stats */}
      {isLoadingStats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: canInviteMembers ? 4 : 2 }).map((_, index) => (
            <div key={index} className="h-[104px] animate-pulse rounded-xl border border-subtle bg-panel" />
          ))}
        </div>
      ) : statsToRender.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statsToRender.map((stat) => {
            const Icon = statIcon(stat.label);
            const positive = stat.change.startsWith('+');
            const negative = stat.change.startsWith('-');
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium text-ink-muted">{stat.label}</p>
                  <span className="flex size-7 items-center justify-center rounded-md border border-subtle bg-elevated text-ink-muted">
                    <Icon className="size-3.5" />
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <p className="text-[26px] font-semibold leading-none tracking-tight text-ink tnum">
                    {stat.value}
                    {stat.unit && <span className="ml-1 text-sm font-normal text-ink-muted">{stat.unit}</span>}
                  </p>
                  <span
                    className={`mb-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium ${
                      positive ? 'text-emerald-300' : negative ? 'text-red-300' : 'text-ink-muted'
                    }`}
                  >
                    {(positive || negative) && <TrendingUpIcon className={`size-3 ${negative ? 'rotate-180' : ''}`} />}
                    {stat.change}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Activity */}
          <Card>
            <div className="flex items-center justify-between border-b border-subtle px-5 py-3.5">
              <div className="flex items-center gap-2">
                <TargetIcon className="size-4 text-ink-muted" />
                <h2 className="text-[13px] font-semibold text-ink">Recent activity</h2>
              </div>
              <Link
                to="/dashboard/issues"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-300 transition-colors hover:text-brand-200"
              >
                View issues
                <ChevronRightIcon className="size-3" />
              </Link>
            </div>
            <div className="p-5">
              {isLoadingActivity ? (
                <div className="space-y-4">
                  <div className="h-9 animate-pulse rounded-md bg-elevated" />
                  <div className="h-9 animate-pulse rounded-md bg-elevated" />
                  <div className="h-9 animate-pulse rounded-md bg-elevated" />
                </div>
              ) : activityFeed && activityFeed.length > 0 ? (
                <ol className="relative space-y-5 before:absolute before:inset-y-1 before:left-[15px] before:w-px before:bg-subtle">
                  {activityFeed.slice(0, 8).map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.action] || RocketIcon;
                    return (
                      <li key={activity.id} className="relative flex gap-3">
                        <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-subtle bg-elevated text-ink-muted">
                          <Icon className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
                            <span className="font-medium text-ink">
                              {activity.user?.name || activity.user?.email}
                            </span>{' '}
                            {describeActivity(activity)}
                          </p>
                          <p className="mt-1 text-[11px] text-ink-disabled">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[12.5px] font-medium text-ink-secondary">No activity yet</p>
                  <p className="mt-1 text-[11.5px] text-ink-muted">Create an issue or invite a teammate to get started.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Audit logs */}
          {canViewAuditLogs && (
            <Card>
              <div className="flex items-center gap-2 border-b border-subtle px-5 py-3.5">
                <ShieldIcon className="size-4 text-ink-muted" />
                <h2 className="text-[13px] font-semibold text-ink">Audit log</h2>
                <Badge tone="neutral" className="ml-1">
                  Owner
                </Badge>
              </div>
              <div className="p-5">
                {isLoadingAudit ? (
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-elevated" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-elevated" />
                  </div>
                ) : auditLogs && auditLogs.length > 0 ? (
                  <ul className="divide-y divide-subtle/70">
                    {auditLogs.slice(0, 6).map((log: any) => {
                      const actor = log.user?.name || log.user?.email || 'System';
                      const meta = log.metadata || {};
                      return (
                        <li key={log.id} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
                            <span className="font-medium text-ink">{actor}</span>{' '}
                            {log.action === 'MEMBER_INVITED' && (
                              <>invited <span className="text-brand-300">{meta.invitedEmail}</span> as {meta.role?.toLowerCase()}</>
                            )}
                            {log.action === 'MEMBER_JOINED' && <>joined the workspace</>}
                            {log.action === 'MEMBER_ROLE_UPDATED' && (
                              <>changed <span className="text-brand-300">{meta.targetEmail}</span> to {meta.newRole?.toLowerCase()}</>
                            )}
                            {log.action === 'MEMBER_REMOVED' && <>removed <span className="text-brand-300">{meta.targetEmail}</span></>}
                            {log.action === 'PROJECT_CREATED' && <>created project <span className="text-brand-300">{meta.name}</span></>}
                            {log.action === 'PROJECT_DELETED' && <>deleted project {meta.name}</>}
                            {log.action === 'OWNERSHIP_TRANSFERRED' && <>transferred ownership</>}
                            {![
                              'MEMBER_INVITED',
                              'MEMBER_JOINED',
                              'MEMBER_ROLE_UPDATED',
                              'MEMBER_REMOVED',
                              'PROJECT_CREATED',
                              'PROJECT_DELETED',
                              'OWNERSHIP_TRANSFERRED',
                            ].includes(log.action) && <>{log.action.replace(/_/g, ' ').toLowerCase()}</>}
                          </p>
                          <span className="shrink-0 text-[10.5px] text-ink-disabled">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-[12px] text-ink-muted">No administrative actions recorded yet.</p>
                )}
              </div>
            </Card>
          )}

          {/* Pending invitations */}
          {canInviteMembers && (
            <Card>
              <div className="flex items-center justify-between border-b border-subtle px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <MailIcon className="size-4 text-ink-muted" />
                  <h2 className="text-[13px] font-semibold text-ink">Pending invitations</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/team')}>
                  Manage
                </Button>
              </div>
              <div className="p-5">
                {pendingInvites.length === 0 ? (
                  <p className="text-[12px] text-ink-muted">
                    No pending invitations. Invite a teammate from the Team page.
                  </p>
                ) : (
                  <ul className="divide-y divide-subtle/70">
                    {pendingInvites.slice(0, 5).map((invite: any) => (
                      <li key={invite.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar name={invite.email} size="xs" />
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium text-ink">{invite.email}</p>
                            <p className="text-[11px] capitalize text-ink-muted">{invite.role.toLowerCase()}</p>
                          </div>
                        </div>
                        <Badge tone="warning" dot>
                          Pending
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <FolderKanbanIcon className="size-4 text-ink-muted" />
              <h3 className="text-[13px] font-semibold text-ink">Workspace</h3>
            </div>
            <div className="mt-4 rounded-lg border border-subtle bg-canvas/50 p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-medium text-ink">Free plan</p>
                <Badge tone="brand" dot>
                  Active
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-subtle pt-3 text-[12px]">
                <span className="text-ink-muted">Members</span>
                <span className="font-medium text-ink tnum">{members.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px]">
                <span className="text-ink-muted">Your role</span>
                <span className="font-medium text-ink">{roleLabel}</span>
              </div>
            </div>
            {canManageBilling && (
              <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => navigate('/dashboard/team')}>
                Manage people and roles
              </Button>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-[13px] font-semibold text-ink">Quick links</h3>
            <ul className="mt-3 space-y-1">
              {[
                { label: 'Issue board', to: '/dashboard/issues', icon: InboxIcon },
                { label: 'Projects', to: '/dashboard/projects', icon: FolderKanbanIcon },
                { label: 'Team', to: '/dashboard/team', icon: UsersIcon },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-2.5 rounded-md px-2 py-2 text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-hover hover:text-ink"
                    >
                      <Icon className="size-4 text-ink-disabled" />
                      {item.label}
                      <ChevronRightIcon className="ml-auto size-3.5 text-ink-disabled" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          {isOwner && (
            <Card className="border-danger/25 bg-danger/[0.03] p-5">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold text-red-300">
                <ShieldIcon className="size-4" />
                Danger zone
              </h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
                Deleting this workspace removes all projects, issues, and members permanently.
              </p>
              <Button variant="danger-outline" size="sm" className="mt-3 w-full" onClick={() => setIsDeleteOpen(true)}>
                Delete workspace
              </Button>
            </Card>
          )}
        </div>
      </div>

      <CreateOrgModal
        isOpen={isCreateOrgOpen}
        onClose={() => setIsCreateOrgOpen(false)}
        onSuccess={(org) => setCurrentOrg(org)}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete workspace"
        message={`Delete "${currentOrg.name}"? This permanently removes every project, issue, and member.`}
        confirmText="Delete workspace"
        type="danger"
        isLoading={deleteOrganization.isPending}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteWorkspace}
      />
    </div>
  );
}
