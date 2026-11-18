import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  ArrowLeftIcon,
  Button,
  Input,
  LockIcon,
  MailIcon,
  ShieldIcon,
} from '@issueflow/ui';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { AuthShell } from '../components/AuthShell';

export function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { forgotPassword, resetPassword } = useAuthQueries();
  const navigate = useNavigate();

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await forgotPassword.mutateAsync(email);
      setMessage(response.message);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send a reset code. Check your email and try again.');
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await resetPassword.mutateAsync({ email, otp, newPassword });
      setMessage('Password reset. Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not reset your password. Check the code and try again.');
    }
  };

  return (
    <AuthShell
      title={step === 'email' ? 'Reset your password' : 'Choose a new password'}
      description={
        step === 'email'
          ? 'Enter the email on your account and we’ll send a 6-digit verification code.'
          : `Enter the code sent to ${email} and choose a new password.`
      }
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-brand-300 underline decoration-brand-500/40 underline-offset-2 transition-colors hover:text-brand-200">
          <ArrowLeftIcon className="size-3.5" />
          Back to sign in
        </Link>
      }
    >
      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          {error && <Alert tone="danger" title="Could not send code" description={error} />}
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            leftIcon={<MailIcon />}
            autoFocus
          />
          <Button type="submit" fullWidth loading={forgotPassword.isPending}>
            Send verification code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && <Alert tone="danger" title="Could not reset password" description={error} />}
          {message && <Alert tone="success" title="Code sent" description={message} />}

          <div>
            <label htmlFor="otp" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              Verification code
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="h-11 text-center font-mono text-lg tracking-[0.5em]"
              autoFocus
            />
          </div>

          <Input
            label="New password"
            type="password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Create a new password"
            leftIcon={<LockIcon />}
          />

          <Input
            label="Confirm new password"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the new password"
            leftIcon={<LockIcon />}
            error={
              confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match.' : undefined
            }
          />

          <Button type="submit" fullWidth loading={resetPassword.isPending} disabled={!otp || !newPassword}>
            Reset password
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setError('');
              setMessage('');
            }}
            className="w-full text-center text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Use a different email
          </button>
        </form>
      )}

      <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-subtle bg-panel/60 p-3">
        <ShieldIcon className="mt-0.5 size-4 shrink-0 text-ink-disabled" />
        <p className="text-[11.5px] leading-relaxed text-ink-muted">
          Reset codes expire after a short period. If you don&apos;t receive one, check your spam folder or
          contact a workspace admin.
        </p>
      </div>
    </AuthShell>
  );
}
