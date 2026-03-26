import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { uploadToCloudinary } from '../lib/cloudinary';

const COLORS = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'bg-sky-500/10 text-sky-500 border-sky-500/20',
];

export function Projects() {
  const { currentOrg } = useAuth();
  const { canManageProjects } = usePermissions();
  const { useProjects, createProject, updateProject, deleteProject } = useProjectQueries();
  const { data: projects, isLoading } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setName(project.name);
    setKey(project.key);
    setLogoPreview(project.logoUrl || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setName('');
    setKey('');
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let uploadedLogoUrl = logoPreview;
      if (logoFile) {
        uploadedLogoUrl = await uploadToCloudinary(logoFile);
      }

      if (editingProject) {
        await updateProject.mutateAsync({ 
          id: editingProject.id, 
          name, 
          key, 
          logoUrl: uploadedLogoUrl || undefined 
        });
      } else {
        await createProject.mutateAsync({ name, key, logoUrl: uploadedLogoUrl || undefined });
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save project', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProject) return;
    if (!window.confirm('Are you sure you want to delete this project? This will soft-delete the project.')) return;
    
    setIsSubmitting(true);
    try {
      await deleteProject.mutateAsync(editingProject.id);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to delete project', error);
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Projects</h1>
          <p className="text-slate-500 font-medium">Manage your organization's projects and their settings.</p>
        </div>
        {canManageProjects && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            New Project
          </button>
        )}
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Link 
              key={project.id} 
              to={`/dashboard/projects/${project.id}`}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden block text-left"
            >
              <div className="flex items-start justify-between mb-8">
                {project.logoUrl ? (
                  <div className="size-14 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                    <img src={project.logoUrl} alt={project.name} className="size-full object-cover" />
                  </div>
                ) : (
                  <div className={`size-14 rounded-2xl border flex items-center justify-center shadow-sm ${COLORS[index % COLORS.length]}`}>
                    <span className="font-black text-lg tracking-tighter">{project.key}</span>
                  </div>
                )}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenEdit(project);
                  }}
                  className="size-8 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                >
                  <span className="material-symbols-outlined text-xl">settings</span>
                </button>
              </div>
              
              <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors truncate">{project.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                Key: {project.key}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-lg">view_kanban</span>
                  Board View
                </div>
                <div className="flex -space-x-2">
                   {(() => {
                     const assignees = Array.from(new Set(
                       (project as any).issues
                         ?.map((i: any) => i.assignee)
                         .filter(Boolean)
                         .map((a: any) => JSON.stringify(a))
                     )).map((a: any) => JSON.parse(a)).slice(0, 3);

                     if (assignees.length === 0) {
                        return (
                          <div className="size-6 rounded-full border-2 border-white dark:border-card-dark bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                             N/A
                          </div>
                        );
                     }

                     return assignees.map((assignee: any) => (
                       assignee.avatarUrl ? (
                         <img 
                           key={assignee.id} 
                           src={assignee.avatarUrl} 
                           alt={assignee.name} 
                           className="size-6 rounded-full border-2 border-white dark:border-card-dark object-cover" 
                         />
                       ) : (
                         <div key={assignee.id} className="size-6 rounded-full border-2 border-white dark:border-card-dark bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                            {assignee.name?.charAt(0) || '?'}
                         </div>
                       )
                     ));
                   })()}
                </div>
              </div>
            </Link>
          ))}
          
          {canManageProjects && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-8 text-slate-300 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer group min-h-[260px]"
            >
              <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <p className="font-black text-sm uppercase tracking-widest">Create Project</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-card-dark/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 text-center">
          <div className="size-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-6 shadow-inner">
            <span className="material-symbols-outlined text-4xl">tactic</span>
          </div>
          <h2 className="text-2xl font-black mb-2">No projects found</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
            Your organization doesn't have any projects yet. Start by creating one to organize your workflow.
          </p>
          {canManageProjects ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-primary/25 hover:-translate-y-1"
            >
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              Start First Project
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20">
              <span className="material-symbols-outlined text-lg">lock</span>
              Owner/Admin access required
            </div>
          )}
        </div>
      )}

      {/* New/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
               <div className="flex items-center gap-3">
                 <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">tactic</span>
                 </div>
                 <h2 className="text-xl font-black tracking-tight">{editingProject ? 'Edit Project' : 'New Project'}</h2>
               </div>
              <button onClick={handleCloseModal} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-4">
                 <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="size-28 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer flex items-center justify-center overflow-hidden transition-all group"
                 >
                   {logoPreview ? (
                     <img src={logoPreview} alt="Logo Preview" className="size-full object-cover" />
                   ) : (
                     <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary transition-colors text-center px-4">
                        <span className="material-symbols-outlined text-3xl">insert_photo</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">Click to Select Logo</span>
                     </div>
                   )}
                   {isSubmitting && logoFile && (
                     <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <div className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                     </div>
                   )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                 {logoPreview && (
                   <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Remove</button>
                 )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Project Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Marketing Website"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Project Key</label>
                  <input 
                    type="text" 
                    required
                    maxLength={5}
                    value={key}
                    onChange={e => setKey(e.target.value.toUpperCase())}
                    placeholder="e.g. MKT"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none uppercase font-mono font-bold text-sm tracking-widest"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !name || !key}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-black transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-primary/25"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                         <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                         <span>{logoFile ? 'Uploading...' : 'Saving...'}</span>
                      </div>
                    ) : (editingProject ? 'Save Changes' : 'Create Project')}
                  </button>
                </div>
                {editingProject && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 rounded-2xl font-black text-rose-500 hover:bg-rose-500/10 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Delete Project
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
