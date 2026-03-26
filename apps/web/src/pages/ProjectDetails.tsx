import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { IssueStatus, IssuePriority } from '@issueflow/types';
import { QuickAddModal } from '../components/QuickAddModal';

const COLUMNS: { id: IssueStatus; label: string; color: string }[] = [
  { id: IssueStatus.BACKLOG, label: 'Backlog', color: 'bg-slate-400' },
  { id: IssueStatus.TODO, label: 'To Do', color: 'bg-orange-500' },
  { id: IssueStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-primary' },
  { id: IssueStatus.REVIEW, label: 'Review', color: 'bg-blue-500' },
  { id: IssueStatus.DONE, label: 'Done', color: 'bg-emerald-500' },
];

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { useProject } = useProjectQueries();
  const { useIssues } = useIssueQueries();
  
  const { data: project, isLoading: isProjectLoading } = useProject(id);
  const { data: issues = [], isLoading: isIssuesLoading } = useIssues({ projectId: id });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | undefined>();

  const openCreateModal = (status?: IssueStatus) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case IssuePriority.LOW: return 'bg-blue-400';
      case IssuePriority.MEDIUM: return 'bg-primary';
      case IssuePriority.HIGH: return 'bg-orange-500';
      case IssuePriority.URGENT: return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {project.logoUrl ? (
            <div className="size-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <img src={project.logoUrl} alt={project.name} className="size-full object-cover" />
            </div>
          ) : (
            <div className="size-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-xl">
              {project.key}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Link to="/projects" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Projects</Link>
               <span className="text-slate-400 text-xs">/</span>
               <span className="text-xs font-bold text-primary uppercase tracking-widest">{project.key}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">{project.name}</h1>
          </div>
        </div>
        <button 
          onClick={() => openCreateModal()}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Issue
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar flex-1 min-h-0">
        {COLUMNS.map((column) => {
          const columnIssues = issues.filter(i => i.status === column.id);
          
          return (
            <div key={column.id} className="w-80 flex flex-col gap-4 flex-shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold dark:text-slate-200 uppercase tracking-wider">{column.label}</span>
                  <span className="bg-slate-200 dark:bg-card-dark px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{columnIssues.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {isIssuesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark animate-pulse h-32"></div>
                  ))
                ) : (
                  columnIssues.map((issue) => (
                    <Link 
                      key={issue.id} 
                      to={`/issues/${issue.id}`}
                      className={`bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm hover:border-primary/50 transition-all group cursor-pointer block ${issue.priority === IssuePriority.URGENT ? 'border-l-4 border-l-rose-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{project.key}-{issue.shortId.split('-').pop()}</span>
                        <div className={`size-2 rounded-full ${getPriorityColor(issue.priority)} shadow-sm`}></div>
                      </div>
                      <h3 className="text-sm font-medium leading-relaxed dark:text-slate-200 mb-4 line-clamp-2">{issue.title}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                           {(issue as any).assignee ? (
                             <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/10">
                               {(issue as any).assignee.name?.charAt(0) || (issue as any).assignee.email.charAt(0)}
                             </div>
                           ) : (
                             <div className="size-6 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                               <span className="material-symbols-outlined text-[14px] text-slate-400">person_add</span>
                             </div>
                           )}
                        </div>
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
                
                <button 
                  onClick={() => openCreateModal(column.id)}
                  className="h-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:border-primary/50 hover:text-primary transition-colors group"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-xl">add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <QuickAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialStatus={selectedStatus}
        initialProjectId={project.id}
      />
    </div>
  );
}
