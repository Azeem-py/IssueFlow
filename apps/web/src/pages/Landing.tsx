import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 selection:bg-primary/30 selection:text-primary overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(15,15,15,0)_0%,rgba(10,10,10,1)_100%)] z-10"></div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-white text-2xl">fluid</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">IssueFlow</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          {user ? (
            <Link 
              to="/dashboard" 
              className="px-6 py-2.5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2"
            >
              Dashboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Log In</Link>
              <Link 
                to="/signup" 
                className="px-6 py-2.5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-200 transition-all hover:shadow-xl hover:shadow-white/10"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-40 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="size-2 bg-primary rounded-full animate-ping"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Now in Private Beta</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] md:leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          STAY IN THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-gradient">FLOW.</span>
        </h1>
        
        <p className="max-w-xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 leading-relaxed">
          The high-performance issue tracker designed for developers who value speed, precision, and state-of-the-art aesthetics.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
          <Link 
            to="/signup" 
            className="w-full md:w-auto px-10 py-5 bg-primary text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
          >
            Create Workspace
          </Link>
          <button className="w-full md:w-auto px-10 py-5 bg-slate-900 border border-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all">
            See Documentation
          </button>
        </div>

        {/* Mockup Preview */}
        <div className="mt-32 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10 rounded-full"></div>
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-3xl p-2 shadow-[0_0_100px_rgba(37,99,235,0.1)]">
            <div className="aspect-[16/9] w-full bg-background-dark rounded-2xl border border-slate-800 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
                {/* Simulated UI elements */}
                <div className="absolute top-0 left-0 w-64 h-full border-r border-slate-800 p-6 hidden md:block">
                    <div className="h-8 w-32 bg-slate-800 rounded-lg mb-8"></div>
                    <div className="space-y-4">
                        {[1,2,3,4].map(i => <div key={i} className="h-6 w-full bg-slate-800/50 rounded-lg"></div>)}
                    </div>
                </div>
                <div className="absolute top-0 left-0 md:left-64 right-0 p-8">
                    <div className="flex justify-between mb-8">
                        <div className="h-10 w-48 bg-slate-800 rounded-xl"></div>
                        <div className="h-10 w-32 bg-primary/50 rounded-xl"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-64 bg-slate-800/30 rounded-2xl border border-white/5 p-6">
                                <div className="h-4 w-24 bg-slate-700 rounded-full mb-4"></div>
                                <div className="space-y-3">
                                    {[1,2,3].map(j => <div key={j} className="h-16 bg-slate-800/50 rounded-xl"></div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-500">
                    <div className="size-20 bg-white text-black rounded-full flex items-center justify-center shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl fill-current leading-none ml-1">play_arrow</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-40 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { title: 'Blazing Fast', desc: 'Optimized for keyboard-first navigation and sub-millisecond response times.', icon: 'bolt' },
                { title: 'Multi-Tenant', desc: 'Secure isolation between organizations with robust role-based access control.', icon: 'security' },
                { title: 'Rich UI', desc: 'A stunning dark-themed interface that keeps you in the creative flow.', icon: 'palette' }
            ].map(f => (
                <div key={f.title} className="group">
                    <div className="size-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                        <span className="material-symbols-outlined text-primary">{f.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-slate-600 font-medium ml-1">© 2026 IssueFlow. Engineered by Azeem.</p>
        <div className="flex gap-8 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-white cursor-pointer transition-colors">Legal</span>
        </div>
      </footer>
    </div>
  );
}
