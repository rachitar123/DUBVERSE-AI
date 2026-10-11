import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  description,
}) => {
  return (
    <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {change}
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          )}
          {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
        </div>
        <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
    </div>
  );
};
