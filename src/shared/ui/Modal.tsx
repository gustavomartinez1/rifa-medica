'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      // KEY FIX: overflow-y-auto allows scrolling, items-start + pt-4 prevents centering issues on small screens
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ minHeight: '100vh', padding: '1rem' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Spacer for vertical centering on larger screens */}
      <div className="flex-1 min-h-[2rem]" />
      
      {/* Modal content - scrollable wrapper */}
      <div className="relative w-full max-w-lg my-4 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {title && (
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
      </div>

      {/* Spacer for vertical centering on larger screens */}
      <div className="flex-1 min-h-[2rem]" />
    </div>
  );
}
