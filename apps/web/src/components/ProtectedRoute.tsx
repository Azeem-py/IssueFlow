import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@issueflow/ui';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-canvas">
        <Spinner className="size-6 text-brand-400" />
        <p className="text-[12.5px] text-ink-muted">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
