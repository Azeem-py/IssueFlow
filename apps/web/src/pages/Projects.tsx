import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Dialog,
  EmptyState,
  FolderKanbanIcon,
  ImageIcon,
  Input,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  useToast,
} from '@issueflow/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { uploadToCloudinary } from '../lib/cloudinary';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';

const PROJECT_ACCENTS = [
  'border-brand-500/25 bg-brand-500/10 text-brand-300',
  'border-teal-500/25 bg-teal-500/10 text-teal-300',
  'border-purple/25 bg-purple/10 text-violet-300',
  'border-info/25 bg-info/10 text-sky-300',
  'border-orange/25 bg-orange/10 text-orange-300',
  'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
];

export function Projects() {
  const { currentOrg } = useAuth();
  const { canManageProjects } = usePermissions();
  const { useProjects, createProject, updateProject, deleteProject } = useProjectQueries();
  const { data: projects, isLoading } = useProjects();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setName('');
    setKey('');
    setLogoFile(null);
    setLogoPreview('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setName(project.name);
    setKey(project.key);
    setLogoPreview(project.logoUrl || '');
    setLogoFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setName('');
    setKey('');
    setLogoFile(null);
    setLogoPreview('');
    setError('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
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
          logoUrl: uploadedLogoUrl || undefined,
        });
        toast({ tone: 'success', title: 'Project updated' });
      } else {
        await createProject.mutateAsync({ name, key, logoUrl: uploadedLogoUrl || undefined });
        toast({ tone: 'success', title: 'Project created' });
      }

      handleCloseModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save project. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      toast({ tone: 'success', title: 'Project deleted' });
      setDeleteTarget(null);
      handleCloseModal();
    } catch (err) {
      toast({ tone: 'error', title: 'Could not delete project', description: 'Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<FolderKanbanIcon />}
        title="No workspace selected"
        description="Choose or create a workspace to manage projects."
        className="mt-10"
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Organize related issues into projects. Each project provides a short key for its issues."
        actions={
          canManageProjects ? (
            <Button onClick={handleOpenCreate} icon={<PlusIcon className="size-4" />}>
              New project
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[176px] animate-pulse rounded-xl border border-subtle bg-panel" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => {
            const projectIssues = (project as any).issues || [];
            const assignees = Array.from(
              new Map(
                projectIssues
                  .map((issue: any) => issue.assignee)
                  .filter(Boolean)
                  .map((assignee: any) => [assignee.id, assignee]),
              ).values(),
            ) as any[];

            return (
              <div key={project.id} className="relative">
                <Link
                  to={`/dashboard/projects/${project.id}`}
                  className="group flex h-full flex-col rounded-xl border border-subtle bg-panel p-4 shadow-elevation-1 transition-[border-color,background-color,box-shadow] duration-150 hover:border-line hover:bg-elevated/40 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <div className="flex items-start justify-between gap-3">
                    {project.logoUrl ? (
                      <img
                        src={project.logoUrl}
                        alt=""
                        className="size-10 rounded-lg border border-subtle object-cover"
                      />
                    ) : (
                      <span
                        className={`flex size-10 items-center justify-center rounded-lg border text-[12px] font-semibold ${PROJECT_ACCENTS[index % PROJECT_ACCENTS.length]}`}
                      >
                        {project.key}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 truncate pr-6 text-[14px] font-semibold text-ink transition-colors group-hover:text-brand-200">
                    {project.name}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone="neutral">{project.key}</Badge>
                    <span className="text-[11px] text-ink-muted">
                      {projectIssues.length} {projectIssues.length === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-subtle pt-3">
                    {assignees.length > 0 ? (
                      <AvatarGroup max={4} size="xs" label={`${project.name} assignees`}>
                        {assignees.map((assignee) => (
                          <Avatar
                            key={assignee.id}
                            src={assignee.avatarUrl}
                            name={assignee.name || assignee.email}
                            size="xs"
                          />
                        ))}
                      </AvatarGroup>
                    ) : (
                      <span className="text-[11px] text-ink-disabled">No assignees</span>
                    )}
                    <span className="text-[11px] font-medium text-ink-muted transition-colors group-hover:text-brand-300">
                      Open board
                    </span>
                  </div>
                </Link>

                {canManageProjects && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(project)}
                    aria-label={`Edit ${project.name}`}
                    title="Edit project"
                    className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-md bg-panel/80 text-ink-disabled transition-colors hover:bg-hover hover:text-ink"
                  >
                    <SettingsIcon className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {canManageProjects && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex min-h-[176px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-subtle bg-panel/30 p-4 text-ink-disabled transition-colors hover:border-brand-500/40 hover:bg-brand-500/[0.03] hover:text-brand-300"
            >
              <span className="flex size-9 items-center justify-center rounded-lg border border-subtle bg-elevated">
                <PlusIcon className="size-4" />
              </span>
              <span className="text-[12px] font-medium">Create project</span>
            </button>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<FolderKanbanIcon />}
          title="No projects yet"
          description="Create your first project to organize work and give issues a short key."
          action={
            canManageProjects ? (
              <Button size="sm" onClick={handleOpenCreate}>
                Create first project
              </Button>
            ) : (
              <Badge tone="warning" dot>
                Admin access required
              </Badge>
            )
          }
        />
      )}

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Edit project' : 'Create project'}
        description={
          editingProject
            ? 'Update the project name, key, or logo.'
            : 'Projects group related issues and provide the prefix for issue keys.'
        }
        footer={
          <>
            {editingProject && canManageProjects && (
              <Button
                type="button"
                variant="danger-outline"
                size="sm"
                className="mr-auto"
                onClick={() => setDeleteTarget(editingProject)}
                icon={<TrashIcon className="size-3.5" />}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="project-form"
              size="sm"
              loading={isSubmitting}
              disabled={!name.trim() || !key.trim()}
            >
              {editingProject ? 'Save changes' : 'Create project'}
            </Button>
          </>
        }
      >
        <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert tone="danger" title="Could not save project" description={error} />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-canvas text-ink-disabled transition-colors hover:border-brand-500/50 hover:text-brand-300"
              aria-label="Choose project logo"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Project logo preview" className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-5" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition-opacity group-hover:opacity-100">
                <ImageIcon className="size-4 text-white" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink">Project logo</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">Optional. PNG or JPG, square works best.</p>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Input
            label="Project name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Marketing website"
            autoFocus
          />

          <Input
            label="Project key"
            required
            maxLength={5}
            value={key}
            onChange={(event) => setKey(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="WEB"
            hint="Used as the issue prefix, for example WEB-12."
            className="font-mono uppercase tracking-wider"
          />
        </form>
      </Dialog>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete project"
        message={`Delete "${deleteTarget?.name ?? 'this project'}"? Its issues will be removed from the workspace.`}
        confirmText="Delete project"
        type="danger"
        isLoading={isSubmitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
