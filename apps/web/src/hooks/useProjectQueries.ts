import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { CreateProjectInput, IProject } from '@issueflow/types';
import { useAuth } from '../contexts/AuthContext';

export function useProjectQueries() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  // Get projects for current organization
  const useProjects = () => useQuery<IProject[]>({
    queryKey: ['projects', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/projects`);
      return data;
    },
    enabled: !!currentOrg?.id,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectInput) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.post(`/organizations/${currentOrg.id}/projects`, projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentOrg?.id] });
    },
  });

  return {
    useProjects,
    createProject: createProjectMutation,
  };
}
