import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  EmptyState,
  FolderKanbanIcon,
  PlusIcon,
  useToast,
} from '@issueflow/ui';
import { IssueStatus, IIssue } from '@issueflow/types';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { usePermissions } from '../hooks/usePermissions';
import { KanbanBoard } from '../components/KanbanBoard';
import { QuickAddModal } from '../components/QuickAddModal';
import { BOARD_COLUMNS } from '../lib/issueMeta';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { useProject } = useProjectQueries();
  const { useIssues, updateIssue } = useIssueQueries();
  const { canCreateIssues, canEditOwnIssues } = usePermissions();
  const { toast } = useToast();

  const { data: project, isLoading: isProjectLoading } = useProject(id);
  const { data: issues = [], isLoading: isIssuesLoading } = useIssues({ projectId: id });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | undefined>();

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

  if (isProjectLoading) {
    return (
      <div className="space-y-5">
        <div className="h-20 animate-pulse rounded-xl border border-subtle bg-panel" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-[420px] w-[278px] shrink-0 animate-pulse rounded-xl border border-subtle bg-panel/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        icon={<FolderKanbanIcon />}
        title="Project not found"
        description="This project may have been deleted, or you may not have access to it."
        action={
          <Link
            to="/dashboard/projects"
            className="inline-flex h-9 items-center rounded-md border border-subtle bg-elevated px-3.5 text-sm font-medium text-ink transition-colors hover:border-line hover:bg-hover"
          >
            Back to projects
          </Link>
        }
        className="mt-10"
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Project header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          {project.logoUrl ? (
            <img
              src={project.logoUrl}
              alt=""
              className="size-11 shrink-0 rounded-lg border border-subtle object-cover"
            />
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-[13px] font-semibold text-brand-300">
              {project.key}
            </span>
          )}

          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <Link to="/dashboard/projects" className="transition-colors hover:text-ink">
                Projects
              </Link>
              <span aria-hidden="true" className="text-ink-disabled">/</span>
              <span className="font-mono text-ink-secondary">{project.key}</span>
            </nav>
            <h1 className="mt-1 truncate text-[22px] font-semibold tracking-tight text-ink md:text-[24px]">
              {project.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
              <span>{issues.length} {issues.length === 1 ? 'issue' : 'issues'}</span>
              <span aria-hidden="true" className="text-ink-disabled">·</span>
              <span>Board</span>
              <Badge tone="neutral" className="ml-0.5">
                {project.key}
              </Badge>
            </div>
          </div>
        </div>

        {canCreateIssues && (
          <Button onClick={() => openCreateModal()} icon={<PlusIcon className="size-4" />}>
            New issue
          </Button>
        )}
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap items-center gap-2">
        {BOARD_COLUMNS.map((column) => {
          const count = issues.filter((issue) => issue.status === column.id).length;
          return (
            <span
              key={column.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-1 text-[11px] text-ink-muted"
            >
              <span aria-hidden="true" className={`size-1.5 rounded-full ${column.dot}`} />
              {column.label}
              <span className="font-medium text-ink-secondary tnum">{count}</span>
            </span>
          );
        })}
      </div>

      {!isIssuesLoading && issues.length === 0 && (
        <EmptyState
          icon={<FolderKanbanIcon />}
          title="This project has no issues yet"
          description={
            canCreateIssues
              ? 'Add the first issue to get this board moving.'
              : 'An admin has not created any issues in this project yet.'
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
        issues={issues}
        loading={isIssuesLoading}
        canEdit={canEditOwnIssues}
        canCreate={canCreateIssues}
        onCreateIssue={openCreateModal}
        onMoveIssue={handleMoveIssue}
        projectKey={project.key}
      />

      <QuickAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialStatus={selectedStatus}
        initialProjectId={project.id}
      />
    </div>
  );
}
