import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  EyeIcon,
  EyeOffIcon,
  Input,
  KeyIcon,
  LockIcon,
  MailIcon,
  Select,
  Spinner,
  UserIcon,
} from '@issueflow/ui';
import { UserRole } from '@issueflow/types';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/AuthShell';

const ROLE_HINT: Record<string, string> = {
  MEMBER: 'Create and edit issues, move work, and comment.',
  ADMIN: 'Manage projects, invite members, and oversee workspace operations.',
  VIEWER: 'Read-only access to projects, issues, and comments.',
};

export function Signup() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirect =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuthQueries();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate(redirect, { replace: true });
  }, [user, authLoading, navigate, redirect]);

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas">
        <Spinner className="size-6 text-brand-400" />
        <p className="text-[12.5px] text-ink-muted">Loading your workspace…</p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await register.mutateAsync({
        email,
        password,
        name,
        role,
        ...(role === UserRole.ADMIN && { secretCode }),
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create your account. Try again.');
    }
  };

  return (
    <AuthShell
      wide
      title="Create your account"
      description="Start tracking work with your team in a few seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-300 underline decoration-brand-500/40 underline-offset-2 transition-colors hover:text-brand-200">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger" title="Could not create account" description={error} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            leftIcon={<UserIcon />}
          />
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            leftIcon={<MailIcon />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            leftIcon={<LockIcon />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="rounded p-1 text-ink-muted transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            }
          />
          <Select
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            hint={ROLE_HINT[role]}
          >
            <option value={UserRole.MEMBER}>Member</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.VIEWER}>Viewer</option>
          </Select>
        </div>

        {role === UserRole.ADMIN && (
          <div className="rounded-lg border border-brand-500/25 bg-brand-500/[0.05] p-3">
            <div className="mb-2 flex items-center gap-2">
              <KeyIcon className="size-4 text-brand-300" />
              <p className="text-[12px] font-medium text-ink">Admin registration code</p>
            </div>
            <Input
              type={showSecretCode ? 'text' : 'password'}
              required
              value={secretCode}
              onChange={(event) => setSecretCode(event.target.value)}
              placeholder="Enter the code from your owner"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowSecretCode((visible) => !visible)}
                  aria-label={showSecretCode ? 'Hide code' : 'Show code'}
                  className="rounded p-1 text-ink-muted transition-colors hover:text-ink"
                >
                  {showSecretCode ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              }
              aria-label="Admin registration code"
            />
            <p className="mt-1.5 text-[11px] text-ink-muted">Ask a workspace owner for this code.</p>
          </div>
        )}

        <Button type="submit" fullWidth loading={register.isPending} className="mt-1">
          Create account
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-ink-disabled">
          By creating an account you agree to the Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
