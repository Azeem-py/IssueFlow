import React, { useEffect, useRef, useState } from 'react';
import { Alert, Avatar, Button, Dialog, Input, useToast } from '@issueflow/ui';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { uploadToCloudinary } from '../lib/cloudinary';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const { updateProfile } = useAuthQueries();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(user?.name || '');
    setAvatarPreview(user?.avatarUrl || '');
    setAvatarFile(null);
    setError('');
  }, [isOpen, user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      let finalAvatarUrl = user?.avatarUrl || '';
      if (avatarFile) {
        finalAvatarUrl = await uploadToCloudinary(avatarFile);
      }

      await updateProfile.mutateAsync({ name, avatarUrl: finalAvatarUrl });
      toast({ tone: 'success', title: 'Profile updated' });
      onClose();
    } catch (err) {
      setError('Could not update your profile. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Account settings"
      description="Update how you appear to teammates in this workspace."
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="profile-form" size="sm" loading={isSubmitting} disabled={!name.trim()}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger" title="Could not save profile" description={error} />}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative size-16 shrink-0 overflow-hidden rounded-full border border-subtle bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
            aria-label="Change profile picture"
          >
            <Avatar src={avatarPreview} name={name || user?.email} size="xl" className="size-full" />
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-ink">{user?.name || 'Your profile'}</p>
            <p className="truncate text-[11.5px] text-ink-muted">{user?.email}</p>
            <p className="mt-1 text-[11px] text-ink-disabled">PNG or JPG. Square images work best.</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <Input
          label="Display name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          autoFocus
        />

        <Input label="Email address" value={user?.email || ''} disabled readOnly hint="Email changes are managed by your account provider." />
      </form>
    </Dialog>
  );
}
