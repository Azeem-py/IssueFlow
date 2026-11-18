import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@issueflow/ui';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Issues } from './pages/Issues';
import { Team } from './pages/Team';
import { IssueDetails } from './pages/IssueDetails';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AcceptInvite } from './pages/AcceptInvite';
import { ForgotPassword } from './pages/ForgotPassword';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const DesignSystem = lazy(() =>
  import('./pages/DesignSystem').then((module) => ({ default: module.DesignSystem })),
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/invite/accept" element={<AcceptInvite />} />
              <Route
                path="/design-system"
                element={
                  <Suspense
                    fallback={
                      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">
                        Loading design system…
                      </div>
                    }
                  >
                    <DesignSystem />
                  </Suspense>
                }
              />

              {/* Protected workspace routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/dashboard/issues" element={<Layout><Issues /></Layout>} />
                <Route path="/dashboard/issues/:id" element={<Layout><IssueDetails /></Layout>} />
                <Route path="/dashboard/projects" element={<Layout><Projects /></Layout>} />
                <Route path="/dashboard/projects/:id" element={<Layout><ProjectDetails /></Layout>} />
                <Route path="/dashboard/team" element={<Layout><Team /></Layout>} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && import.meta.env.VITE_SHOW_DEVTOOLS === 'true' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
