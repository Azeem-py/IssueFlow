import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { IUser } from '@issueflow/types';

export function useAuthQueries() {
  const queryClient = useQueryClient();

  // Get current user
  const useMe = () => useQuery<IUser>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Seed the cache immediately so useMe() returns the user without a fetch
      queryClient.setQueryData(['me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      // Seed the cache with the new user
      queryClient.setQueryData(['me'], data?.user ?? data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/logout');
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
      localStorage.removeItem('issueflow_org_id');
      window.location.href = '/login';
    },
  });

  // Get current user organizations
  const useOrganizations = () => useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await api.get('/organizations');
      return data;
    },
    retry: false,
  });

  // Create organization mutation
  const createOrganizationMutation = useMutation({
    mutationFn: async (orgData: { name: string; slug: string; logoUrl?: string }) => {
      const { data } = await api.post('/organizations', orgData);
      return data;
    },
    onSuccess: (data) => {
      // Insert the new organization immediately so the UI can switch to it
      // without racing the background refetch.
      queryClient.setQueryData(['organizations'], (old: any[] | undefined) => {
        const list = old || [];
        return list.some((org) => org.id === data.id) ? list : [...list, data];
      });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { name?: string; avatarUrl?: string }) => {
      const { data } = await api.post('/auth/me', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Forgot Password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    },
  });

  // Reset Password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (resetData: any) => {
      const { data } = await api.post('/auth/reset-password', resetData);
      return data;
    },
  });

  // Get invitations received by the current user
  const useMyInvitations = () => useQuery({
    queryKey: ['my-invitations'],
    queryFn: async () => {
      const { data } = await api.get('/organizations/invites/my');
      return data;
    },
  });

  // Decline invitation mutation
  const declineInvitationMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await api.post(`/organizations/invites/${inviteId}/decline`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
    },
  });

  // Delete organization mutation (owner only)
  const deleteOrganizationMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const { data } = await api.delete(`/organizations/${orgId}`, {
        headers: { 'x-org-id': orgId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      localStorage.removeItem('issueflow_org_id');
    },
  });

  return {
    useMe,
    useOrganizations,
    useMyInvitations,
    declineInvitation: declineInvitationMutation,
    createOrganization: createOrganizationMutation,
    deleteOrganization: deleteOrganizationMutation,
    updateProfile: updateProfileMutation,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
  };
}
