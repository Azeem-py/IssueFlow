import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CreateIssueInput, IssueStatus, IssuePriority } from '@issueflow/types';

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(IssueStatus).default(IssueStatus.BACKLOG),
  priority: z.nativeEnum(IssuePriority).default(IssuePriority.MEDIUM),
  projectId: z.string().min(1, 'Project ID is required'),
});

type IssueFormData = z.infer<typeof issueSchema>;

export function QuickAddForm() {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.MEDIUM,
      projectId: 'project-1', // Placeholder
    }
  });

  const mutation = useMutation({
    mutationFn: (newIssue: CreateIssueInput) => axios.post('/api/issues', newIssue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      reset();
    },
  });

  const onSubmit = (data: IssueFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h3>Quick Add Issue</h3>
      <div>
        <input {...register('title')} placeholder="Title" />
        {errors.title && <span style={{ color: 'red' }}>{errors.title.message}</span>}
      </div>
      <div>
        <textarea {...register('description')} placeholder="Description" />
      </div>
      <div>
        <select {...register('status')}>
          {Object.values(IssueStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <select {...register('priority')}>
          {Object.values(IssuePriority).map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add Issue'}
      </button>
    </form>
  );
}
