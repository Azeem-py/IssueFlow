import React, { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  ImageIcon,
  Input,
  useToast,
} from '@issueflow/ui';
import { useAuthQueries } from '../hooks/useAuthQueries';
import { uploadToCloudinary } from '../lib/cloudinary';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (org: any) => void;
}

export function CreateOrgModal({ isOpen, onClose, onSuccess }: CreateOrgModalProps) {
  const { createOrganization } = useAuthQueries();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      let uploadedLogoUrl = '';
      if (logoFile) {
        uploadedLogoUrl = await uploadToCloudinary(logoFile);
      }

      const org = await createOrganization.mutateAsync({
        name,
        slug: finalSlug,
        logoUrl: uploadedLogoUrl || undefined,
      });

      toast({ tone: 'success', title: 'Workspace created', description: org?.name });
      onSuccess(org);
      onClose();
      setName('');
      setSlug('');
      setLogoFile(null);
      setLogoPreview('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create workspace. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Create workspace"
      description="A workspace holds your projects, issues, and team."
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-org-form" size="sm" loading={isSubmitting} disabled={!name.trim()}>
            Create workspace
          </Button>
        </>
      }
    >
      <form id="create-org-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger" title="Could not create workspace" description={error} />}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-canvas text-ink-disabled transition-colors hover:border-brand-500/50 hover:text-brand-300"
            aria-label="Choose workspace logo"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Workspace logo preview" className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-5" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition-opacity group-hover:opacity-100">
              <ImageIcon className="size-4 text-white" />
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-ink">Workspace logo</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">Optional. Square images work best.</p>
            {logoPreview && (
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview('');
                }}
                className="mt-1 text-[11px] font-medium text-red-300 transition-colors hover:text-red-200"
              >
                Remove logo
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <Input
          label="Workspace name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Acme Corp"
          autoFocus
        />

        <Input
          label="Workspace URL"
          value={slug}
          onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, '-'))}
          placeholder="acme-corp"
          hint={`issueflow.app/${generatedSlug || 'your-workspace'}`}
          className="font-mono"
        />
      </form>
    </Dialog>
  );
}
