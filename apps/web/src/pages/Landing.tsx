import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Product', href: '#product' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Changelog', href: '#changelog' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary/30 selection:text-primary overflow-x-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] md:w-[70%] h-[70%] bg-primary/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] md:w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 border-b ${scrolled || isMobileMenuOpen ? 'bg-black/60 backdrop-blur-xl border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-9 md:size-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
              <img src="/apple-touch-icon.png" alt="IssueFlow" className="size-full object-cover" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">IssueFlow</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-6 mr-4">
              {user ? (
                <Link to="/dashboard" className="px-6 py-2.5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2">
                  Dashboard
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Log In</Link>
                  <Link to="/signup" className="px-6 py-2.5 bg-white text-black font-extrabold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-200 transition-all shadow-lg hover:shadow-white/5">
                    Start Building
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full inset-x-0 bg-black/90 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-white/5" />
            <div className="flex flex-col gap-4">
              {user ? (
                <Link to="/dashboard" className="w-full py-4 bg-primary text-white text-center font-black uppercase text-xs tracking-[0.2em] rounded-2xl">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="w-full py-4 bg-white/5 border border-white/10 text-white text-center font-black uppercase text-xs tracking-[0.2em] rounded-2xl">
                    Log In
                  </Link>
                  <Link to="/signup" className="w-full py-4 bg-white text-black text-center font-black uppercase text-xs tracking-[0.2em] rounded-2xl">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 md:pt-56 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.9] md:leading-[0.85] text-white">
          FLOW AT THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-white to-primary bg-[length:200%_auto] animate-gradient">SPEED OF LIGHT.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-2xl font-medium mb-12 md:mb-16 leading-relaxed px-4 opacity-80">
          The high-performance issue tracker designed for developers who value <span className="text-white font-bold">precision</span> over complexity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4">
          <Link to="/signup" className="group relative w-full sm:w-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center px-10 md:px-12 py-4 md:py-5 bg-primary text-white font-black uppercase text-[10px] md:text-xs tracking-[0.3em] rounded-2xl hover:bg-primary/90 transition-all">
              Launch Workspace
            </div>
          </Link>
          <button className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] md:text-xs tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl">
            Watch Demo
          </button>
        </div>

        {/* Dashboard Preview Plate - Hidden on smallest, optimized for others */}
        <div className="mt-20 md:mt-32 relative perspective-1000 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-primary/20 blur-[80px] md:blur-[120px] -z-10 rounded-full scale-90"></div>
          <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-1.5 md:p-2 shadow-2xl overflow-hidden group">
            <div className="aspect-[16/10] bg-[#0a0a0a] rounded-[1.2rem] md:rounded-[2rem] border border-white/5 overflow-hidden flex flex-col">
              {/* Fake UI Header */}
              <div className="h-10 md:h-14 border-b border-white/5 px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="size-2 md:size-3 rounded-full bg-rose-500/50"></div>
                  <div className="size-2 md:size-3 rounded-full bg-amber-500/50"></div>
                  <div className="size-2 md:size-3 rounded-full bg-emerald-500/50"></div>
                  <div className="h-3 md:h-4 w-24 md:w-40 bg-white/10 rounded-full ml-2 md:ml-4"></div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="size-6 md:size-8 rounded-lg bg-white/5"></div>
                  <div className="size-6 md:size-8 rounded-lg bg-white/5"></div>
                </div>
              </div>
              {/* Fake UI Body */}
              <div className="flex-1 flex overflow-hidden">
                <div className="w-20 md:w-64 border-r border-white/5 p-3 md:p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-6 md:h-8 w-full rounded-lg md:rounded-xl ${i === 1 ? 'bg-primary/20 border border-primary/20' : 'bg-white/5'}`}></div>)}
                </div>
                <div className="flex-1 p-4 md:p-8">
                  <div className="flex justify-between items-end mb-6 md:mb-10">
                    <div className="space-y-2">
                      <div className="h-3 md:h-4 w-20 md:w-32 bg-white/10 rounded-full"></div>
                      <div className="h-6 md:h-8 w-40 md:w-64 bg-white/20 rounded-lg md:rounded-xl"></div>
                    </div>
                    <div className="h-8 md:h-10 w-24 md:w-32 bg-primary rounded-lg md:rounded-xl"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map((s, i) => (
                      <div key={s} className={`${i > 0 ? 'hidden md:block' : ''} space-y-4`}>
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-primary' : 'bg-emerald-500'}`}></div>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{s}</span>
                        </div>
                        {[1, 2].map(j => (
                          <div key={j} className="h-24 md:h-32 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-3 md:space-y-4">
                            <div className="h-2.5 md:h-3 w-1/2 bg-white/10 rounded-full"></div>
                            <div className="h-2.5 md:h-3 w-3/4 bg-white/5 rounded-full"></div>
                            <div className="flex justify-between pt-2 md:pt-4">
                              <div className="size-5 md:size-6 rounded-full bg-white/10"></div>
                              <div className="h-3 md:h-4 w-10 md:w-12 bg-white/5 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Integrations - Optimized for Mobile */}
      <section id="product" className="py-24 md:py-40 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center text-center lg:text-left">
          <div className="space-y-8 md:space-y-12">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white uppercase italic">Zero <br /> Latency.</h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">Every interaction in IssueFlow is optimized for speed. No spinners, no progressive loading. Just pure, instant execution.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              {[
                { label: 'Time to Interactive', value: '42ms', desc: 'World class performance' },
                { label: 'Keyboard Latency', value: '<2ms', desc: 'Instant feedback' },
              ].map(stat => (
                <div key={stat.label} className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5">
                  <div className="text-3xl md:text-4xl font-black text-primary mb-2 italic tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-200 mb-1">{stat.label}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-primary/20 blur-[80px] md:blur-[120px] rounded-full"></div>
            <div className="relative p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 border-t-white/20">
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-400">Execution Speed Benchmark</span>
                  <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                </div>
                <div className="space-y-4 md:space-y-6">
                  {[
                    { name: 'IssueFlow', width: '100%', time: '42ms', color: 'bg-primary shadow-[0_0_20px_rgba(103,100,242,0.4)]' },
                    { name: 'Traditional CRM', width: '40%', time: '820ms', color: 'bg-slate-800' },
                    { name: 'Jira Legacy', width: '25%', time: '1450ms', color: 'bg-slate-900' }
                  ].map(bar => (
                    <div key={bar.name} className="space-y-2">
                      <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>{bar.name}</span>
                        <span>{bar.time}</span>
                      </div>
                      <div className="h-2.5 md:h-3 w-full bg-black rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: bar.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Features - GRID 4.0 */}
      <section id="features" className="py-24 md:py-40 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none text-center md:text-left">Built for <br /> Builders.</h2>
          <p className="max-w-sm text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs leading-loose text-center md:text-left mx-auto md:mx-0">We removed the friction between your code and your tracking. Use the interface you already love.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Keyboard First', desc: 'Every action has a shortcut. Keep your hands on the keys.', icon: 'keyboard' },
            { title: 'API Everything', desc: 'Powerful REST endpoints for total automation.', icon: 'api' },
            { title: 'Rich Markdown', desc: 'Write documentation and comments in syntax you know.', icon: 'code' },
            { title: 'Branch Tracking', desc: 'Automatically link PRs to issues with zero configuration.', icon: 'branch' },
            { title: 'Realtime Sync', desc: 'Collab without refresh. State is always perfectly synced.', icon: 'sync' },
            { title: 'Global Search', desc: 'Lightning fast command bar for finding anything instantly.', icon: 'search' },
            { title: 'Audit Logs', desc: 'Enterprise-grade security and tracking for every change.', icon: 'verified_user' },
            { title: 'Theme Engine', desc: 'Beautifully crafted dark and light modes out of the box.', icon: 'palette' }
          ].map((f, i) => (
            <div key={f.title} className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group flex flex-col justify-between min-h-[14rem] md:h-64 cursor-default">
              <div className="size-10 md:size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                <span className="material-symbols-outlined text-primary text-xl md:text-2xl">{f.icon}</span>
              </div>
              <div className="mt-6 md:mt-0">
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-2">{f.title}</h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 md:py-40 relative z-10 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="relative order-2 lg:order-1 hidden sm:block">
            <div className="grid grid-cols-3 gap-4 md:gap-6 transform -rotate-3 md:-rotate-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <div key={i} className={`aspect-square rounded-2xl md:rounded-3xl bg-black border border-white/5 flex items-center justify-center ${i % 2 === 0 ? 'opacity-20 translate-y-4 md:translate-y-8' : 'opacity-100 shadow-2xl shadow-primary/10'}`}>
                  <div className="size-8 md:size-12 rounded-xl bg-white/5 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 md:space-y-10 order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">Works with <br /> Your Stack.</h2>
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">Connect IssueFlow with the tools you use every day. From GitHub actions to Slack alerts, we keep everyone in the loop.</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {['Webhooks', 'Slack Bot', 'Prisma Sync'].map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-300">{tag}</span>
              ))}
            </div>
            <button className="flex items-center justify-center lg:justify-start gap-3 text-primary font-black uppercase text-[10px] md:text-xs tracking-[0.3em] hover:gap-5 transition-all text-center w-full lg:w-auto">
              Explore All Integrations
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-40 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-5xl md:text-[8rem] font-black tracking-tighter text-white uppercase italic mb-6 md:mb-8">Simple <br /> Pricing.</h2>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Start building for free. Scale when you scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {[
            { name: 'Developer', price: '$0', desc: 'Perfect for individual builders and early adopters.', features: ['Unlimited Projects', 'Core Kanban Board', 'Keyboard Shortcuts', 'API Access'] },
            { name: 'Team', price: 'Free', desc: 'Powerful workspace for growing teams.', features: ['Organization Support', 'Member Management', 'Custom Priorities', 'Advanced Filters'], active: true }
          ].map(plan => (
            <div key={plan.name} className={`p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border flex flex-col justify-between ${plan.active ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white'}`}>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-6 md:mb-8">
                  <span className="text-5xl md:text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${plan.active ? 'opacity-60' : 'text-slate-500'}`}>per month</span>
                </div>
                <p className={`text-xs md:text-sm font-bold mb-8 md:mb-10 leading-relaxed ${plan.active ? 'opacity-80' : 'text-slate-500'}`}>{plan.desc}</p>
                <div className="space-y-4 mb-10 md:mb-12">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      <span className="material-symbols-outlined text-base md:text-lg">{plan.active ? 'done_all' : 'done'}</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <button className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all ${plan.active ? 'bg-black text-white shadow-2xl hover:scale-105' : 'bg-white/10 hover:bg-white/20'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-40 px-6 max-w-5xl mx-auto text-center relative z-10 font-display">
        <div className="p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-indigo-600 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full -mr-40 -mt-40 blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black opacity-20 rounded-full -ml-40 -mb-40 blur-[60px]"></div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] uppercase italic">
              READY TO <br className="hidden sm:block" /> BREAK THE SOUND <br className="hidden sm:block" /> BARRIER?
            </h2>
            <p className="text-white/70 text-base md:text-xl font-bold mb-10 md:mb-12 max-w-md mx-auto">
              The only issue tracker that keeps up with your execution. Stop waiting. Start flowing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link to="/signup" className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-indigo-600 font-extrabold uppercase text-[10px] md:text-xs tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-2xl">
                Get Started Free
              </Link>
              <button className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-black/20 backdrop-blur-lg border border-white/20 text-white font-black uppercase text-[10px] md:text-xs tracking-[0.3em] rounded-2xl hover:bg-black/30 transition-all">
                Join Discord
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 font-display">
        <div className="flex items-center gap-3">
          <div className="size-9 md:size-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
            <img src="/apple-touch-icon.png" alt="IssueFlow" className="size-full object-cover" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">IssueFlow</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-600 font-bold text-[10px] md:text-xs tracking-tight uppercase text-center">
            Designed for agentic workflows & fast builders.
          </p>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] md:text-[10px] text-slate-800 font-black uppercase tracking-widest text-center">
              Engineered by <a href="https://devazeem.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary transition-colors underline decoration-slate-800 underline-offset-4">Azeem Sanusi</a>
            </p>
            <a href="mailto:bljazeem@gmail.com" className="text-[9px] text-slate-800 font-bold hover:text-primary transition-colors">bljazeem@gmail.com</a>
          </div>
          <p className="text-[9px] md:text-[10px] text-slate-800 font-black mt-2">© 2026 ISSUEFLOW INC. ALL RIGHTS RESERVED.</p>
        </div>

        <div className="flex gap-6 md:gap-10">
          {['X', 'GitHub', 'Discord'].map(s => (
            <a key={s} href="#" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors">{s}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
