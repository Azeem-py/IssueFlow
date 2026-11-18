import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Spinner } from '@issueflow/ui';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/AuthShell';

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, refreshUser, setCurrentOrg, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteToken: string) => {
      const { data } = await api.post('/organizations/invites/accept', { token: inviteToken });
      return data;
    },
    onSuccess: async (data: any) => {
      await refreshUser();
      if (data?.organization) {
        setCurrentOrg({ ...data.organization, members: [{ role: data.role }] });
      }
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'This invitation could not be accepted. It may be expired or already used.');
    },
  });

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      localStorage.setItem('pending_invite_token', token || '');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!token) {
      setError('This invitation link is missing its token.');
      return;
    }

    if (!attemptedRef.current) {
      attemptedRef.current = true;
      acceptInviteMutation.mutate(token);
    }
  }, [user, token, navigate, isLoading]);

  if (error) {
    return (
      <AuthShell
        title="Invitation couldn’t be accepted"
        description="The link may be expired, revoked, or already used."
        footer={
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="font-medium text-brand-300 transition-colors hover:text-brand-200"
          >
            Continue to your workspace
          </button>
        }
      >
        <div className="space-y-4">
          <Alert tone="danger" title="Invitation error" description={error} />
          <Button fullWidth onClick={() => navigate('/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Joining workspace"
      description="We’re adding you to the workspace. This usually takes a moment."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-subtle bg-panel p-4">
          <Spinner className="size-5 text-brand-400" />
          <div>
            <p className="text-[13px] font-medium text-ink">Accepting invitation</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">Please keep this page open.</p>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-500/60" />
        </div>
      </div>
    </AuthShell>
  );
}
