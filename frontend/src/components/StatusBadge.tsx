import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isProcessing = ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'SYNTHESIZING', 'SYNCING'].includes(status);
  
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }

  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertTriangle className="w-3.5 h-3.5" />
        Failed
      </span>
    );
  }

  if (status === 'QUEUED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" />
        Queued
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      {status}
    </span>
  );
};
