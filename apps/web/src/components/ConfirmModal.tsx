import React from 'react';

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
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
            }`}>
              <span className="material-symbols-outlined text-3xl">
                {isDanger ? 'warning' : 'help'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{title}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl font-black transition-all text-sm shadow-lg disabled:opacity-50 ${
                isDanger 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
