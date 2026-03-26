import React, { useState } from 'react';
import { useAuthQueries } from '../hooks/useAuthQueries';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '@issueflow/types';

export function Signup() {
  const { user, isLoading: authLoading } = useAuth();
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

  // Redirect if already logged in
  if (!authLoading && user) {
    window.location.href = '/dashboard';
    return null;
  }

  // Prevent flicker during initial load
  if (authLoading) {
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
      await register.mutateAsync({ 
        email, 
        password, 
        name, 
        role,
        ...(role === UserRole.ADMIN && { secretCode })
      });
      
      // Small pause for cookie commit
      await new Promise(r => setTimeout(r, 100));
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-dark relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-lg relative py-12">
        <div className="bg-card-dark/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="size-12 rounded-xl overflow-hidden shadow-lg shadow-primary/30 mb-4">
              <img src="/apple-touch-icon.png" alt="IssueFlow" className="size-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create an Account</h1>
            <p className="text-slate-400 text-sm text-center">Join IssueFlow today and streamline your engineering workflow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">person</span>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Your Role</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">shield_person</span>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value={UserRole.MEMBER}>Member (Standard)</option>
                    <option value={UserRole.ADMIN}>Admin (Management)</option>
                    <option value={UserRole.VIEWER}>Viewer (Read-only)</option>
                  </select>
                </div>
              </div>
            </div>

            {role === UserRole.ADMIN && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2 ml-1">Admin Secret Code</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">key</span>
                  <input 
                    type={showSecretCode ? "text" : "password"} 
                    required
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="w-full bg-primary/10 border border-primary/30 rounded-xl pl-12 pr-12 py-3 text-primary outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-primary/40"
                    placeholder="Enter registration code"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretCode(!showSecretCode)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-xl">{showSecretCode ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-primary/60 px-1 font-medium italic">Contact workspace owner for this code</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={register.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {register.isPending ? 'Processing...' : 'Create Account'}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">rocket_launch</span>
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
        
        <p className="mt-6 text-center text-slate-600 text-xs px-8">
          By signing up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
