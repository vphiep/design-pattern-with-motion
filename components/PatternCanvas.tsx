'use client';

import { motion } from 'framer-motion';
import { CornerCrosshair } from './decor/CornerCrosshair';
import { ReplayButton } from './ReplayButton';
import { Pause, Play } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/animations/reduced-motion';
import { cn } from '@/lib/utils/cn';

interface PatternCanvasProps {
  children: React.ReactNode;
  caption?: string;
  replayable?: boolean;
  scrollLinked?: boolean;
  onReplay?: () => void;
  onTogglePause?: () => void;
  paused?: boolean;
  className?: string;
  aspect?: 'square' | 'video' | 'wide' | 'auto';
  label?: string;
  /** Optional i18n overrides for the control captions; defaults to English. */
  labels?: { replay?: string; pause?: string; play?: string };
}

/**
 * Frame / container for an animated pattern illustration.
 * Provides a tasteful, blueprint-feeling border, optional caption,
 * and a replay button. The actual animation is implemented by the
 * illustration component passed as children.
 */
export function PatternCanvas({
  children,
  caption,
  replayable = true,
  onReplay,
  onTogglePause,
  paused = false,
  className,
  aspect = 'video',
  label = 'Pattern illustration',
  labels
}: PatternCanvasProps) {
  const reduced = usePrefersReducedMotion();
  const pauseText = labels?.pause ?? 'Pause';
  const playText = labels?.play ?? 'Play';
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-[16/10]',
    wide: 'aspect-[2/1]',
    auto: ''
  }[aspect];

  return (
    <figure
      className={cn(
        'group relative isolate border-hairline bg-surface',
        'shadow-editorial dark:shadow-editorial-dark',
        className
      )}
      role="img"
      aria-label={label}
    >
      {/* corner crosshairs */}
      <CornerCrosshair className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
      <CornerCrosshair className="right-0 top-0 translate-x-1/2 -translate-y-1/2" />
      <CornerCrosshair className="left-0 bottom-0 -translate-x-1/2 translate-y-1/2" />
      <CornerCrosshair className="right-0 bottom-0 translate-x-1/2 translate-y-1/2" />

      {/* frame tick marks on top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-px bg-border-soft" aria-hidden />
        ))}
      </div>

      {/* canvas content */}
      <div className={cn('relative w-full overflow-hidden', aspectClass)}>
        {/* subtle grid inside frame */}
        <div aria-hidden className="absolute inset-0 bg-grid-fine opacity-50" />
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative h-full w-full"
        >
          {children}
        </motion.div>
      </div>

      {/* footer with caption + replay */}
      {(caption || replayable) && (
        <div className="flex items-center justify-between gap-3 border-t border-border-soft px-4 py-2">
          {caption ? (
            <span className="caption truncate">{caption}</span>
          ) : (
            <span className="caption opacity-0">·</span>
          )}
          {replayable && !reduced && (
            <div className="flex items-center gap-2">
              {onTogglePause && (
                <button
                  type="button"
                  onClick={onTogglePause}
                  className="inline-flex items-center gap-1.5 border-hairline bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-text transition-colors hover:bg-accent hover:text-bg"
                  aria-label={paused ? playText : pauseText}
                >
                  {paused ? <Play size={11} /> : <Pause size={11} />}
                  {paused ? playText : pauseText}
                </button>
              )}
              <ReplayButton onClick={onReplay} labels={{ replay: labels?.replay }} size="sm" />
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
