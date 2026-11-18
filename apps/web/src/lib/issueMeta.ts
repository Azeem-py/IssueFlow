import { IssueStatus } from '@issueflow/types';

export interface BoardColumn {
  id: IssueStatus;
  label: string;
  dot: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: IssueStatus.BACKLOG, label: 'Backlog', dot: 'bg-slate-400' },
  { id: IssueStatus.TODO, label: 'Todo', dot: 'bg-sky-400' },
  { id: IssueStatus.IN_PROGRESS, label: 'In progress', dot: 'bg-teal-400' },
  { id: IssueStatus.REVIEW, label: 'In review', dot: 'bg-violet-400' },
  { id: IssueStatus.DONE, label: 'Done', dot: 'bg-emerald-400' },
];

export function issueKey(issue: any, projectKey?: string) {
  const prefix = projectKey || issue?.project?.key;
  const number = typeof issue?.shortId === 'string' ? issue.shortId.split('-').pop() : '';
  return prefix ? `${prefix}-${number}` : issue?.shortId ?? '';
}

export function statusLabel(status: IssueStatus) {
  const label = status.toLowerCase().replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function priorityLabel(priority: string) {
  const label = priority.toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}
