import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateInviteInput, UserRole } from '@issueflow/types';

export function useOrgQueries() {
  const queryClient = useQueryClient();
  const { currentOrg, refreshUser } = useAuth();

  // Get organization members
  const useMembers = () => useQuery<any[]>({
    queryKey: ['org-members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/members`);
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Get pending invitations (sent by this org)
  const useInvites = () => useQuery<any[]>({
    queryKey: ['org-invites', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/invites`);
      return data;
    },
    enabled: !!currentOrg?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get invitations sent TO the current user
  const useMyInvites = () => useQuery<any[]>({
    queryKey: ['my-invites'],
    queryFn: async () => {
      const { data } = await api.get('/organizations/invites/my');
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 10000, // Poll every 5 seconds for real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Create invitation mutation (sent by user)
  const createInviteMutation = useMutation({
    mutationFn: async (inviteData: CreateInviteInput) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.post(`/organizations/${currentOrg.id}/invites`, inviteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-invites', currentOrg?.id] });
    },
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: UserRole }) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.post(`/organizations/${currentOrg.id}/members/${memberId}/role`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', currentOrg?.id] });
    },
  });

  // Revoke invitation mutation (cancel sent invite)
  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.delete(`/organizations/${currentOrg.id}/invites/${inviteId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-invites', currentOrg?.id] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!currentOrg?.id) throw new Error('No active organization');
      const { data } = await api.delete(`/organizations/${currentOrg.id}/members/${memberId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', currentOrg?.id] });
    },
  });

  // Accept invitation mutation (received invite)
  const acceptInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/organizations/invites/accept', { token });
      return data;
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  // Decline invitation mutation (received invite)
  const declineInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await api.post(`/organizations/invites/${inviteId}/decline`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
    },
  });

  return {
    useMembers,
    useInvites,
    useMyInvites,
    createInvite: createInviteMutation,
    updateMemberRole: updateMemberRoleMutation,
    revokeInvite: revokeInviteMutation,
    removeMember: removeMemberMutation,
    acceptInvite: acceptInviteMutation,
    declineInvite: declineInviteMutation,
  };
}
