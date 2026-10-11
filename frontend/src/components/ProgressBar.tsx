import React from 'react';

interface ProgressBarProps {
  progress: number;
  currentStep?: string;
  estimatedRemainingSeconds?: number;
  showDetails?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  currentStep,
  estimatedRemainingSeconds,
  showDetails = true,
}) => {
  const formatTime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Almost ready...';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `~${mins}m ${secs}s remaining` : `~${secs}s remaining`;
  };

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
          <span className="font-medium text-slate-200 truncate max-w-[70%]">{currentStep || 'Processing dubbing task...'}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-400 font-semibold">{progress}%</span>
            {estimatedRemainingSeconds !== undefined && progress < 100 && (
              <span className="text-slate-400 font-mono">({formatTime(estimatedRemainingSeconds)})</span>
            )}
          </div>
        </div>
      )}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
