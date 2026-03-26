import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const acceptInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/organizations/invites/accept', { token });
      return data;
    },
    onSuccess: async () => {
      // Refresh user to get the new membership
      await refreshUser();
      navigate('/');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    }
  });

  useEffect(() => {
    if (!user) {
      // If not logged in, redirect to login but save the invite token for later
      localStorage.setItem('pending_invite_token', token || '');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (token && !acceptInviteMutation.isPending && !acceptInviteMutation.isSuccess && !error) {
      acceptInviteMutation.mutate(token);
    }
  }, [user, token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card-dark border border-slate-800 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-rose-500 text-6xl mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Invitation Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card-dark border border-slate-800 rounded-xl p-8 text-center">
        <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Accepting Invitation</h2>
        <p className="text-slate-500">Please wait while we add you to the organization...</p>
      </div>
    </div>
  );
}
