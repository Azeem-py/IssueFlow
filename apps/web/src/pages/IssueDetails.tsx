import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CheckCircleIcon,
  CopyIcon,
  EmptyState,
  MessageSquareIcon,
  PriorityBadge,
  Select,
  SendIcon,
  ShieldIcon,
  StatusBadge,
  TrashIcon,
  useToast,
} from '@issueflow/ui';
import { IssueStatus, IssuePriority } from '@issueflow/types';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import api from '../lib/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { issueKey, priorityLabel, statusLabel } from '../lib/issueMeta';

function MarkdownRenderer({ content, members }: { content: string; members?: any[] }) {
  let displayContent = content || '';
  if (members && members.length > 0) {
    const sortedNames = [...members]
      .map((member) => member.user.name || member.user.email)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    sortedNames.forEach((name) => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(@${escaped})(?!\\]\\(#mention\\))`, 'g');
      displayContent = displayContent.replace(regex, `[$1](#mention)`);
    });
  }

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, href, children, ...props }) => {
            if (href === '#mention') {
              return (
                <span className="inline-block rounded border border-brand-500/25 bg-brand-500/10 px-1 py-0.5 align-baseline text-[0.95em] font-medium leading-none text-brand-300">
                  {children}
                </span>
              );
            }
            return (
              <a
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-300 underline decoration-brand-500/30 underline-offset-2 transition-colors hover:text-brand-200"
                {...(props as any)}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  placeholder?: string;
  members: any[];
  autoFocus?: boolean;
}

function MentionTextarea({ value, onChange, placeholder, members, autoFocus }: MentionTextareaProps) {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [localMentions, setLocalMentions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue, localMentions);

    const cursor = event.target.selectionStart;
    const textBeforeCursor = nextValue.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
    setMentionSearch(match ? match[1].toLowerCase() : null);
  };

  const handleMentionSelect = (member: any) => {
    if (!textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
    if (!match) return;

    const replaceStr = `@${member.user.name || member.user.email} `;
    const leadingWhitespace = match[0].startsWith(' ') || match[0].startsWith('\n') ? match[0][0] : '';
    const startIdx = textBeforeCursor.lastIndexOf(match[0]);

    const newTextBefore = textBeforeCursor.slice(0, startIdx) + leadingWhitespace + replaceStr;
    const newText = newTextBefore + value.slice(cursor);

    const newMentions = Array.from(new Set([...localMentions, member.user.id]));
    setLocalMentions(newMentions);
    onChange(newText, newMentions);
    setMentionSearch(null);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = newTextBefore.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const filteredMembers =
    mentionSearch !== null
      ? members.filter((member: any) =>
          (member.user.name || member.user.email).toLowerCase().includes(mentionSearch),
        )
      : [];

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        value={value}
        onChange={handleTextareaChange}
        aria-label={placeholder || 'Comment'}
        className="min-h-[140px] w-full resize-y bg-transparent px-4 py-3 text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink-muted"
        placeholder={placeholder}
      />

      {mentionSearch !== null && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-2 z-30 mb-1 max-h-48 w-64 overflow-y-auto rounded-lg border border-line bg-elevated p-1 shadow-elevation-3 app-scrollbar">
          {filteredMembers.map((member: any) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleMentionSelect(member)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
            >
              <Avatar src={member.user.avatarUrl} name={member.user.name || member.user.email} size="xs" />
              <span className="truncate">{member.user.name || member.user.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  issueId,
  depth = 0,
  issueAuthorId,
  members,
  canComment,
}: {
  comment: any;
  issueId: string;
  depth?: number;
  issueAuthorId?: string;
  members: any[];
  canComment: boolean;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const { addComment } = useIssueQueries();
  const { toast } = useToast();

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await addComment.mutateAsync({
        issueId,
        content: replyContent,
        parentId: comment.id,
        mentions: selectedMentions,
      });
      setReplyContent('');
      setSelectedMentions([]);
      setIsReplying(false);
    } catch (error) {
      toast({ tone: 'error', title: 'Could not post reply', description: 'Your text is preserved. Try again.' });
    }
  };

  const isAuthor = comment.authorId === issueAuthorId;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-subtle pl-4 md:ml-8' : ''}>
      <div className="py-4">
        <div className="flex gap-3">
          <Avatar
            src={comment.author?.avatarUrl}
            name={comment.author?.name || comment.author?.email}
            size="sm"
            className="mt-0.5"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[12.5px] font-medium text-ink">
                {comment.author?.name || comment.author?.email}
              </span>
              {isAuthor && (
                <Badge tone="brand" size="sm">
                  Author
                </Badge>
              )}
              <span className="text-[11px] text-ink-disabled">
                {new Date(comment.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {canComment && (
                <button
                  type="button"
                  onClick={() => setIsReplying((value) => !value)}
                  className="ml-auto text-[11px] font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  {isReplying ? 'Cancel' : 'Reply'}
                </button>
              )}
            </div>

            <div className="mt-1.5">
              <MarkdownRenderer content={comment.content} members={members} />
            </div>
          </div>
        </div>

        {isReplying && (
          <form onSubmit={handleReply} className="ml-11 mt-2">
            <div className="overflow-hidden rounded-lg border border-brand-500/30 bg-panel shadow-elevation-2">
              <MentionTextarea
                autoFocus
                value={replyContent}
                onChange={(value, mentions) => {
                  setReplyContent(value);
                  setSelectedMentions(mentions);
                }}
                members={members}
                placeholder={`Reply to ${comment.author?.name || 'this person'}…`}
              />
              <div className="flex items-center justify-end gap-2 border-t border-subtle px-3 py-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={addComment.isPending}
                  disabled={!replyContent.trim()}
                  icon={<SendIcon className="size-3.5" />}
                >
                  Reply
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {comment.replies?.map((reply: any) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          issueId={issueId}
          depth={depth + 1}
          issueAuthorId={issueAuthorId}
          members={members}
          canComment={canComment}
        />
      ))}
    </div>
  );
}

export function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentOrg } = useAuth();
  const { canEditOwnIssues, canManageGlobalIssues, isViewer } = usePermissions();
  const { useIssue, useComments, addComment, deleteIssue, updateIssue } = useIssueQueries();
  const { toast } = useToast();

  const { data: issue, isLoading: isLoadingIssue } = useIssue(id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(id);

  const [commentContent, setCommentContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [composerTab, setComposerTab] = useState<'write' | 'preview'>('write');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ['org-members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/members`);
      return data;
    },
    enabled: !!currentOrg?.id,
  });

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !commentContent.trim()) return;
    try {
      await addComment.mutateAsync({ issueId: id, content: commentContent, mentions: selectedMentions });
      setCommentContent('');
      setSelectedMentions([]);
      setComposerTab('write');
    } catch (error) {
      toast({ tone: 'error', title: 'Could not post comment', description: 'Your text is preserved. Try again.' });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteIssue.mutateAsync(id);
      toast({ tone: 'success', title: 'Issue deleted' });
      navigate('/dashboard/issues');
    } catch (error) {
      toast({ tone: 'error', title: 'Could not delete issue', description: 'Try again.' });
    }
  };

  const handleUpdateStatus = async (status: IssueStatus) => {
    if (!id) return;
    try {
      await updateIssue.mutateAsync({ id, status });
    } catch (error) {
      toast({ tone: 'error', title: 'Could not update status', description: 'Try again.' });
    }
  };

  const handleUpdatePriority = async (priority: IssuePriority) => {
    if (!id) return;
    try {
      await updateIssue.mutateAsync({ id, priority });
    } catch (error) {
      toast({ tone: 'error', title: 'Could not update priority', description: 'Try again.' });
    }
  };

  const handleUpdateAssignee = async (assigneeId: string) => {
    if (!id) return;
    try {
      await updateIssue.mutateAsync({ id, assigneeId: (assigneeId || null) as any });
    } catch (error) {
      toast({ tone: 'error', title: 'Could not update assignee', description: 'Try again.' });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ tone: 'success', title: 'Link copied' });
    } catch {
      toast({ tone: 'error', title: 'Could not copy link' });
    }
  };

  const handleCopyKey = async () => {
    if (!issue) return;
    try {
      await navigator.clipboard.writeText(issueKey(issue));
      toast({ tone: 'success', title: 'Issue key copied' });
    } catch {
      toast({ tone: 'error', title: 'Could not copy issue key' });
    }
  };

  if (isLoadingIssue) {
    return (
      <div className="space-y-5">
        <div className="h-4 w-56 animate-pulse rounded bg-elevated" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-elevated" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-80 animate-pulse rounded-xl border border-subtle bg-panel" />
          <div className="h-64 animate-pulse rounded-xl border border-subtle bg-panel" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <EmptyState
        icon={<MessageSquareIcon />}
        title="Issue not found"
        description="This issue may have been deleted, or you may not have access to it."
        action={
          <Link
            to="/dashboard/issues"
            className="inline-flex h-9 items-center rounded-md border border-subtle bg-elevated px-3.5 text-sm font-medium text-ink transition-colors hover:border-line hover:bg-hover"
          >
            Back to issues
          </Link>
        }
        className="mt-10"
      />
    );
  }

  const isAuthor = issue.authorId === user?.id;
  const canDelete = canManageGlobalIssues || (isAuthor && canEditOwnIssues);
  const author = (issue as any).author;
  const project = (issue as any).project;
  const commentCount = comments.reduce(
    (total: number, comment: any) => total + 1 + (comment.replies?.length || 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
        <Link to="/dashboard/projects" className="transition-colors hover:text-ink">
          Projects
        </Link>
        <span aria-hidden="true" className="text-ink-disabled">/</span>
        <span>{project?.name}</span>
        <span aria-hidden="true" className="text-ink-disabled">/</span>
        <span className="rounded border border-subtle bg-panel px-1.5 py-0.5 font-mono text-ink-secondary">
          {issueKey(issue)}
        </span>
        <button
          type="button"
          onClick={handleCopyKey}
          aria-label="Copy issue key"
          title="Copy issue key"
          className="flex size-5 items-center justify-center rounded text-ink-disabled transition-colors hover:bg-hover hover:text-ink"
        >
          <CopyIcon className="size-3" />
        </button>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} size="md" />
            <PriorityBadge priority={issue.priority} size="md" />
            <span className="text-[11px] text-ink-disabled">
              Opened {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-ink md:text-[28px]">
            {issue.title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopyLink} icon={<CopyIcon className="size-3.5" />}>
            Copy link
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              aria-label="Delete issue"
              className="text-ink-muted hover:bg-danger/10 hover:text-red-300"
            >
              <TrashIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main content */}
        <div className="min-w-0 space-y-5">
          <Card>
            <div className="flex items-center justify-between border-b border-subtle px-5 py-3">
              <h2 className="text-[13px] font-semibold text-ink">Description</h2>
              <span className="text-[11px] text-ink-disabled">
                by {author?.name || author?.email || 'Unknown'}
              </span>
            </div>
            <div className="px-5 py-4">
              {issue.description ? (
                <MarkdownRenderer content={issue.description} members={members} />
              ) : (
                <p className="text-[13px] italic text-ink-muted">No description provided.</p>
              )}
            </div>
          </Card>

          {/* Discussion */}
          <Card>
            <div className="flex items-center gap-2 border-b border-subtle px-5 py-3">
              <MessageSquareIcon className="size-4 text-ink-muted" />
              <h2 className="text-[13px] font-semibold text-ink">Discussion</h2>
              <span className="rounded-full bg-elevated px-1.5 py-0.5 text-[10px] font-medium leading-none text-ink-muted tnum">
                {commentCount}
              </span>
            </div>

            <div className="px-5">
              {isLoadingComments ? (
                <div className="space-y-4 py-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex animate-pulse gap-3">
                      <div className="size-8 rounded-full bg-elevated" />
                      <div className="h-16 flex-1 rounded-md bg-elevated" />
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[12.5px] font-medium text-ink-secondary">No comments yet</p>
                  <p className="mt-1 text-[11.5px] text-ink-muted">
                    {canEditOwnIssues
                      ? 'Share context, ask a question, or mention a teammate.'
                      : 'Comments from the team will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-subtle">
                  {comments.map((comment: any) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      issueId={id!}
                      issueAuthorId={issue.authorId}
                      members={members}
                      canComment={canEditOwnIssues}
                    />
                  ))}
                </div>
              )}
            </div>

            {canEditOwnIssues && (
              <div className="border-t border-subtle p-4">
                <form onSubmit={handleAddComment}>
                  <div className="overflow-hidden rounded-lg border border-subtle bg-canvas transition-colors focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/15">
                    <div className="flex items-center gap-1 border-b border-subtle bg-panel/60 px-2 py-1.5">
                      {(['write', 'preview'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setComposerTab(tab)}
                          aria-pressed={composerTab === tab}
                          className={`rounded px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                            composerTab === tab
                              ? 'bg-elevated text-ink'
                              : 'text-ink-muted hover:text-ink'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                      <span className="ml-auto pr-1 text-[10.5px] text-ink-disabled">
                        Markdown supported · @ to mention
                      </span>
                    </div>

                    {composerTab === 'write' ? (
                      <MentionTextarea
                        value={commentContent}
                        onChange={(value, mentions) => {
                          setCommentContent(value);
                          setSelectedMentions(mentions);
                        }}
                        members={members}
                        placeholder="Add a comment… Use **bold**, `code`, or @ to mention someone"
                      />
                    ) : (
                      <div className="min-h-[140px] px-4 py-3">
                        {commentContent.trim() ? (
                          <MarkdownRenderer content={commentContent} members={members} />
                        ) : (
                          <p className="text-[12.5px] text-ink-muted">Nothing to preview yet.</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-subtle bg-panel/40 px-3 py-2">
                      <span className="text-[11px] text-ink-disabled">
                        {selectedMentions.length > 0
                          ? `${selectedMentions.length} ${selectedMentions.length === 1 ? 'mention' : 'mentions'}`
                          : 'Be specific and kind.'}
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        loading={addComment.isPending}
                        disabled={!commentContent.trim()}
                        icon={<SendIcon className="size-3.5" />}
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>

        {/* Properties */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                Properties
              </h2>
              {isViewer && (
                <Badge tone="info" dot>
                  Read-only
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <Select
                label="Status"
                value={issue.status}
                disabled={isViewer}
                onChange={(event) => handleUpdateStatus(event.target.value as IssueStatus)}
              >
                {Object.values(IssueStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </Select>

              <Select
                label="Priority"
                value={issue.priority}
                disabled={isViewer}
                onChange={(event) => handleUpdatePriority(event.target.value as IssuePriority)}
              >
                {Object.values(IssuePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabel(priority)}
                  </option>
                ))}
              </Select>

              <div>
                <Select
                  label="Assignee"
                  value={(issue as any).assigneeId || ''}
                  disabled={isViewer}
                  onChange={(event) => handleUpdateAssignee(event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((member: any) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name || member.user.email}
                    </option>
                  ))}
                </Select>
                {isViewer && (
                  <p className="mt-1 text-[11px] text-ink-disabled">
                    Only members and admins can change the assignee.
                  </p>
                )}
              </div>

              <div className="border-t border-subtle pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-muted">Project</span>
                  <Link
                    to={project?.id ? `/dashboard/projects/${project.id}` : '/dashboard/projects'}
                    className="max-w-[60%] truncate font-medium text-brand-300 transition-colors hover:text-brand-200"
                  >
                    {project?.name || '—'}
                  </Link>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px]">
                  <span className="text-ink-muted">Issue key</span>
                  <span className="font-mono text-ink-secondary">{issueKey(issue)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Details
            </h2>
            <div className="space-y-3 text-[12px]">
              <div className="flex items-center gap-2.5">
                <Avatar src={author?.avatarUrl} name={author?.name || author?.email} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{author?.name || author?.email || 'Unknown'}</p>
                  <p className="text-[11px] text-ink-muted">Author</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-subtle pt-2.5">
                <span className="text-ink-muted">Created</span>
                <span className="text-ink-secondary">
                  {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Updated</span>
                <span className="text-ink-secondary">
                  {new Date(issue.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </Card>

          {isViewer ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-subtle bg-panel/60 p-3">
              <ShieldIcon className="mt-0.5 size-4 shrink-0 text-ink-disabled" />
              <p className="text-[11.5px] leading-relaxed text-ink-muted">
                You&apos;re a viewer in this workspace. You can read issues and comments but not edit them.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-brand-500/20 bg-brand-500/[0.04] p-3">
              <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <p className="text-[11.5px] leading-relaxed text-ink-muted">
                Changes save immediately and update every board and list in this workspace.
              </p>
            </div>
          )}
        </aside>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete issue"
        message={`Delete "${issue.title}"? This removes the issue, its comments, and its activity.`}
        confirmText="Delete issue"
        type="danger"
        isLoading={deleteIssue.isPending}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
