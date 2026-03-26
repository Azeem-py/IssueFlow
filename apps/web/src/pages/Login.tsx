import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthQueries();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (!isLoading && user) {
    window.location.href = '/dashboard';
    return null;
  }

  // Prevent flicker during initial load
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background-dark gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing workspace...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login.mutateAsync({ email, password, rememberMe });
      
      // Small pause to ensure browser cookie write is prioritized before reload
      await new Promise(r => setTimeout(r, 100));
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-dark relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative">
        <div className="bg-card-dark/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="size-12 rounded-xl overflow-hidden shadow-lg shadow-primary/30 mb-4">
              <img src="/apple-touch-icon.png" alt="IssueFlow" className="size-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to your IssueFlow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" title="Coming soon!" className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider">Forgot password?</Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900/50 text-primary focus:ring-primary/50 focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer">
                Keep me logged in
              </label>
            </div>

            <button 
              type="submit" 

              disabled={login.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">Get started for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
