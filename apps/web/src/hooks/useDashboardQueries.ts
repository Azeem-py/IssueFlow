import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { IDashboardStats, IActivityLog } from '@issueflow/types';

export function useDashboardQueries() {
  const { currentOrg } = useAuth();

  const useDashboardStats = () => useQuery<IDashboardStats>({
    queryKey: ['dashboard-stats', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return { baseStats: [], advancedStats: [] };
      const { data } = await api.get('/dashboard', {
        headers: { 'x-org-id': currentOrg.id },
      });
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const useActivityFeed = () => useQuery<IActivityLog[]>({
    queryKey: ['activity-feed', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get('/activity', {
        headers: { 'x-org-id': currentOrg.id },
      });
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    useDashboardStats,
    useActivityFeed,
  };
}
