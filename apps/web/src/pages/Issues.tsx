import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FolderKanbanIcon,
  InboxIcon,
  Input,
  PlusIcon,
  SearchIcon,
  XIcon,
  useToast,
} from '@issueflow/ui';
import { IssuePriority, IssueStatus, IIssue } from '@issueflow/types';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { KanbanBoard } from '../components/KanbanBoard';
import { QuickAddModal } from '../components/QuickAddModal';
import { statusLabel } from '../lib/issueMeta';

const PRIORITIES: IssuePriority[] = [
  IssuePriority.LOW,
  IssuePriority.MEDIUM,
  IssuePriority.HIGH,
  IssuePriority.URGENT,
];

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export function Issues() {
  const navigate = useNavigate();
  const { currentOrg } = useAuth();
  const { useIssues, updateIssue } = useIssueQueries();
  const { data: issues = [], isLoading } = useIssues();
  const { useProjects } = useProjectQueries();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { canCreateIssues, canEditOwnIssues } = usePermissions();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    status: IssueStatus[];
    priority: IssuePriority[];
  }>({ status: [], priority: [] });

  const openCreateModal = (status?: IssueStatus) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleMoveIssue = (issue: IIssue, status: IssueStatus) => {
    updateIssue.mutate(
      { id: issue.id, status },
      {
        onError: () =>
          toast({
            tone: 'error',
            title: 'Could not move issue',
            description: 'The issue was restored to its previous column. Try again.',
          }),
      },
    );
  };

  const filteredIssues = issues.filter((issue) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      issue.title.toLowerCase().includes(query) ||
      issue.shortId.toLowerCase().includes(query) ||
      (issue as any).project?.key?.toLowerCase().includes(query) ||
      (issue as any).project?.name?.toLowerCase().includes(query);

    const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(issue.status);
    const matchesPriority =
      activeFilters.priority.length === 0 || activeFilters.priority.includes(issue.priority);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const hasFilters = Boolean(searchQuery) || activeFilters.status.length > 0 || activeFilters.priority.length > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilters({ status: [], priority: [] });
  };

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<FolderKanbanIcon />}
        title="No workspace selected"
        description="Choose or create a workspace to view and manage issues."
        className="mt-10"
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Issues"
        description={
          canEditOwnIssues
            ? `Everything in flight across ${currentOrg.name}. Drag a card to move it, or use search and filters to narrow the board.`
            : `All work across ${currentOrg.name}. Search and filter the board to find what you need.`
        }
        actions={
          canCreateIssues ? (
            <Button onClick={() => openCreateModal()} icon={<PlusIcon className="size-4" />}>
              New issue
            </Button>
          ) : (
            <Badge tone="info" dot>
              Read-only
            </Badge>
          )
        }
      />

      {/* Search and filters */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title, issue key, or project"
            aria-label="Search issues"
            leftIcon={<SearchIcon />}
            wrapperClassName="xl:max-w-md"
            className="bg-panel"
          />

          <div className="hidden h-6 w-px bg-subtle xl:block" />

          <div className="flex flex-1 flex-wrap items-center gap-2">
            <span className="mr-0.5 text-[11px] font-medium text-ink-disabled">Priority</span>
            {PRIORITIES.map((priority) => {
              const active = activeFilters.priority.includes(priority);
              return (
                <button
                  key={priority}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setActiveFilters((previous) => ({
                      ...previous,
                      priority: active
                        ? previous.priority.filter((value) => value !== priority)
                        : [...previous.priority, priority],
                    }))
                  }
                  className={`h-7 rounded-full border px-2.5 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-brand-500/40 bg-brand-500/10 text-brand-200'
                      : 'border-subtle bg-panel text-ink-muted hover:border-line hover:text-ink'
                  }`}
                >
                  {PRIORITY_LABEL[priority]}
                </button>
              );
            })}

            <span className="mx-1 hidden h-5 w-px bg-subtle sm:block" />

            <label className="sr-only" htmlFor="status-filter">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={activeFilters.status[0] ?? ''}
              onChange={(event) =>
                setActiveFilters((previous) => ({
                  ...previous,
                  status: event.target.value ? [event.target.value as IssueStatus] : [],
                }))
              }
              className="h-7 rounded-md border border-subtle bg-panel px-2 text-[11px] font-medium text-ink-secondary outline-none transition-colors hover:border-line focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All statuses</option>
              {Object.values(IssueStatus)
                .filter((status) => status !== IssueStatus.CANCELED)
                .map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-ink-muted transition-colors hover:bg-hover hover:text-ink"
              >
                <XIcon className="size-3" />
                Clear
              </button>
            )}
          </div>

          <span className="shrink-0 text-[11px] text-ink-muted tnum xl:text-right">
            {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
          </span>
        </div>
      </Card>

      {/* Onboarding helpers */}
      {!isLoadingProjects && projects.length === 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-subtle bg-panel/60 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-300">
              <FolderKanbanIcon className="size-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-medium text-ink">Create a project to start tracking issues</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Issues live inside projects so they get a short key like PROJ-1.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/projects')}>
            Go to projects
          </Button>
        </div>
      )}

      {!isLoading && !isLoadingProjects && issues.length === 0 && projects.length > 0 && (
        <EmptyState
          icon={<InboxIcon />}
          title="No issues yet"
          description={
            canCreateIssues
              ? 'Add the first issue and it will appear on this board.'
              : 'An admin has not created any issues in this workspace yet.'
          }
          action={
            canCreateIssues ? (
              <Button size="sm" onClick={() => openCreateModal()}>
                Create first issue
              </Button>
            ) : undefined
          }
        />
      )}

      <KanbanBoard
        issues={filteredIssues}
        loading={isLoading}
        canEdit={canEditOwnIssues}
        canCreate={canCreateIssues && projects.length > 0}
        onCreateIssue={openCreateModal}
        onMoveIssue={handleMoveIssue}
      />

      {isLoading && (
        <p className="sr-only" role="status">
          Loading issues
        </p>
      )}

      <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialStatus={selectedStatus} />
    </div>
  );
}
