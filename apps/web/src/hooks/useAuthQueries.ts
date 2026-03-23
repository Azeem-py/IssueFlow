import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { UserRole } from '@issueflow/types';

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
});
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
    onSuccess: () => {
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
      queryClient.invalidateQueries();
    },
  });

  // Get current user organizations
  const useOrganizations = () => useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await api.get('/organizations');
      return data;
    },
  });

  // Create organization mutation
  const createOrganizationMutation = useMutation({
    mutationFn: async (orgData: { name: string; slug: string; logoUrl?: string }) => {
      const { data } = await api.post('/organizations', orgData);
      return data;
    },
    onSuccess: () => {
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

  return {
    useMe,
    useOrganizations,
    createOrganization: createOrganizationMutation,
    updateProfile: updateProfileMutation,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
  };
}
