import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { IssueStatus, IssuePriority, IIssue } from '@issueflow/types';
import { QuickAddModal } from '../components/QuickAddModal';
import { useAuth } from '../contexts/AuthContext';

const COLUMNS: { id: IssueStatus; label: string; color: string }[] = [
  { id: IssueStatus.BACKLOG, label: 'Backlog', color: 'bg-slate-400' },
  { id: IssueStatus.TODO, label: 'To Do', color: 'bg-orange-500' },
  { id: IssueStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-primary' },
  { id: IssueStatus.REVIEW, label: 'Review', color: 'bg-blue-500' },
  { id: IssueStatus.DONE, label: 'Done', color: 'bg-emerald-500' },
];

export function Issues() {
  const { currentOrg } = useAuth();
  const { useIssues, updateIssue } = useIssueQueries();
  const { data: issues = [], isLoading } = useIssues();
  
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

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case IssuePriority.LOW: return 'bg-blue-400';
      case IssuePriority.MEDIUM: return 'bg-primary';
      case IssuePriority.HIGH: return 'bg-orange-500';
      case IssuePriority.URGENT: return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  // Improved filtering logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (issue as any).project?.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(issue.status);
    const matchesPriority = activeFilters.priority.length === 0 || activeFilters.priority.includes(issue.priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!currentOrg) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="size-20 bg-slate-100 dark:bg-card-dark rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-400">corporate_fare</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">No Organization Selected</h2>
        <p className="text-slate-500 max-w-md">Please select or create an organization to view and manage issues.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header / Filter Bar */}
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-4xl font-black tracking-[0.2em] uppercase text-primary font-display italic">Issues</h1>
          <button 
            onClick={() => openCreateModal()}
            className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm md:text-xl">add_circle</span>
            New Task
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-2 shadow-sm">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search by title or project key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-4 focus:ring-primary/5 pl-12 pr-4 py-3 text-sm font-medium rounded-xl outline-none"
            />
          </div>
          
          <div className="h-px lg:h-8 w-full lg:w-px bg-slate-100 dark:bg-slate-800"></div>
          
          <div className="flex items-center gap-2 px-2">
             <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
               {Object.values(IssuePriority).map((p) => (
                  <button 
                    key={p}
                    onClick={() => {
                      setActiveFilters(prev => ({
                        ...prev,
                        priority: prev.priority.includes(p) ? prev.priority.filter(x => x !== p) : [...prev.priority, p]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      activeFilters.priority.includes(p) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
               ))}
             </div>
             { (activeFilters.priority.length > 0 || searchQuery) && (
                <button 
                  onClick={() => { setSearchQuery(''); setActiveFilters({ status: [], priority: [] }); }}
                  className="size-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Main Kanban Board Area */}
      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar flex-1 min-h-0 px-1">
        {COLUMNS.map((column) => {
          const columnIssues = filteredIssues.filter(i => i.status === column.id);
          
          return (
            <div key={column.id} className="w-80 flex flex-col gap-4 flex-shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold dark:text-slate-200 uppercase tracking-wider">{column.label}</span>
                  <span className="bg-slate-200 dark:bg-card-dark px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{columnIssues.length}</span>
                </div>
                <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-xl">more_horiz</span></button>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark animate-pulse h-32"></div>
                  ))
                ) : (
                  columnIssues.map((issue) => (
                    <Link 
                      key={issue.id} 
                      to={`/dashboard/issues/${issue.id}`}
                      className={`bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm hover:border-primary/50 transition-all group cursor-pointer block ${issue.priority === IssuePriority.URGENT ? 'border-l-4 border-l-rose-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{(issue as any).project?.key}-{issue.shortId.split('-').pop()}</span>
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
                           <span className="text-[10px] font-medium text-slate-500">{(issue as any).project?.name}</span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
                
                {/* Add task button */}
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
      />
    </div>
  );
}
