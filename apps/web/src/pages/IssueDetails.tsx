import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { IssueStatus, IssuePriority, IComment, UserRole } from '@issueflow/types';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';

const THREAD_COLORS = [
  'border-primary/40',
  'border-emerald-500/40',
  'border-amber-500/40',
  'border-rose-500/40',
  'border-indigo-500/40',
];

function MarkdownRenderer({ content, members }: { content: string, members?: any[] }) {
  let displayContent = content || '';
  if (members && members.length > 0) {
    const sortedNames = [...members]
      .map(m => m.user.name || m.user.email)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
      
    sortedNames.forEach(name => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(@${escaped})(?!\\]\\(#mention\\))`, 'g');
      displayContent = displayContent.replace(regex, `[$1](#mention)`);
    });
  }

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({node, href, children, ...props}) => {
          if (href === '#mention') {
            return <span className="text-primary font-black bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/25 shadow-sm inline-block leading-none align-baseline">{children}</span>;
          }
           // Type assertion needed because react-markdown typings can be strict
          return <a href={href!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold" {...(props as any)}>{children}</a>;
        }
      }}
    >
      {displayContent}
    </ReactMarkdown>
  );
}

interface CommentItemProps {
  comment: any;
  issueId: string;
  onReply: (parentId: string) => void;
  depth?: number;
  issueAuthorId?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (val: string, mentions: string[]) => void;
  placeholder?: string;
  members: any[];
  autoFocus?: boolean;
}

function MentionTextarea({ value, onChange, placeholder, members, autoFocus }: MentionTextareaProps) {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [localMentions, setLocalMentions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val, localMentions); // Pass up change
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    
    // Better regex for matching @ mentions anywhere in text
    const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      setMentionSearch(match[1].toLowerCase());
    } else {
      setMentionSearch(null);
    }
  };

  const handleMentionSelect = (member: any) => {
    if (!textareaRef.current) return;
    const val = value;
    const cursor = textareaRef.current.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    
    const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
    if (!match) return;
    
    // Replace the specific match
    const replaceStr = `@${member.user.name || member.user.email} `;
    // match.index is the index of the space or the start of the string, plus the '@' match
    // So we slice up to the match index, keeping any leading space
    const leadingWhitespace = match[0].startsWith(' ') || match[0].startsWith('\n') ? match[0][0] : '';
    const startIdx = textBeforeCursor.lastIndexOf(match[0]);
    
    const newTextBefore = textBeforeCursor.slice(0, startIdx) + leadingWhitespace + replaceStr;
    const newText = newTextBefore + val.slice(cursor);
    
    const newMentions = Array.from(new Set([...localMentions, member.userId]));
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

  const filteredMembers = mentionSearch !== null 
    ? members.filter((m: any) => (m.user.name || m.user.email).toLowerCase().includes(mentionSearch))
    : [];

  return (
    <div className="relative w-full">
      <textarea 
        ref={textareaRef}
        autoFocus={autoFocus}
        value={value}
        onChange={handleTextareaChange}
        className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 p-5 focus:ring-0 min-h-[160px] placeholder:text-slate-500 outline-none text-sm leading-relaxed resize-none" 
        placeholder={placeholder}
      ></textarea>
      
      {/* Mention Autocomplete Dropdown */}
      {mentionSearch !== null && filteredMembers.length > 0 && (
        <div className="absolute z-[9999] w-64 max-h-48 overflow-y-auto bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl -mt-10 ml-4">
          {filteredMembers.map((member: any) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleMentionSelect(member)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors text-left"
            >
              <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                {member.user.avatarUrl ? (
                  <img src={member.user.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center font-bold text-[10px]">
                    {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="font-semibold truncate">{member.user.name || member.user.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, issueId, onReply, depth = 0, issueAuthorId, members }: CommentItemProps & { members: any[] }) {
  const { isViewer } = usePermissions();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setCommentContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const { addComment } = useIssueQueries();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await addComment.mutateAsync({ issueId, content: replyContent, parentId: comment.id, mentions: selectedMentions });
      setCommentContent('');
      setSelectedMentions([]);
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const isAuthor = comment.authorId === issueAuthorId;
  const threadColor = THREAD_COLORS[depth % THREAD_COLORS.length];

  return (
    <div className={`flex flex-col gap-2 ${depth > 0 ? `ml-4 md:ml-10 mt-4 border-l-2 ${threadColor} pl-4 md:pl-8` : ''}`}>
      <div className="group relative">
        <div className="flex gap-3">
          {/* Avatar with Ring */}
          <div className="relative shrink-0">
            <div className={`size-8 md:size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border-2 ${isAuthor ? 'border-primary/50' : 'border-transparent'} overflow-hidden shadow-sm`}>
               {comment.author?.avatarUrl ? (
                 <img src={comment.author.avatarUrl} className="size-full object-cover" alt="" />
               ) : (
                 comment.author?.name?.charAt(0) || comment.author?.email?.charAt(0).toUpperCase()
               )}
            </div>
            {isAuthor && (
              <div className="absolute -bottom-1 -right-1 size-4 bg-primary rounded-full border-2 border-white dark:border-background-dark flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[10px] text-white fill-1">star</span>
              </div>
            )}
          </div>

          {/* Comment Card */}
          <div className="flex-1 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-all duration-200">
            <div className="bg-slate-50 dark:bg-slate-800/20 px-4 py-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {comment.author?.name || comment.author?.email}
                </span>
                {isAuthor && (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] uppercase font-black border border-primary/10 tracking-tight">Author</span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {!isViewer && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-sm">reply</span>
                  {isReplying ? 'Cancel' : 'Reply'}
                </button>
              )}
            </div>
            <div className="p-4 text-sm text-slate-600 dark:text-slate-300 prose dark:prose-invert prose-sm max-w-none leading-relaxed">
              <MarkdownRenderer content={comment.content} members={members} />
            </div>
          </div>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={handleReply} className="ml-12 mt-2">
          <div className="bg-white dark:bg-card-dark border-2 border-primary/30 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 animate-in slide-in-from-top-2 duration-200">
            <MentionTextarea 
              autoFocus
              value={replyContent}
              onChange={(val, mentions) => { setCommentContent(val); setSelectedMentions(mentions); }}
              members={members}
              placeholder={`Write a reply to ${comment.author?.name || 'this user'}...`}
            />
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-4 py-1.5 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={addComment.isPending || !replyContent.trim()}
                className="px-5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-shadow disabled:opacity-50 flex items-center gap-2"
              >
                {addComment.isPending ? 'Sending...' : 'Post Reply'}
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-1">
          {comment.replies.map((reply: any) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              issueId={issueId} 
              onReply={onReply} 
              depth={depth + 1} 
              issueAuthorId={issueAuthorId}
              members={members}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, currentOrg } = useAuth();
  const { canEditOwnIssues, canManageGlobalIssues, isViewer } = usePermissions();
  const { useIssue, useComments, addComment, deleteIssue, updateIssue } = useIssueQueries();
  
  const { data: issue, isLoading: isLoadingIssue } = useIssue(id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(id);
  
  const [commentContent, setCommentContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);

  const { data: members = [] } = useQuery({
    queryKey: ['org-members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/members`, {
        headers: { 'x-org-id': currentOrg.id }
      });
      return data;
    },
    enabled: !!currentOrg?.id,
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentContent.trim()) return;
    try {
      await addComment.mutateAsync({ issueId: id, content: commentContent, mentions: selectedMentions });
      setCommentContent('');
      setSelectedMentions([]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await deleteIssue.mutateAsync(id);
      window.location.href = '/issues';
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  const handleUpdateStatus = async (status: IssueStatus) => {
    if (!id) return;
    try {
      await updateIssue.mutateAsync({ id, status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoadingIssue) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Issue not found</h2>
        <Link to="/issues" className="text-primary hover:underline">Back to Issues Board</Link>
      </div>
    );
  }

  const isAuthor = issue.authorId === user?.id;
  const canDelete = canManageGlobalIssues || (isAuthor && canEditOwnIssues);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 pb-20">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
          <Link to="/projects" className="text-slate-400 hover:text-primary transition-colors">Projects</Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{(issue as any).project?.name}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-100 font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{(issue as any).project?.key}-{issue.shortId.split('-').pop()}</span>
        </div>

        {/* Title and Meta */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
             <span className={`px-3 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider ${
              issue.status === IssueStatus.DONE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              {issue.status.replace('_', ' ')}
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Opened {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4">{issue.title}</h1>
          
          <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800/50 mt-6">
            <div className="flex items-center gap-3">
               <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                 {(issue as any).author?.avatarUrl ? (
                   <img src={(issue as any).author.avatarUrl} className="size-full object-cover" alt="" />
                 ) : (
                   ((issue as any).author?.name || (issue as any).author?.email).charAt(0).toUpperCase()
                 )}
               </div>
               <div>
                 <p className="text-xs font-bold">{(issue as any).author?.name || (issue as any).author?.email}</p>
                 <p className="text-[10px] text-slate-500">Issue Author</p>
               </div>
            </div>
            {canDelete && (
              <button onClick={handleDelete} className="size-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-10">
          <div className="relative group">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              {issue.description ? (
                <MarkdownRenderer content={issue.description} members={members} />
              ) : (
                <span className="text-slate-500 italic">No description provided.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Discussion Activity</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
          </div>

          {/* Threaded Comments */}
          <div className="space-y-8">
            {isLoadingComments ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                    <div className="flex-1 h-24 bg-slate-50 dark:bg-slate-800/20 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-16 bg-slate-100/30 dark:bg-card-dark/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="size-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">forum</span>
                </div>
                <h3 className="text-sm font-bold text-slate-400">No discussions yet</h3>
                <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts on this issue.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {comments.map((comment: any) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    issueId={id!} 
                    onReply={(pid: string) => console.log('Reply to', pid)}
                    issueAuthorId={issue.authorId}
                    members={members}
                  />
                ))}
              </div>
            )}
          </div>

          {/* New Discussion Box */}
          {!isViewer && (
            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">add_comment</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">Post a comment</h3>
              </div>
              <form onSubmit={handleAddComment} className="flex gap-4 group">
                <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 shadow-inner overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} className="size-full object-cover" alt="" />
                  ) : (
                    <span className="material-symbols-outlined text-xl">person</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-[1.25rem] overflow-hidden shadow-sm group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 transition-all duration-300">
                    <div className="bg-slate-50 dark:bg-slate-800/30 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex gap-4">
                      <button type="button" className="text-[10px] font-black text-primary border-b-2 border-primary pb-1 uppercase tracking-wider">Markdown Editor</button>
                      <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider">Preview</button>
                    </div>
                    <MentionTextarea 
                      value={commentContent}
                      onChange={(val, mentions) => { setCommentContent(val); setSelectedMentions(mentions); }}
                      members={members}
                      placeholder="Share your thoughts... Use **bold**, *italics*, or type @ to mention someone"
                    />

                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-4 text-slate-400">
                        <button type="button" className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">image</span></button>
                        <button type="button" className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">attach_file</span></button>
                        <button type="button" className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">alternate_email</span></button>
                      </div>
                      <button 
                        type="submit"
                        disabled={addComment.isPending || !commentContent.trim()}
                        className="px-8 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                      >
                        {addComment.isPending ? 'Posting...' : 'Post Discussion'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-4 px-2 uppercase font-bold tracking-tighter">
                    <span className="material-symbols-outlined text-xs text-primary">verified</span>
                    Markdown is fully supported for rich text formatting.
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-6 space-y-8 shadow-sm sticky top-24">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Status</h3>
              <div className="relative group/select">
                <select 
                  disabled={isViewer}
                  value={issue.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as IssueStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none"
                >
                  {Object.values(IssueStatus).map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors">unfold_more</span>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Priority Level</h3>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                issue.priority === IssuePriority.URGENT ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 
                issue.priority === IssuePriority.HIGH ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' : 
                issue.priority === IssuePriority.MEDIUM ? 'bg-primary/5 border-primary/20 text-primary' : 
                'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-xl">
                  {issue.priority === IssuePriority.URGENT ? 'emergency' : 'priority_high'}
                </span>
                <span className="text-sm font-black uppercase tracking-wider">{issue.priority}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Assigned To</h3>
              <div className="flex items-center gap-3">
                {(issue as any).assignee ? (
                  <>
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shadow-sm overflow-hidden">
                      {(issue as any).assignee.avatarUrl ? (
                        <img src={(issue as any).assignee.avatarUrl} className="size-full object-cover" alt="" />
                      ) : (
                        (issue as any).assignee.name?.charAt(0) || (issue as any).assignee.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{(issue as any).assignee.name || (issue as any).assignee.email}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Available</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400 italic">
                    <div className="size-9 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">person_add</span>
                    </div>
                    <span className="text-xs font-medium">Unassigned</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-2 text-primary">
               <span className="material-symbols-outlined text-sm">info</span>
               <p className="text-[10px] font-black uppercase tracking-widest">Metadata</p>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
               Created by {(issue as any).author?.name || 'User'} in project {(issue as any).project?.name}.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
