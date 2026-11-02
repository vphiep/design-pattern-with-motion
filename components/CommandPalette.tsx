'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Compass, Layers, Lock, Sparkles, Database, Cpu } from 'lucide-react';
import { useLocale } from './LocaleProvider';
import { getAllPatterns } from '@/lib/patterns/data';
import { LEARNING_MODULES, type LearningModule } from '@/lib/modules/registry';
import type { Pattern, PatternCategory } from '@/lib/patterns/types';
import { getAllDatabaseTopics, DATABASE_CATEGORY_META } from '@/lib/database/data';
import type { DatabaseTopic } from '@/lib/database/types';
import { getAllJavaCoreTopics, JAVA_CORE_CATEGORY_META } from '@/lib/javacore/data';
import type { JavaCoreTopic } from '@/lib/javacore/types';
import { getAllMessagingTopics, MESSAGING_CATEGORY_META } from '@/lib/messaging/data';
import type { MessagingTopic } from '@/lib/messaging/types';
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

interface DatabaseSearchResult {
  kind: 'database';
  topic: DatabaseTopic;
}

interface JavaCoreSearchResult {
  kind: 'javacore';
  topic: JavaCoreTopic;
}

interface MessagingSearchResult {
  kind: 'messaging';
  topic: MessagingTopic;
}

interface ModuleSearchResult {
  kind: 'module';
  module: LearningModule;
}

type SearchItem =
  | JavaCoreSearchResult
  | DatabaseSearchResult
  | MessagingSearchResult
  | PatternSearchResult
  | ModuleSearchResult
  | QuickLink;

const categoryColorMap: Record<PatternCategory, string> = {
  creational: 'text-[var(--pattern-creational)] border-[var(--pattern-creational)]/40 bg-[var(--pattern-creational)]/10',
  structural: 'text-[var(--pattern-structural)] border-[var(--pattern-structural)]/40 bg-[var(--pattern-structural)]/10',
  behavioral: 'text-[var(--pattern-behavioral)] border-[var(--pattern-behavioral)]/40 bg-[var(--pattern-behavioral)]/10'
};

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { locale, ui, tx } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const patterns = useMemo(() => getAllPatterns(), []);
  const databaseTopics = useMemo(() => getAllDatabaseTopics(), []);
  const javaCoreTopics = useMemo(() => getAllJavaCoreTopics(), []);
  const messagingTopics = useMemo(() => getAllMessagingTopics(), []);

  const quickLinks: QuickLink[] = useMemo(
    () => [
      {
        id: 'ql-messaging',
        title: locale === 'vi' ? 'Kafka vs RabbitMQ Streaming Hub' : 'Kafka vs RabbitMQ Streaming Hub',
        category: 'Messaging',
        href: '/message-queue',
        kind: 'quicklink'
      },
      {
        id: 'ql-mq-playground',
        title: locale === 'vi' ? 'Mô phỏng Phân tán & Backpressure' : 'Distributed Flow Control Simulator',
        category: 'Playground',
        href: '/message-queue/playground',
        kind: 'quicklink'
      },
      {
        id: 'ql-javacore',
        title: locale === 'vi' ? 'Java Core Deep-Dive Hub' : 'Java Core Deep-Dive Hub',
        category: 'Java Core',
        href: '/java-core',
        kind: 'quicklink'
      },
      {
        id: 'ql-database',
        title: locale === 'vi' ? 'Database Internals Hub' : 'Database Internals Hub',
        category: 'Database',
        href: '/database',
        kind: 'quicklink'
      },
      {
        id: 'ql-catalog',
        title: ui.nav.patterns,
        category: 'Design Patterns',
        href: '/patterns',
        kind: 'quicklink'
      },
      {
        id: 'ql-db-playground',
        title: locale === 'vi' ? 'Mô phỏng Database Simulator' : 'Database Engine Simulator',
        category: 'Playground',
        href: '/database/playground',
        kind: 'quicklink'
      },
      {
        id: 'ql-patterns-playground',
        title: ui.nav.playground,
        category: 'Playground',
        href: '/playground',
        kind: 'quicklink'
      }
    ],
    [locale, ui]
  );

  // Filter items based on query
  const filteredItems: SearchItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When empty: return quick links + top highlighted topics from each module
      const topJavaCore: JavaCoreSearchResult[] = javaCoreTopics
        .filter((t) =>
          ['multithreading-thread-lifecycle', 'jvm-memory-model', 'virtual-threads', 'synchronized-monitor'].includes(t.id)
        )
        .map((topic) => ({ kind: 'javacore', topic }));

      const topDatabase: DatabaseSearchResult[] = databaseTopics
        .filter((t) =>
          ['b-tree', 'lsm-tree', 'mvcc-isolation', 'write-ahead-log', 'slotted-page'].includes(t.id)
        )
        .map((topic) => ({ kind: 'database', topic }));

      const topMessaging: MessagingSearchResult[] = messagingTopics
        .filter((t) =>
          ['message-queue-architecture', 'rabbitmq-exchanges-routing', 'kafka-architecture-partitions', 'backpressure-consumer-lag-flow-control'].includes(t.id)
        )
        .map((topic) => ({ kind: 'messaging', topic }));

      const topPatterns: PatternSearchResult[] = patterns
        .filter((p) =>
          ['singleton', 'factory-method', 'decorator', 'observer', 'strategy'].includes(p.id)
        )
        .map((pattern) => ({ kind: 'pattern', pattern }));

      return [...quickLinks, ...topMessaging, ...topJavaCore, ...topDatabase, ...topPatterns];
    }

    // 1. Filter Java Core Topics
    const matchedJavaCore: JavaCoreSearchResult[] = [];
    for (const topic of javaCoreTopics) {
      const name = topic.name.toLowerCase();
      const id = topic.id.toLowerCase();
      const cat = topic.category.toLowerCase();
      const catMeta = JAVA_CORE_CATEGORY_META[topic.category];
      const catLabelVi = (catMeta?.label.vi || '').toLowerCase();
      const catLabelEn = (catMeta?.label.en || '').toLowerCase();
      const taglineVi = topic.tagline.vi.toLowerCase();
      const taglineEn = topic.tagline.en.toLowerCase();
      const jvmEngines = topic.productionJvmEngines.map((e) => e.jvmEngine.toLowerCase()).join(' ');

      if (
        name.includes(q) ||
        id.includes(q) ||
        cat.includes(q) ||
        catLabelVi.includes(q) ||
        catLabelEn.includes(q) ||
        taglineVi.includes(q) ||
        taglineEn.includes(q) ||
        jvmEngines.includes(q)
      ) {
        matchedJavaCore.push({ kind: 'javacore', topic });
      }
    }

    // 2. Filter Database Topics
    const matchedDatabase: DatabaseSearchResult[] = [];
    for (const topic of databaseTopics) {
      const name = topic.name.toLowerCase();
      const id = topic.id.toLowerCase();
      const cat = topic.category.toLowerCase();
      const catMeta = DATABASE_CATEGORY_META[topic.category];
      const catLabelVi = (catMeta?.label.vi || '').toLowerCase();
      const catLabelEn = (catMeta?.label.en || '').toLowerCase();
      const taglineVi = topic.tagline.vi.toLowerCase();
      const taglineEn = topic.tagline.en.toLowerCase();
      const engines = topic.productionEngines.map((e) => e.engine.toLowerCase()).join(' ');

      if (
        name.includes(q) ||
        id.includes(q) ||
        cat.includes(q) ||
        catLabelVi.includes(q) ||
        catLabelEn.includes(q) ||
        taglineVi.includes(q) ||
        taglineEn.includes(q) ||
        engines.includes(q)
      ) {
        matchedDatabase.push({ kind: 'database', topic });
      }
    }

    // 3. Filter Messaging Topics
    const matchedMessaging: MessagingSearchResult[] = [];
    for (const topic of messagingTopics) {
      const name = topic.name.toLowerCase();
      const id = topic.id.toLowerCase();
      const cat = topic.category.toLowerCase();
      const catMeta = MESSAGING_CATEGORY_META[topic.category];
      const catLabelVi = (catMeta?.label.vi || '').toLowerCase();
      const catLabelEn = (catMeta?.label.en || '').toLowerCase();
      const taglineVi = topic.tagline.vi.toLowerCase();
      const taglineEn = topic.tagline.en.toLowerCase();
      const chapter = topic.chapter.toLowerCase();

      if (
        name.includes(q) ||
        id.includes(q) ||
        cat.includes(q) ||
        catLabelVi.includes(q) ||
        catLabelEn.includes(q) ||
        taglineVi.includes(q) ||
        taglineEn.includes(q) ||
        chapter.includes(q)
      ) {
        matchedMessaging.push({ kind: 'messaging', topic });
      }
    }

    // 3. Filter Patterns
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

    // 4. Filter Modules
    const matchedModules: ModuleSearchResult[] = [];
    for (const mod of LEARNING_MODULES) {
      const name = mod.name.toLowerCase();
      const tagline = tx(mod.tagline).toLowerCase();
      const cat = tx(mod.category).toLowerCase();
      if (name.includes(q) || tagline.includes(q) || cat.includes(q) || mod.id.includes(q)) {
        matchedModules.push({ kind: 'module', module: mod });
      }
    }

    // 5. Filter Quicklinks
    const matchedQuickLinks = quickLinks.filter((ql) =>
      ql.title.toLowerCase().includes(q) || ql.category.toLowerCase().includes(q)
    );

    return [
      ...matchedMessaging,
      ...matchedJavaCore,
      ...matchedDatabase,
      ...matchedPatterns,
      ...matchedModules,
      ...matchedQuickLinks
    ];
  }, [query, javaCoreTopics, databaseTopics, messagingTopics, patterns, quickLinks, tx, ui]);

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
    if (item.kind === 'messaging') {
      router.push(`/message-queue/${item.topic.id}`);
    } else if (item.kind === 'javacore') {
      router.push(`/java-core/${item.topic.id}`);
    } else if (item.kind === 'database') {
      router.push(`/database/${item.topic.id}`);
    } else if (item.kind === 'pattern') {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={cn(
              'relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 dark:border-border-soft',
              'bg-[#ffffff] dark:bg-[#14120e] shadow-2xl flex flex-col max-h-[75vh]'
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-border/60 dark:border-border-soft px-4 py-3.5 bg-bg-elevated/40 dark:bg-[#191612]">
              <Search size={18} className="text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === 'vi' ? 'Tìm bài giảng Java Core, Database, Design Patterns...' : 'Search Java Core, Database, Design Patterns...'}
                className={cn(
                  'w-full bg-transparent text-sm md:text-base text-text outline-none placeholder:text-text-soft/60',
                  'font-sans'
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-text-soft hover:text-text p-1 rounded hover:bg-surface"
                >
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border border-border-soft rounded bg-surface text-text-soft">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-text-muted">
                    {ui.search.noResults} <span className="font-semibold text-text">&ldquo;{query}&rdquo;</span>.
                  </p>
                  <p className="mt-2 text-xs text-text-soft">
                    {locale === 'vi' ? (
                      <>
                        Gợi ý: thử tìm <span className="underline cursor-pointer font-medium text-rose-500" onClick={() => setQuery('multithreading')}>multithreading</span>,{' '}
                        <span className="underline cursor-pointer font-medium text-sky-500" onClick={() => setQuery('b-tree')}>b-tree</span>,{' '}
                        <span className="underline cursor-pointer font-medium text-amber-500" onClick={() => setQuery('singleton')}>singleton</span>, hoặc{' '}
                        <span className="underline cursor-pointer font-medium text-text" onClick={() => setQuery('mvcc')}>mvcc</span>.
                      </>
                    ) : (
                      <>
                        Try searching for <span className="underline cursor-pointer" onClick={() => setQuery('multithreading')}>multithreading</span>,{' '}
                        <span className="underline cursor-pointer" onClick={() => setQuery('b-tree')}>b-tree</span>,{' '}
                        <span className="underline cursor-pointer" onClick={() => setQuery('singleton')}>singleton</span>, or{' '}
                        <span className="underline cursor-pointer" onClick={() => setQuery('mvcc')}>mvcc</span>.
                      </>
                    )}
                  </p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;

                  // 1. QuickLink
                  if (item.kind === 'quicklink') {
                    return (
                      <div
                        key={item.id}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-primary text-white shadow-sm'
                            : 'hover:bg-bg-elevated/70 text-text'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Compass size={15} className={isSelected ? 'text-white' : 'text-primary'} />
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border',
                            isSelected
                              ? 'border-white/30 text-white'
                              : 'border-border-soft bg-surface/50 text-text-soft'
                          )}
                        >
                          {item.category}
                        </span>
                      </div>
                    );
                  }

                  // 2. Java Core Topic
                  if (item.kind === 'javacore') {
                    const t = item.topic;
                    const catMeta = JAVA_CORE_CATEGORY_META[t.category];
                    const catTitle = catMeta ? (locale === 'vi' ? catMeta.label.vi : catMeta.label.en) : t.category;

                    return (
                      <div
                        key={`jc-${t.id}`}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors gap-3',
                          isSelected
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'hover:bg-rose-500/5 dark:hover:bg-rose-500/10 text-text'
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={cn(
                              'p-1.5 rounded-lg shrink-0 mt-0.5',
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            )}
                          >
                            <Cpu size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{t.name}</span>
                              <span
                                className={cn(
                                  'text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border',
                                  isSelected
                                    ? 'border-white/30 text-white'
                                    : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                                )}
                              >
                                Java Core · {catTitle}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-0.5 line-clamp-1',
                                isSelected ? 'text-white/90' : 'text-text-muted'
                              )}
                            >
                              {locale === 'vi' ? t.tagline.vi : t.tagline.en}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={cn('shrink-0', isSelected ? 'text-white' : 'text-text-soft')}
                        />
                      </div>
                    );
                  }

                  // 3. Database Topic
                  if (item.kind === 'database') {
                    const t = item.topic;
                    const catMeta = DATABASE_CATEGORY_META[t.category];
                    const catTitle = catMeta ? (locale === 'vi' ? catMeta.label.vi : catMeta.label.en) : t.category;

                    return (
                      <div
                        key={`db-${t.id}`}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors gap-3',
                          isSelected
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'hover:bg-sky-500/5 dark:hover:bg-sky-500/10 text-text'
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={cn(
                              'p-1.5 rounded-lg shrink-0 mt-0.5',
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                            )}
                          >
                            <Database size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{t.name}</span>
                              <span
                                className={cn(
                                  'text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border',
                                  isSelected
                                    ? 'border-white/30 text-white'
                                    : 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10'
                                )}
                              >
                                Database · {catTitle}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-0.5 line-clamp-1',
                                isSelected ? 'text-white/90' : 'text-text-muted'
                              )}
                            >
                              {locale === 'vi' ? t.tagline.vi : t.tagline.en}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={cn('shrink-0', isSelected ? 'text-white' : 'text-text-soft')}
                        />
                      </div>
                    );
                  }

                  // 3b. Messaging Topic
                  if (item.kind === 'messaging') {
                    const t = item.topic;
                    const catMeta = MESSAGING_CATEGORY_META[t.category];
                    const catTitle = catMeta ? (locale === 'vi' ? catMeta.label.vi : catMeta.label.en) : t.category;

                    return (
                      <div
                        key={`msg-${t.id}`}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors gap-3',
                          isSelected
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'hover:bg-purple-500/5 dark:hover:bg-purple-500/10 text-text'
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={cn(
                              'p-1.5 rounded-lg shrink-0 mt-0.5',
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            )}
                          >
                            <Layers size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{t.name}</span>
                              <span
                                className={cn(
                                  'text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border',
                                  isSelected
                                    ? 'border-white/30 text-white'
                                    : 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10'
                                )}
                              >
                                {t.chapter} · {catTitle}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-0.5 line-clamp-1',
                                isSelected ? 'text-white/90' : 'text-text-muted'
                              )}
                            >
                              {locale === 'vi' ? t.tagline.vi : t.tagline.en}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={cn('shrink-0', isSelected ? 'text-white' : 'text-text-soft')}
                        />
                      </div>
                    );
                  }

                  // 4. Learning Module
                  if (item.kind === 'module') {
                    const m = item.module;
                    const isAvail = m.status === 'available';
                    return (
                      <div
                        key={`mod-${m.id}`}
                        data-active={isSelected}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors gap-3',
                          isSelected
                            ? 'bg-primary text-white shadow-sm'
                            : 'hover:bg-bg-elevated/70 text-text'
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
                                  'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border',
                                  isSelected
                                    ? 'border-white/30 text-white'
                                    : 'border-border-soft text-text-soft'
                                )}
                              >
                                {isAvail ? 'Available' : 'Phase ' + m.roadmapPhase}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-0.5 line-clamp-1',
                                isSelected ? 'text-white/90' : 'text-text-muted'
                              )}
                            >
                              {tx(m.tagline)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={cn('shrink-0', isSelected ? 'text-white' : 'text-text-soft')}
                        />
                      </div>
                    );
                  }

                  // 5. Pattern
                  const p = item.pattern;
                  const categoryBadgeColor = categoryColorMap[p.category];

                  return (
                    <div
                      key={`pat-${p.id}`}
                      data-active={isSelected}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors gap-3',
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'hover:bg-bg-elevated/70 text-text'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={cn(
                            'font-mono text-xs mt-0.5 shrink-0',
                            isSelected ? 'text-white/80' : 'text-text-soft'
                          )}
                        >
                          № {String(p.order).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{p.name}</span>
                            <span
                              className={cn(
                                'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border',
                                isSelected ? 'border-white/30 text-white' : categoryBadgeColor
                              )}
                            >
                              {ui.categories[p.category]}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'text-xs mt-0.5 line-clamp-1',
                              isSelected ? 'text-white/90' : 'text-text-muted'
                            )}
                          >
                            {tx(p.tagline)}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className={cn('shrink-0', isSelected ? 'text-white' : 'text-text-soft')}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-border-soft/60 px-4 py-2.5 bg-bg-elevated/30 text-[11px] font-mono text-text-soft">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 rounded border border-border-soft bg-surface mr-1">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 rounded border border-border-soft bg-surface mr-1">
                    ↓
                  </kbd>
                  {ui.search.navigateHint}
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border-soft bg-surface mr-1">
                    ↵
                  </kbd>
                  {ui.search.selectHint}
                </span>
              </div>
              <span>
                <kbd className="px-1.5 py-0.5 rounded border border-border-soft bg-surface mr-1">
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
