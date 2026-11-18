import React from 'react';
import { AlertCircleIcon, AlertTriangleIcon, Button, Dialog } from '@issueflow/ui';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isLoading = false,
}: ConfirmModalProps) {
  const isDanger = type === 'danger';
  const Icon = isDanger ? AlertTriangleIcon : AlertCircleIcon;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span
            className={`flex size-6 items-center justify-center rounded-md ${
              isDanger ? 'bg-danger/10 text-red-300' : 'bg-info/10 text-sky-300'
            }`}
          >
            <Icon className="size-3.5" />
          </span>
          {title}
        </span>
      }
      description={message}
      size="sm"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            loading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    />
  );
}
