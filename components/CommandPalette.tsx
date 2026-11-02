'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Compass, Layers, Lock, Sparkles } from 'lucide-react';
import { useLocale } from './LocaleProvider';
import { getAllPatterns } from '@/lib/patterns/data';
import { LEARNING_MODULES, type LearningModule } from '@/lib/modules/registry';
import type { Pattern, PatternCategory } from '@/lib/patterns/types';
import { cn } from '@/lib/utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickLink {
  id: string;
  title: string;
  category: string;
  href: string;
  kind: 'quicklink';
}

interface PatternSearchResult {
  kind: 'pattern';
  pattern: Pattern;
}

interface ModuleSearchResult {
  kind: 'module';
  module: LearningModule;
}

type SearchItem = PatternSearchResult | ModuleSearchResult | QuickLink;

const categoryColorMap: Record<PatternCategory, string> = {
  creational: 'text-[var(--pattern-creational)] border-[var(--pattern-creational)] bg-[var(--pattern-creational)]/10',
  structural: 'text-[var(--pattern-structural)] border-[var(--pattern-structural)] bg-[var(--pattern-structural)]/10',
  behavioral: 'text-[var(--pattern-behavioral)] border-[var(--pattern-behavioral)] bg-[var(--pattern-behavioral)]/10'
};

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { ui, tx } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const patterns = useMemo(() => getAllPatterns(), []);

  const quickLinks: QuickLink[] = useMemo(
    () => [
      {
        id: 'ql-catalog',
        title: ui.nav.patterns,
        category: ui.search.quickLinks,
        href: '/patterns',
        kind: 'quicklink'
      },
      {
        id: 'ql-creational',
        title: `${ui.categories.creational} Patterns`,
        category: ui.search.quickLinks,
        href: '/patterns/creational',
        kind: 'quicklink'
      },
      {
        id: 'ql-structural',
        title: `${ui.categories.structural} Patterns`,
        category: ui.search.quickLinks,
        href: '/patterns/structural',
        kind: 'quicklink'
      },
      {
        id: 'ql-behavioral',
        title: `${ui.categories.behavioral} Patterns`,
        category: ui.search.quickLinks,
        href: '/patterns/behavioral',
        kind: 'quicklink'
      },
      {
        id: 'ql-playground',
        title: ui.nav.playground,
        category: ui.search.quickLinks,
        href: '/playground',
        kind: 'quicklink'
      }
    ],
    [ui]
  );

  // Filter items based on query
  const filteredItems: SearchItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When empty: return quick links + top popular patterns
      const topPatterns: PatternSearchResult[] = patterns
        .filter((p) =>
          ['singleton', 'factory-method', 'decorator', 'observer', 'strategy'].includes(p.id)
        )
        .map((pattern) => ({ kind: 'pattern', pattern }));

      return [...quickLinks, ...topPatterns];
    }

    // Filter modules
    const matchedModules: ModuleSearchResult[] = [];
    for (const mod of LEARNING_MODULES) {
      const name = mod.name.toLowerCase();
      const tagline = tx(mod.tagline).toLowerCase();
      const cat = tx(mod.category).toLowerCase();
      if (name.includes(q) || tagline.includes(q) || cat.includes(q) || mod.id.includes(q)) {
        matchedModules.push({ kind: 'module', module: mod });
      }
    }

    // Filter patterns
    const matchedPatterns: PatternSearchResult[] = [];
    for (const pattern of patterns) {
      const name = pattern.name.toLowerCase();
      const id = pattern.id.toLowerCase();
      const category = pattern.category.toLowerCase();
      const categoryLocalized = (ui.categories[pattern.category] || '').toLowerCase();
      const tagline = tx(pattern.tagline).toLowerCase();
      const analogy = tx(pattern.analogy).toLowerCase();
      const systems = pattern.realSystems.map((s) => s.system.toLowerCase()).join(' ');

      if (
        name.includes(q) ||
        id.includes(q) ||
        category.includes(q) ||
        categoryLocalized.includes(q) ||
        tagline.includes(q) ||
        analogy.includes(q) ||
        systems.includes(q)
      ) {
        matchedPatterns.push({ kind: 'pattern', pattern });
      }
    }

    // Filter quicklinks
    const matchedQuickLinks = quickLinks.filter((ql) =>
      ql.title.toLowerCase().includes(q)
    );

    return [...matchedModules, ...matchedPatterns, ...matchedQuickLinks];
  }, [query, patterns, quickLinks, tx, ui]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        executeItem(item);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const executeItem = (item: SearchItem) => {
    onClose();
    if (item.kind === 'pattern') {
      router.push(`/patterns/${item.pattern.id}`);
    } else if (item.kind === 'module') {
      if (item.module.status === 'available') {
        router.push(item.module.href);
      } else {
        router.push('/');
      }
    } else {
      router.push(item.href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] md:pt-[14vh]"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={cn(
              'relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-[var(--border)]',
              'bg-[var(--surface)] shadow-2xl flex flex-col max-h-[75vh]'
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-[var(--border-soft)] px-4 py-3.5 bg-[var(--bg-elevated)]/50">
              <Search size={18} className="text-[var(--accent)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.search.placeholder}
                className={cn(
                  'w-full bg-transparent text-sm md:text-base text-[var(--text)] outline-none placeholder:text-[var(--text-soft)]',
                  'font-sans'
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-[var(--text-soft)] hover:text-[var(--text)] p-1 rounded"
                >
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border border-[var(--border-soft)] rounded bg-[var(--surface)] text-[var(--text-soft)]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div ref={listRef} className="overflow-y-auto p-2 divide-y divide-[var(--border-soft)]/40 flex-1">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    {ui.search.noResults} <span className="font-semibold text-[var(--text)]">&ldquo;{query}&rdquo;</span>.
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-soft)]">
                    Try searching for <span className="underline cursor-pointer" onClick={() => setQuery('singleton')}>singleton</span>,{' '}
                    <span className="underline cursor-pointer" onClick={() => setQuery('database')}>database</span>,{' '}
                    <span className="underline cursor-pointer" onClick={() => setQuery('kafka')}>kafka</span>, or{' '}
                    <span className="underline cursor-pointer" onClick={() => setQuery('docker')}>docker</span>.
                  </p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;

                  if (item.kind === 'quicklink') {
                    return (
                      <div
                        key={item.id}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : 'hover:bg-[var(--bg-elevated)] text-[var(--text)]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Compass size={15} className={isSelected ? 'text-white' : 'text-[var(--accent)]'} />
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border',
                            isSelected
                              ? 'border-white/30 text-white'
                              : 'border-[var(--border-soft)] text-[var(--text-soft)]'
                          )}
                        >
                          {item.category}
                        </span>
                      </div>
                    );
                  }

                  if (item.kind === 'module') {
                    const m = item.module;
                    const isAvail = m.status === 'available';
                    return (
                      <div
                        key={m.id}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-3 rounded-lg cursor-pointer transition-colors gap-3',
                          isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : 'hover:bg-[var(--bg-elevated)] text-[var(--text)]'
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: m.accent }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{m.name}</span>
                              <span
                                className={cn(
                                  'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border',
                                  isSelected
                                    ? 'border-white/30 text-white'
                                    : 'border-[var(--border-soft)] text-[var(--text-soft)]'
                                )}
                              >
                                {isAvail ? 'Available' : 'Phase ' + m.roadmapPhase}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-1 line-clamp-1',
                                isSelected ? 'text-white/90' : 'text-[var(--text-muted)]'
                              )}
                            >
                              {tx(m.tagline)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={cn('shrink-0', isSelected ? 'text-white' : 'text-[var(--text-soft)]')}
                        />
                      </div>
                    );
                  }

                  const p = item.pattern;
                  const categoryBadgeColor = categoryColorMap[p.category];

                  return (
                    <div
                      key={p.id}
                      data-active={isSelected}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-3 rounded-lg cursor-pointer transition-colors gap-3',
                        isSelected
                          ? 'bg-[var(--accent)] text-white'
                          : 'hover:bg-[var(--bg-elevated)] text-[var(--text)]'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={cn(
                            'font-mono text-xs mt-0.5 shrink-0',
                            isSelected ? 'text-white/80' : 'text-[var(--text-soft)]'
                          )}
                        >
                          № {String(p.order).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{p.name}</span>
                            <span
                              className={cn(
                                'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border',
                                isSelected ? 'border-white/30 text-white' : categoryBadgeColor
                              )}
                            >
                              {ui.categories[p.category]}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'text-xs mt-1 line-clamp-1',
                              isSelected ? 'text-white/90' : 'text-[var(--text-muted)]'
                            )}
                          >
                            {tx(p.tagline)}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className={cn('shrink-0', isSelected ? 'text-white' : 'text-[var(--text-soft)]')}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-[var(--border-soft)] px-4 py-2.5 bg-[var(--bg-elevated)]/30 text-[11px] font-mono text-[var(--text-soft)]">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 rounded border border-[var(--border-soft)] bg-[var(--surface)] mr-1">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 rounded border border-[var(--border-soft)] bg-[var(--surface)] mr-1">
                    ↓
                  </kbd>
                  {ui.search.navigateHint}
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-soft)] bg-[var(--surface)] mr-1">
                    ↵
                  </kbd>
                  {ui.search.selectHint}
                </span>
              </div>
              <span>
                <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-soft)] bg-[var(--surface)] mr-1">
                  esc
                </kbd>
                {ui.search.escHint}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
