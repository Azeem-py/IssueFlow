import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { useOrgQueries } from '../hooks/useOrgQueries';
import { useAuth } from '../contexts/AuthContext';
import { IssueStatus, IssuePriority } from '@issueflow/types';

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  priority: z.nativeEnum(IssuePriority),
  status: z.nativeEnum(IssueStatus),
  assigneeId: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: IssueStatus;
  initialProjectId?: string;
}

export function QuickAddModal({ isOpen, onClose, initialStatus, initialProjectId }: QuickAddModalProps) {
  const { currentOrg } = useAuth();
  const { useProjects } = useProjectQueries();
  const { data: projects } = useProjects();
  const { createIssue } = useIssueQueries();
  const { useMembers } = useOrgQueries();
  const { data: members } = useMembers();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      status: initialStatus || IssueStatus.BACKLOG,
      priority: IssuePriority.MEDIUM,
      projectId: initialProjectId || '',
    }
  });

  useEffect(() => {
    if (initialStatus) {
      setValue('status', initialStatus);
    }
  }, [initialStatus, setValue]);

  useEffect(() => {
    if (initialProjectId) {
      setValue('projectId', initialProjectId);
    }
  }, [initialProjectId, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        status: initialStatus || IssueStatus.BACKLOG,
        priority: IssuePriority.MEDIUM,
        projectId: initialProjectId || '',
      });
    }
  }, [isOpen, reset, initialStatus, initialProjectId]);

  const onSubmit = async (values: IssueFormValues) => {
    if (!currentOrg?.id) return;
    try {
      await createIssue.mutateAsync({
        ...values,
        organizationId: currentOrg.id,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const selectedPriority = watch('priority');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a1933] rounded-xl shadow-2xl border border-slate-200 dark:border-primary/20 overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-primary/10">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">add_task</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Quick-Add Issue</h2>
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-primary/20 rounded-lg transition-colors text-slate-500 dark:text-slate-400" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form className="p-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Issue Title</label>
            <input 
              {...register('title')}
              className={`w-full bg-slate-50 dark:bg-[#111022] border ${errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-[#333267]'} rounded-xl px-5 py-4 text-xl font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-[#9392c9] text-slate-900 dark:text-slate-100`}
              placeholder="e.g. Navigation bar is not responsive on mobile" 
              type="text"
              autoFocus
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Description</label>
                <textarea 
                  {...register('description')}
                  className="w-full bg-slate-50 dark:bg-[#111022] border border-slate-200 dark:border-[#333267] rounded-xl p-5 min-h-[150px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-[#9392c9] text-slate-900 dark:text-slate-100" 
                  placeholder="Add detailed description..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Project</label>
                  <select 
                    {...register('projectId')}
                    className={`w-full bg-slate-50 dark:bg-[#111022] border ${errors.projectId ? 'border-rose-500' : 'border-slate-200 dark:border-[#333267]'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-slate-900 dark:text-slate-100`}
                  >
                    <option value="">Select Project</option>
                    {projects?.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
                    ))}
                  </select>
                  {errors.projectId && <p className="text-rose-500 text-xs mt-1">{errors.projectId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Status</label>
                  <select 
                    {...register('status')}
                    className="w-full bg-slate-50 dark:bg-[#111022] border border-slate-200 dark:border-[#333267] rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-slate-900 dark:text-slate-100"
                  >
                    {Object.values(IssueStatus).map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Priority</label>
                <div className="flex gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setValue('priority', p)}
                      className={`flex-1 py-2 rounded-lg border transition-all text-[10px] font-bold flex flex-col items-center gap-1 group ${
                        selectedPriority === p 
                        ? 'border-2 border-primary bg-primary/10' 
                        : 'border-slate-200 dark:border-[#333267] bg-slate-50 dark:bg-[#111022] hover:border-primary/50'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-base ${
                        p === 'LOW' ? 'text-blue-400' : 
                        p === 'MEDIUM' ? 'text-primary' : 
                        p === 'HIGH' ? 'text-orange-500' : 'text-rose-500'
                      }`}>
                        {p === 'LOW' ? 'low_priority' : p === 'URGENT' ? 'emergency' : 'priority_high'}
                      </span>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Assignee</label>
                <select 
                  {...register('assigneeId')}
                  className="w-full bg-slate-50 dark:bg-[#111022] border border-slate-200 dark:border-[#333267] rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-slate-900 dark:text-slate-100"
                >
                  <option value="">Unassigned</option>
                  {members?.map(member => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name || member.user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-primary/10">
            <button className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-primary/10 transition-colors" type="button" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Issue'}
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
