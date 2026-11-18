import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IssueStatus, IssuePriority } from '@issueflow/types';
import {
  Alert,
  Button,
  Dialog,
  Input,
  Select,
  Textarea,
  useToast,
} from '@issueflow/ui';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useIssueQueries } from '../hooks/useIssueQueries';
import { useOrgQueries } from '../hooks/useOrgQueries';
import { useAuth } from '../contexts/AuthContext';
import { priorityLabel, statusLabel } from '../lib/issueMeta';

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

const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-amber-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-400',
};

export function QuickAddModal({ isOpen, onClose, initialStatus, initialProjectId }: QuickAddModalProps) {
  const { currentOrg } = useAuth();
  const { useProjects } = useProjectQueries();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { createIssue } = useIssueQueries();
  const { useMembers } = useOrgQueries();
  const { data: members } = useMembers();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      status: initialStatus || IssueStatus.BACKLOG,
      priority: IssuePriority.MEDIUM,
      projectId: initialProjectId || '',
    },
  });

  useEffect(() => {
    if (initialStatus) setValue('status', initialStatus);
  }, [initialStatus, setValue]);

  useEffect(() => {
    if (initialProjectId) setValue('projectId', initialProjectId);
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
      const created = await createIssue.mutateAsync({
        ...values,
        assigneeId: values.assigneeId || undefined,
        organizationId: currentOrg.id,
      });
      toast({
        tone: 'success',
        title: 'Issue created',
        description: created?.shortId ? `${created.shortId} — ${values.title}` : values.title,
      });
      onClose();
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Could not create issue',
        description: 'Your draft is preserved. Check the form and try again.',
      });
    }
  };

  const selectedPriority = watch('priority');
  const titleValue = watch('title');
  const projectValue = watch('projectId');
  const hasProjects = Boolean(projects && projects.length > 0);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Create issue"
      description="Add the essentials now. You can refine details on the issue page."
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="quick-add-form"
            size="sm"
            loading={isSubmitting || createIssue.isPending}
            disabled={!hasProjects || !titleValue?.trim() || !projectValue}
          >
            Create issue
          </Button>
        </>
      }
    >
      <form id="quick-add-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLoadingProjects && !hasProjects && (
          <Alert
            tone="warning"
            title="Create a project first"
            description="Issues live inside projects so they can get a short key."
            action={
              <Link
                to="/dashboard/projects"
                onClick={onClose}
                className="text-[12px] font-medium text-brand-300 underline underline-offset-2 hover:text-brand-200"
              >
                Go to projects
              </Link>
            }
          />
        )}

        <Input
          label="Title"
          required
          autoFocus
          placeholder="e.g. Navigation bar is not responsive on mobile"
          error={errors.title?.message}
          className="h-10 text-[14px]"
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Add context, steps to reproduce, or acceptance criteria. Markdown is supported."
          rows={5}
          {...register('description')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Project" required error={errors.projectId?.message} {...register('projectId')}>
            <option value="">Select a project</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.key})
              </option>
            ))}
          </Select>

          <Select label="Status" {...register('status')}>
            {Object.values(IssueStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-secondary">Priority</p>
            <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Priority">
              {(Object.values(IssuePriority) as IssuePriority[]).map((priority) => {
                const active = selectedPriority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setValue('priority', priority, { shouldDirty: true })}
                    aria-pressed={active}
                    className={`flex h-9 flex-col items-center justify-center gap-1 rounded-md border text-[10.5px] font-medium capitalize transition-colors ${
                      active
                        ? 'border-brand-500/50 bg-brand-500/10 text-brand-200'
                        : 'border-subtle bg-canvas text-ink-muted hover:border-line hover:text-ink'
                    }`}
                  >
                    <span aria-hidden="true" className={`size-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
                    {priorityLabel(priority)}
                  </button>
                );
              })}
            </div>
          </div>

          <Select label="Assignee" {...register('assigneeId')}>
            <option value="">Unassigned</option>
            {members?.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.name || member.user.email}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Dialog>
  );
}
