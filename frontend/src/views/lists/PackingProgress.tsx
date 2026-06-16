import type { PackingProgress } from '@/models/types';
import { pl } from '@/models/pl';

interface PackingProgressBarProps {
  progress: PackingProgress;
}

export function PackingProgressBar({ progress }: PackingProgressBarProps) {
  return (
    <div className="rounded-2xl bg-white border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-navy">{pl.lists.progress}</span>
        <span className="text-2xl font-bold text-coral">{progress.percent}%</span>
      </div>
      <div className="h-3 rounded-full bg-border overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sand to-coral transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span>
          {pl.lists.packed}: {progress.packedQuantity} {pl.lists.of} {progress.totalQuantity}{' '}
          {pl.lists.pieces}
        </span>
        <span>
          {progress.packedItems} {pl.lists.of} {progress.totalItems} {pl.lists.items}
        </span>
      </div>
    </div>
  );
}
