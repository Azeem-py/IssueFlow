import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/invite/accept" element={<AcceptInvite />} />

              {/* Protected Workspace Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout><Dashboard /></Layout>} path="/" />
                <Route element={<Layout><Issues /></Layout>} path="/issues" />
                <Route element={<Layout><IssueDetails /></Layout>} path="/issues/:id" />
                <Route element={<Layout><Projects /></Layout>} path="/projects" />
                <Route element={<Layout><ProjectDetails /></Layout>} path="/projects/:id" />
                <Route element={<Layout><Team /></Layout>} path="/team" />
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
