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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get a single project
  const useProject = (projectId?: string) => useQuery<IProject>({
    queryKey: ['projects', currentOrg?.id, projectId],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${currentOrg?.id}/projects/${projectId}`);
      return data;
    },
    enabled: !!currentOrg?.id && !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...projectData }: { id: string } & CreateProjectInput) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.post(`/organizations/${currentOrg.id}/projects/${id}`, projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentOrg?.id] });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.delete(`/organizations/${currentOrg.id}/projects/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentOrg?.id] });
    },
  });

  return {
    useProjects,
    useProject,
    createProject: createProjectMutation,
    updateProject: updateProjectMutation,
    deleteProject: deleteProjectMutation,
  };
}
