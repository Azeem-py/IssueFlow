import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Checkbox,
  EyeIcon,
  EyeOffIcon,
  Input,
  LockIcon,
  MailIcon,
  Spinner,
} from '@issueflow/ui';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/AuthShell';

export function Login() {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirect =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthQueries();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) navigate(redirect, { replace: true });
  }, [user, isLoading, navigate, redirect]);

  if (isLoading || user) {
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
      await login.mutateAsync({ email, password, rememberMe });
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email or password is incorrect.');
    }
  };

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Enter your details to continue to your workspace."
      footer={
        <>
          New to IssueFlow?{' '}
          <Link to="/signup" className="font-medium text-brand-300 underline decoration-brand-500/40 underline-offset-2 transition-colors hover:text-brand-200">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger" title="Could not sign in" description={error} />}

        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          leftIcon={<MailIcon />}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-medium text-ink-secondary">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-medium text-brand-300 transition-colors hover:text-brand-200"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
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
        </div>

        <Checkbox
          label="Keep me signed in"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />

        <Button type="submit" fullWidth loading={login.isPending} className="mt-1">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
