'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PatternCard } from './PatternCard';
import { MiniPreview } from './illustrations/MiniPreview';
import { useLocale } from './LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { PatternCategory } from '@/lib/patterns/types';
import { getPatternsByCategory, CATEGORY_META } from '@/lib/patterns/data';

interface CategoryPageShellProps {
  category: PatternCategory;
  className?: string;
}

const motifStyles: Record<PatternCategory, string> = {
  creational: 'bg-[var(--pattern-creational)]',
  structural: 'bg-[var(--pattern-structural)]',
  behavioral: 'bg-[var(--pattern-behavioral)]'
};

function Motif({ category }: { category: PatternCategory }) {
  if (category === 'creational') {
    return (
      <svg viewBox="0 0 280 160" className="h-full w-full text-text" aria-hidden>
        <rect x="40" y="30" width="80" height="100" fill="none" stroke="currentColor" />
        <rect
          x="150"
          y="50"
          width="70"
          height="70"
          fill="var(--accent)"
          className="animate-pulse-soft"
        />
        <path d="M120 80 H150" stroke="var(--accent)" />
      </svg>
    );
  }
  if (category === 'structural') {
    return (
      <svg viewBox="0 0 280 160" className="h-full w-full text-text" aria-hidden>
        <rect x="30" y="30" width="220" height="100" fill="none" stroke="currentColor" />
        <rect x="60" y="50" width="160" height="60" fill="none" stroke="var(--secondary)" />
        <rect x="100" y="65" width="80" height="30" fill="var(--surface)" stroke="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 280 160" className="h-full w-full text-text" aria-hidden>
      <circle cx="140" cy="50" r="16" fill="var(--accent)" />
      <line x1="140" y1="66" x2="60" y2="120" stroke="var(--accent)" />
      <line x1="140" y1="66" x2="140" y2="132" stroke="var(--accent)" />
      <line x1="140" y1="66" x2="220" y2="120" stroke="var(--accent)" />
      <circle cx="60" cy="124" r="8" fill="var(--surface)" stroke="currentColor" />
      <circle cx="140" cy="132" r="8" fill="var(--surface)" stroke="currentColor" />
      <circle cx="220" cy="124" r="8" fill="var(--surface)" stroke="currentColor" />
    </svg>
  );
}

export function CategoryPageShell({ category, className }: CategoryPageShellProps) {
  const { ui } = useLocale();
  const copy = ui.categoryPage.meta[category];
  const patterns = getPatternsByCategory(category).sort((a, b) => a.order - b.order);

  return (
    <div className={cn('relative', className)}>
      <header className="relative border-b border-border-soft">
        <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 px-6 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-2">
            <p className="caption">{ui.categoryPage.sectionKicker}</p>
            <p className="text-display text-display-lg text-accent">
              {CATEGORY_META[category].number}
            </p>
          </div>
          <div className="md:col-span-6">
            <h1 className="text-display text-display-xl">
              {copy.title} <span className="italic text-text-muted">{copy.italic}</span>
            </h1>
            <p className="mt-6 max-w-reading text-lg text-text-muted">{copy.blurb}</p>
            <p className="mt-4 text-sm text-text-soft">{copy.how}</p>
          </div>
          <div className="md:col-span-4">
            <div className="border-hairline bg-surface">
              <div className="aspect-[16/9] border-b border-border-soft bg-bg">
                <Motif category={category} />
              </div>
              <div className="p-4">
                <p className="caption">{ui.categoryPage.inSection}</p>
                <p className="text-display text-display-md mt-1">{patterns.length}</p>
                <p className="text-sm text-text-muted">{copy.motif}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none h-2 w-full bg-border" aria-hidden>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.0, ease: [0.2, 0.7, 0.2, 1] }}
            className={cn('h-full', motifStyles[category])}
          />
        </div>
      </header>

      <section className="mx-auto max-w-wide px-6 py-12">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((p, i) => (
            <li key={p.id}>
              <PatternCard
                pattern={p}
                index={i}
                showCategory={false}
                miniIllustration={<MiniPreview id={p.id} />}
              />
            </li>
          ))}
        </ul>
        <div className="mt-12 flex justify-between text-sm">
          <Link href="/patterns" className="text-text-muted hover:text-accent">
            {ui.categoryPage.allPatternsLink}
          </Link>
          <Link href="/playground" className="text-text-muted hover:text-accent">
            {ui.categoryPage.playgroundLink}
          </Link>
        </div>
      </section>
    </div>
  );
}
