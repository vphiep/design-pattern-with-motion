'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useProgress } from './ProgressProvider';
import { useLocale } from './LocaleProvider';
import { MiniPreview } from './illustrations/MiniPreview';
import type { Pattern } from '@/lib/patterns/types';

interface PatternCardProps {
  pattern: Pattern;
  miniIllustration?: React.ReactNode;
  className?: string;
  index?: number;
  showCategory?: boolean;
}

const categoryAccent: Record<Pattern['category'], string> = {
  creational: 'text-[var(--pattern-creational)]',
  structural: 'text-[var(--pattern-structural)]',
  behavioral: 'text-[var(--pattern-behavioral)]'
};

export function PatternCard({
  pattern,
  miniIllustration,
  className,
  index = 0,
  showCategory = true
}: PatternCardProps) {
  const { isVisited } = useProgress();
  const { ui, tx } = useLocale();
  const visited = isVisited(pattern.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -3 }}
      className={cn('h-full', className)}
    >
      <Link
        href={`/patterns/${pattern.id}`}
        className={cn(
          'group relative flex h-full flex-col border-hairline bg-surface p-5',
          'transition-colors duration-300 ease-editorial',
          'hover:border-accent hover:bg-bg-elevated'
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="caption text-text-soft">№ {String(pattern.order).padStart(2, '0')}</span>
          <div className="flex items-center gap-2">
            {pattern.advanced && (
              <span className="border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                {ui.card.advancedBadge}
              </span>
            )}
            {visited && (
              <span
                aria-label={ui.card.visited}
                title={ui.card.visited}
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
              />
            )}
            {showCategory && (
              <span className={cn('caption', categoryAccent[pattern.category])}>
                {ui.categories[pattern.category]}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4 aspect-[16/9] overflow-hidden border-hairline-soft bg-bg">
          <div className="bg-grid-fine h-full w-full">
            {miniIllustration ?? <MiniPreview id={pattern.id} />}
          </div>
        </div>

        <h3 className="text-display text-display-sm mb-1.5 group-hover:underline-editorial">
          {pattern.name}
        </h3>

        <p className="text-sm leading-relaxed text-text-muted">{tx(pattern.tagline)}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div
            className="flex items-center gap-1"
            aria-label={ui.card.difficultyAria(pattern.difficulty)}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  'h-1 w-3 border-hairline-soft',
                  i < pattern.difficulty ? 'bg-accent' : 'bg-transparent'
                )}
              />
            ))}
          </div>
          <ArrowUpRight
            size={16}
            strokeWidth={1.75}
            className="translate-x-0 text-text-soft transition-transform duration-300 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          />
        </div>
      </Link>
    </motion.div>
  );
}
