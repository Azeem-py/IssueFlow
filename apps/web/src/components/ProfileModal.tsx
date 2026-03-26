import React, { useState, useRef } from 'react';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { uploadToCloudinary } from '../lib/cloudinary';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const { updateProfile } = useAuthQueries();
  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      let finalAvatarUrl = user?.avatarUrl || '';
      if (avatarFile) {
        finalAvatarUrl = await uploadToCloudinary(avatarFile);
      }
      
      await updateProfile.mutateAsync({ name, avatarUrl: finalAvatarUrl });
      onClose();
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">Account Settings</h2>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative size-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl cursor-pointer overflow-hidden group transition-transform hover:scale-105"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl">person</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
              {isSubmitting && avatarFile && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Picture</p>
          </div>

          <div className="space-y-6">
             <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Full Name</label>
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm"
                 placeholder="Your Name"
               />
             </div>
             <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Email Address</label>
               <input 
                 type="text" 
                 disabled
                 value={user?.email}
                 className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed font-bold text-sm"
               />
             </div>
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-black transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-primary/25"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                   <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   <span>{avatarFile ? 'Uploading...' : 'Saving...'}</span>
                </div>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
