import React, { useRef, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Accessible Modal Dialog using HTML5 <dialog> element.
 * Follows Modern Web Guidance:
 * - Uses dialog.showModal()
 * - Sets overscroll-behavior: contain;
 * - Autofocuses on safe action
 * - Accessible name with aria-labelledby
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isDestructive = false,
}) {
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Autofocus on safe action
        cancelBtnRef.current?.focus();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
      className="backdrop:bg-slate-900/50 backdrop:backdrop-blur-xs rounded-2xl p-0 border border-slate-200 shadow-2xl max-w-md w-full bg-white text-slate-800 m-auto"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {isDestructive && (
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
