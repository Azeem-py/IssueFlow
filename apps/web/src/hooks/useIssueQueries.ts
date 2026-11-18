import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { CreateIssueInput, UpdateIssueInput, IIssue, SearchFilters } from '@issueflow/types';
import { useAuth } from '../contexts/AuthContext';

export function useIssueQueries() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  // Get issues for current organization
  const useIssues = (filters: SearchFilters = {}) => useQuery<IIssue[]>({
    queryKey: ['issues', currentOrg?.id, filters],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get('/issues', {
        headers: { 'x-org-id': currentOrg.id },
        params: filters,
      });
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: async (issueData: CreateIssueInput) => {
      const { data } = await api.post('/issues', issueData, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['activity-feed', currentOrg?.id] });
    },
  });

  // Update issue mutation
  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateIssueInput & { id: string }) => {
      const { data } = await api.post(`/issues/${id}`, updateData, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Keep the detail view in sync immediately.
      queryClient.setQueryData(['issues', currentOrg?.id, variables.id], (old: any) =>
        old ? { ...old, ...data } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['issues', currentOrg?.id, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['issues', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['activity-feed', currentOrg?.id] });
    },
  });

  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/issues/${id}`, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['issues', currentOrg?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['issues', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['activity-feed', currentOrg?.id] });
    },
  });

  // Get a single issue
  const useIssue = (id?: string) => useQuery<IIssue>({
    queryKey: ['issues', currentOrg?.id, id],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${id}`, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    enabled: !!id && !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get comments for an issue
  const useComments = (issueId?: string) => useQuery<any[]>({
    queryKey: ['comments', currentOrg?.id, issueId],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${issueId}/comments`, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    enabled: !!issueId && !!currentOrg?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ issueId, content, parentId, mentions }: { issueId: string; content: string; parentId?: string; mentions?: string[] }) => {
      const { data } = await api.post(`/issues/${issueId}/comments`, { content, parentId, mentions }, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', currentOrg?.id, variables.issueId] });
      queryClient.invalidateQueries({ queryKey: ['activity-feed', currentOrg?.id] });
    },
  });

  return {
    useIssues,
    useIssue,
    useComments,
    createIssue: createIssueMutation,
    updateIssue: updateIssueMutation,
    deleteIssue: deleteIssueMutation,
    addComment: addCommentMutation,
  };
}
