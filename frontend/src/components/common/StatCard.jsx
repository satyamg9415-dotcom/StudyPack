import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
      gradient: 'from-indigo-500/10 to-transparent',
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-100',
      text: 'text-purple-600',
      gradient: 'from-purple-500/10 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      text: 'text-amber-600',
      gradient: 'from-amber-500/10 to-transparent',
    },
  }[color] || {
    bg: 'bg-indigo-50/70',
    border: 'border-indigo-100',
    text: 'text-indigo-600',
    gradient: 'from-indigo-500/10 to-transparent',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colorMap.gradient} rounded-bl-full pointer-events-none`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl ${colorMap.bg} ${colorMap.border} border flex items-center justify-center ${colorMap.text} shadow-2xs group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Progress</span>
          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
