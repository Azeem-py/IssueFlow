import React, { useState, useRef } from 'react';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { uploadToCloudinary } from '../lib/cloudinary';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (org: any) => void;
}

export function CreateOrgModal({ isOpen, onClose, onSuccess }: CreateOrgModalProps) {
  const { createOrganization } = useAuthQueries();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Auto-generate slug if empty
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      let uploadedLogoUrl = '';
      if (logoFile) {
        uploadedLogoUrl = await uploadToCloudinary(logoFile);
      }

      const org = await createOrganization.mutateAsync({ 
        name, 
        slug: finalSlug, 
        logoUrl: uploadedLogoUrl || undefined 
      });
      
      onSuccess(org);
      onClose();
      setName('');
      setSlug('');
      setLogoFile(null);
      setLogoPreview('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
               <span className="material-symbols-outlined text-xl">corporate_fare</span>
             </div>
             <h2 className="text-lg font-black tracking-tight">Create Organization</h2>
          </div>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Logo Upload Section */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative size-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer flex items-center justify-center overflow-hidden group transition-all"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="size-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary transition-colors text-center">
                  <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter leading-tight">Click to Select Logo</span>
                </div>
              )}
              {isSubmitting && logoFile && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <div className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            {logoPreview && (
              <button 
                type="button" 
                onClick={() => {
                   setLogoFile(null);
                   setLogoPreview('');
                }}
                className="text-[10px] font-black text-rose-500 uppercase hover:underline"
              >
                Remove Selection
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Organization Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-sm"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Workspace Slug</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="acme-corp"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 px-1 flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-xs text-primary">link</span>
                app.issueflow.com/{slug || 'slug'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !name}
              className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-black transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary/25"
            >
              {isSubmitting ? (
                 <div className="flex items-center justify-center gap-2">
                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>{logoFile ? 'Uploading...' : 'Creating...'}</span>
                 </div>
              ) : 'Launch Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
