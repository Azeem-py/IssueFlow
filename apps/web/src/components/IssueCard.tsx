import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  CalendarIcon,
  CircleDashedIcon,
  PriorityBadge,
} from '@issueflow/ui';
import { IIssue } from '@issueflow/types';
import { issueKey } from '../lib/issueMeta';

interface IssueCardProps {
  issue: IIssue;
  projectKey?: string;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export function IssueCard({ issue, projectKey, draggable = false, onDragStart, onDragEnd }: IssueCardProps) {
  const [dragging, setDragging] = useState(false);
  const assignee = (issue as any).assignee;
  const projectName = (issue as any).project?.name;

  return (
    <Link
      to={`/dashboard/issues/${issue.id}`}
      draggable={draggable}
      onDragStart={(event) => {
        setDragging(true);
        event.dataTransfer.setData('text/plain', issue.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart?.(event);
      }}
      onDragEnd={() => {
        setDragging(false);
        onDragEnd?.();
      }}
      className={`group block rounded-lg border border-subtle bg-panel p-3.5 shadow-elevation-1 transition-[border-color,background-color,box-shadow,opacity] duration-150 hover:border-line hover:bg-elevated/50 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
        dragging ? 'border-brand-500/40 opacity-60' : ''
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-medium tracking-tight text-ink-muted">
          {issueKey(issue, projectKey)}
        </span>
        <PriorityBadge priority={issue.priority} />
      </div>

      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink-secondary transition-colors group-hover:text-ink">
        {issue.title}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {assignee ? (
            <Avatar src={assignee.avatarUrl} name={assignee.name || assignee.email} size="xs" />
          ) : (
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-line text-ink-disabled"
              title="Unassigned"
            >
              <CircleDashedIcon className="size-3.5" />
            </span>
          )}
          {projectName && !projectKey && (
            <span className="truncate text-[11px] text-ink-muted">{projectName}</span>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-disabled">
          <CalendarIcon className="size-3" />
          {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}
