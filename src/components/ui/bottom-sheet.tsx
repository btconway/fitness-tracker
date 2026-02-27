'use client';

import { useEffect, useCallback, type ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white transition-all duration-300 ease-out sm:inset-0 sm:m-auto sm:w-[calc(100vw-2rem)] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-zinc-200 sm:shadow-2xl ${
          open
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-full opacity-0 pointer-events-none sm:translate-y-0 sm:scale-95'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>
        {title && (
          <div className="px-4 pb-3 border-b border-zinc-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-4 pb-[env(safe-area-inset-bottom)] pb-6 sm:px-6">
          {children}
        </div>
      </div>
    </>
  );
}
