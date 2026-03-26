import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { INotification } from '@issueflow/types';

export function useNotificationQueries() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  const useMyNotifications = () => useQuery<INotification[]>({
    queryKey: ['my-notifications', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get('/notifications', {
        headers: { 'x-org-id': currentOrg.id },
      });
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 15000, // 15 seconds polling
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/notifications/${id}/read`, {}, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications', currentOrg?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/notifications/read-all`, {}, {
        headers: { 'x-org-id': currentOrg?.id },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications', currentOrg?.id] });
    },
  });

  return {
    useMyNotifications,
    markAsRead: markAsReadMutation,
    markAllAsRead: markAllAsReadMutation,
  };
}
