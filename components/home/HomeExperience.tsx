'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { useGsapContext } from '@/lib/animations/gsap';
import { getAllPatterns, CATEGORY_META, CATEGORY_ORDER } from '@/lib/patterns/data';
import { MiniPreview } from '@/components/illustrations/MiniPreview';
import { useProgress } from '@/components/ProgressProvider';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { Pattern } from '@/lib/patterns/types';

export function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const patterns = getAllPatterns();
  const { count, total } = useProgress();
  const { ui, tx } = useLocale();
  const [hovered, setHovered] = useState<Pattern | null>(null);

  useGsapContext(root, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-kicker', { y: 12, opacity: 0, duration: 0.45 })
      .from('.hero-title span', { y: 40, opacity: 0, stagger: 0.08, duration: 0.7 }, '-=0.15')
      .from('.hero-lede', { y: 16, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero-cta', { y: 10, opacity: 0, stagger: 0.08, duration: 0.4 }, '-=0.2')
      .from('.hero-station', { y: 20, opacity: 0, stagger: 0.12, duration: 0.5 }, '-=0.15')
      .from(
        '.hero-connector',
        { scaleX: 0, transformOrigin: 'left center', duration: 0.6 },
        '-=0.35'
      );
  }, []);

  return (
    <div ref={root} className="relative">
      {/* Design Patterns In-Depth Hero */}
      <section id="patterns-atlas" className="relative border-b border-border-soft">
        <div className="mx-auto grid max-w-wide grid-cols-1 gap-12 px-6 pb-16 pt-16 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-1">
            <p className="hero-kicker caption">{ui.home.vol}</p>
          </div>
          <div className="md:col-span-8">
            <p className="hero-kicker caption mb-6">{ui.home.kicker}</p>
            <h2 className="hero-title text-display text-display-xl">
              <span className="block">Design Patterns,</span>
              <span className="block italic text-text-muted">Visually.</span>
            </h2>
            <p className="hero-lede mt-8 max-w-reading text-xl leading-relaxed text-text-muted">
              {ui.home.lede}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/patterns"
                className="hero-cta group inline-flex items-center gap-2 border-hairline bg-accent px-5 py-3 text-bg transition-colors hover:bg-accent-strong"
              >
                <BookOpen size={16} />
                <span className="text-sm">{ui.home.browseAll}</span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/playground"
                className="hero-cta group inline-flex items-center gap-2 border-hairline bg-surface px-5 py-3 text-text transition-colors hover:bg-bg-elevated"
              >
                <Sparkles size={16} />
                <span className="text-sm">{ui.home.openPlayground}</span>
              </Link>
            </div>
          </div>
          <aside className="md:col-span-3">
            <div className="border-hairline bg-surface p-5">
              <p className="caption">{ui.home.explored}</p>
              <p className="text-display text-display-md mt-2">
                {count}
                <span className="text-text-soft">/{total}</span>
              </p>
              <p className="mt-1 text-sm text-text-muted">{ui.home.markedSeen}</p>
              <ul className="mt-4 space-y-2 font-mono text-sm">
                {CATEGORY_ORDER.map((cat) => (
                  <li key={cat} className="flex justify-between">
                    <span className="text-text-muted">{ui.categories[cat]}</span>
                    <span>
                      {String(patterns.filter((p) => p.category === cat).length).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="mx-auto grid max-w-wide grid-cols-1 gap-4 px-6 pb-16 md:grid-cols-3">
          {ui.home.stations.map((s) => (
            <div key={s.n} className="hero-station border-hairline bg-surface p-5">
              <p className="caption">{s.n}</p>
              <h3 className="text-display text-display-sm mt-2">{s.t}</h3>
              <p className="mt-2 text-sm text-text-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="hero-connector mx-6 mb-10 hidden h-px origin-left bg-accent md:block" />
      </section>

      {/* 3. The 23 Patterns Atlas Map */}
      <section className="mx-auto max-w-wide px-6 py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="caption">{ui.home.atlasKicker}</p>
            <h2 className="text-display text-display-lg mt-1">{ui.home.atlasTitle}</h2>
            <p className="mt-3 max-w-reading text-text-muted">{ui.home.atlasLede}</p>
          </div>
          {hovered && (
            <div className="hidden w-64 border-hairline bg-surface p-3 lg:block">
              <div className="aspect-[16/9] border-hairline-soft bg-bg">
                <MiniPreview id={hovered.id} />
              </div>
              <p className="caption mt-2">{hovered.name}</p>
              <p className="mt-1 text-xs text-text-muted">{tx(hovered.tagline)}</p>
            </div>
          )}
        </div>

        <div className="space-y-10">
          {CATEGORY_ORDER.map((cat) => {
            const items = patterns.filter((p) => p.category === cat);
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h3 className="text-display text-display-sm">
                    <span className="text-text-soft">{meta.number}</span> {ui.categories[cat]}
                  </h3>
                  <Link href={`/patterns/${cat}`} className="caption hover:text-accent">
                    {ui.home.overview}
                  </Link>
                </div>
                <ul className="grid grid-cols-2 gap-px border-hairline bg-border sm:grid-cols-3 lg:grid-cols-5">
                  {items.map((p) => (
                    <li key={p.id} className="bg-surface">
                      <Link
                        href={`/patterns/${p.id}`}
                        onMouseEnter={() => setHovered(p)}
                        onFocus={() => setHovered(p)}
                        className={cn(
                          'group flex h-full flex-col p-3 transition-colors hover:bg-bg-elevated'
                        )}
                      >
                        <div className="mb-2 aspect-[16/9] overflow-hidden border-hairline-soft bg-bg">
                          <MiniPreview id={p.id} />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-text-soft">
                          № {String(p.order).padStart(2, '0')}
                        </span>
                        <span className="text-display text-sm group-hover:underline-editorial">
                          {p.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
