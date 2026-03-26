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
      const { data } = await api.get('/dashboard');
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const useActivityFeed = () => useQuery<IActivityLog[]>({
    queryKey: ['activity-feed', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get('/activity');
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always', // Force refetch on mount as requested
  });

  const useAuditLogs = () => useQuery<IActivityLog[]>({
    queryKey: ['audit-logs', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get('/activity/audit');
      return data;
    },
    enabled: !!currentOrg?.id,
    refetchOnMount: 'always', // Force refetch on mount as requested
  });

  return {
    useDashboardStats,
    useActivityFeed,
    useAuditLogs,
  };
}
