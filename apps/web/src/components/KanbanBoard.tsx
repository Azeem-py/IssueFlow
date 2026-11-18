import React, { useState } from 'react';
import { PlusIcon, Skeleton } from '@issueflow/ui';
import { IIssue, IssueStatus } from '@issueflow/types';
import { BOARD_COLUMNS } from '../lib/issueMeta';
import { IssueCard } from './IssueCard';

interface KanbanBoardProps {
  issues: IIssue[];
  loading?: boolean;
  canEdit?: boolean;
  canCreate?: boolean;
  onCreateIssue?: (status: IssueStatus) => void;
  onMoveIssue?: (issue: IIssue, status: IssueStatus) => void;
  projectKey?: string;
}

export function KanbanBoard({
  issues,
  loading = false,
  canEdit = false,
  canCreate = false,
  onCreateIssue,
  onMoveIssue,
  projectKey,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);

  const handleDrop = (status: IssueStatus, event: React.DragEvent) => {
    event.preventDefault();
    setDragOverColumn(null);
    if (!canEdit || !onMoveIssue) return;

    const issueId = event.dataTransfer.getData('text/plain');
    const issue = issues.find((item) => item.id === issueId);
    if (!issue || issue.status === status) return;

    onMoveIssue(issue, status);
  };

  return (
    <div
      className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4 app-scrollbar"
      role="region"
      aria-label="Issue board"
    >
      {BOARD_COLUMNS.map((column) => {
        const columnIssues = issues.filter((issue) => issue.status === column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <section
            key={column.id}
            aria-label={`${column.label}, ${columnIssues.length} issues`}
            className={`flex w-[278px] shrink-0 flex-col rounded-xl border p-2.5 transition-colors duration-150 ${
              isOver
                ? 'border-brand-500/50 bg-brand-500/[0.04] ring-1 ring-inset ring-brand-500/25'
                : 'border-subtle/80 bg-panel/40'
            }`}
            onDragOver={(event) => {
              if (!canEdit) return;
              event.preventDefault();
              setDragOverColumn(column.id);
            }}
            onDragLeave={() =>
              setDragOverColumn((current) => (current === column.id ? null : current))
            }
            onDrop={(event) => handleDrop(column.id, event)}
          >
            <header className="flex h-8 items-center justify-between px-1">
              <div className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${column.dot}`} />
                <h2 className="truncate text-[12px] font-semibold text-ink-secondary">{column.label}</h2>
                <span className="rounded-full bg-elevated px-1.5 py-0.5 text-[10px] font-medium leading-none text-ink-muted tnum">
                  {columnIssues.length}
                </span>
              </div>
              {canCreate && onCreateIssue && (
                <button
                  type="button"
                  onClick={() => onCreateIssue(column.id)}
                  aria-label={`Add issue to ${column.label}`}
                  className="flex size-6 items-center justify-center rounded-md text-ink-disabled transition-colors hover:bg-hover hover:text-ink"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              )}
            </header>

            <div className="mt-2 flex flex-col gap-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-[104px] rounded-lg" />
                ))
              ) : columnIssues.length === 0 ? (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-subtle px-3 text-center">
                  <p className="text-[11px] text-ink-disabled">No issues in {column.label.toLowerCase()}</p>
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    projectKey={projectKey}
                    draggable={canEdit}
                    onDragEnd={() => setDragOverColumn(null)}
                  />
                ))
              )}

              {canCreate && onCreateIssue && !loading && (
                <button
                  type="button"
                  onClick={() => onCreateIssue(column.id)}
                  className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-subtle text-[11px] font-medium text-ink-disabled transition-colors hover:border-line hover:bg-hover/50 hover:text-ink-secondary"
                >
                  <PlusIcon className="size-3.5" />
                  Add issue
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
