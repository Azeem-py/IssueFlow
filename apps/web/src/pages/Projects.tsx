import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useProjectQueries } from '../hooks/useProjectQueries';

const COLORS = [
  'text-primary',
  'text-emerald-500',
  'text-amber-500',
  'text-indigo-400',
  'text-rose-500',
  'text-sky-500',
];

export function Projects() {
  const { currentOrg } = useAuth();
  const { canManageProjects } = usePermissions();
  const { useProjects, createProject } = useProjectQueries();
  const { data: projects, isLoading } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', key: '' });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync(newProject);
      setIsModalOpen(false);
      setNewProject({ name: '', key: '' });
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  if (!currentOrg) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined text-4xl">domain_disabled</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">No Organization Selected</h2>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">Please select or create an organization to manage projects.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your organization's projects and their settings.</p>
        </div>
        {canManageProjects && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Project
          </button>
        )}
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={project.id} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-primary/50 transition-all group shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${COLORS[index % COLORS.length]}`}>
                  <span className="font-bold text-sm tracking-widest">{project.key}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">settings</span>
                </button>
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10">
                {project.key} project for this organization.
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <span className="material-symbols-outlined text-sm">confirmation_number</span>
                  View Issues
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded text-emerald-500 bg-emerald-500/10">
                  Active
                </span>
              </div>
            </div>
          ))}
          
          {/* Create Project Placeholder Inline */}
          {canManageProjects && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer group min-h-[200px]"
            >
              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <p className="font-semibold text-sm">Create New Project</p>
            </div>
          )}
        </div>
      ) : (
        /* Empty State when 0 projects */
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-card-dark border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <span className="material-symbols-outlined text-3xl">tactic</span>
          </div>
          <h2 className="text-xl font-bold">No projects yet</h2>
          <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8">
            You don't have any projects in this organization. Projects help you group and organize your issues.
          </p>
          {canManageProjects ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/25"
            >
              <span className="material-symbols-outlined">add</span>
              Create Your First Project
            </button>
          ) : (
            <p className="text-sm font-medium text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              Only owners and admins can create projects.
            </p>
          )}
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Marketing Website"
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Project Key</label>
                <input 
                  type="text" 
                  required
                  maxLength={5}
                  value={newProject.key}
                  onChange={e => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })}
                  placeholder="e.g. MKT"
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none uppercase font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Short identifier for your issues (max 5 chars)</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createProject.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
