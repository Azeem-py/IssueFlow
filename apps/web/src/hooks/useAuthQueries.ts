import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { UserRole } from '@issueflow/types';

export function useAuthQueries() {
  const queryClient = useQueryClient();

  // Get current user profile
  const useMe = () => useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
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
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
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
      localStorage.removeItem('access_token');
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
    mutationFn: async (orgData: { name: string; slug: string }) => {
      const { data } = await api.post('/organizations', orgData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  return {
    useMe,
    useOrganizations,
    createOrganization: createOrganizationMutation,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
