import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Issues } from './pages/Issues';
import { Team } from './pages/Team';
import { IssueDetails } from './pages/IssueDetails';
import { Projects } from './pages/Projects';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
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
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Workspace Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout><Dashboard /></Layout>} path="/" />
                <Route element={<Layout><Issues /></Layout>} path="/issues" />
                <Route element={<Layout><IssueDetails /></Layout>} path="/issues/:id" />
                <Route element={<Layout><Projects /></Layout>} path="/projects" />
                <Route element={<Layout><Team /></Layout>} path="/team" />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
