import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { ThemeProvider } from './components/ThemeProvider';
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

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="issueflow-theme-v2">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/invite/accept" element={<AcceptInvite />} />

              {/* Protected Workspace Routes - Moved under /dashboard */}
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
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
