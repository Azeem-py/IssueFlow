import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateInviteInput, UserRole } from '@issueflow/types';

export function useOrgQueries() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  // Get organization members
  const useMembers = () => useQuery<any[]>({
    queryKey: ['org-members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/members`);
      return data;
    },
    enabled: !!currentOrg?.id,
  });

  // Get pending invitations
  const useInvites = () => useQuery<any[]>({
    queryKey: ['org-invites', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data } = await api.get(`/organizations/${currentOrg.id}/invites`);
      return data;
    },
    enabled: !!currentOrg?.id,
  });

  // Create invitation mutation
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

  return {
    useMembers,
    useInvites,
    createInvite: createInviteMutation,
    updateMemberRole: updateMemberRoleMutation,
  };
}
