'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ReplayButtonProps {
  onClick?: () => void;
  state?: 'idle' | 'playing';
  label?: string;
  /** Optional i18n overrides; take precedence over `label`. */
  labels?: { replay?: string; pause?: string };
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Replay button used to re-trigger an illustration's animation timeline.
 * Designed to be wired up by pattern illustration components.
 */
export function ReplayButton({
  onClick,
  state = 'idle',
  label = 'Replay',
  labels,
  className,
  size = 'md'
}: ReplayButtonProps) {
  const text = labels?.replay ?? label;
  const Icon = state === 'playing' ? Play : RotateCcw;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        'group inline-flex items-center gap-2 border-hairline bg-surface text-text',
        'transition-colors duration-200 ease-editorial hover:bg-accent hover:text-bg',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
        className
      )}
      aria-label={text}
    >
      <motion.span
        animate={state === 'playing' ? { rotate: 360 } : { rotate: 0 }}
        transition={
          state === 'playing'
            ? { repeat: Infinity, duration: 1.4, ease: 'linear' }
            : { duration: 0.3 }
        }
        className="inline-flex"
      >
        <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2} />
      </motion.span>
      <span className="font-mono uppercase tracking-widest">{text}</span>
    </motion.button>
  );
}
