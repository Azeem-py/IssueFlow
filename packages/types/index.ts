export const IssueStatus = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
} as const;
export type IssueStatus = (typeof IssueStatus)[keyof typeof IssueStatus];

export const IssuePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type IssuePriority = (typeof IssuePriority)[keyof typeof IssuePriority];

export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface IProject {
  id: string;
  name: string;
  key: string;
  organizationId: string;
  logoUrl?: string;
}

export interface IIssue {
  id: string;
  shortId: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  organizationId: string;
  authorId: string;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type Issue = IIssue;

// --- DTOs / Input Types ---

export interface RegisterInput {
  email: string;
  password?: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface CreateOrgInput {
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface CreateProjectInput {
  name: string;
  key: string;
  logoUrl?: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  projectId: string;
  organizationId: string;
  assigneeId?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
}

export interface SearchFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assigneeId?: string;
  projectId?: string;
  q?: string;
}

export interface CreateCommentInput {
  content: string;
  issueId: string;
  parentId?: string;
}

export interface IComment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  parentId?: string;
  replies?: IComment[];
  author?: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInviteInput {
  email: string;
  role: UserRole;
}

export interface AcceptInviteInput {
  token: string;
}

export interface IDashboardStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  bg: string;
  unit?: string;
}

export interface IDashboardStats {
  baseStats: IDashboardStat[];
  advancedStats: IDashboardStat[];
}

export interface IActivityLog {
  id: string;
  action: string;
  organizationId: string;
  userId: string;
  issueId?: string;
  projectId?: string;
  metadata?: any;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}
