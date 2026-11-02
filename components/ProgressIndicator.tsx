'use client';

import { motion } from 'framer-motion';
import { useProgress } from './ProgressProvider';
import { useLocale } from './LocaleProvider';

interface ProgressIndicatorProps {
  count: number;
  total: number;
}

/**
 * Visual progress chip in the nav. Animated width reflects exploration.
 */
export function ProgressIndicator({ count, total }: ProgressIndicatorProps) {
  const { visitedList } = useProgress();
  const { ui } = useLocale();
  const pct = Math.min(count / total, 1);
  const label = ui.progress.explored(count, total);

  return (
    <div
      className="hidden items-center gap-2.5 border-hairline bg-surface px-2.5 py-1.5 sm:inline-flex"
      title={label}
      aria-label={label}
    >
      <div className="relative h-1 w-16 overflow-hidden bg-border-soft">
        <motion.div
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute inset-y-0 left-0 bg-accent"
        />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
        <span className="text-text">{count}</span>
        <span className="mx-0.5 text-text-soft">/</span>
        <span>{total}</span>
      </span>
      {/* tiny tick markers */}
      <div className="hidden lg:flex">
        {visitedList.slice(-5).map((id, i) => (
          <span key={`${id}-${i}`} className="mx-0.5 h-1 w-1 rounded-full bg-accent" aria-hidden />
        ))}
      </div>
    </div>
  );
}
