import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function Alert({ type = 'info', message, details, onClose }) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />,
    },
  }[type] || styles.info;

  return (
    <div className={`rounded-xl border p-4 ${styles.bg} ${styles.border} flex items-start justify-between shadow-sm`}>
      <div className="flex items-start space-x-3">
        {styles.icon}
        <div className="text-sm">
          <p className={`font-semibold ${styles.text}`}>{message}</p>
          {details && <p className="text-slate-600 mt-1 text-xs">{details}</p>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
